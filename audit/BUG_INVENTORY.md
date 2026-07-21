# Bug Inventory

Date: 2026-07-20
Status: initial inventory, live and local comparison in progress

## ANOMALIE FORM-ESTIMATION-001

### Intitulé
Le wizard d'estimation gratuite en production reste bloqué à l'étape 1.

### Catégorie
formulaire

### Environnement
- production
- desktop
- Chrome headless via Playwright
- utilisateur non connecté

### URL ou route concernée
`https://www.immelio.fr/estimation`

### Préconditions
Ouvrir la page d'estimation publique sans être connecté.

### Étapes de reproduction
1. Ouvrir `https://www.immelio.fr/estimation`
2. Cliquer sur `Appartement`
3. Observer l'état du bouton `Suivant`

### Résultat actuel
Le bouton `Suivant` reste désactivé après la sélection du type de bien.

### Résultat attendu
La sélection du type de bien doit activer immédiatement le bouton `Suivant` et permettre le passage à l'étape suivante.

### Gravité
P1

### Impact
- utilisateur
- commercial
- image

### Cause technique identifiée
Le défaut d'origine a été corrigé localement par séparation nette serveur/client sur la page d'estimation, mais la production sert encore une build plus ancienne. Le comportement observé en production ne reflète pas l'état actuel validé localement.

### Correctif recommandé
Déployer la version locale validée, puis verrouiller le parcours avec un test end-to-end Playwright.

### Fichiers concernés
- `src/app/estimation/page.tsx`
- `src/components/public/EstimationWizard.tsx`

### Correctif appliqué
Correctif déjà présent localement. Déploiement production encore à faire.

### Test de non-régression
Test Playwright à finaliser pour vérifier étape 1 -> étape 2 sur prod preview et local.

### Statut
reproduit

### Preuves
- Reproduction Playwright le 2026-07-20: `disabledAfterSelect: true` sur prod

## ANOMALIE SEO-DOMAIN-001

### Intitulé
`robots.txt` et `sitemap.xml` de production pointent encore vers le domaine Vercel au lieu du domaine canonique.

### Catégorie
SEO technique

### Environnement
- production
- HTTP direct

### URL ou route concernée
- `https://www.immelio.fr/robots.txt`
- `https://www.immelio.fr/sitemap.xml`

### Préconditions
Aucune.

### Étapes de reproduction
1. Ouvrir `https://www.immelio.fr/robots.txt`
2. Ouvrir `https://www.immelio.fr/sitemap.xml`

### Résultat actuel
Les deux documents référencent `https://immelio-transaction.vercel.app`.

### Résultat attendu
Le domaine canonique doit être `https://www.immelio.fr`.

### Gravité
P2

### Impact
- SEO
- image
- maintenance

### Cause technique identifiée
La production n'est pas alignée avec la base locale actuelle ou `NEXT_PUBLIC_SITE_URL` n'est pas correctement effectif sur la build déployée.

### Correctif recommandé
Redéployer avec `NEXT_PUBLIC_SITE_URL=https://www.immelio.fr` effectivement pris en compte, puis vérifier robots et sitemap.

### Fichiers concernés
- `src/app/robots.ts`
- `src/app/sitemap.ts`
- configuration Vercel

### Correctif appliqué
Code local déjà correct; correction de prod en attente de déploiement.

### Test de non-régression
Contrôle HTTP post-déploiement sur `robots.txt` et `sitemap.xml`.

### Statut
reproduit

### Preuves
- `robots.txt` live: `Sitemap: https://immelio-transaction.vercel.app/sitemap.xml`
- `sitemap.xml` live: URLs en `https://immelio-transaction.vercel.app/...`

## ANOMALIE DATA-PROGRAMME-LOTS-001

### Intitulé
La modification d'un programme supprimait puis recréait tous les lots, ce qui pouvait effacer les options existantes.

### Catégorie
API

### Environnement
- local
- code review + validation build
- admin

### URL ou route concernée
`PUT /api/programmes/[id]`

### Préconditions
Un programme possède des lots existants, dont au moins un porte des options.

### Étapes de reproduction
1. Modifier un programme via l'admin
2. Retirer un lot existant du payload
3. Envoyer la mise à jour

### Résultat actuel
Avant correctif, l'API supprimait tous les lots puis les recréait. Les options liées aux lots supprimés pouvaient disparaître.

