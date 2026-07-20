# Permission Matrix

Date: 2026-07-20
Status: initial matrix

| Ressource | Public | Client | Partenaire | Admin |
| --- | --- | --- | --- | --- |
| Pages publiques | voir | voir | voir | voir |
| Admin `/admin/*` | non | non | non | voir / administrer |
| Portail pro `/pro/*` | non | non | voir / agir sur ses données | voir / agir |
| Biens publics | voir | voir | voir | voir / créer / modifier / supprimer |
| Programmes publics | voir | voir | voir | voir / créer / modifier / supprimer |
| Documents programme publics | télécharger | télécharger | télécharger | télécharger / gérer |
| Documents programme privés | non | non | voir si autorisé | voir / gérer |
| Documents partenaire | non | non | voir / créer / modifier / supprimer ses documents | voir / gérer tous |
| Lots / options | non | non | voir lots, poser options | administrer |
| Leads CRM | non | non | non | voir / créer / modifier / supprimer |
| Demandes admin | non | non | non | voir / traiter |
| Site settings | non | non | non | voir / modifier |
| Upload fichiers | non | non | oui (selon usage) | oui |

## Notes

- Dedicated client private space is not implemented yet, despite `CLIENT` role in database.
- Full server-side permission audit remains in progress endpoint by endpoint.
