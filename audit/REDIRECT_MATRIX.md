# Matrice des Redirections — Immelio Transaction
**Date** : 2026-07-20

---

## Redirections statiques (next.config.ts)

| Source | Destination | Type | Condition |
|--------|-------------|------|-----------|
| `/admin` | `/admin/dashboard` | 307 Temporary | Toujours |

---

## Redirections middleware (src/middleware.ts)

| Condition | Source | Destination |
|-----------|--------|-------------|
| Pas de cookie `auth-token` | `/admin/*` (sauf `/admin/login`) | `/admin/login` |
| Pas de cookie `auth-token` | `/pro/*` (sauf `/pro/login`, `/pro/setup`) | `/pro/login` |

**Pattern admin** : `/^\/admin(?!\/login)(\/|$)/`  
**Pattern pro** : `/^\/pro(?!\/(login|setup))(\/|$)/`

---

## Redirections programmatiques (Server Components)

| Condition | Source | Destination |
|-----------|--------|-------------|
| User connecté (ADMIN/PARTENAIRE) sur `/admin/login` | `/admin/login` | `/admin/dashboard` |
| User connecté (ADMIN/PARTENAIRE) sur `/pro/login` | `/pro/login` | `/pro/dashboard` |
| PARTENAIRE accédant à `/admin/*` | `/admin/*` | `/admin/login` ou 403 |
| ADMIN accédant à `/pro/*` | `/pro/*` | `/pro/login` ou 403 |
| Token invitation invalide/expiré sur `/pro/setup` | `/pro/setup` | `/pro/login` |

---

## Redirections côté client (JavaScript)

| Condition | Source | Destination |
|-----------|--------|-------------|
| Login ADMIN réussi | `/admin/login` | `/admin/dashboard` |
| Login PARTENAIRE réussi | `/pro/login` | `/pro/dashboard` |
| Logout admin | n'importe où | `/admin/login` |
| Logout partenaire | n'importe où | `/pro/login` |

---

## Cas limites à tester

| Scénario | Comportement attendu |
|----------|---------------------|
| PARTENAIRE tente d'accéder à `/admin/dashboard` | Redirigé vers `/admin/login` (middleware) puis 403 (Server Component) |
| ADMIN tente d'accéder à `/pro/dashboard` | Redirigé vers `/pro/login` (middleware) puis 403 (Server Component) |
| Token expiré sur page admin | Middleware laisse passer (présence cookie), Server Component rejette via verifyAuth() → devrait rediriger |
| `/admin` (sans slash) | Redirigé vers `/admin/dashboard` par next.config.ts |
| Deep link `/admin/biens/abc` sans cookie | Redirigé vers `/admin/login` |

---

## Problème potentiel : token expiré non redirigé par middleware

**Symptôme** : Un ADMIN avec un JWT expiré (après 7 jours) garde son cookie `auth-token`. Le middleware le laisse passer car il détecte la présence du cookie. La page admin se charge côté serveur, appelle `verifyAuth()` qui retourne `null`, et le Server Component doit alors gérer la redirection.

**Vérification** : S'assurer que chaque Server Component `/admin/*` contient :
```ts
const user = await verifyAuth(req, "ADMIN");
if (!user) redirect("/admin/login");
```

**Si omis** : La page renvoie une erreur (crash) ou affiche des données vides plutôt que de rediriger.
