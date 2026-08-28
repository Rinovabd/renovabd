# Rinovabd v2 — GTM, GA4, and Technical SEO Plan

## Implementation Boundary

Rinovabd v2 will install **one Google Tag Manager container** in the storefront document and will not add a duplicate direct `gtag.js` installation. The supplied GTM container ID and GA4 identifiers are public configuration identifiers. No service-account JSON, private key, API token, password, customer address, payment detail, email address, or customer/account identifier may be sent in the client data layer.

Google’s GA4 documentation recommends Google Tag Manager as the way to get started with the Google tag and states that a separate `gtag.js` snippet is unnecessary when GTM is used.[1] The same guidance explains that sending manual page views without disabling the default flow can cause duplicate page views.[2]

| Layer | Decision | Boundary |
| --- | --- | --- |
| Container bootstrap | Add the supplied GTM loader in `<head>` and its `<noscript>` companion immediately after `<body>`. | The application carries only the public GTM container ID. |
| GA4 setup | Configure the Google tag inside GTM with the supplied GA4 measurement ID and publish it on all pages. | No direct GA4 snippet is added to the site. |
| SPA navigation | Emit a named `rinova_page_view` data-layer event after client route changes. | Configure one GTM custom-event trigger; do not combine it with a second history/page-view implementation. |
| Commerce events | Emit `view_item_list`, `view_item`, `add_to_cart`, `view_cart`, `begin_checkout`, and `purchase` with anonymous catalogue/order values. | Never include customer, address, telephone, payment, password, token, or session data. |
| Consent | Start Google consent storage as denied and expose a minimal visitor choice that updates consent before analytics storage is permitted. | The choice is browser-local; no consent profile is sent to the v2 API. |

## Crawl and Sitemap Policy

The build generates `robots.txt` and `sitemap.xml` from an explicit public route list. The sitemap includes only canonical, publicly navigable routes: `/`, `/shop`, `/categories`, and the four current category shelves. It excludes Studio, account, cart, checkout, invoice, tracking, API, and parameterised/order-specific paths. The frontend Worker also sets an `X-Robots-Tag: noindex, nofollow` header on private SPA paths.

Google’s sitemap guidance recommends placing canonical URLs in the sitemap and supports automated sitemap generation.[3] Search documentation explains that relevant structured data helps Google understand content; this implementation supplies an Organization/WebSite JSON-LD block for the public storefront without inventing reviews, ratings, or product claims.[4]

> **Ranking boundary:** clean metadata, canonical routes, crawl directives, structured data, an XML sitemap, and useful page content support discoverability. They do not guarantee a specific search position or traffic outcome.

## GTM Workspace Actions Required

The site update installs the data layer but does not publish tags in the GTM workspace. An authorised GTM user must create or confirm a Google tag with the supplied measurement ID on all pages, configure the documented custom-event mapping, test in Tag Assistant, and publish the container version. This separates public storefront code from GTM account administration.

## Verification Finding

The first strict browser run identified two regressions: the consent notice could obstruct a mobile account action, and a data-layer assertion did not confirm all expected commerce events. Both findings are release blockers. The consent component and its deterministic browser test must be corrected and the full single-worker suite must pass before the GTM/GA4 block is marked complete.

Local browser inspection confirmed that the document bootstrap begins with analytics storage denied, then pushes a granted consent update and a public `/shop` page-view event only after the visitor selects “Allow analytics.” The next corrective test must confirm the cart and purchase events and prevent the visible notice from covering unrelated mobile controls.

The local consented add-to-bag action subsequently emitted `add_to_cart` with the public catalogue item identifier only. It did not emit customer, delivery, payment, credential, or session data.

## References

[1]: https://developers.google.com/analytics/devguides/collection/ga4/tag-options "Google Analytics — Tagging for Google Analytics"
[2]: https://developers.google.com/analytics/devguides/collection/ga4/views "Google Analytics — Measure pageviews"
[3]: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap "Google Search Central — Build and submit a sitemap"
[4]: https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data "Google Search Central — Introduction to structured data"
