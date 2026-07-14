## Immelio Transactions Last Version

Cette copie provient de la version identifiee comme correcte sur `http://localhost:3010`.

- Source d'origine : `/Users/taogiachino/tao-immo`
- Date de sauvegarde : `2026-04-29`
- Type : snapshot propre sans `.git`, `node_modules` ni `.next`

Contenu conserve :

- code source complet
- `package.json` et `package-lock.json`
- `.env`
- base SQLite locale `prisma/dev.db`
- uploads et assets publics

Pour relancer le projet depuis ce dossier :

```bash
npm install
npx prisma generate
npm run build
npm run start -- --port 3010
```

Ou en dev :

```bash
npm install
npx prisma generate
npm run dev
```
