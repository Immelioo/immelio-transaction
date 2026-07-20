# Redirect Matrix

Date: 2026-07-20
Status: initial matrix

| URL initiale | Rôle | Environnement | Code / destination actuelle | Comportement attendu | Statut |
| --- | --- | --- | --- | --- | --- |
| `/admin/dashboard` | non connecté | production | `307 -> /admin/login -> 200` | redirection directe vers `/admin/login` | reproduit |
| `/pro/dashboard` | non connecté | production | `307 -> /pro/login -> 200` | redirection vers `/pro/login` | validé |
| `/admin` | non connecté | production | `307 -> /admin/dashboard -> /admin/login` | une seule redirection cohérente | reproduit |
| `/pro/login` | non connecté | production | `200` | accès public | validé |
| `/estimation` | non connecté | production | `200`, parcours bloqué en UI | parcours utilisable | reproduit |
| `/demande-recherche` | non connecté | production | `200` | accès public | validé HTTP |
| `/admin/*` | non connecté | local | proxy route-level active | redirection cohérente | en cours |
| `/pro/*` | non connecté | local | proxy route-level active | redirection cohérente | en cours |

## Notes

- Production still shows a slightly different redirect/header profile than the local repository build.
- Full route matrix remains to be completed role by role.
