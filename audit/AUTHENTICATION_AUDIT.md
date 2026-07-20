# Audit Authentification — Immelio Transaction
**Date** : 2026-07-20

---

## Flux d'authentification

### Login
```
Client → POST /api/auth/login
  ├── Rate limit : 5 req/min par IP (Upstash Redis ou mémoire)
  ├── Validation Zod (loginSchema)
  ├── findUnique(email) → bcrypt.compare(password, hash)
  ├── Anti-timing : dummy hash si user inexistant
  ├── Vérif rôle : seuls ADMIN et PARTENAIRE peuvent se connecter
  ├── generateToken({ userId, role, email }) → JWT HS256 7j
  └── Set-Cookie: auth-token=<jwt>; HttpOnly; SameSite=Lax; Secure; Path=/
```

### Logout
```
Client → POST /api/auth/logout
  └── Set-Cookie: auth-token=; expires=<past>; HttpOnly; ...
```

### Vérification d'identité (API routes)
```
verifyAuth(req, requiredRole)
  ├── Lit cookie auth-token (priorité) OU header Authorization: Bearer
  ├── verifyToken(token) → jwt.verify() avec algorithme HS256 strict
  ├── prisma.user.findUnique(userId) → vérifie que l'user existe toujours
  └── Vérifie le rôle si requiredRole fourni
```

---

## Cookie de session

| Propriété | Valeur |
|-----------|--------|
| Nom | `auth-token` |
| Type | HttpOnly (inaccessible JS) |
| SameSite | Lax |
| Secure | true en production |
| Path | `/` |
| Expiry | 7 jours (durée du JWT) |
| Valeur | JWT HS256 |

**Source** : `src/lib/cookieOptions.ts` → `getAuthCookieOptions(req)`

---

## JWT

| Propriété | Valeur |
|-----------|--------|
| Algorithme | HS256 |
| Durée | 7 jours |
| Payload | `{ userId, role, email }` |
| Secret | `process.env.JWT_SECRET` (erreur si absent) |
| Vérification | `jwt.verify()` avec `{ algorithms: ["HS256"] }` |

---

## Deux espaces distincts

| Espace | Login | Redirect si non connecté |
|--------|-------|--------------------------|
| Admin | `/admin/login` | Depuis middleware (`/admin/*`) |
| Pro | `/pro/login` | Depuis middleware (`/pro/*`) |

Le même token sert les deux espaces. La distinction se fait par le champ `role` dans le JWT et vérifié dans `verifyAuth()`.

---

## Activation compte partenaire

Flux distinct du login :
```
Admin → POST /admin/partenaires/nouveau → prisma.user.create({ role: "PARTENAIRE", password: "" })
  → generateInviteToken() → crypto.randomUUID()
  → email avec lien /pro/setup?token=<uuid>

Partenaire → GET /pro/setup?token=<uuid>
  → vérif inviteToken + inviteTokenExpiry (24h)
  → POST /api/auth/setup → bcrypt.hash(password) + inviteToken=null
```

---

## Points positifs

- ✅ Constant-time comparison (dummy hash anti-timing-attack)
- ✅ JWT signé avec secret obligatoire (pas de fallback hardcodé)
- ✅ Algorithme JWT restrictif (`HS256` uniquement)
- ✅ Cookie HttpOnly (pas accessible depuis JS)
- ✅ Vérification DB à chaque requête (l'user peut être désactivé en supprimant son compte)
- ✅ Rate limiting login : 5 tentatives/min

---

## Points à améliorer

| ID | Issue | Priorité |
|----|-------|---------|
| AUTH-01 | Middleware Edge ne valide pas le JWT (présence seulement) | P2 |
| AUTH-02 | Pas de refresh token (le JWT expire après 7j, l'user est déconnecté sans préavis) | P3 |
| AUTH-03 | Pas de révocation de token (si compromis, doit attendre 7j d'expiry) | P3 |
| AUTH-04 | Pas de 2FA admin | P2 |

---

## AUTH-01 — Middleware JWT non validé

**Fichier** : `src/middleware.ts:14`

Le middleware vérifie uniquement la présence du cookie, pas la validité du JWT. Voir [SECURITY_AUDIT.md F-SEC-01](SECURITY_AUDIT.md) pour la correction complète.

---

## AUTH-03 — Révocation de token

Sans base de révocation (blacklist), un token volé reste valide 7 jours. Options :
1. Raccourcir la durée JWT à 1h + refresh token (complexité élevée)
2. Ajouter un champ `tokenVersion: Int` en DB, incrémenté à chaque logout ou changement MDP. Le JWT inclut `tokenVersion` et est rejeté si la version ne correspond plus.
3. Approche minimale : à chaque `verifyAuth()`, on recharge l'user depuis DB (déjà en place ✅) — si l'admin supprime le compte, l'user est immédiatement révoqué.
