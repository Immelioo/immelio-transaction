# Inventaire des Routes Pages — Immelio Transaction
**Date** : 2026-07-20

---

## Pages Publiques

| Route | Composant | Auth | Description |
|-------|-----------|------|-------------|
| `/` | `src/app/page.tsx` | Non | Accueil — biens en vedette, CTA |
| `/biens` | `src/app/biens/page.tsx` | Non | Catalogue biens (filtre statut≠VENDU) |
| `/biens/[id]` | `src/app/biens/[id]/page.tsx` | Non | Fiche détail bien |
| `/programmes` | `src/app/programmes/page.tsx` | Non | Liste programmes neufs |
| `/programmes/[id]` | `src/app/programmes/[id]/page.tsx` | Non | Fiche programme |
| `/estimation` | `src/app/estimation/page.tsx` | Non | Wizard estimation gratuite |
| `/demande-recherche` | `src/app/demande-recherche/page.tsx` | Non | Formulaire recherche |
| `/contact` | `src/app/contact/page.tsx` | Non | Formulaire contact |
| `/devenir-partenaire` | `src/app/devenir-partenaire/page.tsx` | Non | Candidature partenariat |
| `/favoris` | `src/app/favoris/page.tsx` | Non | Favoris (localStorage) |
| `/about` | `src/app/about/page.tsx` | Non | À propos |
| `/mentions-legales` | `src/app/mentions-legales/page.tsx` | Non | Mentions légales |
| `/politique-confidentialite` | `src/app/politique-confidentialite/page.tsx` | Non | RGPD |

---

## Authentification

| Route | Composant | Description |
|-------|-----------|-------------|
| `/admin/login` | `src/app/admin/login/page.tsx` | Login administrateur |
| `/pro/login` | `src/app/pro/login/page.tsx` | Login partenaire |
| `/pro/setup` | `src/app/pro/setup/page.tsx` | Activation compte partenaire (inviteToken) |

---

## Espace Partenaire (`/pro/*`)

Toutes ces routes nécessitent un cookie `auth-token` valide avec rôle `PARTENAIRE`.

| Route | Composant | Description |
|-------|-----------|-------------|
| `/pro/dashboard` | `src/app/pro/dashboard/page.tsx` | Tableau de bord partenaire |
| `/pro/biens` | `src/app/pro/biens/page.tsx` | Catalogue biens (vue partenaire) |
| `/pro/programmes` | `src/app/pro/programmes/page.tsx` | Programmes neufs |
| `/pro/documents` | `src/app/pro/documents/page.tsx` | Documents du partenaire |
| `/pro/envoyer-document` | `src/app/pro/envoyer-document/page.tsx` | Upload document |
| `/pro/historique` | `src/app/pro/historique/page.tsx` | Historique activités |
| `/pro/messages` | `src/app/pro/messages/page.tsx` | Messagerie admin ↔ partenaire |
| `/pro/demande-recherche` | `src/app/pro/demande-recherche/page.tsx` | Soumettre demande recherche |

---

## Espace Admin (`/admin/*`)

Toutes ces routes nécessitent un cookie `auth-token` valide avec rôle `ADMIN`.

| Route | Composant | Description |
|-------|-----------|-------------|
| `/admin` | Redirect | → `/admin/dashboard` |
| `/admin/dashboard` | `src/app/admin/dashboard/page.tsx` | Vue d'ensemble |
| `/admin/biens` | `src/app/admin/biens/page.tsx` | Gestion biens |
| `/admin/biens/nouveau` | `src/app/admin/biens/nouveau/page.tsx` | Créer bien |
| `/admin/biens/[id]` | `src/app/admin/biens/[id]/page.tsx` | Voir bien |
| `/admin/biens/[id]/modifier` | `src/app/admin/biens/[id]/modifier/page.tsx` | Modifier bien + photos |
| `/admin/programmes` | `src/app/admin/programmes/page.tsx` | Gestion programmes |
| `/admin/programmes/nouveau` | `src/app/admin/programmes/nouveau/page.tsx` | Créer programme |
| `/admin/programmes/[id]/modifier` | `src/app/admin/programmes/[id]/modifier/page.tsx` | Modifier programme |
| `/admin/contacts` | `src/app/admin/contacts/page.tsx` | CRM contacts |
| `/admin/crm` | `src/app/admin/crm/page.tsx` | Vue CRM complète |
| `/admin/leads` | `src/app/admin/leads/page.tsx` | Gestion leads |
| `/admin/leads/[id]` | `src/app/admin/leads/[id]/page.tsx` | Détail lead |
| `/admin/partenaires` | `src/app/admin/partenaires/page.tsx` | Gestion partenaires + demandes |
| `/admin/partenaires/nouveau` | `src/app/admin/partenaires/nouveau/page.tsx` | Créer partenaire |
| `/admin/partenaires/[id]/modifier` | `src/app/admin/partenaires/[id]/modifier/page.tsx` | Modifier partenaire |
| `/admin/demandes` | `src/app/admin/demandes/page.tsx` | Demandes de recherche |
| `/admin/visites` | `src/app/admin/visites/page.tsx` | Gestion visites |
| `/admin/messages` | `src/app/admin/messages/page.tsx` | Messagerie admin |
| `/admin/documents-pro` | `src/app/admin/documents-pro/page.tsx` | Documents partenaires |
| `/admin/parametres` | `src/app/admin/parametres/page.tsx` | Paramètres admin |
| `/admin/site` | `src/app/admin/site/page.tsx` | Éditeur contenu site |
| `/admin/temoignages` | `src/app/admin/temoignages/page.tsx` | Gestion témoignages |

---

## Métadonnées SEO

| Route | Title | Description |
|-------|-------|-------------|
| `/` | Immelio Transaction — Agence Immobilière | Oui |
| `/biens` | Nos Biens — Immelio Transaction | Oui |
| `/programmes` | Programmes Neufs — Immelio Transaction | Oui |
| `/estimation` | Estimation Gratuite — Immelio Transaction | Oui |
| `/devenir-partenaire` | Devenir Partenaire — Immelio Transaction | Oui |
| `/about` | À propos — Immelio Transaction | Oui |
| `/contact` | Contact — Immelio Transaction | Oui |
| `/mentions-legales` | Mentions légales — Immelio Transaction | Oui |
| Pages admin/pro | — | Non indexées (noindex recommandé) |

---

## Recommandation SEO

Ajouter dans les layouts admin et pro :
```ts
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};
```
