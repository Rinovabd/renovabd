/** Rinovabd v2 only: verify the new Cloudflare frontend, its Studio SPA route, and cross-origin API/R2 integration. */
import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const web = "https://shop-v2.rinovabd.com";
const api = "https://api-v2.rinovabd.com";
const reportPath = fileURLToPath(new URL("../reports/v2-cloudflare-web-live.json", import.meta.url));
const report = { checkedAt: new Date().toISOString(), web, api, checks: [] };
const check = (name, success, details) => { report.checks.push({ name, success, details }); assert.ok(success, `${name}: ${details}`); };

try {
  const homepage = await fetch(`${web}/`); const homepageHtml = await homepage.text();
  check("frontend-homepage", homepage.status === 200 && homepageHtml.includes("Rinovabd — Colour, considered"), `HTTP ${homepage.status}`);
  const studio = await fetch(`${web}/admin`); const studioHtml = await studio.text();
  check("frontend-studio-spa-route", studio.status === 200 && studioHtml.includes("Rinovabd — Colour, considered"), `HTTP ${studio.status}`);
  const catalogue = await fetch(`${api}/api/products`, { headers: { Origin: web } }); const body = await catalogue.json();
  check("api-cors", catalogue.headers.get("access-control-allow-origin") === web, `allow-origin=${catalogue.headers.get("access-control-allow-origin")}`);
  check("api-catalogue", catalogue.status === 200 && body.ok && body.products?.length === 4, `HTTP ${catalogue.status}; products=${body.products?.length}`);
  check("r2-backed-product-images", body.products.every((product) => product.image.startsWith(`${api}/api/media/`)), "All product images resolve through the new v2 media API.");
  const token = (await readFile("/home/ubuntu/.rinovabd-v2/admin-access-token.txt", "utf8")).trim();
  const login = await fetch(`${api}/api/admin/login`, { method: "POST", headers: { "content-type": "application/json", Origin: web }, body: JSON.stringify({ token }) }); const loginBody = await login.json();
  check("studio-login", login.status === 200 && loginBody.ok && typeof loginBody.session === "string", `HTTP ${login.status}`);
  const adminCatalogue = await fetch(`${api}/api/admin/products`, { headers: { "x-admin-session": loginBody.session, Origin: web } }); const adminBody = await adminCatalogue.json();
  check("studio-admin-catalogue", adminCatalogue.status === 200 && adminBody.ok && adminBody.products?.length === 4, `HTTP ${adminCatalogue.status}; products=${adminBody.products?.length}`);
  report.outcome = "passed";
} catch (cause) {
  report.outcome = "failed"; report.failure = cause instanceof Error ? cause.message : String(cause);
  await mkdir(fileURLToPath(new URL("../reports/", import.meta.url)), { recursive: true }); await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`); throw cause;
}
await mkdir(fileURLToPath(new URL("../reports/", import.meta.url)), { recursive: true });
await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
