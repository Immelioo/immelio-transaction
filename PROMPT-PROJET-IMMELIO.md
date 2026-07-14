# PROMPT PROJET IMMELIO TRANSACTION — Résumé Complet V2

> **Ce fichier sert de prompt à coller dans une nouvelle conversation Claude pour reprendre le projet.**
> Dernière mise à jour : 13 avril 2026

---

## QUI EST LE CLIENT

**Tao** — Fondateur d'**Immelio Transaction**, agence immobilière nationale basée à Lyon.
- Pas de bureau physique, tout repose sur le site web
- Téléphone : 07 71 55 64 83
- Email : tf.immopro@gmail.com
- Localisation : Lyon, France
- Projet : `~/tao-immo`

---

## STRUCTURE DU SITE — 3 ESPACES

### 1. Espace B2C (Public — clients particuliers)
- **Page d'accueil** (`/`) : hero, stats, biens en vedette, programmes neufs, formulaire de contact
- **Nos Biens** (`/biens`) : liste des biens avec filtres, pagination
- **Détail Bien** (`/biens/[id]`) : photos, description, formulaire de visite
- **Programmes Neufs** (`/programmes`) : liste des programmes
- **Détail Programme** (`/programmes/[id]`) : lots, documents, prix
- **Demande de Recherche** (`/demande-recherche`) : formulaire pour demander un bien spécifique
- **Section "Qui sommes-nous"** : intégrée à la page d'accueil

### 2. Espace B2B (Pro — partenaires)
- **Login Pro** (`/pro/login`) : connexion + formulaire "Devenir partenaire"
- **Dashboard** (`/pro/dashboard`) : stats, options en cours, accès rapide
- **Biens Anciens** (`/pro/biens`) : biens avec commission partenaire visible + documents par bien
- **Programmes Neufs** (`/pro/programmes`) : programmes avec documents, grille de lots, demande d'option
- **Envoyer un Document** (`/pro/envoyer-document`) : upload de mandats, compromis, etc.
- **Demande de Recherche** (`/pro/demande-recherche`) : recherche pour un client du partenaire
- **Bouton CRM Admin** : visible UNIQUEMENT dans la sidebar pro quand connecté en admin

### 3. CRM Admin (privé — admin uniquement)
- **Login Admin** (`/admin/login`) : accessible via le footer "CRM Administration"
- **Dashboard** (`/admin/dashboard`) : vue d'ensemble (biens, disponibles, demandes, visites, partenaires, leads)
- **Gestion des Biens** (`/admin/biens`) : liste, créer, modifier, supprimer
- **Nouveau Bien** (`/admin/biens/nouveau`) : formulaire complet avec photos, équipements, DPE, commission partenaire
- **Gestion des Programmes** (`/admin/programmes`) : liste, créer, modifier, supprimer (avec icône corbeille dans la liste)
- **Modifier Programme** : édition complète avec gestion des lots (ajouter, modifier, supprimer)
- **Partenaires** (`/admin/partenaires`) : liste, créer, modifier, supprimer. Code d'accès auto-généré
- **Demandes** (`/admin/demandes`) : workflow NOUVELLE → EN_COURS → TRAITEE / REFUSEE
- **Visites** (`/admin/visites`) : workflow EN_ATTENTE → CONFIRMEE / ANNULEE
- **Documents Pro** (`/admin/documents-pro`) : validation ENVOYE → VU → VALIDE / REFUSE
- **Leads CRM** (`/admin/leads`) : pipeline NOUVEAU → CONTACTE → QUALIFIE → PROPOSITION → NEGOCE → GAGNE / PERDU
- **Paramètres** (`/admin/parametres`) : changement de mot de passe, infos agence

---

## STACK TECHNIQUE

- **Framework** : Next.js 16.2.1 avec App Router, TypeScript
- **Style** : Tailwind CSS v4
- **ORM** : Prisma v5.22.0
- **Base de données DEV** : SQLite (`prisma/dev.db`)
- **Base de données PROD** : PostgreSQL (Neon — projet `twilight-hall-01908801`) — migration à faire
- **Auth** : localStorage côté client, bcryptjs pour hashage des mots de passe (12 rounds)
- **Upload fichiers** : API `/api/upload` → `public/uploads/`
- **Responsive** : mobile (375px+) et desktop, sidebar hamburger sur mobile

---

## IDENTIFIANTS

| Rôle | Email | Mot de passe |
|------|-------|-------------|
| Admin | `admin@immelio.fr` | `admin123` |
| Partenaire test | `partenaire@exemple.fr` | `partner123` |

---

## MODÈLES DE DONNÉES (Prisma — 14 modèles)

