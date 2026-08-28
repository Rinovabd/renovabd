/** Validates build-generated Rinovabd crawl artifacts: every listed URL is public and all private operational routes stay excluded. */
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const publicUrls = ["https://shop-v2.rinovabd.com/", "https://shop-v2.rinovabd.com/shop", "https://shop-v2.rinovabd.com/categories", "https://shop-v2.rinovabd.com/categories/complexion", "https://shop-v2.rinovabd.com/categories/lips", "https://shop-v2.rinovabd.com/categories/sets", "https://shop-v2.rinovabd.com/categories/skin-ritual"];
const forbidden = ["/admin", "/account", "/cart", "/checkout", "/invoice/", "/track/"];
const [sitemap, robots] = await Promise.all([readFile(resolve("dist/public/sitemap.xml"), "utf8"), readFile(resolve("dist/public/robots.txt"), "utf8")]);
if (!sitemap.startsWith("<?xml") || !sitemap.includes("<urlset")) throw new Error("sitemap.xml is not valid XML sitemap output.");
for (const url of publicUrls) if (!sitemap.includes(`<loc>${url}</loc>`)) throw new Error(`Missing public sitemap URL: ${url}`);
for (const path of forbidden) if (sitemap.includes(path)) throw new Error(`Private route included in sitemap: ${path}`);
if (!robots.includes("Sitemap: https://shop-v2.rinovabd.com/sitemap.xml")) throw new Error("robots.txt has no canonical sitemap declaration.");
for (const path of forbidden) if (!robots.includes(`Disallow: ${path}`)) throw new Error(`robots.txt has no private-route directive: ${path}`);
console.log(`SEO artifact verification passed: ${publicUrls.length} public URLs; ${forbidden.length} private paths excluded.`);
