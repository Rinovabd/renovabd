/** Rinovabd v2 Web: package the already-built frontend into a new standalone Cloudflare Worker; no legacy Workers, buckets, or GitHub deployment integration are used. */
import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import { extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const publicDir = fileURLToPath(new URL("../../dist/public/", import.meta.url));
const outputPath = fileURLToPath(new URL("./deploy-v2-web-request.json", import.meta.url));
const contentTypes = { ".css": "text/css; charset=UTF-8", ".html": "text/html; charset=UTF-8", ".ico": "image/x-icon", ".js": "application/javascript; charset=UTF-8", ".json": "application/json; charset=UTF-8", ".png": "image/png", ".svg": "image/svg+xml", ".txt": "text/plain; charset=UTF-8", ".webp": "image/webp", ".xml": "application/xml; charset=UTF-8" };

async function collect(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const absolute = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collect(absolute)); else if (entry.isFile()) files.push(absolute);
  }
  return files;
}

const files = (await collect(publicDir)).sort();
const assets = {};
for (const file of files) {
  const routePath = `/${relative(publicDir, file).replaceAll("\\", "/")}`;
  const buffer = await readFile(file);
  assets[routePath] = { body: buffer.toString("base64"), type: contentTypes[extname(file)] || "application/octet-stream", size: (await stat(file)).size };
}
if (!assets["/index.html"]) throw new Error("No production index.html found. Run the frontend build first.");

const source = `/** Rinovabd v2 Web — new Cloudflare frontend Worker. It serves the Ribbon Modernism build and does not bind to, route through, or modify legacy infrastructure. */
const assets = ${JSON.stringify(assets)};
function fromBase64(value) { const binary = atob(value); const bytes = new Uint8Array(binary.length); for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index); return bytes; }
function respond(asset, request) { const headers = new Headers({ "content-type": asset.type, "x-content-type-options": "nosniff", "cache-control": asset.type.includes("text/html") ? "no-cache" : "public, max-age=31536000, immutable" }); return new Response(request.method === "HEAD" ? null : fromBase64(asset.body), { status: 200, headers }); }
export default { fetch(request) { const url = new URL(request.url); if (request.method !== "GET" && request.method !== "HEAD") return new Response("Method not allowed", { status: 405, headers: { allow: "GET, HEAD" } }); const asset = assets[url.pathname]; if (asset) return respond(asset, request); if (url.pathname.startsWith("/assets/") || url.pathname.startsWith("/api/")) return new Response("Not found", { status: 404 }); return respond(assets["/index.html"], request); } };`;
const sourceBase64 = Buffer.from(source).toString("base64");
const executeCode = `async () => { const code = atob("${sourceBase64}"); const metadata = { main_module: "index.mjs", workers_dev: true, bindings: [{ type: "plain_text", name: "APP_NAME", text: "Rinovabd v2 Web" }] }; const boundary = "----RinovabdV2Web" + Date.now(); const body = ["--" + boundary, "Content-Disposition: form-data; name=\\"metadata\\"", "Content-Type: application/json", "", JSON.stringify(metadata), "--" + boundary, "Content-Disposition: form-data; name=\\"index.mjs\\"; filename=\\"index.mjs\\"", "Content-Type: application/javascript+module", "", code, "--" + boundary + "--"].join("\\r\\n"); return cloudflare.request({ method: "PUT", path: "/accounts/" + accountId + "/workers/scripts/rinovabd-v2-web", body, contentType: "multipart/form-data; boundary=" + boundary, rawBody: true }); }`;
await writeFile(outputPath, `${JSON.stringify({ code: executeCode })}\n`);
