/** Rinovabd v2: pure unit checks for public route safety, CORS, admin guards, and catalog response mapping. */
import assert from "node:assert/strict";
import test from "node:test";
import worker from "../src/index.mjs";

const emptyDb = { prepare: () => ({ bind() { return this; }, first: async () => ({ ok: 1 }), all: async () => ({ results: [] }), run: async () => ({ meta: { changes: 0 } }) }) };
const baseEnv = { DB: emptyDb, CACHE: { get: async () => null, put: async () => {} }, MEDIA: {}, ALLOWED_ORIGIN: "https://shop.example" };

test("health reports the explicitly isolated service name and resource state", async () => {
  const response = await worker.fetch(new Request("https://api.example/api/health"), baseEnv);
  assert.equal(response.status, 200);
  assert.equal((await response.json()).service, "rinovabd-v2-api");
});

test("CORS only grants the configured storefront origin", async () => {
  const response = await worker.fetch(new Request("https://api.example/api/health", { headers: { origin: "https://shop.example" } }), baseEnv);
  assert.equal(response.headers.get("access-control-allow-origin"), "https://shop.example");
  const denied = await worker.fetch(new Request("https://api.example/api/health", { headers: { origin: "https://untrusted.example" } }), baseEnv);
  assert.equal(denied.headers.get("access-control-allow-origin"), "null");
});

test("admin library rejects requests until a separately configured v2 secret exists", async () => {
  const response = await worker.fetch(new Request("https://api.example/api/admin/products"), baseEnv);
  assert.equal(response.status, 503);
  assert.equal((await response.json()).error.code, "ADMIN_SETUP_REQUIRED");
});

test("public product response maps new D1 rows to the frontend contract", async () => {
  const productDb = { prepare: (sql) => ({ bind() { return this; }, first: async () => ({ ok: 1 }), all: async () => sql.includes("FROM products") ? ({ results: [{ id: "rnv-1", name: "Test", category: "Skin ritual", price_bdt: 900, compare_at_bdt: null, image_url: "https://asset", shade: "30 ml", stock: 2, status: "low-stock", description: "x" }] }) : ({ results: [] }) }) };
  const response = await worker.fetch(new Request("https://api.example/api/products"), { ...baseEnv, DB: productDb });
  const body = await response.json();
  assert.equal(body.products[0].status, "Low stock");
  assert.equal(body.products[0].price, 900);
});
