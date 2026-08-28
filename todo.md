# Rinovabd v2 Completion Checklist

- [x] Push the completed Rinovabd v2 rebuild to the selected existing `Rinovabd/renovabd` repository.
- [x] Verify and record the newly created v2 R2, D1, KV, and Worker resource mapping, with no legacy resource changes.
- [x] Build and publish the redesigned frontend to a new Cloudflare-hosted target that is separate from the existing Worker and R2 bucket.
- [x] Verify the new Cloudflare frontend, v2 API, Studio dashboard, and API integration from public URLs.
- [x] Push the updated Cloudflare deployment documentation to GitHub as source-code storage only.

## Enhanced Commerce and Studio

- [x] Verify existing v2 credential state and design a secret-safe environment-variable scheme without disclosing any credential values.
- [ ] Extend the new v2 D1 schema and Worker for customer accounts, categories, checkout, orders, invoices, and tracking events.
- [ ] Build customer login, category browsing, checkout, tracking, invoice, and improved Studio admin workflows.
- [ ] Document secure Google analytics and service-account integration requirements without embedding credentials in source or client code.
- [ ] Test and redeploy the new Cloudflare frontend and API, then update the GitHub source-only repository.

## Sequential Verification Gates

- [x] Gate 1: Record the checklist baseline and identify only the features that apply to this separate v2 build.
- [ ] Gate 2: Run data-model and API unit tests after every backend change.
- [ ] Gate 3: Run typecheck and production build after every frontend change.
- [ ] Gate 4: Run browser automation for login, categories, checkout, invoice, and Studio access; capture screenshots at desktop and mobile sizes.
- [ ] Gate 5: Run the live Cloudflare smoke suite after deployment; fix every failed check before publishing the next step.
- [ ] Save the final web project checkpoint and prepare the deployment/access handoff.
