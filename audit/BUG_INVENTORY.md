# Inventaire des Bugs — Immelio Transaction
**Date** : 2026-07-20

---

## Bugs corrigés (commit 50ae5c0)

| ID | Sévérité | Description | Fichier(s) | Statut |
|----|---------|-------------|-----------|--------|
| BUG-01 | HIGH | Téléchargement documents ne déclenchait pas le download | `src/lib/fileDownload.ts` | ✅ CORRIGÉ |
| BUG-02 | MEDIUM | Contrôles réordonnancement photos invisibles sur mobile/touch | `src/app/admin/biens/[id]/modifier/page.tsx` | ✅ CORRIGÉ |
| BUG-03 | MEDIUM | Page estimation gratuite non fonctionnelle (wizard) | `src/components/public/EstimationWizard.tsx` | ✅ CORRIGÉ |
| BUG-04 | MEDIUM | Formulaire "Commencer votre projet" (demande-recherche) | `src/components/public/SearchRequestForm.tsx` | ✅ CORRIGÉ |
| BUG-05 | HIGH | Formulaire demande partenariat inexistant / résultat illisible | `src/app/devenir-partenaire/page.tsx` (NEW) | ✅ CORRIGÉ |
| BUG-06 | HIGH | Lien email demande partenariat pointant vers mauvais domaine | `src/lib/email.ts`, `NEXT_PUBLIC_SITE_URL` | ✅ CORRIGÉ |
| BUG-07 | MEDIUM | Filtre biens homepage utilisait `disponible: true` (déprécié) | `src/app/page.tsx:40` | ✅ CORRIGÉ |
| BUG-08 | HIGH | `src/middleware.ts` supprimé accidentellement du répertoire de travail | `src/middleware.ts` | ✅ RESTAURÉ (git checkout HEAD) |

---

## Bugs connus restants

| ID | Sévérité | Description | Fichier(s) | Priorité |
|----|---------|-------------|-----------|---------|
| BUG-09 | MEDIUM | Après changement MDP, l'ancien JWT reste valide (pas d'invalidation) | `src/lib/auth.ts`, `src/app/api/auth/change-password` | P2 |
| BUG-10 | LOW | Cookie auth-token sans Max-Age explicite (inconsistance avec JWT 7j) | `src/lib/cookieOptions.ts` | P3 |
| BUG-11 | INFO | `/api/partenariat` (legacy) et `/api/devenir-partenaire` (nouveau) coexistent | `src/app/api/partenariat/route.ts` | P3 |
| BUG-12 | LOW | Admin partenaires : extraction `entreprise` depuis `lead.notes` (brittle) | `src/app/admin/partenaires/page.tsx:63` | P3 |
| BUG-13 | INFO | `GET /api/demandes` — auth non vérifiée ? (à confirmer) | `src/app/api/demandes/route.ts` | P2 |

---

## BUG-12 — Extraction entreprise depuis notes (fragile)

**Fichier** : `src/app/admin/partenaires/page.tsx:63`

```ts
...(lead.notes && { 
  entreprise: lead.notes
    .replace(/^Demande de partenariat — /, "")
    .split("\n")[0] 
}),
```

Cette extraction dépend du format exact de `lead.notes` défini dans l'API. Si le format change, l'extraction silencieusement retourne une mauvaise valeur.

**Correction** : Stocker `entreprise` comme champ dédié dans le modèle `Lead` en DB, ou utiliser un champ `metadata JSON` pour les données structurées.

---

## BUG-13 — GET /api/demandes sans auth ?

À vérifier : la route `src/app/api/demandes/route.ts` ne définit qu'un `POST` (public). Le `GET` n'est peut-être que dans `/api/demandes/[id]`. Si un `GET /api/demandes` existe sans auth, toutes les demandes de recherche (avec nom, email, téléphone des clients) seraient exposées publiquement.

**Action** : Confirmer que la route `GET /api/demandes` nécessite `verifyAuth(req, "ADMIN")`.
