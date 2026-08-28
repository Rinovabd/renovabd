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

## Delivered v2 Workflows

| Area | Delivered capability | Data and access boundary |
| --- | --- | --- |
| Customer accounts | Registration, sign-in, sign-out, and current-session retrieval. | Customer passwords are salted and PBKDF2-hashed; opaque sessions expire in the new v2 KV and live in browser session storage. |
| Shopping | Public categories, category shelves, shared bag, validated checkout, and delivery/payment collection. | Catalogue and stock are read from the new D1 database; the browser does not receive operational credentials. |
| Orders | Immediate printable invoice, protected order/invoice retrieval, and customer-safe tracking stages. | Order documents require the authenticated customer session or the unique access link returned by successful checkout. |
| Studio | Username/password entry, expiring session logout, product metadata, categories, media, inventory controls, order queue, and validated tracking transitions. | Studio credentials remain Cloudflare Worker secrets; the client holds only an expiring session identifier. |
| Analytics boundary | Privacy-safe operational event endpoint and a Studio integration-status boundary. | GA4, GTM, and Search Console reports are **not connected yet**. Service-account material is reserved for future server-only use after Google property access is confirmed. |

> **Production data boundary:** automated browser coverage uses deterministic API mocks and does not create a customer, order, or inventory movement in the live store. The live API failure/security checks and public browser rendering are verified. A live customer checkout must be approved first because it creates durable customer/order data and decrements real inventory.

## GTM-First GA4 and Technical SEO

The storefront now loads the supplied **public Google Tag Manager container** as its only browser measurement installation. A direct GA4 `gtag.js` tag is intentionally absent to prevent duplicate page views. Tracking begins with analytics storage denied, then changes only when a visitor elects to allow optional analytics. The data layer emits `rinova_page_view`, `view_item_list`, `add_to_cart`, `view_cart`, `begin_checkout`, and `purchase` events using public catalogue values and anonymous order totals only. It never emits names, email addresses, phone numbers, delivery addresses, passwords, sessions, payment details, or service-account material.

The authorised GTM workspace still needs a Google tag with the supplied GA4 measurement identifier configured on all pages, followed by its own preview and publish action. This source release does not access, publish, or store configuration for the GTM or GA4 account.

Public pages receive canonical URLs, social metadata, and Organization/WebSite/CollectionPage JSON-LD. Customer, cart, checkout, invoice, tracking, and Studio paths receive a `noindex, nofollow, noarchive` directive and are excluded from generated crawl output. `pnpm build` fetches the live public v2 category list when available (and uses the maintained v2 fallback set if it is temporarily unavailable) to generate `dist/public/sitemap.xml` and `dist/public/robots.txt`. The deployed files are available at [sitemap.xml](https://shop-v2.rinovabd.com/sitemap.xml) and [robots.txt](https://shop-v2.rinovabd.com/robots.txt).

## Local Quality Checks

```bash
pnpm check
pnpm build
pnpm test:security
pnpm test:seo
pnpm test:e2e
cd cloudflare-worker
pnpm test
pnpm typecheck
node scripts/verify-v2-api-upgrade.mjs
```

The API verifier writes an ignored, redacted report and checks health, public categories, invalid customer/admin authentication, unauthenticated Studio denial, invalid checkout denial, authenticated Studio metadata, and the order queue. `pnpm test:seo` validates seven generated public sitemap URLs, six excluded private route patterns, and the canonical sitemap declaration. The Playwright configuration intentionally uses one worker so all desktop and Chromium-mobile scenarios execute one at a time. The latest run passed **12 of 12** scenarios. The build emits a non-blocking Rollup chunk-size warning.

## Deployment Notes

`make-worker-deploy-request.mjs` deploys the isolated API Worker. `publish-frontend-assets.mjs` copies campaign assets to deterministic `site/v2/*` object keys in the new R2 bucket and updates v2 catalogue image URLs. `make-web-worker-deploy-request.mjs` packages the production frontend into the separate Cloudflare frontend Worker. The frontend’s latest accepted isolated Worker deployment is recorded in [deployment verification](docs/deployment-verification.md). See [the GTM/GA4/SEO plan](docs/gtm-ga4-seo-plan.md), [v2 secret boundaries](docs/v2-secret-boundaries.md), and [release-gate evidence](docs/release-gate-evidence.md) for redacted operational details.
