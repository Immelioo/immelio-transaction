# Test Plan

Date: 2026-07-20
Status: active

## Automated checks

- `npx tsc --noEmit`
- `npx eslint src/ tests/ --max-warnings 20`
- `npx prisma validate`
- `npm run build`
- `npx tsx --test tests/programmeLots.test.ts`

## Immediate E2E targets

1. Public estimation flow
2. Public search request flow
3. Public partnership request flow
4. Admin login redirect matrix
5. Partner login redirect matrix
6. Protected document downloads

## Visual regression targets

- public home, biens, programmes, estimation, contact
- admin dashboard, leads, programmes
- partner dashboard, programmes, documents
