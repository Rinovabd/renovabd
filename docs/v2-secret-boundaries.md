# Rinovabd v2 Secret Boundaries

The new `rinovabd-v2-api` Worker has the following **redacted, verified secret bindings**: `ADMIN-USERNAME`, `ADMIN-PASSWORD`, `ADMIN_API_TOKEN`, and `GOOGLE-SERVICE-ACCOUNT`. Their values were intentionally not read, copied, written to source files, added to tests, surfaced through API responses, or included in log output.

| Secret binding | Server-side purpose | Client-side rule |
| --- | --- | --- |
| `ADMIN-USERNAME` and `ADMIN-PASSWORD` | Authorize Studio username/password sign-in and create an expiring admin session in v2 KV. | Never expose, bundle, store, or log. The browser sends credentials only to the HTTPS v2 API sign-in endpoint. |
| `ADMIN_API_TOKEN` | Backward-compatible automated deployment/smoke authentication only. | Never display in Studio or client code. |
| `GOOGLE-SERVICE-ACCOUNT` | Reserved for server-only GA4/Search Console API calls after property access is granted. | Never return it from an API, insert it into analytics payloads, or bundle it into the frontend. |

> The hyphenated Cloudflare binding names are accessed only with bracket syntax, such as `env["ADMIN-USERNAME"]`; this avoids renaming or copying an existing secret and keeps the configuration isolated to v2.

## Audit Rules

The release pipeline must fail if a committed source file contains a private-key marker, a service-account credential field, a secret binding value, or a local secret-file path. Functional tests use the already-configured secret bindings at runtime but report only pass/fail and HTTP status information.
