/** Rinovabd v2 only: run live checks against api-v2 and write redacted evidence; never print the private token or session. */
import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const base = "https://api-v2.rinovabd.com";
const token = (await readFile("/home/ubuntu/.rinovabd-v2/admin-access-token.txt", "utf8")).trim();
const themeImagePath = "/home/ubuntu/upload/5ce555fa-cbdb-4200-988a-fc4f118220ab.jpeg";
const reportPath = fileURLToPath(new URL("../reports/v2-live-smoke.json", import.meta.url));
const report = { checkedAt: new Date().toISOString(), base, checks: [] };

await mkdir(fileURLToPath(new URL("../reports/", import.meta.url)), { recursive: true });

async function call(label, path, options = {}) {
  const response = await fetch(`${base}${path}`, options);
  const body = await response.json().catch(() => null);
  report.checks.push({ label, status: response.status, ok: response.ok, body: body && typeof body === "object" ? { ok: body.ok, service: body.service, error: body.error?.code, productCount: body.products?.length, assetId: body.asset?.id, key: body.asset?.key } : body });
  return { response, body };
}

try {
  const health = await call("health", "/api/health");
  assert.equal(health.response.status, 200); assert.equal(health.body.service, "rinovabd-v2-api");

  const catalogue = await call("catalogue", "/api/products");
  assert.equal(catalogue.response.status, 200); assert.ok(Array.isArray(catalogue.body.products)); assert.ok(catalogue.body.products.length >= 4);

  const login = await call("admin-login", "/api/admin/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ token }) });
  assert.equal(login.response.status, 200); assert.equal(typeof login.body.session, "string");

  const adminCatalogue = await call("admin-catalogue", "/api/admin/products", { headers: { "x-admin-session": login.body.session } });
  assert.equal(adminCatalogue.response.status, 200); assert.ok(adminCatalogue.body.products.length >= 4);

  const image = await readFile(themeImagePath);
  const upload = await call("media-upload", "/api/media", { method: "POST", headers: { "x-admin-session": login.body.session, "content-type": "image/jpeg", "x-filename": "rinova-pink-theme-reference.jpeg" }, body: image });
  assert.equal(upload.response.status, 201); assert.match(upload.body.asset.key, /^uploads\//);

  report.outcome = "passed";
} catch (cause) {
  report.outcome = "failed";
  report.failure = cause instanceof Error ? cause.message : String(cause);
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  throw cause;
}

await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
