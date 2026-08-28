/**
 * Rinovabd v2 API — isolated Cloudflare backend.
 * The Worker binds only rinovabd-v2-db, rinovabd-v2-cache, and rinovabd-v2-media.
 * It intentionally contains no legacy resource identifiers, routes, or bindings.
 */
const MAX_UPLOAD_BYTES = 6 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const asJson = (payload, status = 200, headers = {}) => new Response(JSON.stringify(payload), {
  status,
  headers: { "content-type": "application/json; charset=UTF-8", "cache-control": "no-store", ...headers },
});

const error = (code, message, status = 400) => asJson({ ok: false, error: { code, message } }, status);

function cors(origin, env) {
  const configured = String(env.ALLOWED_ORIGIN || "").trim();
  const permitted = configured ? configured === origin : origin || "*";
  return {
    "access-control-allow-origin": permitted ? (configured || origin || "*") : "null",
    "access-control-allow-methods": "GET, POST, PATCH, OPTIONS",
    "access-control-allow-headers": "authorization, content-type, x-admin-session, x-filename",
    "access-control-max-age": "86400",
    vary: "Origin",
  };
}

function withCors(response, origin, env) {
  const headers = new Headers(response.headers);
  Object.entries(cors(origin, env)).forEach(([key, value]) => headers.set(key, value));
  return new Response(response.body, { status: response.status, headers });
}

function normaliseProduct(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    price: row.price_bdt,
    compareAt: row.compare_at_bdt,
    image: row.image_url,
    shade: row.shade,
    stock: row.stock,
    status: row.status === "low-stock" ? "Low stock" : row.status === "live" ? "Live" : "Draft",
    description: row.description,
  };
}

async function readJson(request) {
  try { return await request.json(); } catch { return null; }
}

function safeText(value, max = 240) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function validProduct(input) {
  const name = safeText(input?.name, 120);
  const category = safeText(input?.category, 80);
  const image = safeText(input?.image, 1024);
  const price = Number(input?.price);
  const stock = Number(input?.stock);
  if (!name || !category || !image || !Number.isInteger(price) || price < 0 || !Number.isInteger(stock) || stock < 0) return null;
  const statusMap = { Live: "live", Draft: "draft", "Low stock": "low-stock", live: "live", draft: "draft", "low-stock": "low-stock" };
  const status = statusMap[input.status] || "draft";
  const compareAt = input.compareAt === undefined || input.compareAt === null || input.compareAt === "" ? null : Number(input.compareAt);
  if (compareAt !== null && (!Number.isInteger(compareAt) || compareAt < price)) return null;
  return { name, category, image, price, stock, status, compareAt, shade: safeText(input.shade, 100), description: safeText(input.description, 1400) };
}

async function adminAuthenticated(request, env) {
  const expectedToken = String(env.ADMIN_API_TOKEN || "").trim();
  if (!expectedToken) return { ok: false, setupRequired: true };
  const direct = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || "";
  if (direct && direct === expectedToken) return { ok: true };
  const session = request.headers.get("x-admin-session") || "";
  if (!session || !env.CACHE) return { ok: false };
  const sessionRecord = await env.CACHE.get(`admin-session:${session}`, "json");
  return sessionRecord?.role === "admin" ? { ok: true } : { ok: false };
}

async function requireAdmin(request, env) {
  const auth = await adminAuthenticated(request, env);
  if (auth.ok) return null;
  return auth.setupRequired ? error("ADMIN_SETUP_REQUIRED", "Set ADMIN_API_TOKEN as a secret on the new v2 Worker before admin routes can be used.", 503) : error("UNAUTHORISED", "An admin session or bearer token is required.", 401);
}

async function health(env) {
  let db = "unavailable";
  try { await env.DB.prepare("SELECT 1 AS ok").first(); db = "ok"; } catch { db = "degraded"; }
  return asJson({ ok: db === "ok", service: "rinovabd-v2-api", resources: { database: db, cache: env.CACHE ? "configured" : "unavailable", media: env.MEDIA ? "configured" : "unavailable" } }, db === "ok" ? 200 : 503);
}

async function products(request, env) {
  const url = new URL(request.url);
  const requestedCategory = safeText(url.searchParams.get("category"), 80);
  const q = safeText(url.searchParams.get("q"), 80);
  const showAll = url.searchParams.get("all") === "true";
  const terms = []; const bindings = [];
  if (!showAll) terms.push("status != 'draft'");
  if (requestedCategory) { terms.push("category = ?"); bindings.push(requestedCategory); }
  if (q) { terms.push("(name LIKE ? OR category LIKE ? OR shade LIKE ?)"); bindings.push(`%${q}%`, `%${q}%`, `%${q}%`); }
  const clause = terms.length ? `WHERE ${terms.join(" AND ")}` : "";
  const statement = env.DB.prepare(`SELECT id, name, category, price_bdt, compare_at_bdt, image_url, shade, stock, status, description FROM products ${clause} ORDER BY created_at DESC`).bind(...bindings);
  const rows = await statement.all();
  return asJson({ ok: true, products: rows.results.map(normaliseProduct) }, 200, { "cache-control": "public, max-age=60" });
}

