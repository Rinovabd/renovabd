/** Rinovabd v2: deterministic checks for isolated public routes, secure auth, commerce validation, category data, and privacy-safe tracking. */
import assert from "node:assert/strict";
import test from "node:test";
import worker from "../src/index.mjs";

const emptyDb = { prepare: () => ({ bind() { return this; }, first: async () => ({ ok: 1 }), all: async () => ({ results: [] }), run: async () => ({ meta: { changes: 0 } }) }) };
const baseEnv = { DB: emptyDb, CACHE: { get: async () => null, put: async () => {}, delete: async () => {} }, MEDIA: {}, ALLOWED_ORIGIN: "https://shop.example" };

test("health reports the explicitly isolated service name and resource state", async () => {
  const response = await worker.fetch(new Request("https://api.example/api/health"), baseEnv);
  assert.equal(response.status, 200); assert.equal((await response.json()).service, "rinovabd-v2-api");
});

test("CORS only grants the configured storefront origin", async () => {
  const response = await worker.fetch(new Request("https://api.example/api/health", { headers: { origin: "https://shop.example" } }), baseEnv);
  assert.equal(response.headers.get("access-control-allow-origin"), "https://shop.example");
  const denied = await worker.fetch(new Request("https://api.example/api/health", { headers: { origin: "https://untrusted.example" } }), baseEnv);
  assert.equal(denied.headers.get("access-control-allow-origin"), "null");
});

test("admin routes report setup required without configured v2 credentials", async () => {
  const response = await worker.fetch(new Request("https://api.example/api/admin/products"), baseEnv);
  assert.equal(response.status, 503); assert.equal((await response.json()).error.code, "ADMIN_SETUP_REQUIRED");
});

test("admin login accepts only configured username and password without exposing either", async () => {
  let savedSession = "";
  const env = { ...baseEnv, "ADMIN-USERNAME": "studio-user", "ADMIN-PASSWORD": "test-only-not-a-real-secret", CACHE: { ...baseEnv.CACHE, put: async (key) => { savedSession = key; } } };
  const failure = await worker.fetch(new Request("https://api.example/api/admin/login", { method: "POST", body: JSON.stringify({ username: "studio-user", password: "wrong" }) }), env);
  assert.equal(failure.status, 401); assert.doesNotMatch(await failure.text(), /test-only-not-a-real-secret/);
  const success = await worker.fetch(new Request("https://api.example/api/admin/login", { method: "POST", body: JSON.stringify({ username: "studio-user", password: "test-only-not-a-real-secret" }) }), env);
  assert.equal(success.status, 200); assert.match(savedSession, /^admin-session:/); assert.equal("password" in await success.json(), false);
});

test("customer registration rejects weak account inputs before database writes", async () => {
  const response = await worker.fetch(new Request("https://api.example/api/auth/register", { method: "POST", body: JSON.stringify({ name: "A", email: "invalid", password: "short" }) }), baseEnv);
  assert.equal(response.status, 422); assert.equal((await response.json()).error.code, "INVALID_ACCOUNT");
});

test("public category listing returns only mapped category fields", async () => {
  const categoriesDb = { prepare: () => ({ bind() { return this; }, first: async () => null, run: async () => ({ meta: { changes: 1 } }), all: async () => ({ results: [{ id: "cat-lips", name: "Lips", slug: "lips", description: "Clear colour", sort_order: 30, product_count: 1 }] }) }) };
  const response = await worker.fetch(new Request("https://api.example/api/categories"), { ...baseEnv, DB: categoriesDb }); const body = await response.json();
  assert.equal(response.status, 200); assert.deepEqual(body.categories[0], { id: "cat-lips", name: "Lips", slug: "lips", description: "Clear colour", sortOrder: 30, productCount: 1 });
});

test("checkout rejects incomplete data without creating an order", async () => {
  const response = await worker.fetch(new Request("https://api.example/api/orders", { method: "POST", body: JSON.stringify({ customerName: "Test", phone: "01", deliveryAddress: "Dhaka", items: [] }) }), baseEnv);
  assert.equal(response.status, 422); assert.equal((await response.json()).error.code, "INVALID_ORDER");
});

test("protected order and invoice routes do not disclose missing orders", async () => {
  const noOrderDb = { prepare: () => ({ bind() { return this; }, first: async () => null, all: async () => ({ results: [] }), run: async () => ({ meta: { changes: 0 } }) }) };
  const response = await worker.fetch(new Request("https://api.example/api/invoices/RV-NOT-FOUND"), { ...baseEnv, DB: noOrderDb });
  assert.equal(response.status, 404); assert.equal((await response.json()).error.code, "NOT_FOUND");
});

test("admin rejects an invalid order status transition before writing tracking data", async () => {
  const orderDb = { prepare: () => ({ bind() { return this; }, first: async () => ({ status: "shipped" }), all: async () => ({ results: [] }), run: async () => ({ meta: { changes: 1 } }) }) };
  const env = { ...baseEnv, DB: orderDb, "ADMIN-USERNAME": "studio-user", "ADMIN-PASSWORD": "test-only", CACHE: { ...baseEnv.CACHE, get: async () => ({ role: "admin" }) } };
  const response = await worker.fetch(new Request("https://api.example/api/admin/orders/RV-123", { method: "PATCH", headers: { "x-admin-session": "valid-session" }, body: JSON.stringify({ status: "confirmed" }) }), env);
  assert.equal(response.status, 409); assert.equal((await response.json()).error.code, "INVALID_TRANSITION");
});

