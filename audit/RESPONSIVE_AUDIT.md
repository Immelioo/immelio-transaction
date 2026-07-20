# Audit Responsive & Affichage — Immelio Transaction
**Date** : 2026-07-20

---

## Breakpoints Tailwind utilisés

| Classe | Largeur min |
|--------|------------|
| sm | 640px |
| md | 768px |
| lg | 1024px |
| xl | 1280px |
| 2xl | 1536px |

---

## Résolutions testées (à valider)

| Résolution | Dispositif | Statut |
|-----------|-----------|--------|
| 375×812 | iPhone SE / 14 | À tester |
| 390×844 | iPhone 14 Pro | À tester |
| 768×1024 | iPad | À tester |
| 1280×800 | Laptop | À tester |
| 1920×1080 | Desktop | À tester |

---

## Findings Responsive

### RESP-01 — Contrôles photo reorder (CORRIGÉ)
**Fichier** : `src/app/admin/biens/[id]/modifier/page.tsx`  
**Statut** : ✅ CORRIGÉ dans commit 50ae5c0

Les boutons de réordonnancement des photos étaient masqués derrière un overlay `opacity-0 group-hover:opacity-100`, invisible sur mobile/tactile. Remplacés par des boutons toujours visibles sous chaque miniature.

### RESP-02 — Table admin avec overflow-x-auto
**Fichier** : `src/app/admin/partenaires/page.tsx:88`  
**Statut** : ✅ Géré (overflow-x-auto présent)

La table des partenaires est wrappée dans `overflow-x-auto`, permettant le scroll horizontal sur mobile.

### RESP-03 — Header mobile
**Fichier** : `src/components/layout/Header.tsx`  
**Statut** : ✅ Menu hamburger fonctionnel

Menu desktop masqué sur mobile (`hidden md:flex`), remplacé par un menu hamburger avec état `menuOpen`.

### RESP-04 — Page devenir-partenaire : grille avantages
**Fichier** : `src/components/public/DevenirPartenaireForm.tsx:91`  
`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`  
**Statut** : ✅ Responsive

### RESP-05 — Admin dashboard sur mobile
**Fichier** : `src/app/admin/dashboard/page.tsx`  
**Statut** : À vérifier

Les tableaux de bord admin avec graphiques ou tableaux larges peuvent déborder sur petits écrans. L'admin travaille principalement sur desktop, mais vérifier le rendu sur tablette (768px).

### RESP-06 — Formulaire d'estimation (wizard)
**Fichier** : `src/components/public/EstimationWizard.tsx`  
**Statut** : À vérifier

Le wizard multi-étapes doit être accessible et utilisable sur mobile (boutons assez grands, pas d'éléments qui se chevauchent).

---

## Navigation mobile

| Élément | Mobile | Tablette | Desktop |
|---------|--------|---------|---------|
| Logo | ✅ | ✅ | ✅ |
| Nav links | Masqués (hamburger) | ✅ | ✅ |
| Bouton "Estimer" | Dans menu mobile | Dans menu mobile | ✅ |
| Bouton "Devenir Partenaire" | Dans menu mobile | Dans menu mobile | ✅ |
| Bouton "Espace Pro" | Dans menu mobile | Dans menu mobile | ✅ |

---

## Accessibilité de base (non exhaustif)

| Check | Statut |
|-------|--------|
| Attributs `alt` sur images | À vérifier (images biens) |
| Labels sur formulaires | ✅ (labels explicites) |
| Focus visible | À vérifier (Tailwind ring) |
| Contraste couleurs | À vérifier (primary, accent) |
| Boutons avec texte/aria-label | À vérifier |
| Ordre lecture DOM mobile | À vérifier |

---

## Recommandations

1. Ajouter `role="main"` ou `<main>` autour du contenu principal sur les pages publiques
2. Vérifier que tous les boutons d'action admin ont des `aria-label` explicites
3. Tester la navigation clavier sur les formulaires (estimation, contact, partenariat)
4. Vérifier les contrastes WCAG AA pour les couleurs `primary` et `accent`
