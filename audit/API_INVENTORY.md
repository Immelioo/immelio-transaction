# Inventaire des API Routes — Immelio Transaction
**Date** : 2026-07-20  
**Total** : 37 route handlers

---

## Authentification

| Méthode | Route | Auth requise | Description |
|---------|-------|-------------|-------------|
| POST | `/api/auth/login` | Non | Connexion admin/partenaire — JWT en cookie HttpOnly |
| POST | `/api/auth/logout` | Non | Supprime le cookie auth-token |
| GET | `/api/auth/me` | ADMIN\|PARTENAIRE | Retourne l'utilisateur courant |
| POST | `/api/auth/setup` | Non (token invite) | Activation compte partenaire avec inviteToken |
| POST | `/api/auth/change-password` | ADMIN\|PARTENAIRE | Changement de mot de passe |

---

## Biens immobiliers

| Méthode | Route | Auth requise | Description |
|---------|-------|-------------|-------------|
| GET | `/api/biens` | Non | Liste des biens (filtrée pour public : pas VENDU, pas commissionPartenaire) |
| POST | `/api/biens` | ADMIN | Créer un bien |
| GET | `/api/biens/[id]` | Non | Détail bien (filtré si non-admin) |
| PUT | `/api/biens/[id]` | ADMIN | Modifier un bien (avec gestion photos) |
| DELETE | `/api/biens/[id]` | ADMIN | Supprimer un bien |

---

## Programmes neufs

| Méthode | Route | Auth requise | Description |
|---------|-------|-------------|-------------|
| GET | `/api/programmes` | Non | Liste des programmes |
| POST | `/api/programmes` | ADMIN | Créer un programme |
| GET | `/api/programmes/[id]` | Non | Détail programme |
| PUT | `/api/programmes/[id]` | ADMIN | Modifier un programme |
| DELETE | `/api/programmes/[id]` | ADMIN | Supprimer un programme |
| GET | `/api/programmes/[id]/documents/[documentId]` | ADMIN\|PARTENAIRE | Télécharger document programme |

---

## Contacts / CRM

| Méthode | Route | Auth requise | Description |
|---------|-------|-------------|-------------|
| POST | `/api/contact` | Non | Formulaire contact public |
| GET | `/api/contacts` | ADMIN | Liste contacts CRM |
| POST | `/api/contacts` | ADMIN | Créer un contact |
| GET | `/api/contacts/[id]` | ADMIN | Détail contact |
| PUT | `/api/contacts/[id]` | ADMIN | Modifier contact |
| DELETE | `/api/contacts/[id]` | ADMIN | Supprimer contact |

---

## Demandes de recherche

| Méthode | Route | Auth requise | Description |
|---------|-------|-------------|-------------|
| POST | `/api/demandes` | Non | Soumettre une demande de recherche publique |
| GET | `/api/demandes` | ADMIN (à vérifier) | Lister les demandes |
| GET | `/api/demandes/[id]` | ADMIN | Détail demande |
| PATCH | `/api/demandes/[id]` | ADMIN | Modifier statut demande |
| DELETE | `/api/demandes/[id]` | ADMIN | Supprimer demande |

---

## Partenaires

| Méthode | Route | Auth requise | Description |
|---------|-------|-------------|-------------|
| GET | `/api/partenaires` | ADMIN | Liste des partenaires |
| POST | `/api/partenaires` | ADMIN | Créer un compte partenaire + envoyer invitation |
| GET | `/api/partenaires/[id]` | ADMIN | Détail partenaire |
| PUT | `/api/partenaires/[id]` | ADMIN | Modifier partenaire (partenaireUpdateSchema) |
| DELETE | `/api/partenaires/[id]` | ADMIN | Supprimer partenaire |
| POST | `/api/partenaires/[id]/reinvite` | ADMIN | Renvoyer invitation par email |
| POST | `/api/partenariat` | Non | ⚠️ Ancien endpoint (deprecated) |
| POST | `/api/devenir-partenaire` | Non | Nouveau formulaire demande partenariat |

---

## Documents

