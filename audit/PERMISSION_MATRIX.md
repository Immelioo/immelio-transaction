# Matrice des Permissions — Immelio Transaction
**Date** : 2026-07-20

---

## Légende

| Symbole | Signification |
|---------|--------------|
| ✅ | Accès autorisé |
| ❌ | Accès refusé (401/403) |
| 🔒 | Accès restreint (données filtrées) |
| 🔀 | Redirigé vers login |

---

## Pages (Server Components)

| Route | Anonyme | CLIENT | PARTENAIRE | ADMIN |
|-------|---------|--------|-----------|-------|
| `/` | ✅ | ✅ | ✅ | ✅ |
| `/biens` | ✅ | ✅ | ✅ | ✅ |
| `/biens/[id]` | 🔒 (pas VENDU) | 🔒 | ✅ | ✅ |
| `/programmes` | ✅ | ✅ | ✅ | ✅ |
| `/programmes/[id]` | ✅ | ✅ | ✅ | ✅ |
| `/estimation` | ✅ | ✅ | ✅ | ✅ |
| `/demande-recherche` | ✅ | ✅ | ✅ | ✅ |
| `/contact` | ✅ | ✅ | ✅ | ✅ |
| `/devenir-partenaire` | ✅ | ✅ | ✅ | ✅ |
| `/favoris` | ✅ | ✅ | ✅ | ✅ |
| `/about` | ✅ | ✅ | ✅ | ✅ |
| `/mentions-legales` | ✅ | ✅ | ✅ | ✅ |
| `/politique-confidentialite` | ✅ | ✅ | ✅ | ✅ |
| `/pro/login` | ✅ | ✅ | ✅ | ✅ |
| `/pro/setup` | ✅ (token requis) | ✅ | ✅ | ✅ |
| `/pro/dashboard` | 🔀 login | — | ✅ | ❌* |
| `/pro/biens` | 🔀 login | — | ✅ | ❌* |
| `/pro/documents` | 🔀 login | — | ✅ | ❌* |
| `/pro/messages` | 🔀 login | — | ✅ | ❌* |
| `/pro/demande-recherche` | 🔀 login | — | ✅ | ❌* |
| `/admin/login` | ✅ | ✅ | ✅ | ✅ |
| `/admin/dashboard` | 🔀 login | — | ❌* | ✅ |
| `/admin/biens` | 🔀 login | — | ❌* | ✅ |
| `/admin/biens/[id]` | 🔀 login | — | ❌* | ✅ |
| `/admin/contacts` | 🔀 login | — | ❌* | ✅ |
| `/admin/crm` | 🔀 login | — | ❌* | ✅ |
| `/admin/partenaires` | 🔀 login | — | ❌* | ✅ |
| `/admin/leads` | 🔀 login | — | ❌* | ✅ |
| `/admin/messages` | 🔀 login | — | ❌* | ✅ |
| `/admin/parametres` | 🔀 login | — | ❌* | ✅ |
| `/admin/site` | 🔀 login | — | ❌* | ✅ |

*\* Le middleware redirige si pas de cookie. Les Server Components vérifient le rôle (verifyAuth). Un PARTENAIRE avec cookie valide accédant à `/admin/*` sera redirigé par le Server Component.*

---

## API Routes

