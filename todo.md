# Rinovabd v2 Completion Checklist

- [x] Push the completed Rinovabd v2 rebuild to the selected existing `Rinovabd/renovabd` repository.
- [x] Verify and record the newly created v2 R2, D1, KV, and Worker resource mapping, with no legacy resource changes.
- [x] Build and publish the redesigned frontend to a new Cloudflare-hosted target that is separate from the existing Worker and R2 bucket.
- [x] Verify the new Cloudflare frontend, v2 API, Studio dashboard, and API integration from public URLs.
- [x] Push the updated Cloudflare deployment documentation to GitHub as source-code storage only.

## Enhanced Commerce and Studio

- [x] Verify existing v2 credential state and design a secret-safe environment-variable scheme without disclosing any credential values.
- [x] Extend the new v2 D1 schema and Worker for customer accounts, categories, checkout, orders, invoices, and tracking events.
- [x] Build customer login, category browsing, checkout, tracking, invoice, and improved Studio admin workflows.
- [x] Document secure Google analytics and service-account integration requirements without embedding credentials in source or client code.
- [x] Test and redeploy the new Cloudflare frontend and API, then update the GitHub source-only repository.

## Sequential Verification Gates

- [x] Gate 1: Record the checklist baseline and identify only the features that apply to this separate v2 build.
- [x] Gate 2: Run data-model and API unit tests after every backend change.
- [x] Gate 3: Run typecheck and production build after every frontend change.
- [x] Gate 4: Run strictly single-worker browser automation for customer failure, categories, mocked checkout/invoice, Studio entry/product operations/logout at desktop and mobile sizes; capture screenshots.
- [x] Gate 5: Run the redacted live Cloudflare API smoke suite and public browser checks after deployment; fix every failed check before proceeding.
- [ ] Save the final web project checkpoint and prepare the deployment/access handoff.
