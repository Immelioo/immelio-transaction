# Plan de Tests — Immelio Transaction
**Date** : 2026-07-20

---

## Infrastructure de test recommandée

### Unit tests
- **Framework** : Vitest (compatible Next.js App Router)
- **Priorité** : Schémas Zod, fonctions utilitaires (formatDate, sanitizedString)

### Integration tests
- **Framework** : Playwright (E2E)
- **Base de données** : Environnement de test séparé (`.env.test`)
- **Seed** : `prisma db seed` avec données de test

### Visual regression
- **Framework** : Playwright screenshots + comparaison

---

## Fichiers de test à créer

### `playwright.config.ts`
```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: "html",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile-chrome", use: { ...devices["Pixel 5"] } },
  ],
});
```

---

## Tests E2E prioritaires

### 1. Navigation publique (`tests/e2e/public-navigation.spec.ts`)
- [ ] Homepage charge sans erreur 500
- [ ] Menu hamburger mobile s'ouvre/ferme
- [ ] Lien "Nos Biens" affiche la liste
- [ ] Fiche bien accessible en cliquant
- [ ] Biens avec statut=VENDU non affichés dans la liste
- [ ] Page "/estimation" charge le wizard
- [ ] Page "/demande-recherche" affiche le formulaire
- [ ] Page "/contact" affiche le formulaire
- [ ] Page "/devenir-partenaire" affiche le formulaire
- [ ] Footer présent sur toutes les pages

### 2. Authentification admin (`tests/e2e/auth-admin.spec.ts`)
- [ ] Login admin avec mauvais MDP → erreur "Identifiants incorrects"
- [ ] Login admin réussi → redirect `/admin/dashboard`
- [ ] `/admin/dashboard` sans cookie → redirect `/admin/login`
- [ ] Logout → cookie supprimé → redirect login
- [ ] 5 tentatives échouées → rate limit 429

### 3. Authentification partenaire (`tests/e2e/auth-partner.spec.ts`)
- [ ] Login partenaire avec mauvais MDP → erreur
- [ ] Login partenaire réussi → redirect `/pro/dashboard`
- [ ] `/pro/dashboard` sans cookie → redirect `/pro/login`
- [ ] PARTENAIRE ne peut pas accéder à `/admin/dashboard`
- [ ] Logout partenaire → cookie supprimé

### 4. Redirections (`tests/e2e/redirects.spec.ts`)
- [ ] `/admin` → `/admin/dashboard`
- [ ] `/admin/login` si déjà connecté admin → `/admin/dashboard`
- [ ] `/pro/login` si déjà connecté partenaire → `/pro/dashboard`
- [ ] `/admin/biens` sans auth → `/admin/login`

### 5. Sécurité IDOR (`tests/e2e/idor-security.spec.ts`)
- [ ] `GET /api/partenaires` sans auth → 401
- [ ] `GET /api/contacts` sans auth → 401
- [ ] `DELETE /api/biens/xxx` sans auth → 401
- [ ] `GET /api/documents-partenaire` partenaire A ne voit pas docs partenaire B
- [ ] `GET /api/biens/xxx` → commissionPartenaire absent de la réponse publique

### 6. Formulaires publics (`tests/e2e/forms.spec.ts`)
- [ ] Contact : soumission réussie avec données valides
- [ ] Contact : erreur si email invalide
- [ ] Estimation : parcours complet du wizard → succès
- [ ] Demande de recherche : soumission réussie
- [ ] Devenir partenaire : soumission réussie → page succès
- [ ] Visites : demande soumise avec bien ID

### 7. Upload (`tests/e2e/upload.spec.ts`)
- [ ] Upload photo valide (JPEG) → URL Cloudinary retournée
- [ ] Upload type interdit (EXE) → 400
- [ ] Upload sans auth → 401
- [ ] Upload > 10MB → 400

---

## Tests manuels

Voir [MANUAL_TEST_CHECKLIST.md](MANUAL_TEST_CHECKLIST.md) pour la checklist complète.

---

## Environnement de test

```bash
# .env.test (à créer)
DATABASE_URL="postgresql://test:test@localhost:5432/immelio_test"
JWT_SECRET="test-secret-minimum-32-characters-long"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NEXTAUTH_URL="http://localhost:3000"
# Ne pas configurer Cloudinary en test (mock)
# Ne pas configurer SMTP en test (mock)
```

```bash
# Installer Playwright
npm install --save-dev @playwright/test
npx playwright install chromium

# Lancer les tests
npx playwright test
npx playwright test --ui  # mode interface graphique
```
