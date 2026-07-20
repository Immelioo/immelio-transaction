# Security Audit

Date: 2026-07-20
Status: in progress

## Authentication

- Cookie name: `auth-token`
- Cookie verification:
  - server routes: `src/lib/auth.ts`
  - edge/proxy: `src/proxy.ts`
- JWT algorithm: HS256
- JWT expiry: 7 days
- No server-side session store or token revocation list

## Confirmed strengths

- Protected admin and partner spaces at edge level in `src/proxy.ts`
- Mutating API routes check `Origin` / `Sec-Fetch-Site` in proxy
- `verifyAuth()` reloads user from database and does not trust raw JWT payload only
- Rate limiting helper already supports Upstash Redis

## Confirmed weaknesses

1. Rate limiting falls back to in-memory counters when Upstash is not configured.
2. No JWT rotation or revocation list.
3. Sensitive document storage is still effectively public if source URLs leak.
4. Production build currently differs from local validated code, which weakens trust in the effective runtime perimeter.

## Priority list

### P1
- Configure Upstash Redis in production and staging
- Move sensitive partner/admin documents to private storage or signed URLs
- Deploy the validated local security fixes to production

### P2
- Add session revocation / rotation strategy
- Strengthen audit logs around admin write actions and document access

### P3
- Review CSP to reduce `unsafe-inline` / `unsafe-eval` on legacy production build