| Endpoint | Méthode | Anonyme | PARTENAIRE | ADMIN |
|----------|---------|---------|-----------|-------|
| `/api/auth/login` | POST | ✅ | ✅ | ✅ |
| `/api/auth/logout` | POST | ✅ | ✅ | ✅ |
| `/api/auth/me` | GET | ❌ 401 | ✅ | ✅ |
| `/api/auth/setup` | POST | ✅ (token) | ✅ | ✅ |
| `/api/auth/change-password` | POST | ❌ | ✅ | ✅ |
| `/api/biens` | GET | ✅ 🔒 | ✅ | ✅ |
| `/api/biens/[id]` | GET | ✅ 🔒 | ✅ | ✅ |
| `/api/biens` | POST | ❌ | ❌ | ✅ |
| `/api/biens/[id]` | PUT | ❌ | ❌ | ✅ |
| `/api/biens/[id]` | DELETE | ❌ | ❌ | ✅ |
| `/api/contact` | POST | ✅ | ✅ | ✅ |
| `/api/contacts` | GET | ❌ | ❌ | ✅ |
| `/api/contacts` | POST | ❌ | ❌ | ✅ |
| `/api/contacts/[id]` | GET/PUT/DELETE | ❌ | ❌ | ✅ |
| `/api/demandes` | POST | ✅ | ✅ | ✅ |
| `/api/demandes` | GET | ❌* | ❌* | ✅ |
| `/api/demandes/[id]` | GET/PATCH/DELETE | ❌ | ❌ | ✅ |
| `/api/devenir-partenaire` | POST | ✅ | ✅ | ✅ |
| `/api/documents` | GET/POST | ❌ | ❌ | ✅ |
| `/api/documents-partenaire` | GET | ❌ | ✅ (ses docs) | ✅ (tous) |
| `/api/documents-partenaire` | POST | ❌ | ✅ | ✅ |
| `/api/documents-partenaire/[id]` | GET/PUT/DELETE | ❌ | ✅ (ses docs) | ✅ |
| `/api/dossiers/[id]` | PATCH | ❌ | ❌ | ✅ |
| `/api/leads` | GET/POST | ❌ | ❌ | ✅ |
| `/api/leads/[id]` | GET/PUT/DELETE | ❌ | ❌ | ✅ |
| `/api/messages` | GET/POST | ❌ | ✅ (ses msgs) | ✅ |
| `/api/messages/unread-count` | GET | ❌ | ✅ | ✅ |
| `/api/options` | GET/POST | ❌ | ❌ | ✅ |
| `/api/options/[id]` | PUT/DELETE | ❌ | ❌ | ✅ |
| `/api/partenaires` | GET/POST | ❌ | ❌ | ✅ |
| `/api/partenaires/[id]` | GET/PUT/DELETE | ❌ | ❌ | ✅ |
| `/api/partenaires/[id]/reinvite` | POST | ❌ | ❌ | ✅ |
| `/api/partenariat` | POST | ✅ | ✅ | ✅ |
| `/api/programmes` | GET/POST | ✅/❌ | ✅/❌ | ✅ |
| `/api/programmes/[id]` | GET/PUT/DELETE | ✅/❌/❌ | ✅/❌/❌ | ✅ |
| `/api/site-settings` | GET | ✅ | ✅ | ✅ |
| `/api/site-settings` | PUT | ❌ | ❌ | ✅ |
| `/api/temoignages` | GET | ✅ | ✅ | ✅ |
| `/api/temoignages` | POST/PUT/DELETE | ❌ | ❌ | ✅ |
| `/api/upload` | POST | ❌ | ✅ | ✅ |
| `/api/visites` | GET/POST | ❌ | ❌ | ✅ |
| `/api/visites/[id]` | PUT/DELETE | ❌ | ❌ | ✅ |
| `/api/cron/reminders` | GET | Cron-Secret | — | — |

*\* Vérifier `GET /api/demandes` — s'il est public, toutes les demandes de recherche seraient exposées.*

---

## Données filtrées par rôle

| Donnée | Anonyme | PARTENAIRE | ADMIN |
|--------|---------|-----------|-------|
| `commissionPartenaire` (bien) | ❌ supprimé | ✅ | ✅ |
| `documents` (bien) | ❌ | ❌* | ✅ |
| Biens VENDU | ❌ 404 | ✅ | ✅ |
| Leads complets | ❌ | ❌ | ✅ |
| Contacts CRM | ❌ | ❌ | ✅ |
| Documents partenaire | ❌ | Ses docs seulmt | Tous |

*\* Les partenaires accèdent aux documents via leur propre espace `/pro/documents`, pas via `/api/biens/[id]`.*
