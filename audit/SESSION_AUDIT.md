# Session Audit

Date: 2026-07-20
Status: initial

## Current model

- Session carrier: signed JWT cookie
- Cookie name: `auth-token`
- Lifetime: 7 days
- Verification at edge and API layers

## Confirmed good points

- HttpOnly cookie path is in use
- Edge proxy clears auth cookie on invalid role/token in protected areas

## Remaining weaknesses

- No server-side revocation store
- No forced invalidation after role change beyond DB reload on request
- No multi-session admin governance layer
