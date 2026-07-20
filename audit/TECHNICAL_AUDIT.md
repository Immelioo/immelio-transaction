# Audit Technique Exhaustif — Immelio Transaction
**Date** : 2026-07-20  
**Auditeur** : Claude Sonnet 4.6  
**Périmètre** : Codebase complète (115+ fichiers TS/TSX)  
**Branche** : main (commit 50ae5c0)

---

## Stack technique

| Composant | Version | Notes |
|-----------|---------|-------|
| Next.js | 16.2.9 | App Router, React Server Components |
| React | 19 | Concurrent features |
| TypeScript | 5.x | Mode strict |
| Prisma | 5.x | ORM PostgreSQL |
| PostgreSQL | — | Hébergement Neon |
| Cloudinary | — | Photos + documents |
| Nodemailer | — | SMTP Gmail + fallback Resend |
| JWT | jsonwebtoken 9.x | HS256, expiry 7j |
| bcryptjs | — | Hachage mots de passe (rounds=12) |
| Upstash Redis | — | Rate limiting serverless |
| Zod | 3.x | Validation schémas |
| Tailwind CSS | 3.x | Styles |
| Vercel | — | Hébergement / déploiement |

---

## Vue d'ensemble

### Points forts
- Architecture App Router correctement structurée (server components, route handlers)
- Validation Zod systématique sur toutes les routes API
- Authentification JWT avec cookie HttpOnly
- Rate limiting hybride Upstash + mémoire
- Hash bcrypt avec 12 rounds
- Headers sécurité complets (HSTS, X-Frame-Options, CSP, etc.)
- `poweredByHeader: false` (masque Next.js)
- Pas de password dans les `select` Prisma
- Logs structurés via `src/lib/logger.ts`
- Upload avec UUID aléatoire (pas de noms devinables)
- Constant-time password comparison (dummy hash anti-timing-attack)

### Points à corriger (résumé)
- Middleware Edge ne valide pas le JWT (présence seulement)
- CSP : `'unsafe-inline'` dans `script-src` affaiblit la protection XSS
- Proxy téléchargement sans allowlist de domaine
- Traversée de chemin locale dans `fileDownload.ts`
- Double endpoint partenariat (`/api/partenariat` + `/api/devenir-partenaire`)
- Pas de 2FA pour le compte admin
- Pas de reset password en self-service pour les partenaires
- IP rate limiting spoofable si Vercel mal configuré
- `GET /api/demandes` : vérifier présence d'auth (route publique ?)

---

## Architecture des rôles

```
CLIENT     → Espace public uniquement (biens, estimation, contact, favoris localStorage)
PARTENAIRE → /pro/* (dashboard, biens, documents, messages, demandes)
ADMIN      → /admin/* (CRM complet, partenaires, biens, programmes, sites settings)
```

---

## Résultats par domaine

| Domaine | Sévérité max | Nb findings |
|---------|-------------|-------------|
| Sécurité | MEDIUM | 6 |
| Authentification | LOW | 2 |
| Autorisations | LOW | 1 |
| Upload | MEDIUM | 1 |
| Sessions | LOW | 1 |
| Responsive | LOW | 3 |
| Performance | INFO | 2 |
| Fonctionnel | FIXED | 6 |

---

## Commits de correction

| Commit | Description |
|--------|-------------|
| 50ae5c0 | Phase C : 6 bugs corrigés + page devenir-partenaire + filtres statut |

---

## Fichiers d'audit détaillés

- [SECURITY_AUDIT.md](SECURITY_AUDIT.md) — Findings sécurité détaillés
- [AUTHENTICATION_AUDIT.md](AUTHENTICATION_AUDIT.md) — Flux d'authentification
- [SESSION_AUDIT.md](SESSION_AUDIT.md) — Gestion des sessions
- [PERMISSION_MATRIX.md](PERMISSION_MATRIX.md) — Matrice d'accès par rôle
- [REDIRECT_MATRIX.md](REDIRECT_MATRIX.md) — Toutes les redirections
- [API_INVENTORY.md](API_INVENTORY.md) — 37 routes API documentées
- [ROUTE_INVENTORY.md](ROUTE_INVENTORY.md) — Routes pages documentées
- [UPLOAD_AUDIT.md](UPLOAD_AUDIT.md) — Sécurité des uploads
- [RESPONSIVE_AUDIT.md](RESPONSIVE_AUDIT.md) — Bugs affichage
- [BUG_INVENTORY.md](BUG_INVENTORY.md) — Inventaire bugs
- [FIXES_APPLIED.md](FIXES_APPLIED.md) — Corrections appliquées
- [REMAINING_ISSUES.md](REMAINING_ISSUES.md) — Issues restantes
- [TEST_PLAN.md](TEST_PLAN.md) — Plan de tests
- [MANUAL_TEST_CHECKLIST.md](MANUAL_TEST_CHECKLIST.md) — Checklist tests manuels
- [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) — Checklist déploiement
- [ROLLBACK_PLAN.md](ROLLBACK_PLAN.md) — Plan de rollback
