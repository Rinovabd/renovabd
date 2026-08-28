/** Rinovabd v2 only: serialize the local Worker source and fresh binding IDs into a documented Cloudflare multipart deployment request. */
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const sourcePath = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const outputPath = fileURLToPath(new URL("./deploy-v2-worker-request.json", import.meta.url));
const source = await readFile(sourcePath, "utf8");
const sourceBase64 = Buffer.from(source).toString("base64");

const executeCode = `async () => {
  const code = atob("${sourceBase64}");
  const metadata = {
    main_module: "index.mjs",
    workers_dev: true,
    bindings: [
      { type: "d1", name: "DB", id: "9a3e6871-3df9-4e7f-8ecc-8b3fcbcefe16" },
      { type: "kv_namespace", name: "CACHE", namespace_id: "3adfac39087040c9ae95b36397ead661" },
      { type: "r2_bucket", name: "MEDIA", bucket_name: "rinovabd-v2-media" },
      { type: "plain_text", name: "APP_NAME", text: "Rinovabd v2" },
      { type: "plain_text", name: "ALLOWED_ORIGIN", text: "https://shop-v2.rinovabd.com" }
    ]
  };
  const boundary = "----RinovabdV2" + Date.now();
  const body = [
    "--" + boundary,
    "Content-Disposition: form-data; name=\\"metadata\\"",
    "Content-Type: application/json",
    "",
    JSON.stringify(metadata),
    "--" + boundary,
    "Content-Disposition: form-data; name=\\"index.mjs\\"; filename=\\"index.mjs\\"",
    "Content-Type: application/javascript+module",
    "",
    code,
    "--" + boundary + "--"
  ].join("\\r\\n");
  return cloudflare.request({ method: "PUT", path: "/accounts/" + accountId + "/workers/scripts/rinovabd-v2-api", body, contentType: "multipart/form-data; boundary=" + boundary, rawBody: true });
}`;

await writeFile(outputPath, `${JSON.stringify({ code: executeCode })}\n`);
