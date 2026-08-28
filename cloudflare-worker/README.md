# Rinovabd v2 Worker

This directory deploys the **new** `rinovabd-v2-api` Worker. Its bindings are intentionally limited to the newly created `rinovabd-v2-db`, `rinovabd-v2-cache`, and `rinovabd-v2-media` resources. Do not amend `wrangler.toml` with IDs or names belonging to older Rinovabd infrastructure.

## Required post-deployment secret

Set a strong, unique `ADMIN_API_TOKEN` secret on the **new** Worker before using `/api/admin/*` or `/api/media`. The Worker deliberately fails closed with `503 ADMIN_SETUP_REQUIRED` while that new secret is unset.

## Public routes

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Reports readiness of only the new Worker resources. |
| `GET` | `/api/products` | Returns live v2 catalogue records, optionally filtered by `category` or `q`. |
| `POST` | `/api/orders` | Creates a validated COD or mobile-payment order and decrements v2 stock. |
| `GET` | `/api/media/:key` | Reads an object only from the new v2 media bucket. |

## Admin routes

The Studio workflow uses a direct bearer token or a time-limited cached session generated via `POST /api/admin/login`. Product and media mutation routes are deliberately unavailable until the new worker’s secret exists.

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/api/admin/login` | Exchanges the new Worker admin token for a 12-hour session. |
| `GET` | `/api/admin/overview` | Reads v2 inventory, orders, and media counts. |
| `GET/POST` | `/api/admin/products` | Lists or creates v2 products. |
| `GET/PATCH` | `/api/admin/products/:id` | Reads or modifies a v2 product. |
| `POST` | `/api/media` | Streams a validated image into the new R2 bucket. |

## Verification

Run `pnpm test` and `pnpm typecheck`. The tests intentionally use fakes and make no request to any production resource.