- **User** : clients, partenaires, agents, admin (rôle, code d'accès, entreprise)
- **Bien** : biens immobiliers (type, transaction, prix, surface, DPE, équipements, commissionPartenaire)
- **Photo** : photos de biens
- **Programme** : programmes neufs (promoteur, statut, norme RT, commissionPartenaire)
- **Lot** : lots (numéro, type T1-T5, surface, étage, prix, statut DISPONIBLE/OPTION/RESERVE/VENDU)
- **PhotoProgramme** : photos/perspectives/plans masse
- **DocumentProgramme** : plaquettes, plans, grilles prix
- **DemandeRecherche** : demandes de recherche client/partenaire
- **DemandeVisite** : demandes de visite programmée
- **Document** : documents liés à un bien ou un partenaire
- **DocumentPartenaire** : documents partenaire → admin
- **OptionLot** : options sur lots (7 jours d'expiration)
- **Lead** : pipeline CRM
- **Activite** : historique d'actions sur un lead
- **Message** : messagerie interne (modèle existe, pas encore d'UI)

---

## SÉCURITÉ

- Mots de passe hashés **bcryptjs** (12 rounds) pour admin ET partenaires
- API sensibles (POST/PUT/DELETE) protégées par token admin → 401 si non autorisé
- `localStorage.clear()` à chaque connexion pour éviter conflits de session
- `window.location.href` pour redirections cross-rôle (pas router.push → évite boucles React)
- Commission partenaire masquée côté public (stripée du GET /api/biens)

---

## BUGS CORRIGÉS

1. Route `/bien/[id]` → `/biens/[id]` — liens fonctionnels
2. Mots de passe partenaires en clair → hashés bcrypt
3. Admin CRM inaccessible (boucles redirection) → window.location.href + state machine
4. `dateLivraison` vs `datelivraison` casing → corrigé
5. `commissionPartenaire` absente des API → ajoutée partout
6. DocumentManager type error → corrigé
7. Dashboard fetch type errors → corrigé avec .length
8. Next.js 16 params Promise pattern → corrigé partout

---

## FONCTIONNALITÉS DÉJÀ IMPLÉMENTÉES

- CRUD complet biens (créer, lire, modifier, supprimer) avec photos et documents
- CRUD complet programmes avec gestion des lots
- CRUD complet partenaires (créer, modifier, supprimer) avec code d'accès auto-généré
- Boutons Supprimer (avec confirmation) sur biens, programmes, partenaires
- Édition des lots après création d'un programme
- Page Paramètres (changement mot de passe + infos agence)
- API changement de mot de passe (`/api/auth/change-password`)
- Bouton CRM Admin conditionnel dans la sidebar espace pro (visible si admin)
- Lien CRM Administration dans le footer
- Espace pro complet (biens, programmes, documents, options, demandes)
- Upload de fichiers (photos + documents)
- Workflow de validation documents partenaire
- Pipeline CRM leads
- Gestion des demandes de visite et recherche

---

## NOTES TECHNIQUES CRITIQUES

1. **Next.js 16 params** : `params: Promise<{ id: string }>` avec `await params`
2. **Redirections cross-rôle** : toujours `window.location.href` (JAMAIS `router.push`)
3. **Admin login** : fait `localStorage.clear()` avant de stocker la session
4. **Commission partenaire** : visible pros/admin uniquement, masquée clients
5. **Uploads** : stockés dans `public/uploads/` — doit migrer vers cloud pour production
6. **Le CRM est la priorité absolue** — doit être accessible à tout moment
7. **DeleteButton** component réutilisable dans `src/components/admin/DeleteButton.tsx` (supporte `type: "biens" | "programmes"`, `iconOnly`, `redirectTo`, `onDeleted`)

---

## HÉBERGEMENT — PLAN IMMELIO.FR

### Comptes

| Service | Compte | Statut |
|---------|--------|--------|
| **GitHub** | Immelio69 | CRÉÉ |
| **Vercel** | Connecter avec GitHub | À FAIRE |
| **Neon** | twilight-hall-01908801 | CRÉÉ |
| **OVH** | immelio.fr | ACHETÉ |

### Étapes de déploiement

1. **Préparer le code** : Prisma SQLite → PostgreSQL, .gitignore, next.config, uploads → cloud
2. **Push sur GitHub** : repo `immelio-site` sur Immelio69
3. **Configurer Vercel** : importer repo, variables d'environnement (DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL)
4. **Configurer Neon** : récupérer URL connexion, migration Prisma, seed
5. **DNS OVH** : CNAME `@` et `www` → `cname.vercel-dns.com.`
6. **Lier domaine** : Vercel → Settings → Domains → immelio.fr + www.immelio.fr
7. **Vérification** : tester toutes les pages, admin, pro, mobile

---

## DEMANDES EN COURS — À IMPLÉMENTER

### A. Automatisations CRM (PRIORITÉ HAUTE)

#### A1. Email automatique de confirmation de visite
- Quand une demande de visite arrive, envoyer un **email automatique** au client avec confirmation
- Intégrer un **système d'agenda** pour l'admin (créneaux disponibles)
- Si le créneau est libre → confirmation automatique
- Si occupé → email "Nous reviendrons vers vous rapidement"
- Service email : **Resend** (resend.com) — gratuit 3000 emails/mois, simple à intégrer avec Next.js

#### A2. Création automatique de codes d'accès partenaire + envoi par email
- Quand un partenaire est créé depuis le CRM → **email automatique** envoyé avec :
  - Identifiants de connexion (email + mot de passe temporaire)
  - Code d'accès unique
  - Lien vers l'espace pro
- **Sans intervention de l'admin** (tout automatique à la création)

#### A3. Liste des partenaires à appeler
- Dashboard admin : section **"Partenaires à contacter"**
- Liste les nouveaux partenaires qui n'ont pas encore été appelés
- Bouton "Marqué comme contacté" pour valider
- Ajout d'un champ `contacte: Boolean` et `dateContact: DateTime?` dans le modèle User

### B. Amélioration page d'accueil B2C (PRIORITÉ HAUTE)

#### B1. Page d'accueil plus vivante pour les particuliers
- **Animations** : fade-in des sections au scroll, compteurs animés pour les stats
- **Carrousel de biens** en vedette (auto-scroll)
- **Témoignages clients** (section avec des avis)
- **Barre de recherche** rapide en hero (ville, type, budget)
- **Section "Comment ça marche"** en 3 étapes visuelles
- **Photos plus impactantes** / vidéo de présentation
- **CTA plus visibles** avec micro-animations

### C. Améliorations Admin (PRIORITÉ MOYENNE)

- Notifications en temps réel dans le dashboard (nouvelles demandes, documents)
- Tableau de bord avec graphiques (évolution leads, visites, etc.)
- Export CSV des données (biens, partenaires, leads)
- Messagerie interne fonctionnelle (le modèle Message existe déjà)

---

## STRUCTURE DES FICHIERS CLÉS

```
tao-immo/
├── prisma/
│   ├── schema.prisma          # Schéma BDD (14 modèles)
│   ├── seed.ts                # Données initiales (bcrypt)
│   └── dev.db                 # BDD SQLite (dev uniquement)
├── src/
│   ├── app/
│   │   ├── page.tsx           # Page d'accueil B2C
│   │   ├── biens/             # Pages publiques biens
│   │   │   ├── page.tsx       # Liste biens
│   │   │   └── [id]/page.tsx  # Détail bien
│   │   ├── programmes/        # Pages publiques programmes
│   │   │   ├── page.tsx       # Liste programmes
│   │   │   └── [id]/page.tsx  # Détail programme
│   │   ├── demande-recherche/ # Formulaire recherche
│   │   ├── pro/               # Espace partenaires (B2B)
│   │   │   ├── login/page.tsx
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── biens/page.tsx
│   │   │   ├── programmes/page.tsx (+ LotGrid.tsx, OptionForm.tsx)
│   │   │   ├── envoyer-document/page.tsx
│   │   │   └── demande-recherche/page.tsx
│   │   ├── admin/             # CRM Admin
│   │   │   ├── login/page.tsx
│   │   │   ├── layout.tsx     # Auth guard + AdminSidebar
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── biens/page.tsx, nouveau/page.tsx, [id]/page.tsx, [id]/modifier/page.tsx
│   │   │   ├── programmes/page.tsx, nouveau/page.tsx, [id]/modifier/page.tsx
│   │   │   ├── partenaires/page.tsx, nouveau/page.tsx, [id]/modifier/page.tsx
│   │   │   ├── demandes/page.tsx
│   │   │   ├── visites/page.tsx
│   │   │   ├── documents-pro/page.tsx (+ DocumentStatutActions.tsx)
│   │   │   ├── leads/page.tsx
│   │   │   └── parametres/page.tsx
│   │   └── api/               # Routes API
│   │       ├── auth/login/route.ts, change-password/route.ts
│   │       ├── biens/route.ts, [id]/route.ts
│   │       ├── programmes/route.ts, [id]/route.ts
│   │       ├── partenaires/route.ts, [id]/route.ts
│   │       ├── demandes/route.ts, [id]/route.ts
│   │       ├── visites/route.ts, [id]/route.ts
│   │       ├── leads/[id]/route.ts
│   │       ├── documents/route.ts
│   │       ├── documents-partenaire/route.ts, [id]/route.ts
│   │       ├── options/route.ts
│   │       ├── contact/route.ts
│   │       └── upload/route.ts
│   ├── components/
│   │   ├── layout/Header.tsx, Footer.tsx, AdminSidebar.tsx
│   │   ├── ui/BienCard.tsx, ContactForm.tsx
│   │   └── admin/DeleteButton.tsx, DocumentManager.tsx, DocumentStatutActions.tsx
│   └── lib/
│       ├── prisma.ts          # Client Prisma singleton
│       └── utils.ts           # formatPrix, formatDate
├── public/uploads/            # Fichiers uploadés
├── .env                       # DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL
├── .claude/launch.json        # Config serveur dev (port 3000)
├── package.json
├── next.config.ts
└── tailwind.config.ts
```

---

## POUR RELANCER LE TRAVAIL

Colle ce prompt dans une nouvelle conversation Claude Code, puis dis :

**"Reprends le projet Immelio Transaction. Le code est dans `~/tao-immo`. Commence par [tâche souhaitée]."**

Exemples :
- "Implémente les automatisations email (A1, A2, A3)"
- "Améliore la page d'accueil B2C (B1)"
- "Prépare le code pour le déploiement sur immelio.fr"
- "Lance le serveur dev et vérifie que tout fonctionne"
