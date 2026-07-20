# Deployment Checklist

Date: 2026-07-20

- [ ] `npm run build` passes on deployment branch
- [ ] `NEXT_PUBLIC_SITE_URL=https://www.immelio.fr` confirmed in Vercel production env
- [ ] `JWT_SECRET` present
- [ ] `CRON_SECRET` present
- [ ] Upstash Redis variables configured
- [ ] Email provider variables validated
- [ ] Post-deploy check on `/robots.txt`
- [ ] Post-deploy check on `/sitemap.xml`
- [ ] Post-deploy Playwright check on `/estimation`
- [ ] Post-deploy redirect check on `/admin/dashboard` and `/pro/dashboard`
