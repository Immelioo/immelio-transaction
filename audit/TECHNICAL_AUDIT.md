# Technical Audit — Immelio Transaction

Date: 2026-07-20
Scope: local repository `/Users/taogiachino/Claude-master-fichier/projets/Immelio transactions last version` and live production `https://www.immelio.fr`
Status: in progress

## Executive snapshot

- Stack confirmed: Next.js 16.2.9 App Router, React 19, TypeScript strict, Prisma 5, PostgreSQL/Neon, Cloudinary, custom JWT auth, Zod, Vercel.
- Four spaces confirmed in code:
  - public B2C: `/`, `/biens/*`, `/programmes/*`, `/contact`, `/estimation`, `/demande-recherche`, `/about`, `/favoris`
  - admin: `/admin/*`
  - partner: `/pro/*`
  - client: role exists in data model, no dedicated private client dashboard implemented yet
- Route protection is implemented primarily in `src/proxy.ts`.
- Production is serving an older build than the validated local codebase:
  - live `robots.txt` and `sitemap.xml` still point to `https://immelio-transaction.vercel.app`
  - live `/estimation` still fails at step 1 in browser interaction

## Confirmed anomalies at this stage

| ID | Severity | Category | Current state |
| --- | --- | --- | --- |
| FORM-ESTIMATION-001 | P1 | formulaire / parcours public | reproduced on production, fixed locally, not deployed |
| SEO-DOMAIN-001 | P2 | SEO technique / domaine | reproduced on production |
| FORM-PARTNERSHIP-001 | P1 | formulaire / workflow CRM | reproduced in code, corrected locally |
| DATA-PROGRAMME-LOTS-001 | P1 | API / données | reproduced in code, corrected locally |
| BUILD-PROXY-001 | P1 | build / auth edge | reproduced locally, corrected locally |
| SEC-RATELIMIT-001 | P1 | sécurité / anti-abus | reproduced in local build logs and code |
| SEC-DOCUMENT-001 | P1 | sécurité / téléchargement | reproduced in code, remediation pending |

## Architecture and auth

- JWT cookie: `auth-token`
- Auth helper: `src/lib/auth.ts`
- JWT implementation: `src/lib/jwt.ts`
- Edge/server protection: `src/proxy.ts`
- Cookie options: `src/lib/cookieOptions.ts`
- Rate limiting: `src/lib/rateLimit.ts`

## Immediate technical conclusions

1. The repository now builds again under Next 16 after removing the obsolete duplicate `src/middleware.ts`.
2. The production deployment is lagging behind the repository state validated locally.
3. Partnership requests were split across two inconsistent endpoints; both public entrypoints now persist into admin demands locally.
4. The programme update API had a real data-loss path on lots with existing options; that path is now blocked and covered by a regression test.
5. Rate limiting is still not production-grade until Upstash Redis is configured.
6. Document download entrypoints are protected, but the underlying asset URLs are still public if leaked.

## Current validation status

- `npx tsc --noEmit`: pass
- `npx eslint src/ tests/ --max-warnings 20`: pass
- `npx prisma validate`: pass
- `npm run build`: pass
- `npx tsx --test tests/programmeLots.test.ts`: pass

## Next audit steps

1. Complete full route-by-route redirect matrix.
2. Audit every mutating API for auth, ownership, validation, and error codes.
3. Add end-to-end tests for public lead flows and protected-route redirects.
4. Build visual regression coverage under `tests/visual-regression`.
5. Prepare a deployment-ready diff list for production rollout.
