# Audit Sécurité — Immelio Transaction
**Date** : 2026-07-20  
**Niveau de risque** : Pas de vulnérabilité critique en production immédiate

---

## F-SEC-01 — Middleware Edge : validation JWT absente
**Sévérité** : MEDIUM  
**Fichier** : `src/middleware.ts:14`

```ts
const token = request.cookies.get("auth-token")?.value;
if (!token) { /* redirect */ }
return NextResponse.next(); // ← ne valide PAS le JWT
```

**Risque** : Un cookie `auth-token` avec un JWT expiré ou forgé passe le middleware et atteint les Server Components. La protection réelle est dans chaque Server Component / route handler qui appelle `verifyAuth()`. Si un Server Component oublie l'appel `verifyAuth()`, la page sera accessible avec un token invalide.

**Mitigation actuelle** : Tous les Server Components admin appellent `verifyAuth()`. Le middleware est une première barrière UX (redirect vers login), pas la barrière de sécurité.

**Correction recommandée** : Valider le JWT dans le middleware via `verifyToken()` importé depuis un module Edge-compatible (attention : `prisma` n'est pas disponible en Edge). Solution : décoder et vérifier la signature JWT en Edge sans requête DB.

```ts
// src/middleware.ts — version renforcée
import { verifyToken } from "@/lib/jwt"; // doit être Edge-compatible

export function middleware(request: NextRequest) {
  // ...
  const tokenValue = request.cookies.get("auth-token")?.value;
  if (!tokenValue) { /* redirect */ }
  
  const payload = verifyToken(tokenValue);
  if (!payload) { /* redirect */ }
  
  return NextResponse.next();
}
```

**Statut** : À corriger (priorité MEDIUM)

---

## F-SEC-02 — CSP : `unsafe-inline` dans script-src
**Sévérité** : MEDIUM  
**Fichier** : `next.config.ts:6`

```ts
const cspScriptSrc = isProd
  ? "script-src 'self' 'unsafe-inline'" // ← affaiblit XSS protection
  : "script-src 'self' 'unsafe-inline' 'unsafe-eval'";
```

**Risque** : `'unsafe-inline'` autorise l'exécution de scripts inline, contournant partiellement la CSP comme protection XSS secondaire.

**Correction recommandée** : Migrer vers une CSP basée sur `nonces` (Next.js 15+ supporte `generateBuildId` + middleware pour injecter les nonces). Alternative immédiate : supprimer `'unsafe-inline'` et auditer les scripts inline utilisés.

**Statut** : À corriger à moyen terme

---

## F-SEC-03 — SSRF dans le proxy de téléchargement
**Sévérité** : LOW-MEDIUM  
**Fichier** : `src/lib/fileDownload.ts:64`

```ts
const upstream = await fetch(absoluteUrl, { cache: "no-store" });
```

**Risque** : Si un attaquant peut insérer une URL arbitraire dans la table `documentPartenaire.url` (ex. `http://169.254.169.254/latest/meta-data/`), le serveur Next.js proxy la requête vers cet hôte interne. En pratique, les URLs en DB viennent uniquement de Cloudinary via `/api/upload` (authentifié), donc le risque est faible.

**Correction recommandée** : Ajouter une allowlist de domaines dans le proxy.

```ts
const ALLOWED_PROXY_DOMAINS = ["res.cloudinary.com"];

function isAllowedUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ALLOWED_PROXY_DOMAINS.some(d => parsed.hostname === d || parsed.hostname.endsWith(`.${d}`));
  } catch { return false; }
}

// Dans proxyFileDownload :
if (!absoluteUrl.startsWith("/") && !isAllowedUrl(absoluteUrl)) {
  return NextResponse.json({ error: "URL non autorisée" }, { status: 403 });
}
```

**Statut** : Correction recommandée

---

## F-SEC-04 — Traversée de chemin locale (path traversal)
**Sévérité** : MEDIUM  
**Fichier** : `src/lib/fileDownload.ts:21`

```ts
function getLocalFilePath(sourceUrl: string) {
  const normalized = path.normalize(sourceUrl).replace(/^(\.\.(\/|\\|$))+/, "");
  return path.join(process.cwd(), "public", normalized);
}
```

**Risque** : `path.normalize` + regex `../` peut être bypassé avec des séquences URL-encodées (`%2e%2e%2f`) ou des chemins alternatifs sur Windows (`..\..\`). Un attaquant qui contrôle un chemin `/`-préfixé pourrait lire des fichiers hors de `public/`.

**Contexte** : Cette branche n'est atteinte que si `sourceUrl.startsWith("/")`. Les URLs dans la DB devraient toutes être des URLs Cloudinary (https://), donc ce chemin n'est en pratique jamais emprunté avec des données production.

**Correction recommandée** :

```ts
function getLocalFilePath(sourceUrl: string): string {
  const publicDir = path.join(process.cwd(), "public");
  const resolved = path.resolve(publicDir, sourceUrl.replace(/^\//, ""));
  if (!resolved.startsWith(publicDir + path.sep) && resolved !== publicDir) {
    throw new Error("Path traversal détecté");
  }
  return resolved;
}
```

**Statut** : Correction recommandée

---

## F-SEC-05 — Double endpoint partenariat
**Sévérité** : LOW (organisation)  
**Fichiers** : `src/app/api/partenariat/route.ts`, `src/app/api/devenir-partenaire/route.ts`

Deux endpoints existent pour soumettre une demande de partenariat :
- `POST /api/partenariat` (ancien) : crée Contact + Dossier + Lead, schéma différent (champ `societe`+`ville`)
- `POST /api/devenir-partenaire` (nouveau) : crée Lead uniquement, envoie email admin

**Risque** : Confusion pour les futurs développeurs, données dupliquées si les deux sont appelés.

**Correction recommandée** : Désactiver `/api/partenariat` en retournant 410 Gone, ou le refactorer pour appeler le nouveau endpoint. Vérifier qu'aucun composant n'appelle encore l'ancien endpoint.

**Statut** : À corriger (nettoyage)

---

## F-SEC-06 — Rate limiting : IP depuis x-forwarded-for sans validation
**Sévérité** : LOW  
**Fichier** : `src/lib/rateLimit.ts:100`

```ts
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  // ...
}
```

**Risque** : En théorie, un attaquant peut insérer `X-Forwarded-For: 1.2.3.4` pour contourner le rate limiting par IP. En pratique, Vercel remplace/sécurise `x-forwarded-for` avec l'IP réelle de la requête entrante, donc le risque est faible en prod.

**Statut** : Acceptable en production Vercel

---

## F-SEC-07 — Pas de 2FA pour le compte admin
**Sévérité** : MEDIUM (risque business)  
**Fichiers** : `src/app/api/auth/login/route.ts`, `src/app/admin/login/page.tsx`

Le compte admin n'a pas de double authentification. Si le mot de passe est compromis, l'accès à l'ensemble du CRM est possible.

**Correction recommandée** : Implémenter TOTP (Time-based OTP) avec une bibliothèque comme `otplib`. Alternative plus simple : limiter l'accès admin par IP allowlist en middleware.

**Statut** : À planifier (priorité MEDIUM)

---

## F-SEC-08 — Pas de reset password en self-service pour PARTENAIRE
**Sévérité** : LOW (UX + sécurité)

Les partenaires ne peuvent pas réinitialiser leur mot de passe eux-mêmes. L'admin doit le modifier manuellement. Cela crée une pression pour utiliser des mots de passe simples et mémorisables.

**Correction recommandée** : Ajouter un flow "mot de passe oublié" pour les partenaires :
1. Formulaire `/pro/forgot-password` (email)
2. `POST /api/auth/forgot-password` → génère token (UUID) stocké en DB avec expiry 1h
3. Email avec lien `/pro/reset-password?token=xxx`
4. `POST /api/auth/reset-password` → valide token, hash nouveau MDP

**Statut** : À implémenter

---

## Résumé des priorités

| ID | Sévérité | Effort | Priorité |
|----|---------|--------|---------|
| F-SEC-03 | MEDIUM | 30min | P1 — Corriger maintenant |
| F-SEC-04 | MEDIUM | 20min | P1 — Corriger maintenant |
| F-SEC-01 | MEDIUM | 2h | P2 — Sprint suivant |
| F-SEC-07 | MEDIUM | 1j | P2 — Sprint suivant |
| F-SEC-02 | MEDIUM | 4h | P2 — Sprint suivant |
| F-SEC-08 | LOW | 4h | P3 — Backlog |
| F-SEC-05 | LOW | 30min | P3 — Nettoyage |
| F-SEC-06 | LOW | — | P4 — Acceptable |

---

## Ce qui est bien sécurisé

- ✅ Injection SQL : impossible via Prisma (requêtes paramétrées)
- ✅ XSS reflected : Zod sanitise les inputs, React échappe les outputs
- ✅ IDOR : tous les endpoints sensibles vérifient le rôle via `verifyAuth()`
- ✅ Mass assignment : Zod `safeParse` avant toute écriture en DB
- ✅ Timing attacks login : dummy hash bcrypt
- ✅ Secrets en clair : JWT_SECRET non hardcodé (erreur si absent)
- ✅ Passwords en clair : bcrypt rounds=12
- ✅ Passwords dans les réponses : `select` Prisma exclut toujours `password`
- ✅ Clickjacking : `X-Frame-Options: DENY` + `frame-ancestors 'none'`
- ✅ MIME sniffing : `X-Content-Type-Options: nosniff`
- ✅ Transport : HSTS `max-age=63072000; includeSubDomains; preload`
- ✅ Commission partenaire : champ supprimé des réponses API publiques
- ✅ Documents : non accessibles sans authentification
