# Checklist Déploiement — Immelio Transaction
**Date** : 2026-07-20

---

## Avant le déploiement

### Variables d'environnement Vercel

Vérifier dans Vercel > Project > Settings > Environment Variables :

- [ ] `DATABASE_URL` — URL Neon PostgreSQL (connection pooling recommandé)
- [ ] `JWT_SECRET` — secret fort, min 32 caractères aléatoires
- [ ] `NEXT_PUBLIC_SITE_URL` — `https://www.immelio.fr` (avec www)
- [ ] `NEXTAUTH_URL` — `https://www.immelio.fr`
- [ ] `CLOUDINARY_CLOUD_NAME`
- [ ] `CLOUDINARY_API_KEY`
- [ ] `CLOUDINARY_API_SECRET`
- [ ] `GMAIL_USER` — adresse Gmail
- [ ] `GMAIL_APP_PASSWORD` — mot de passe d'application Gmail (pas le mot de passe principal)
- [ ] `ADMIN_EMAIL` — email de réception des notifications
- [ ] `UPSTASH_REDIS_REST_URL` — Redis Upstash (rate limiting)
- [ ] `UPSTASH_REDIS_REST_TOKEN`
- [ ] `CRON_SECRET` — secret pour l'endpoint cron (long UUID)
- [ ] `RESEND_API_KEY` — optionnel, fallback email

### Base de données

- [ ] `npx prisma migrate deploy` exécuté sur la DB de production
- [ ] Compte admin créé : `admin@immelio.fr` (changer le MDP par défaut !)
- [ ] Données seed de test supprimées si elles ont été importées
- [ ] Backup avant migration

### DNS & Domaine

- [ ] DNS `www.immelio.fr` pointe vers Vercel
- [ ] Certificat SSL actif (Vercel gère automatiquement Let's Encrypt)
- [ ] Redirect `immelio.fr` → `www.immelio.fr` (ou inverse, mais choisir un canonical)
- [ ] Header HSTS vérifié : `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`

### Code

- [ ] `npx tsc --noEmit` passe sans erreur
- [ ] `npm run build` passe sans erreur
- [ ] Tests Playwright passent (si configurés)
- [ ] Audit dépendances : `npm audit --audit-level=high` → 0 vulnérabilités high/critical

---

## Pendant le déploiement

- [ ] Déploiement via `git push` sur la branche `main`
- [ ] Build Vercel réussi (vérifier les logs)
- [ ] Preview URL fonctionnelle avant de promouvoir en production
- [ ] Vérifier les logs Vercel après deploy (pas d'erreurs au démarrage)

---

## Après le déploiement

### Tests de fumée (smoke tests)

- [ ] Homepage charge en production (`https://www.immelio.fr`)
- [ ] Login admin fonctionnel
- [ ] Un bien s'affiche correctement
- [ ] Un formulaire public se soumet
- [ ] Email reçu suite à une soumission de formulaire
- [ ] Vérifier console navigateur : pas d'erreurs critiques

### Cron jobs

- [ ] Configurer le cron Vercel pour `/api/cron/reminders` :
  ```json
  // vercel.json
  {
    "crons": [
      {
        "path": "/api/cron/reminders",
        "schedule": "0 8 * * *"
      }
    ]
  }
  ```
- [ ] Vérifier que `CRON_SECRET` est dans les headers Vercel

### Monitoring

- [ ] Vérifier Vercel Analytics (si activé)
- [ ] Tester le rate limiting : 5 tentatives de login → 429
- [ ] Vérifier logs Upstash Redis (si configuré)

---

## Changement de mot de passe admin post-déploiement

⚠️ **IMPORTANT** : Le mot de passe admin par défaut (`admin123` du seed) doit être changé immédiatement.

1. Connectez-vous avec `admin@immelio.fr` / `admin123`
2. Allez dans `/admin/parametres`
3. Changez le mot de passe par un mot de passe fort (min 16 caractères)

---

## Rollback

Voir [ROLLBACK_PLAN.md](ROLLBACK_PLAN.md)
