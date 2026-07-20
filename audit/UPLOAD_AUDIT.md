# Upload Audit

Date: 2026-07-20
Status: initial

## Current implementation

- Route: `POST /api/upload`
- Auth: `ADMIN_OR_PARTENAIRE`
- Storage: Cloudinary
- Allowed photo MIME: JPEG, PNG, WebP, HEIC, HEIF
- Allowed document MIME: PDF, JPEG, PNG

## Positive controls

- MIME allowlist
- Size limits
- UUID public IDs
- Rate limiting hook

## Open issues

1. Source URLs remain public if leaked.
2. SVG and archive uploads are not allowed, which is correct.
3. Sensitive documents still need signed/private delivery semantics.
