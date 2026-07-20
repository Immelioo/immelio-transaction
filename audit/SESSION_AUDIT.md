# Audit Sessions — Immelio Transaction
**Date** : 2026-07-20

---

## Gestion de session actuelle

L'application utilise un JWT stocké dans un cookie HttpOnly. Il n'y a pas de session serveur (pas de `express-session`, pas de table `Session` en DB).

### Durée de vie

- JWT : 7 jours (configurable dans `src/lib/jwt.ts:3` via `JWT_EXPIRES_IN`)
- Cookie : pas de Max-Age explicite (persistant jusqu'à fermeture navigateur si pas de `expires`)

**Action** : Ajouter `maxAge: 7 * 24 * 60 * 60` au cookie pour aligner avec la durée JWT.

### Invalidation

| Scénario | Comportement actuel |
|----------|---------------------|
| Logout | Cookie vidé (expires dans le passé) ✅ |
| Suppression compte | Prochain appel API retourne 401 (verifyAuth() recharge user depuis DB) ✅ |
| Changement MDP | Token reste valide jusqu'à expiry ⚠️ |
| Token expiré | verifyToken() retourne null → 401 ✅ |
| Token forgé | jwt.verify() échoue → 401 ✅ |

### Points d'attention

**SES-01** : Après changement de mot de passe (`POST /api/auth/change-password`), l'ancien JWT reste valide. Si un attaquant a volé le token, le changement de mot de passe ne l'invalide pas immédiatement.

**Correction** : Ajouter un champ `passwordChangedAt: DateTime` en DB. Dans `verifyAuth()`, si `payload.iat < user.passwordChangedAt`, rejeter le token.

**SES-02** : ✅ Le cookie a bien `maxAge: 7 * 24 * 60 * 60` (7 jours) et `sameSite: "strict"` dans `src/lib/cookieOptions.ts`. Pas d'action requise.

---

## Checklist de sécurité session

| Check | Statut |
|-------|--------|
| Cookie HttpOnly | ✅ |
| Cookie Secure (prod) | ✅ |
| Cookie SameSite=Lax | ✅ |
| JWT expirant | ✅ (7j) |
| JWT signé avec secret fort | ✅ |
| Algorithme JWT restreint | ✅ (HS256 only) |
| Vérification user en DB | ✅ |
| Logout efface le cookie | ✅ |
| Max-Age cookie aligné avec JWT | ✅ 7j (cookieOptions.ts) |
| Invalidation après changement MDP | ⚠️ Manquant |
| Protection CSRF | ✅ (SameSite=Lax + HttpOnly) |