async function createOrder(request, env) {
  const input = await readJson(request);
  const customerName = safeText(input?.customerName, 120);
  const phone = safeText(input?.phone, 30);
  const deliveryAddress = safeText(input?.deliveryAddress, 500);
  const items = Array.isArray(input?.items) ? input.items.slice(0, 20) : [];
  const paymentMethod = input?.paymentMethod === "mobile-payment" ? "mobile-payment" : "cod";
  if (!customerName || !phone || !deliveryAddress || !items.length) return error("INVALID_ORDER", "Name, phone, delivery address, and at least one item are required.", 422);
  const productIds = [...new Set(items.map((item) => safeText(item?.id, 80)).filter(Boolean))];
  if (!productIds.length) return error("INVALID_ITEMS", "Order items are not valid.", 422);
  const placeholders = productIds.map(() => "?").join(",");
  const catalogue = await env.DB.prepare(`SELECT id, name, price_bdt, stock, status FROM products WHERE id IN (${placeholders})`).bind(...productIds).all();
  const byId = new Map(catalogue.results.map((row) => [row.id, row]));
  const orderItems = [];
  for (const item of items) {
    const id = safeText(item?.id, 80); const quantity = Number(item?.quantity);
    const product = byId.get(id);
    if (!product || product.status === "draft" || !Number.isInteger(quantity) || quantity < 1 || quantity > 10 || product.stock < quantity) return error("ITEM_UNAVAILABLE", "One or more items are not currently available in the requested quantity.", 409);
    orderItems.push({ id, name: product.name, quantity, unitPrice: product.price_bdt, lineTotal: product.price_bdt * quantity });
  }
  const subtotal = orderItems.reduce((total, item) => total + item.lineTotal, 0);
  const delivery = subtotal >= 2000 ? 0 : 150;
  const id = `RV-${crypto.randomUUID().replaceAll("-", "").slice(0, 10).toUpperCase()}`;
  await env.DB.batch([
    env.DB.prepare("INSERT INTO orders (id, customer_name, phone, delivery_address, items_json, subtotal_bdt, delivery_bdt, total_bdt, payment_method) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(id, customerName, phone, deliveryAddress, JSON.stringify(orderItems), subtotal, delivery, subtotal + delivery, paymentMethod),
    ...orderItems.map((item) => env.DB.prepare("UPDATE products SET stock = stock - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(item.quantity, item.id)),
  ]);
  return asJson({ ok: true, order: { id, subtotal, delivery, total: subtotal + delivery, paymentMethod, status: "new" } }, 201);
}

async function adminLogin(request, env) {
  const input = await readJson(request); const token = safeText(input?.token, 512); const expected = String(env.ADMIN_API_TOKEN || "").trim();
  if (!expected) return error("ADMIN_SETUP_REQUIRED", "Set ADMIN_API_TOKEN as a secret on the new v2 Worker before signing in.", 503);
  if (!token || token !== expected) return error("UNAUTHORISED", "The supplied access token is not valid.", 401);
  const session = crypto.randomUUID();
  await env.CACHE.put(`admin-session:${session}`, JSON.stringify({ role: "admin", createdAt: new Date().toISOString() }), { expirationTtl: 60 * 60 * 12 });
  return asJson({ ok: true, session, expiresInSeconds: 43200 });
}

async function adminProducts(request, env, id) {
  const denied = await requireAdmin(request, env); if (denied) return denied;
  if (request.method === "GET") {
    if (id) { const row = await env.DB.prepare("SELECT * FROM products WHERE id = ?").bind(id).first(); return row ? asJson({ ok: true, product: normaliseProduct(row) }) : error("NOT_FOUND", "Product was not found.", 404); }
    const rows = await env.DB.prepare("SELECT * FROM products ORDER BY updated_at DESC").all(); return asJson({ ok: true, products: rows.results.map(normaliseProduct) });
  }
  const input = await readJson(request); const product = validProduct(input); if (!product) return error("INVALID_PRODUCT", "Provide a valid name, category, image, non-negative price, and non-negative whole stock count.", 422);
  const productId = id || `rnv-${crypto.randomUUID().slice(0, 8)}`;
  if (id) {
    const result = await env.DB.prepare("UPDATE products SET name=?, category=?, price_bdt=?, compare_at_bdt=?, image_url=?, shade=?, stock=?, status=?, description=?, updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(product.name, product.category, product.price, product.compareAt, product.image, product.shade, product.stock, product.status, product.description, productId).run();
    if (!result.meta.changes) return error("NOT_FOUND", "Product was not found.", 404);
  } else {
    await env.DB.prepare("INSERT INTO products (id, name, category, price_bdt, compare_at_bdt, image_url, shade, stock, status, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(productId, product.name, product.category, product.price, product.compareAt, product.image, product.shade, product.stock, product.status, product.description).run();
  }
  const saved = await env.DB.prepare("SELECT * FROM products WHERE id = ?").bind(productId).first();
  return asJson({ ok: true, product: normaliseProduct(saved) }, id ? 200 : 201);
}

async function mediaUpload(request, env) {
  const denied = await requireAdmin(request, env); if (denied) return denied;
  const type = request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() || "";
  const length = Number(request.headers.get("content-length") || "0");
  if (!ALLOWED_IMAGE_TYPES.has(type)) return error("UNSUPPORTED_MEDIA", "Only JPEG, PNG, and WebP images can be uploaded.", 415);
  if (length && length > MAX_UPLOAD_BYTES) return error("PAYLOAD_TOO_LARGE", "Images must be 6 MB or smaller.", 413);
  const bytes = await request.arrayBuffer(); if (!bytes.byteLength || bytes.byteLength > MAX_UPLOAD_BYTES) return error("PAYLOAD_TOO_LARGE", "Images must be 6 MB or smaller.", 413);
  const extension = type === "image/jpeg" ? "jpg" : type.split("/")[1];
  const id = crypto.randomUUID(); const key = `uploads/${new Date().toISOString().slice(0, 10)}/${id}.${extension}`; const originalName = safeText(request.headers.get("x-filename"), 200) || `upload.${extension}`;
  await env.MEDIA.put(key, bytes, { httpMetadata: { contentType: type }, customMetadata: { originalName } });
  await env.DB.prepare("INSERT INTO media_assets (id, object_key, content_type, original_name, size_bytes) VALUES (?, ?, ?, ?, ?)").bind(id, key, type, originalName, bytes.byteLength).run();
  return asJson({ ok: true, asset: { id, key, url: `/api/media/${encodeURIComponent(key)}`, type, size: bytes.byteLength } }, 201);
}

async function mediaRead(env, key) {
  const object = await env.MEDIA.get(key); if (!object) return error("NOT_FOUND", "Media asset was not found.", 404);
  const headers = new Headers(); object.writeHttpMetadata(headers); headers.set("etag", object.httpEtag); headers.set("cache-control", "public, max-age=31536000, immutable"); headers.set("x-content-type-options", "nosniff");
  return new Response(object.body, { headers });
}

async function overview(request, env) {
  const denied = await requireAdmin(request, env); if (denied) return denied;
  const [stock, orders, media] = await env.DB.batch([
    env.DB.prepare("SELECT COUNT(*) AS products, COALESCE(SUM(stock), 0) AS units, SUM(CASE WHEN stock < 10 THEN 1 ELSE 0 END) AS low_stock FROM products").bind(),
    env.DB.prepare("SELECT COUNT(*) AS orders, COALESCE(SUM(total_bdt), 0) AS revenue, SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) AS new_orders FROM orders").bind(),
    env.DB.prepare("SELECT COUNT(*) AS assets FROM media_assets").bind(),
  ]);
  return asJson({ ok: true, overview: { inventory: stock.results[0], orders: orders.results[0], media: media.results[0] } });
}

async function route(request, env) {
  const url = new URL(request.url); const path = url.pathname.replace(/\/+$/, "") || "/";
  if (request.method === "OPTIONS") return new Response(null, { status: 204 });
  if (path === "/api/health" && request.method === "GET") return health(env);
  if (path === "/api/products" && request.method === "GET") return products(request, env);
  if (path === "/api/orders" && request.method === "POST") return createOrder(request, env);
  if (path === "/api/admin/login" && request.method === "POST") return adminLogin(request, env);
  if (path === "/api/admin/overview" && request.method === "GET") return overview(request, env);
  if (path === "/api/admin/products" && (request.method === "GET" || request.method === "POST")) return adminProducts(request, env, "");
  const productMatch = path.match(/^\/api\/admin\/products\/([^/]+)$/);
  if (productMatch && (request.method === "GET" || request.method === "PATCH")) return adminProducts(request, env, decodeURIComponent(productMatch[1]));
  if (path === "/api/media" && request.method === "POST") return mediaUpload(request, env);
  const mediaMatch = path.match(/^\/api\/media\/(.+)$/);
  if (mediaMatch && request.method === "GET") return mediaRead(env, decodeURIComponent(mediaMatch[1]));
  return error("NOT_FOUND", "This API route does not exist.", 404);
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("origin") || "";
    try { return withCors(await route(request, env), origin, env); }
    catch (cause) { console.error("rinovabd-v2-api", cause); return withCors(error("INTERNAL_ERROR", "The request could not be completed." , 500), origin, env); }
  },
};