| Méthode | Route | Auth requise | Description |
|---------|-------|-------------|-------------|
| GET | `/api/documents-partenaire` | ADMIN\|PARTENAIRE | Documents du partenaire connecté (filtrés par rôle) |
| POST | `/api/documents-partenaire` | ADMIN\|PARTENAIRE | Enregistrer un document partenaire |
| GET | `/api/documents-partenaire/[id]` | ADMIN\|PARTENAIRE | Télécharger document (proxy Cloudinary) |
| PUT | `/api/documents-partenaire/[id]` | ADMIN\|PARTENAIRE | Modifier métadonnées |
| DELETE | `/api/documents-partenaire/[id]` | ADMIN\|PARTENAIRE | Supprimer document |
| POST | `/api/upload` | ADMIN\|PARTENAIRE | Upload fichier vers Cloudinary |
| GET | `/api/documents` | ADMIN | Gestion documents biens (admin) |
| POST | `/api/documents` | ADMIN | Créer document bien |

---

## Leads

| Méthode | Route | Auth requise | Description |
|---------|-------|-------------|-------------|
| GET | `/api/leads` | ADMIN | Liste des leads |
| POST | `/api/leads` | ADMIN | Créer un lead |
| GET | `/api/leads/[id]` | ADMIN | Détail lead |
| PUT | `/api/leads/[id]` | ADMIN | Modifier lead |
| DELETE | `/api/leads/[id]` | ADMIN | Supprimer lead |
| POST | `/api/leads/[id]/activites` | ADMIN | Ajouter activité au lead |

---

## Messagerie

| Méthode | Route | Auth requise | Description |
|---------|-------|-------------|-------------|
| GET | `/api/messages` | ADMIN\|PARTENAIRE | Messages (filtrés par rôle) |
| POST | `/api/messages` | ADMIN\|PARTENAIRE | Envoyer un message |
| GET | `/api/messages/unread-count` | ADMIN\|PARTENAIRE | Nombre de messages non lus |

---

## Visites

| Méthode | Route | Auth requise | Description |
|---------|-------|-------------|-------------|
| GET | `/api/visites` | ADMIN | Liste des visites |
| POST | `/api/visites` | Non | Demander une visite (formulaire public) |
| PUT | `/api/visites/[id]` | ADMIN | Modifier visite |
| DELETE | `/api/visites/[id]` | ADMIN | Supprimer visite |

---

## Dossiers

| Méthode | Route | Auth requise | Description |
|---------|-------|-------------|-------------|
| PATCH | `/api/dossiers/[id]` | ADMIN | Modifier dossier (statut, notes) |

---

## Paramètres & Contenu

| Méthode | Route | Auth requise | Description |
|---------|-------|-------------|-------------|
| GET | `/api/site-settings` | Non | Paramètres publics du site |
| PUT | `/api/site-settings` | ADMIN | Modifier paramètres site |
| GET | `/api/temoignages` | Non | Liste des témoignages |
| POST | `/api/temoignages` | ADMIN | Créer témoignage |
| PUT | `/api/temoignages/[id]` | ADMIN | Modifier témoignage |
| DELETE | `/api/temoignages/[id]` | ADMIN | Supprimer témoignage |
| GET | `/api/options` | ADMIN | Options/paramètres admin |
| POST | `/api/options` | ADMIN | Créer option |
| PUT | `/api/options/[id]` | ADMIN | Modifier option |
| DELETE | `/api/options/[id]` | ADMIN | Supprimer option |

---

## Tâches planifiées

| Méthode | Route | Auth requise | Description |
|---------|-------|-------------|-------------|
| GET | `/api/cron/reminders` | Cron-Secret header | Envoi des rappels automatiques |

---

## Points d'attention

1. **`/api/partenariat`** — endpoint legacy à désactiver (voir SECURITY_AUDIT F-SEC-05)
2. **`GET /api/demandes`** — vérifier si l'auth est bien requise (éviter exposition données clients)
3. **`/api/programmes/[id]/documents/[documentId]`** — vérifier le contrôle d'accès sur chaque document
4. **`/api/visites` POST** — public, rate limité à 3/min par IP (correct)
5. **`/api/cron/reminders`** — doit vérifier `process.env.CRON_SECRET` dans le header
