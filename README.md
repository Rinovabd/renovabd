# Rinovabd v2

Rinovabd v2 is a complete **Ribbon Modernism** redesign: an editorial beauty storefront paired with a private Studio dashboard for catalogue and media operations. GitHub is used for source code only; deployment is performed directly to Cloudflare.

## Live Cloudflare Services

| Layer | New v2 target | Public URL |
| --- | --- | --- |
| Frontend | `rinovabd-v2-web` Worker | [shop-v2.rinovabd.com](https://shop-v2.rinovabd.com) |
| Private Studio | Frontend SPA route | [shop-v2.rinovabd.com/admin](https://shop-v2.rinovabd.com/admin) |
| API | `rinovabd-v2-api` Worker | [api-v2.rinovabd.com/api/health](https://api-v2.rinovabd.com/api/health) |
| Data | `rinovabd-v2-db` D1, `rinovabd-v2-cache` KV, `rinovabd-v2-media` R2 | Private bindings only |

> **Legacy safety:** v2 binds exclusively to the resources named above. The prior Worker and prior R2 bucket are not reused, routed, queried, or modified.

## Source Layout

The React/Tailwind storefront and Studio dashboard are in `client/`. The standalone Cloudflare API, schema, deployment request builders, asset publisher, and verification scripts are in `cloudflare-worker/`. The API fetches catalogue data from new D1, creates temporary Studio sessions in new KV, and stores campaign assets/uploads in new R2.

## Local Quality Checks

```bash
pnpm check
pnpm build
cd cloudflare-worker
pnpm test
pnpm typecheck
node scripts/verify-v2-web-live.mjs
```

The final live verifier checks the Cloudflare homepage, Studio SPA route, API CORS policy, four-product catalogue, R2-backed media URLs, Studio login, and authenticated catalogue operation. The local Studio token and generated request files remain excluded from version control.

## Deployment Notes

`make-worker-deploy-request.mjs` deploys the isolated API Worker. `publish-frontend-assets.mjs` copies campaign assets to deterministic `site/v2/*` object keys in the new R2 bucket and updates v2 catalogue image URLs. `make-web-worker-deploy-request.mjs` packages the production frontend into the separate Cloudflare frontend Worker. See [deployment verification](docs/deployment-verification.md) for the deployed route and resource mapping.
