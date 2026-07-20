# Fixes Applied

Date: 2026-07-20

## Already present locally before this audit pass

- Public estimation/client wrappers refactored to avoid hydration breakage
- Public demand-search wrapper refactored
- Partnership request flow centralized into admin demands
- Cookie banner overlap corrected
- Programme and partner document downloads proxied through application routes

## Added during this audit pass

1. Removed obsolete duplicate `src/middleware.ts`
2. Added safe lot mutation planner: `src/lib/programmeLots.ts`
3. Protected programme edit flow from deleting lots with active options
4. Preserved lot IDs through admin programme edit form
5. Added regression test: `tests/programmeLots.test.ts`
6. Unified partnership-request persistence for `/devenir-partenaire` and `/pro/login`
7. Switched admin partnership alert block to dossier-backed requests instead of parsing raw leads
