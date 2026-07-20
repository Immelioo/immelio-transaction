# Plan de Rollback — Immelio Transaction
**Date** : 2026-07-20

---

## Principes

- Ne jamais supprimer de données réelles sans backup
- Ne jamais modifier directement la base de production
- Préférer un rollback rapide (revert Vercel) à une correction à chaud en production

---

## Rollback Vercel (code)

Vercel conserve l'historique des déploiements.

```bash
# Via CLI Vercel
vercel rollback [deployment-url]

# Via interface Vercel
# Vercel Dashboard > Deployments > cliquer sur un déploiement précédent > "Promote to Production"
```

**Durée** : ~2 minutes

---

## Rollback base de données

### Avant une migration Prisma

```bash
# Toujours créer un backup avant migrate deploy
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Revenir à une version précédente du schéma

```bash
# Identifier la dernière migration stable
ls prisma/migrations/

# Annuler la dernière migration (si possible)
npx prisma migrate resolve --rolled-back <migration_name>

# Ou restaurer depuis backup
psql $DATABASE_URL < backup_20260720_120000.sql
```

⚠️ Prisma ne supporte pas le rollback automatique des migrations. Une fois en production, une migration vers une version précédente nécessite une migration de "down" manuelle.

---

## Scénarios de rollback

### Scénario 1 : Bug critique après déploiement

1. Identifier le déploiement précédent stable dans Vercel Dashboard
2. Cliquer "Promote to Production" sur le déploiement précédent
3. Vérifier que le problème est résolu
4. **Ne pas toucher la base de données** sauf si la migration a causé le problème

**Durée estimée** : 5 minutes

### Scénario 2 : Migration DB corrompue

1. Stopper immédiatement le trafic (Vercel : passer en maintenance page ou redirect)
2. Restaurer le backup DB le plus récent
3. Rollback le code Vercel vers la version compatible avec l'ancien schéma
4. Analyser la migration défaillante avant de re-tenter

**Durée estimée** : 30 minutes à 2h selon taille du backup

### Scénario 3 : Fuite de données / incident sécurité

1. Faire un rollback code immédiat
2. Révoquer tous les JWT : changer `JWT_SECRET` dans Vercel → tous les utilisateurs sont déconnectés
3. Analyser les logs Vercel et Upstash pour identifier l'origine
4. Notifier les utilisateurs affectés si nécessaire (obligation RGPD 72h)

**Durée estimée** : 15 minutes pour la neutralisation

---

## Contacts en cas d'incident

| Rôle | Action |
|------|--------|
| Développeur | Rollback code + analyse |
| Admin Immelio | Informer les partenaires si nécessaire |
| Hébergeur Neon | Support DB si corruption |
| CNIL | Notification si fuite données personnelles (72h max) |

---

## Données non rollbackables

Certaines actions sont irréversibles côté Cloudinary :
- Fichiers supprimés de Cloudinary via `uploader.destroy()` → perdus définitivement
- Emails envoyés → impossibles à annuler

**Mitigation** : Ne jamais supprimer des fichiers Cloudinary en bulk. Toujours archiver plutôt que supprimer.

---

## Git Tags pour les versions stables

```bash
# Tagger une version stable avant un changement majeur
git tag -a v1.0.0-stable -m "Version stable avant migration XYZ"
git push origin v1.0.0-stable

# Revenir à un tag si nécessaire
git checkout v1.0.0-stable
```
