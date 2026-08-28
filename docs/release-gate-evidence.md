# Rinovabd v2 Release-Gate Evidence

## Browser Checks — 2026-08-28

| Public URL | Result | Verified outcome |
| --- | --- | --- |
| `https://shop-v2.rinovabd.com/` | Passed | The new Cloudflare frontend loaded the Ribbon Modernism homepage, four live v2 catalogue cards, account and Studio paths, and campaign images from the new `api-v2` media routes. |
| `https://shop-v2.rinovabd.com/admin` | Passed | The new username-password Studio entry rendered with a password field, a secure sign-in action, a customer-safe session statement, and no access-token prompt or credential value. |
| `https://shop-v2.rinovabd.com/categories` | Passed | All four new v2 category shelves rendered, each with a live product count, a category path, and v2 R2-backed editorial media. |
| `https://shop-v2.rinovabd.com/account` | Passed | The customer account route rendered distinct sign-in and account-creation controls with labelled email and password fields; no account information was submitted. |
| `https://shop-v2.rinovabd.com/categories` (post-refinement) | Passed | The live v2 category index returned four real category shelves and rendered the hot-pink category rail plus a separate dark editorial merchandising band. |
| `https://shop-v2.rinovabd.com/account` (post-refinement) | Passed | The live account screen retained its secure labelled sign-in controls and rendered the account desk rail and account-counter ticket; no credentials or customer data were submitted. |

> These checks used only public browser rendering. No customer account, administrator credential, session token, service-account credential, or legacy Cloudflare resource was accessed or recorded.

## GTM, GA4, and Technical SEO Release Gate

| Check | Result | Verified outcome |
| --- | --- | --- |
| GTM-first storefront code | Passed locally | The build contains one GTM bootstrap, denied-by-default consent, and no direct `gtag.js` installation. The serialized browser suite verifies anonymous add-to-cart, bag, checkout, and purchase data-layer events after opt-in. |
| Public metadata and noindex boundary | Passed locally | The desktop/mobile browser suite verifies a canonical category URL with `CollectionPage` JSON-LD and `noindex, nofollow, noarchive` on the account route. |
| Sitemap | Passed live | `https://shop-v2.rinovabd.com/sitemap.xml` served seven canonical public URLs: home, shop, category index, and four current category shelves. No Studio, account, cart, checkout, invoice, or tracking route appeared. |
| Robots | Passed live | `https://shop-v2.rinovabd.com/robots.txt` allows public crawling, disallows the six private route patterns, and declares the canonical sitemap URL. |

The SEO build verifier passed with seven public URLs and six excluded private paths. The final serialized Playwright run passed 12 of 12 desktop/mobile scenarios. No real customer, invoice, order, payment, or Studio credential was submitted during this verification.

The deployed homepage inspection confirmed one GTM bootstrap, no duplicate direct GA tag, the canonical homepage URL, indexable public crawl directive, and Organization structured data. Publishing a Google tag in the authorised GTM workspace remains a separate account-side action; this release does not access or publish that workspace.

## Cloudflare AI Assistant Release — 2026-08-28

The isolated assistant revision was deployed without modifying legacy Workers or buckets. The API Worker `rinovabd-v2-api` accepted deployment `670c9e5d666e439db810bef4df5ba602`; the frontend Worker `rinovabd-v2-web` accepted deployment `afd7601784c5476991168b3814d68a26`. The API uses the fresh `AI` Workers AI binding and `ASSISTANT_KNOWLEDGE` Vectorize binding for the dedicated `rinovabd-v2-assistant-knowledge` index.

| Check | Result | Verified outcome |
| --- | --- | --- |
| Worker unit suite | **15/15 passed** | Customer structured contract, privacy redaction, staff session-only authorization, and bearer-token rejection. |
| Frontend/type/build/security/SEO gates | Passed | Assistant UI compiles with the existing storefront and no tracked credential material was introduced. |
| Sequential browser suite | **16/16 passed** | Customer assistant structured answer/product card and authenticated Studio copilot approval boundary on desktop and mobile Chromium projects. |
| Live customer assistant | HTTP **200** | Public support response returned the structured answer keys without customer data. |
| Live staff assistant without session | HTTP **401**, `UNAUTHORISED` | Staff copilot was not exposed at the public boundary. |
| Live API health after deployment | HTTP **200** | Isolated v2 API remained available after the assistant deployment. |
| Live public storefront | Passed | Customer launcher rendered at `https://shop-v2.rinovabd.com/`. |
| Live Studio entry | Passed | Username/password gate rendered at `https://shop-v2.rinovabd.com/admin`; no credential was submitted. |

No live customer order, account, or inventory mutation was created by this assistant verification. Workers AI generation and Vectorize retrieval are configured server-side; deterministic fallback remains safe when either service has no available result. GTM/GA4 identifiers and all credential values remain outside this evidence.
