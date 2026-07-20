# Corrections Appliquées — Immelio Transaction
**Date** : 2026-07-20  
**Commit** : 50ae5c0

---

## Phase A — Corrections précédentes (commits antérieurs)

| Commit | Description |
|--------|-------------|
| c25ff67 | Domaine canonical, CSP prod, middleware auth, lotSchema, filtres statut biens |
| 0da2fac | Labels types documents, téléchargement proxy, UX estimation, dashboards statut |
| 9f84d5f | Suppression placeholder-document (code mort) |
| 58722a3 | Gestion photos/docs programme dans page modifier + PUT API |

---

## Phase C — Corrections commit 50ae5c0

### FIX-01 : Filtres biens homepage
**Fichier** : `src/app/page.tsx:40`  
**Avant** : `where: { enVedette: true, disponible: true }`  
**Après** : `where: { enVedette: true, statut: { not: "VENDU" } }`

### FIX-02 : Contrôles réordonnancement photos (toujours visibles)
**Fichier** : `src/app/admin/biens/[id]/modifier/page.tsx`  
**Avant** : Boutons dans overlay `opacity-0 group-hover:opacity-100` (invisibles sur touch)  
**Après** : Boutons `←` `→` et `✕` visibles en permanence sous chaque miniature photo + bouton "★ Principale"

### FIX-03 : Page devenir-partenaire (création complète)
**Fichiers créés** :
- `src/app/devenir-partenaire/page.tsx` — Server component + métadonnées
- `src/components/public/DevenirPartenaireForm.tsx` — Formulaire client complet
- `src/app/api/devenir-partenaire/route.ts` — API POST avec validation Zod + email admin

### FIX-04 : Template email demande partenariat
**Fichier** : `src/lib/email.ts`  
**Ajouté** : `emailDemandePartenariat()` — email admin avec liens préfill vers `/admin/partenaires/nouveau`

### FIX-05 : Schema Zod pour candidature partenariat
**Fichier** : `src/lib/schemas.ts`  
**Ajouté** : `devenirPartenaireSchema` avec `sanitizedString()` sur tous les champs texte

### FIX-06 : Section "Demandes entrantes" dans admin partenaires
**Fichier** : `src/app/admin/partenaires/page.tsx`  
**Ajouté** : Bannière amber avec liste des demandes NOUVEAU + bouton "Créer le compte" avec URL préfillée

### FIX-07 : Navigation header — lien "Devenir Partenaire"
**Fichier** : `src/components/layout/Header.tsx`  
**Ajouté** : Bouton desktop + entrée menu mobile → `/devenir-partenaire`

### FIX-08 : CTA homepage mis à jour
**Fichier** : `src/app/page.tsx`  
**Avant** : Un seul bouton "Accéder à l'Espace Pro"  
**Après** : Deux boutons — "Devenir Partenaire" → `/devenir-partenaire` + "Déjà partenaire ? Se connecter" → `/pro/login`

### FIX-09 : Restoration middleware.ts (supprimé accidentellement)
**Fichier** : `src/middleware.ts`  
**Action** : `git checkout HEAD -- src/middleware.ts`

---

## Phase D — Corrections sécurité (post-audit)

### FIX-10 : Protection SSRF dans le proxy de téléchargement
**Fichier** : `src/lib/fileDownload.ts`  
Ajout de `isAllowedRemoteUrl()` qui vérifie que l'hôte est dans `ALLOWED_PROXY_HOSTNAMES` (`res.cloudinary.com`). Toute URL vers un domaine non autorisé retourne 403.

### FIX-11 : Protection traversée de chemin (path traversal)
**Fichier** : `src/lib/fileDownload.ts`  
Remplacement de `path.normalize()` + regex par `path.resolve()` suivi d'une vérification que le chemin résolu est bien sous `process.cwd()/public/`.

### FIX-12 : Dépréciation endpoint legacy `/api/partenariat`
**Fichier** : `src/app/api/partenariat/route.ts`  
L'endpoint retourne maintenant 410 Gone. Utiliser `/api/devenir-partenaire` à la place.

---

## Résultat TypeScript

```bash
npx tsc --noEmit
# → 0 erreurs
```