### Résultat attendu
Les lots existants doivent être mis à jour de manière stable. La suppression d'un lot optionné doit être bloquée explicitement.

### Gravité
P1

### Impact
- données
- utilisateur
- commercial
- maintenance

### Cause technique identifiée
Algorithme de synchronisation destructif dans `PUT /api/programmes/[id]`: `deleteMany` suivi de `create`.

### Correctif recommandé
Conserver les identifiants de lots, planifier les créations/mises à jour/suppressions, et refuser la suppression implicite d'un lot portant des options.

### Fichiers concernés
- `src/app/api/programmes/[id]/route.ts`
- `src/app/admin/programmes/[id]/modifier/page.tsx`
- `src/lib/schemas.ts`
- `src/lib/programmeLots.ts`

### Correctif appliqué
Oui. L'API calcule désormais un plan de mutation non destructif et retourne un `409` si un lot optionné serait supprimé.

### Test de non-régression
`tests/programmeLots.test.ts`

### Statut
testé

### Preuves
- test `planProgrammeLotChanges` vert
- build local vert

## ANOMALIE FORM-PARTNERSHIP-001

### Intitulé
Les demandes de partenariat n'alimentaient pas uniformément l'onglet `Demandes`.

### Catégorie
formulaire

### Environnement
- local
- revue de code
- flux public `/devenir-partenaire`
- flux partenaire `/pro/login`

### URL ou route concernée
- `/devenir-partenaire`
- `/pro/login`
- `POST /api/devenir-partenaire`
- `POST /api/partenariat`

### Préconditions
Aucune.

### Étapes de reproduction
1. Inspecter `src/components/public/DevenirPartenaireForm.tsx`
2. Inspecter `src/app/pro/login/page.tsx`
3. Constater que les deux flux postaient sur des endpoints différents, dont l'un renvoyait `410`

### Résultat actuel
Avant correctif :
- `/devenir-partenaire` créait uniquement un lead
- `/pro/login` postait sur `/api/partenariat`, endpoint déprécié en `410`
- l'onglet admin `Demandes` ne constituait pas une source unique fiable

### Résultat attendu
Toute demande de partenariat doit créer un dossier `PARTENARIAT` exploitable par l'admin depuis `Demandes`.

### Gravité
P1

### Impact
- utilisateur
- commercial
- maintenance

### Cause technique identifiée
Duplication de workflows et inversion de la logique canonique entre `/api/devenir-partenaire` et `/api/partenariat`.

### Correctif recommandé
Centraliser la persistance métier et faire converger les deux endpoints publics vers le même workflow.

### Fichiers concernés
- `src/app/api/devenir-partenaire/route.ts`
- `src/app/api/partenariat/route.ts`
- `src/lib/partnershipRequest.ts`
- `src/app/admin/partenaires/page.tsx`

### Correctif appliqué
Oui. Les deux endpoints créent désormais contact + dossier + lead, avec des métadonnées d'origine cohérentes.

### Test de non-régression
Validation compile/build effectuée. Test E2E dossier réel à finaliser sur environnement de test non productif.

### Statut
corrigé

### Preuves
- `src/app/api/partenariat/route.ts` ne renvoie plus `410`
- `src/app/api/devenir-partenaire/route.ts` crée désormais un dossier `PARTENARIAT`

## ANOMALIE BUILD-PROXY-001

### Intitulé
Le dépôt contenait à la fois `src/proxy.ts` et `src/middleware.ts`, ce qui cassait le build Next 16.

### Catégorie
erreur serveur

### Environnement
- local
- build production

### URL ou route concernée
Build application

### Préconditions
Lancer `npm run build`.

### Étapes de reproduction
1. Exécuter `npm run build`

### Résultat actuel
Next 16 échouait avec le message indiquant que `middleware.ts` et `proxy.ts` coexistaient.

### Résultat attendu
Une seule surface Edge doit exister.

### Gravité
P1

### Impact
- maintenance
- déploiement
- stabilité

### Cause technique identifiée
Migration incomplète de `middleware.ts` vers `proxy.ts`.

### Correctif recommandé
Supprimer le fichier `src/middleware.ts` et conserver `src/proxy.ts` comme source unique.

### Fichiers concernés
- `src/middleware.ts`
- `src/proxy.ts`

