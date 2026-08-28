/** Generates public crawl artifacts at build time from the live v2 category index; excludes customer, checkout, invoice, tracking, and Studio routes. */
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const origin = "https://shop-v2.rinovabd.com";
const output = resolve("dist/public");
const fallbackSlugs = ["complexion", "skin-ritual", "lips", "sets"];
const escape = (value) => value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[character]);
async function categorySlugs() {
  try {
    const response = await fetch("https://api-v2.rinovabd.com/api/categories", { signal: AbortSignal.timeout(5000), headers: { accept: "application/json" } });
    const body = await response.json();
    const remote = Array.isArray(body?.categories) ? body.categories.map((category) => category?.slug).filter((slug) => typeof slug === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) : [];
    return remote.length ? [...new Set(remote)].sort() : fallbackSlugs;
  } catch { return fallbackSlugs; }
}
const slugs = await categorySlugs();
const lastmod = new Date().toISOString().slice(0, 10);
const routes = ["/", "/shop", "/categories", ...slugs.map((slug) => `/categories/${slug}`)];
const entries = routes.map((route) => `  <url>\n    <loc>${escape(`${origin}${route}`)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${route === "/" ? "weekly" : "monthly"}</changefreq>\n    <priority>${route === "/" ? "1.0" : route === "/shop" || route === "/categories" ? "0.8" : "0.7"}</priority>\n  </url>`).join("\n");
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;
const robots = `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /account\nDisallow: /cart\nDisallow: /checkout\nDisallow: /invoice/\nDisallow: /track/\n\nSitemap: ${origin}/sitemap.xml\n`;
await mkdir(output, { recursive: true });
await Promise.all([writeFile(resolve(output, "sitemap.xml"), sitemap), writeFile(resolve(output, "robots.txt"), robots)]);
console.log(`SEO artifacts generated: ${routes.length} public URLs`);
