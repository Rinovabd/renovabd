# Rinovabd Rebuild Map

The rebuilt Rinovabd system is a **new, isolated product**. Its storefront and Studio dashboard are designed to replace the experience rather than extend the supplied archive. The supplied pink reference directly establishes the `#F767A5` **Rinova Pink** signature colour.

| Layer | New component | Responsibility | Isolation requirement |
| --- | --- | --- | --- |
| Storefront | `client/src/pages/Home.tsx`, `Shop.tsx` | Editorial shopping, cart interaction, category discovery, subscription capture | Uses the new API origin only after it is provisioned. |
| Studio | `client/src/pages/Admin.tsx` | Product creation/editing, stock view, media upload desk, content and delivery workspaces | Uses a new authenticated session and new API origin only. |
| Visual system | `client/src/index.css`, `ideas.md` | Ribbon Modernism, pink colour system, responsive motion, accessible focus/contrast | Independent typography and assets; no old static bundle reuse. |
| API | `cloudflare-worker/` | New Worker routes, fresh D1/KV/R2 bindings, CORS, authenticated administration | New names prefixed `rinovabd-v2`; never reference legacy binding IDs or resource names. |
| Media | New R2 bucket `rinovabd-v2-media` | Direct server-issued upload URLs and private upload metadata | A new bucket only; no legacy R2 bucket access. |
| Automation | `.github/workflows/verify.yml` | Build, typecheck, unit tests, Worker tests, dependency/audit gates | GitHub repository is new and private. |

## Release sequence

1. Provision `rinovabd-v2-api`, `rinovabd-v2-db`, `rinovabd-v2-cache`, and `rinovabd-v2-media`.
2. Apply only the new migration set to `rinovabd-v2-db`.
3. Deploy the Worker and bind only its newly created resources.
4. Add the generated Worker origin as `VITE_RINOVABD_API_URL` during storefront build/deployment.
5. Enable the GitHub quality workflow in the new private `Rinovabd` repository.

The old Worker and old R2 bucket are deliberately outside this map.