### Correctif appliqué
Oui. `src/middleware.ts` supprimé.

### Test de non-régression
`npm run build`

### Statut
testé

### Preuves
- build vert le 2026-07-20 après suppression

## ANOMALIE SEC-RATELIMIT-001

### Intitulé
Le rate limiting retombe en mémoire faute de configuration Upstash Redis.

### Catégorie
sécurité

### Environnement
- local build logs
- production design risk

### URL ou route concernée
Toutes les APIs utilisant `src/lib/rateLimit.ts`

### Préconditions
Variables `UPSTASH_REDIS_REST_URL` et `UPSTASH_REDIS_REST_TOKEN` absentes.

### Étapes de reproduction
1. Lancer `npm run build`
2. Observer les warnings
3. Inspecter `src/lib/rateLimit.ts`

### Résultat actuel
Le système utilise un store mémoire par instance, non fiable en environnement serverless multi-instance.

### Résultat attendu
Le compteur doit être partagé et persistant.

### Gravité
P1

### Impact
- sécurité
- performance
- maintenance

### Cause technique identifiée
Configuration Upstash absente, malgré un code de support déjà présent.

### Correctif recommandé
Configurer Upstash Redis en local/staging/production et revalider les routes publiques critiques.

### Fichiers concernés
- `src/lib/rateLimit.ts`
- variables d'environnement Vercel

### Correctif appliqué
Non.

### Test de non-régression
À faire après ajout des variables Upstash.

### Statut
détecté

### Preuves
- warning de build du 2026-07-20

## ANOMALIE SEC-DOCUMENT-001

### Intitulé
Les documents sensibles sont téléchargés via un proxy applicatif, mais les URLs d'origine restent potentiellement publiques si elles fuitent.

### Catégorie
sécurité

### Environnement
- local
- revue de code

### URL ou route concernée
- `POST /api/upload`
- `GET /api/documents-partenaire/[id]`
- `GET /api/programmes/[id]/documents/[documentId]`

### Préconditions
Un document est uploadé vers Cloudinary via `type: "upload"` et son URL est connue.

### Étapes de reproduction
1. Uploader un document
2. Observer que l'URL source est stockée telle quelle
3. Télécharger le document via la route proxy applicative

### Résultat actuel
Le point d'entrée applicatif est protégé, mais l'asset d'origine n'est pas signé ni privé par conception.

### Résultat attendu
Les documents sensibles doivent être servis via une URL temporaire signée ou un stockage privé.

### Gravité
P1

### Impact
- sécurité
- image
- conformité

### Cause technique identifiée
`src/app/api/upload/route.ts` renvoie une URL publique Cloudinary `type: "upload"`, puis cette URL est stockée en base.

### Correctif recommandé
Basculer les documents sensibles vers un stockage privé ou signer dynamiquement les URLs de lecture.

### Fichiers concernés
- `src/app/api/upload/route.ts`
- `src/app/api/documents-partenaire/[id]/route.ts`
- `src/app/api/programmes/[id]/documents/[documentId]/route.ts`

### Correctif appliqué
Non.

### Test de non-régression
À définir après choix d'architecture documentaire sécurisée.

### Statut
détecté

### Preuves
- revue de code des routes upload et download

## ANOMALIE REDIRECT-ADMIN-001

### Intitulé
`/admin` effectuait une double redirection inutile avant d'afficher la page de connexion.

### Catégorie
redirection

### Environnement
- local
- desktop
- utilisateur non connecté

### URL ou route concernée
`/admin`

### Préconditions
Être non authentifié.

### Étapes de reproduction
1. Ouvrir `/admin`
2. Observer la chaîne de redirection HTTP

### Résultat actuel
Avant correctif, la chaîne était :
- `/admin` -> `/admin/dashboard`
- `/admin/dashboard` -> `/admin/login`

### Résultat attendu
`/admin` doit rediriger directement vers `/admin/login` sans détour.

### Gravité
P2

### Impact
- utilisateur
- performance
- image

### Cause technique identifiée
Une règle `redirects()` dans `next.config.ts` forçait `/admin` vers `/admin/dashboard`, alors que le proxy serveur redirigeait ensuite logiquement vers `/admin/login`.

### Correctif recommandé
Supprimer la redirection de configuration et laisser la logique d'accès faire autorité.

