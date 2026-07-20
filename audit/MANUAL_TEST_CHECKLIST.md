# Checklist Tests Manuels — Immelio Transaction
**Date** : 2026-07-20  
**À utiliser** : Avant chaque déploiement en production

---

## 1. Pages publiques

### Homepage `/`
- [ ] La page charge sans erreur console
- [ ] Les biens en vedette s'affichent (minimum 1)
- [ ] Les biens VENDU ne sont PAS affichés dans "En vedette"
- [ ] Le bouton "Devenir Partenaire" est visible
- [ ] Le bouton "Déjà partenaire ? Se connecter" est visible
- [ ] Le header est correct (logo, navigation, boutons)
- [ ] Le footer est présent

### Catalogue biens `/biens`
- [ ] La liste des biens s'affiche
- [ ] Les biens VENDU ne sont PAS dans la liste
- [ ] Les filtres (type, budget, etc.) fonctionnent
- [ ] Cliquer sur un bien ouvre la fiche détail

### Fiche bien `/biens/[id]`
- [ ] Photos visibles et navigables
- [ ] Informations correctes (surface, prix, etc.)
- [ ] Le champ `commissionPartenaire` n'est pas visible
- [ ] Bouton "Demander une visite" fonctionne
- [ ] Bouton "Ajouter aux favoris" fonctionne

### Estimation `/estimation`
- [ ] Le wizard démarre correctement
- [ ] Navigation entre les étapes (précédent / suivant)
- [ ] L'étape finale affiche le récapitulatif
- [ ] Le formulaire de contact final se soumet

### Demande de recherche `/demande-recherche`
- [ ] Formulaire affiché correctement
- [ ] Soumission avec données valides → succès
- [ ] Erreur si email invalide
- [ ] Erreur si téléphone invalide

### Contact `/contact`
- [ ] Formulaire affiché
- [ ] Soumission → message de confirmation
- [ ] Erreur si champs requis manquants

### Devenir partenaire `/devenir-partenaire`
- [ ] Section avantages visible (4 cartes)
- [ ] Formulaire affiché (prenom, nom, email, telephone, entreprise, message)
- [ ] Soumission réussie → page de confirmation
- [ ] Erreur si email invalide

---

## 2. Authentification

### Login Admin `/admin/login`
- [ ] Connexion avec bons identifiants → redirect `/admin/dashboard`
- [ ] Connexion avec mauvais MDP → message d'erreur
- [ ] 5 échecs consécutifs → message rate limit

### Login Partenaire `/pro/login`
- [ ] Connexion partenaire réussie → redirect `/pro/dashboard`
- [ ] Connexion avec mauvais MDP → message d'erreur
- [ ] Partenaire ne peut pas accéder à `/admin/*`

### Logout
- [ ] Logout admin → redirect `/admin/login` + session détruite
- [ ] Logout partenaire → redirect `/pro/login` + session détruite
- [ ] Après logout, retour arrière navigateur ne redonne pas accès

---

## 3. Espace Admin

### Dashboard `/admin/dashboard`
- [ ] Statistiques visibles (leads, biens, partenaires...)
- [ ] Liens vers sections opérationnels

### Biens `/admin/biens`
- [ ] Liste des biens (tous statuts)
- [ ] Créer un nouveau bien → formulaire + upload photos
- [ ] Modifier un bien existant
- [ ] **Réordonnancement photos** : boutons ← → visibles et fonctionnels
- [ ] Supprimer un bien → confirmation

### Partenaires `/admin/partenaires`
- [ ] Si des demandes entrantes existent → bannière amber visible
- [ ] Bouton "Créer le compte" préfille les champs
- [ ] Créer partenaire → email d'invitation envoyé
- [ ] Renvoyer invitation → email envoyé
- [ ] Modifier partenaire → modifications sauvées
- [ ] Supprimer partenaire → confirmation

### CRM / Leads `/admin/leads`
- [ ] Liste des leads
- [ ] Fiche lead avec activités
- [ ] Modifier statut lead

### Messages `/admin/messages`
- [ ] Messagerie admin ↔ partenaire fonctionnelle
- [ ] Compteur messages non lus mis à jour

### Paramètres `/admin/parametres` et `/admin/site`
- [ ] Modifier paramètres → sauvegarde

---

## 4. Espace Partenaire

### Dashboard `/pro/dashboard`
- [ ] Tableau de bord avec stats
- [ ] Liens vers sections

### Biens `/pro/biens`
- [ ] Catalogue biens visible
- [ ] Champ `commissionPartenaire` **visible** (contrairement au public)

### Documents `/pro/documents`
- [ ] Liste des documents du partenaire
- [ ] **Téléchargement** : cliquer sur un document → fichier téléchargé
- [ ] Upload nouveau document → visible dans la liste

### Messagerie `/pro/messages`
- [ ] Messages avec admin visibles
- [ ] Envoi de message fonctionnel

---

## 5. Emails (vérifier boîte admin)

- [ ] Formulaire contact → email reçu
- [ ] Demande de partenariat → email admin avec lien "Créer le compte"
- [ ] Lien "Créer le compte" dans l'email → préfille correctement le formulaire admin
- [ ] Invitation partenaire → email avec lien d'activation valide (24h)
- [ ] Lien d'activation → page setup → création MDP → connexion

---

## 6. Mobile (375px)

- [ ] Homepage sur mobile → layout correct
- [ ] Menu hamburger fonctionne
- [ ] Formulaires sur mobile → champs accessibles, clavier mobile
- [ ] Contrôles photos (← → ✕) sur mobile → boutons cliquables
- [ ] Pages biens sur mobile → scroll horizontal si tableau

---

## 7. Sécurité basique

- [ ] `GET /api/partenaires` sans cookie → 401 (tester dans Postman/curl)
- [ ] `GET /api/contacts` sans cookie → 401
- [ ] `POST /api/biens` sans cookie → 401
- [ ] `/admin/dashboard` sans cookie → redirect login (pas de contenu)
- [ ] Response publique `/api/biens/[id]` ne contient pas `commissionPartenaire`
