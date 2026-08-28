/** Rinovabd v2 only: serialize the additive isolated D1 schema as a Cloudflare request without placing credentials in code or logs. */
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const schemaPath = fileURLToPath(new URL("../schema.sql", import.meta.url));
const outputPath = fileURLToPath(new URL("./apply-v2-schema-request.json", import.meta.url));
const source = await readFile(schemaPath, "utf8");
const encoded = Buffer.from(source).toString("base64");
const code = `async () => { const sql = atob("${encoded}"); return cloudflare.request({ method: "POST", path: "/accounts/" + accountId + "/d1/database/9a3e6871-3df9-4e7f-8ecc-8b3fcbcefe16/query", body: { sql } }); }`;
await writeFile(outputPath, `${JSON.stringify({ code })}\n`);
