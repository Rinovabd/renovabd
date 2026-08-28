# Rinovabd v2 Sequential Implementation and Verification Matrix

This matrix adopts the supplied working-checklist principle for the **separate Rinovabd v2 Cloudflare deployment**. The referenced system is not copied as a specification: its GitHub Pages, legacy Worker, legacy R2, 35-product catalogue, POS, reviews, returns, CMS, courier, and AI-assistant claims do not describe this new v2 application. Only the requested features below are in scope.

> **Gate rule:** complete a feature’s implementation, failure-path test, persistence check, desktop screenshot, mobile screenshot, and live Cloudflare check before advancing. A failed gate pauses the sequence until repaired and rerun. Test evidence must never include credentials, customer information, service-account JSON, or session values.

| Gate | In-scope deliverable | Automated checks | Visual checks | Exit criterion |
| --- | --- | --- | --- | --- |
| 1 | Security boundary and v2 data-model migration | Secret-name inspection, schema validation, unauthenticated API rejection | Updated Studio sign-in at desktop and mobile | Admin username/password secret bindings exist; no secret is in code, reports, or client bundles. |
| 2 | Customer account registration and sign-in | Registration, incorrect-password, login, session, protected-profile tests | Login page at desktop and mobile | Passwords are salted and hashed; session is short-lived and stored only in session storage. |
| 3 | Categories and product browsing | Category query, product-filter, empty-state tests | `/categories` and category detail layouts at desktop and mobile | Live categories return only valid products and every navigation path is usable. |
| 4 | Cart, checkout, and order tracking | Totals, validation errors, order persistence, invalid transition rejection | Cart, checkout, success, and tracking routes at desktop and mobile | A test order can be created and tracked without exposing customer data publicly. |
| 5 | Printable invoice workflow | Invoice ownership/administration rules, totals, print route, missing-order error | Invoice screen and print CSS preview | Each completed checkout produces a protected browser-printable invoice. |
| 6 | Studio operations | Admin login failure, product creation/edit validation, category operations, order status and inventory event tests | Dashboard, catalogue, categories, orders at desktop and mobile | Studio actions persist only to the new v2 D1 database and unauthenticated requests fail. |
| 7 | Analytics and Google integration boundary | Public event payload redaction and missing-configuration tests | Consent-safe UI states | GA4/GTM identifiers may be public; the Google service account remains server-only until supplied and authorized. |
| 8 | Release pipeline | Typecheck, build, Worker unit tests, browser test suite, desktop/mobile screenshots, live smoke test | Review screenshots after every repaired failure | All applicable gates pass consecutively on the new Cloudflare frontend and API. |

## Explicit Deferrals

POS, barcode labels, returns, reviews, CMS/blog, newsletters, courier booking, Google Sheets writes, large-video uploads, and AI assistance are not part of the current v2 request. They remain future modules and will not be represented as working features in the dashboard.
