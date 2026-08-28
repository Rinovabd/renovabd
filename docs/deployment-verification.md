# Rinovabd v2 Deployment Verification

The new backend is deployed as `rinovabd-v2-api`, with an independently provisioned D1 database, KV namespace, and R2 bucket. The existing Worker and R2 bucket were not reused or modified.

| Verification item | Result | Evidence |
| --- | --- | --- |
| New Worker deployment | Passed | Deployment version `61177209-d388-4a4d-b063-5b4d223d1369` serves `rinovabd-v2-api`. |
| New data resources | Passed | `rinovabd-v2-db`, `rinovabd-v2-cache`, and `rinovabd-v2-media` were provisioned fresh. |
| Dedicated public hostname | Passed | `https://api-v2.rinovabd.com` is a new proxied DNS record plus a new `api-v2.rinovabd.com/*` Worker route. |
| Health check | Passed | `GET /api/health` returned `200` and reported the new D1, KV, and R2 bindings as configured. |
| Catalogue check | Passed | `GET /api/products` returned the four v2 seed products. |
| Studio authorization | Passed | New token login and a protected admin catalogue request returned `200`. |
| New R2 upload | Passed | The supplied pink theme image was uploaded to a v2-only object key during the live smoke check. |

## New v2 Resource Map

| Resource class | New v2 resource | Identifier or route | Verification |
| --- | --- | --- | --- |
| Worker | `rinovabd-v2-api` | Script ID `931972abb79e464c984252ee93909b40`; public route `api-v2.rinovabd.com/*` | Health response returned `200` at the dedicated v2 hostname. |
| R2 media bucket | `rinovabd-v2-media` | ENAM Standard bucket; created `2026-08-28T00:02:20.379Z` | The live test uploaded the supplied pink reference to `uploads/2026-08-28/315bd371-de7a-4909-a75e-eea8495dde95.jpg`. |
| D1 database | `rinovabd-v2-db` | `9a3e6871-3df9-4e7f-8ecc-8b3fcbcefe16`; created `2026-08-28T00:02:20.798Z` | Four v2 tables and the separate product catalogue were verified. |
| KV cache | `rinovabd-v2-cache` | `3adfac39087040c9ae95b36397ead661` | Direct namespace inspection confirmed the dedicated v2 binding. |

> **Isolation guarantee:** The v2 Worker binds only `rinovabd-v2-db`, `rinovabd-v2-cache`, and `rinovabd-v2-media`. The prior Worker and prior R2 bucket were neither targeted nor modified during this rebuild.

## Routing diagnosis

The account-level Workers.dev endpoint did not resolve the freshly uploaded Worker in browser verification. The Worker itself had an active deployment, but its Workers.dev hostname returned a platform “nothing here yet” page. The production-safe repair was to create an unused `api-v2.rinovabd.com` host with a new proxied DNS record and new Worker route, after checking that neither an existing DNS record nor a Worker route used that host. This does not alter old Worker routes.

Cloudflare’s documentation describes `workers.dev` as suitable for quick testing and recommends a Worker route or custom domain for production traffic; it also notes that all paths for a dedicated custom host can direct to one Worker.[1] [2]

## References

[1]: https://developers.cloudflare.com/workers/configuration/routing/workers-dev/ "Cloudflare Workers: workers.dev"
[2]: https://developers.cloudflare.com/workers/configuration/routing/custom-domains/ "Cloudflare Workers: Custom Domains"