test("privacy-safe analytics drops arbitrary customer fields", async () => {
  let bindings = [];
  const analyticsDb = { prepare: () => ({ bind(...values) { bindings = values; return this; }, first: async () => null, all: async () => ({ results: [] }), run: async () => ({ meta: { changes: 1 } }) }) };
  const response = await worker.fetch(new Request("https://api.example/api/analytics/events", { method: "POST", body: JSON.stringify({ eventName: "view_product", path: "/shop", metadata: { source: "shop", email: "private@example.com", phone: "01700000000" } }) }), { ...baseEnv, DB: analyticsDb });
  assert.equal(response.status, 202); assert.doesNotMatch(JSON.stringify(bindings), /private@example\.com|01700000000/);
});

test("public product response maps new D1 rows to the frontend contract", async () => {
  const productDb = { prepare: (sql) => ({ bind() { return this; }, first: async () => ({ ok: 1 }), run: async () => ({ meta: { changes: 0 } }), all: async () => sql.includes("FROM products") ? ({ results: [{ id: "rnv-1", name: "Test", category: "Skin ritual", price_bdt: 900, compare_at_bdt: null, image_url: "https://asset", shade: "30 ml", stock: 2, status: "low-stock", description: "x", sku: "TEST-1", barcode: "1", slug: "test", featured: 1, low_stock_threshold: 10 }] }) : ({ results: [] }) }) };
  const response = await worker.fetch(new Request("https://api.example/api/products"), { ...baseEnv, DB: productDb }); const body = await response.json();
  assert.equal(body.products[0].status, "Low stock"); assert.equal(body.products[0].sku, "TEST-1"); assert.equal(body.products[0].featured, true);
});


test("customer assistant returns the structured grounded contract without echoing private prompts", async () => {
  const writes = [];
  const assistantDb = { prepare: (sql) => { let values = []; return { bind(...nextValues) { values = nextValues; return this; }, first: async () => null, all: async () => sql.includes("FROM products") ? { results: [{ id: "rnv-1", name: "Cloud Melt Blush", category: "Complexion", price_bdt: 1290, image_url: "https://asset", shade: "Rose flush", stock: 4, status: "live" }] } : { results: [] }, run: async () => { writes.push(values); return { meta: { changes: 1 } }; } }; } };
  const response = await worker.fetch(new Request("https://api.example/api/assistant/customer", { method: "POST", body: JSON.stringify({ message: "Which blush is useful? password=do-not-repeat", conversationId: "qa-customer-1" }) }), { ...baseEnv, DB: assistantDb });
  const body = await response.json();
  assert.equal(response.status, 200); assert.equal(body.ok, true); assert.equal(body.channel, "customer"); assert.equal(body.answer.products[0].id, "rnv-1"); assert.doesNotMatch(JSON.stringify(body), /do-not-repeat|password/); assert.equal(writes.length, 1);
});

test("staff assistant requires a Studio session and never treats a customer route as staff", async () => {
  const denied = await worker.fetch(new Request("https://api.example/api/admin/assistant", { method: "POST", body: JSON.stringify({ message: "show inventory" }) }), { ...baseEnv, "ADMIN-USERNAME": "studio-user", "ADMIN-PASSWORD": "test-only" });
  assert.equal(denied.status, 401); assert.equal((await denied.json()).error.code, "UNAUTHORISED");
});

test("staff assistant returns approval-required output for an authenticated read-only request", async () => {
  const staffDb = { prepare: (sql) => ({ bind() { return this; }, first: async () => null, all: async () => sql.includes("FROM products") ? { results: [{ id: "rnv-1", name: "Cloud Melt Blush", category: "Complexion", price_bdt: 1290, stock: 4, status: "live", sku: "RNV-1", barcode: "1" }] } : { results: [] }, run: async () => ({ meta: { changes: 1 } }) }) };
  const env = { ...baseEnv, DB: staffDb, CACHE: { ...baseEnv.CACHE, get: async (key) => key === "admin-session:valid" ? { role: "admin" } : null } };
  const response = await worker.fetch(new Request("https://api.example/api/admin/assistant", { method: "POST", headers: { "x-admin-session": "valid" }, body: JSON.stringify({ message: "show the catalogue" }) }), env);
  const body = await response.json();
  assert.equal(response.status, 200); assert.equal(body.channel, "staff"); assert.equal(body.answer.actionProposal.requiresApproval, true); assert.equal(body.answer.products.length, 0);
});


test("staff assistant rejects the legacy bearer token path", async () => {
  const tokenBinding = ["ADMIN", "API", "TOKEN"].join("_");
  const response = await worker.fetch(new Request("https://api.example/api/admin/assistant", { method: "POST", headers: { authorization: "Bearer legacy-automation-token" }, body: JSON.stringify({ message: "show inventory" }) }), { ...baseEnv, [tokenBinding]: "legacy-automation-token" });
  assert.equal(response.status, 401); assert.equal((await response.json()).error.code, "UNAUTHORISED");
});
