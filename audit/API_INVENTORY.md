# API Inventory

Date: 2026-07-20
Status: initial inventory

| Méthodes | Route | Auth attendue | Notes |
| --- | --- | --- | --- |
| PUT | `/api/auth/change-password` | utilisateur connecté | vérifie session |
| POST | `/api/auth/login` | publique | login |
| POST | `/api/auth/logout` | publique avec cookie | logout |
| GET | `/api/auth/me` | utilisateur connecté | retourne session |
| POST, GET | `/api/auth/setup` | publique via token | onboarding partenaire |
| GET, POST | `/api/biens` | GET public, POST admin | CRUD biens |
| GET, PUT, DELETE | `/api/biens/[id]` | GET public/admin, write admin | bien détail |
| POST | `/api/contact` | publique | lead contact |
| GET, POST | `/api/contacts` | admin | CRM contacts |
| PUT, DELETE | `/api/contacts/[id]` | admin | CRM contacts |
| GET | `/api/cron/reminders` | secret cron | cron secret requis |
| POST | `/api/demandes` | publique | demande de recherche |
| PATCH | `/api/demandes/[id]` | admin | traitement demande |
| POST | `/api/devenir-partenaire` | publique | ancien flux lead partenariat |
| POST, GET | `/api/documents` | admin/partner selon cas | documents biens |
| POST, GET | `/api/documents-partenaire` | admin/partner | documents partenaires |
| GET, PUT, DELETE | `/api/documents-partenaire/[id]` | admin/partner | ownership check |
| PATCH | `/api/dossiers/[id]` | admin | traitement dossier |
| GET, POST | `/api/leads` | admin | CRM leads |
| GET, PATCH, DELETE | `/api/leads/[id]` | admin | lead détail |
| POST, PATCH | `/api/leads/[id]/activites` | admin | CRM activités |
| GET, POST, PATCH | `/api/messages` | admin/partner | messagerie interne |
| GET | `/api/messages/unread-count` | admin/partner | badge |
| POST, GET | `/api/options` | admin/partner | options lots |
| PATCH | `/api/options/[id]` | admin/partner | statut option |
| GET, POST | `/api/partenaires` | admin | gestion partenaires |
| GET, PUT, DELETE | `/api/partenaires/[id]` | admin | gestion partenaire |
| POST | `/api/partenaires/[id]/reinvite` | admin | réinvitation |
| POST | `/api/partenariat` | publique | nouveau flux demande partenaire |
| GET, POST | `/api/programmes` | GET public/admin/partner, POST admin | programmes |
| GET, PUT, DELETE | `/api/programmes/[id]` | GET public/admin, write admin | programme détail |
| GET | `/api/programmes/[id]/documents/[documentId]` | public or auth depending document | proxy download |
| GET, PUT | `/api/site-settings` | admin | CMS site |
| GET, POST | `/api/temoignages` | GET public, POST admin | contenus |
| PUT, DELETE | `/api/temoignages/[id]` | admin | contenus |
| POST | `/api/upload` | admin/partner | upload Cloudinary |
| POST | `/api/visites` | publique | demande de visite |
| PATCH | `/api/visites/[id]` | admin | statut visite |

## Observations

- Public lead flows currently rely on `/api/contact`, `/api/demandes`, `/api/devenir-partenaire` and `/api/partenariat`.
- `GET /api/cron/reminders` is not auth-protected but is guarded by `CRON_SECRET`.
- Mutating APIs also pass through origin checks in `src/proxy.ts`.