### Fichiers concernés
- `next.config.ts`
- `src/app/admin/page.tsx`
- `src/proxy.ts`

### Correctif appliqué
Oui. La règle `redirects()` a été retirée.

### Test de non-régression
`tests/rc/redirects.test.ts`

### Statut
testé

### Preuves
- smoke test RC vert le 2026-07-20

## ANOMALIE SEC-DEP-001

### Intitulé
Le dépôt embarquait `next-auth` vulnérable alors que la librairie n'était pas utilisée.

### Catégorie
sécurité

### Environnement
- local
- audit dépendances

### URL ou route concernée
N/A

### Préconditions
Exécuter `npm audit --json` et rechercher l'usage de `next-auth`.

### Étapes de reproduction
1. Lancer `npm audit --json`
2. Rechercher `next-auth` dans `src/`, `tests/`, `scripts/`, `prisma/`

### Résultat actuel
`next-auth` remontait comme dépendance vulnérable directe alors qu'aucun usage réel n'existait dans le dépôt.

### Résultat attendu
Une dépendance d'auth vulnérable et inutilisée ne doit pas rester installée.

### Gravité
P2

### Impact
- sécurité
- maintenance

### Cause technique identifiée
Dette de dépendance laissée après évolution vers une auth custom JWT/cookie.

### Correctif recommandé
Retirer `next-auth` du projet et regénérer la lockfile.

### Fichiers concernés
- `package.json`
- `package-lock.json`

### Correctif appliqué
Oui. `next-auth` a été retiré.

### Test de non-régression
- `npm install`
- `npm audit --json`
- `npx tsc --noEmit`

### Statut
testé

### Preuves
- `rg -n "next-auth|NextAuth|@auth/core"` ne renvoie plus d'usage applicatif
- `npm ls next-auth` vide le 2026-07-20

## ANOMALIE SEC-DEP-002

### Intitulé
`nodemailer` était en version vulnérable au regard de `npm audit`.

### Catégorie
sécurité

### Environnement
- local
- audit dépendances

### URL ou route concernée
N/A

### Préconditions
Lancer `npm audit --json`.

### Étapes de reproduction
1. Exécuter `npm audit --json`
2. Observer les advisories sur `nodemailer`

### Résultat actuel
`nodemailer` remontait avec un advisory `high` tant que le projet restait sur une version 7.x.

### Résultat attendu
Le provider SMTP du projet doit être maintenu sur une version non signalée en high.

### Gravité
P1

### Impact
- sécurité
- maintenance

### Cause technique identifiée
Version historique trop ancienne de `nodemailer`.

### Correctif recommandé
Mettre `nodemailer` à niveau et rerun toute la chaîne de validation.

### Fichiers concernés
- `package.json`
- `package-lock.json`

### Correctif appliqué
Oui. `nodemailer` est passé en `9.0.3`.

### Test de non-régression
- `npm audit --json`
- `npm run build`
- `npx tsc --noEmit`

### Statut
testé

### Preuves
- plus aucun advisory `high` dans `npm audit` le 2026-07-20

## ANOMALIE BUILD-DEPS-001

### Intitulé
Le proxy Edge utilisait `jose` sans que la dépendance soit déclarée explicitement.

### Catégorie
erreur serveur

### Environnement
- local
- typecheck

### URL ou route concernée
`src/proxy.ts`

### Préconditions
Lancer `npx tsc --noEmit`.

### Étapes de reproduction
1. Exécuter `npx tsc --noEmit`
2. Observer l'erreur sur le module `jose`

### Résultat actuel
Le typecheck cassait après nettoyage npm car `jose` n'était pas déclaré dans `package.json`.

### Résultat attendu
Toute dépendance importée par le proxy Edge doit être explicitement déclarée.

### Gravité
P1

### Impact
- build
- déploiement
- maintenance

### Cause technique identifiée
Incohérence entre le code du proxy et l'arbre de dépendances déclaré.

### Correctif recommandé
Ajouter `jose` explicitement aux dépendances du projet.

### Fichiers concernés
- `package.json`
- `package-lock.json`
- `src/proxy.ts`

### Correctif appliqué
Oui. `jose` est maintenant déclaré explicitement.

### Test de non-régression
- `npx tsc --noEmit`
- `npm run build`

### Statut
testé

### Preuves
- typecheck vert le 2026-07-20
