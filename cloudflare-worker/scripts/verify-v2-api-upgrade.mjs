/** Rinovabd v2 only: redacted post-deployment smoke verification for secure admin, account failure, categories, and commerce API boundaries. */
import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const api = "https://api-v2.rinovabd.com";
const origin = "https://shop-v2.rinovabd.com";
const reportPath = fileURLToPath(new URL("../reports/v2-api-upgrade-live.json", import.meta.url));
const report = { checkedAt: new Date().toISOString(), api, checks: [] };
const record = (name, response, detail) => { report.checks.push({ name, status: response.status, success: detail }); assert.ok(detail, `${name} returned HTTP ${response.status}`); };
const json = (path, options = {}) => fetch(`${api}${path}`, { ...options, headers: { Origin: origin, ...(options.headers || {}) } });

try {
  const health = await json("/api/health"); const healthBody = await health.json(); record("health", health, health.status === 200 && healthBody.ok === true);
  const categoryResponse = await json("/api/categories"); const categoryBody = await categoryResponse.json(); record("public-categories", categoryResponse, categoryResponse.status === 200 && categoryBody.categories?.length === 4);
  const invalidAdmin = await json("/api/admin/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ username: "invalid", password: "invalid" }) }); record("admin-login-rejects-invalid-credentials", invalidAdmin, invalidAdmin.status === 401);
  const unauthenticatedAdmin = await json("/api/admin/products"); record("admin-products-rejects-unauthenticated", unauthenticatedAdmin, unauthenticatedAdmin.status === 401);
  const invalidCustomer = await json("/api/auth/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: "invalid@example.invalid", password: "invalid" }) }); record("customer-login-rejects-invalid-credentials", invalidCustomer, invalidCustomer.status === 401);
  const invalidOrder = await json("/api/orders", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ customerName: "", email: "invalid", phone: "", deliveryAddress: "", items: [] }) }); record("checkout-rejects-incomplete-order", invalidOrder, invalidOrder.status === 422);
  const token = (await readFile("/home/ubuntu/.rinovabd-v2/admin-access-token.txt", "utf8")).trim();
  const adminLogin = await json("/api/admin/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ token }) }); const adminSession = await adminLogin.json(); record("admin-automation-session", adminLogin, adminLogin.status === 200 && typeof adminSession.session === "string");
  const products = await json("/api/admin/products", { headers: { "x-admin-session": adminSession.session } }); const productBody = await products.json(); record("admin-product-metadata", products, products.status === 200 && productBody.products?.length === 4 && productBody.products.every((product) => product.sku && product.barcode));
  const orders = await json("/api/admin/orders", { headers: { "x-admin-session": adminSession.session } }); const orderBody = await orders.json(); record("admin-order-queue", orders, orders.status === 200 && Array.isArray(orderBody.orders));
  report.outcome = "passed";
} catch (cause) { report.outcome = "failed"; report.failure = cause instanceof Error ? cause.message : "unclassified"; await mkdir(fileURLToPath(new URL("../reports/", import.meta.url)), { recursive: true }); await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`); throw cause; }
await mkdir(fileURLToPath(new URL("../reports/", import.meta.url)), { recursive: true });
await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
