# Rollback Plan

Date: 2026-07-20

1. Keep previous production deployment ID available in Vercel.
2. If a regression is detected:
   - revert traffic to previous deployment
   - verify admin login, partner login, public home, estimation
3. Re-run:
   - `npm run build`
   - targeted E2E flows
4. Patch forward from the branch that introduced the regression.

## Data safety note

Do not run destructive Prisma schema changes directly against production without an explicit migration plan and rollback path.
