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
