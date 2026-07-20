# Issues Restantes — Immelio Transaction
**Date** : 2026-07-20

Classées par priorité. P1 = bloquer le lancement. P2 = avant ou juste après launch. P3 = backlog.

---

## P1 — Bloquants pour la mise en production

### REM-01 : Variables d'environnement Vercel
**Action utilisateur requise** (ne peut pas être automatisé)

Vérifier que ces variables sont définies dans Vercel > Settings > Environment Variables :

| Variable | Requis | Notes |
|----------|--------|-------|
| `DATABASE_URL` | ✅ | URL Neon PostgreSQL |
| `JWT_SECRET` | ✅ | Minimum 32 caractères aléatoires |
| `NEXTAUTH_URL` | ✅ | `https://www.immelio.fr` |
| `NEXT_PUBLIC_SITE_URL` | ✅ | `https://www.immelio.fr` |
| `CLOUDINARY_CLOUD_NAME` | ✅ | |
| `CLOUDINARY_API_KEY` | ✅ | |
| `CLOUDINARY_API_SECRET` | ✅ | |
| `GMAIL_USER` | ✅ | |
| `GMAIL_APP_PASSWORD` | ✅ | |
| `ADMIN_EMAIL` | ✅ | Email de réception admin |
| `UPSTASH_REDIS_REST_URL` | Recommandé | Sans Redis, rate limiting par instance |
| `UPSTASH_REDIS_REST_TOKEN` | Recommandé | |
| `CRON_SECRET` | ✅ | Pour `/api/cron/reminders` |
| `RESEND_API_KEY` | Optionnel | Fallback email |

---

## P2 — Avant ou juste après le lancement

### ~~REM-02 : Proxy téléchargement — allowlist domaine (SSRF)~~ ✅ CORRIGÉ
`src/lib/fileDownload.ts` — `isAllowedRemoteUrl()` vérifie que le hostname est dans `ALLOWED_PROXY_HOSTNAMES` (`res.cloudinary.com`)

### ~~REM-03 : Path traversal local dans fileDownload~~ ✅ CORRIGÉ
`src/lib/fileDownload.ts` — `getLocalFilePath()` utilise `path.resolve()` + vérification que le chemin résolu est bien sous `public/`

### REM-04 : Middleware JWT — valider le token en Edge
**Fichier** : `src/middleware.ts`  
**Action** : Importer `verifyToken()` (Edge-compatible sans prisma) et valider la signature  
**Effort** : 1h (s'assurer que `jsonwebtoken` fonctionne en Edge ou migrer vers `jose`)  
Voir [SECURITY_AUDIT F-SEC-01](SECURITY_AUDIT.md)

### ~~REM-05 : Désactivation endpoint legacy `/api/partenariat`~~ ✅ CORRIGÉ
`src/app/api/partenariat/route.ts` — retourne 410 Gone

### REM-06 : Vérifier auth sur GET /api/demandes
**Fichier** : `src/app/api/demandes/route.ts`  
**Action** : Confirmer qu'il n'y a que le POST dans ce fichier (GET dans route.ts d'un autre niveau)  
**Effort** : 5 min

### REM-07 : Suppression fichiers Cloudinary lors delete document
**Fichier** : `src/app/api/documents-partenaire/[id]/route.ts`  
**Action** : Vérifier et ajouter `getCloudinary().uploader.destroy(publicId)` si absent  
**Effort** : 30 min

---

## P3 — Backlog

### REM-08 : 2FA pour compte admin
Implémenter TOTP avec `otplib` ou restreindre l'accès admin par IP allowlist.  
**Effort** : 1 jour

### REM-09 : Reset password en self-service pour partenaires
Flow complet : formulaire `/pro/forgot-password` → token DB (1h) → email → `/pro/reset-password?token=`  
**Effort** : 4h

### REM-10 : CSP sans unsafe-inline
Migrer vers CSP nonce-based.  
**Effort** : 4h (Next.js 15+ middleware nonce)

### REM-11 : Invalidation JWT après changement MDP
Ajouter champ `passwordChangedAt` en DB, vérifier dans `verifyAuth()`.  
**Effort** : 2h + migration Prisma

### ~~REM-12 : Max-Age cookie aligné avec JWT~~ ✅ DÉJÀ EN PLACE
`src/lib/cookieOptions.ts` — `maxAge: 7 * 24 * 60 * 60` et `sameSite: "strict"` déjà configurés

### REM-13 : noindex sur pages admin/pro
Ajouter dans les layouts :
```ts
export const metadata = { robots: { index: false, follow: false } };
```
**Effort** : 10 min

### REM-14 : Extraction entreprise depuis lead.notes (fragile)
Ajouter colonne `entreprise` sur le modèle `Lead` ou utiliser JSON metadata.  
**Effort** : 2h + migration Prisma

### REM-15 : Scan antivirus documents upload
Intégrer Cloudinary Malware Scan add-on.  
**Effort** : Dépend du plan Cloudinary
