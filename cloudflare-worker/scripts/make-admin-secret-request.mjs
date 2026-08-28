/** Rinovabd v2 only: create a unique admin token outside version control and prepare a secret-binding request without printing the value. */
import { randomBytes } from "node:crypto";
import { chmod, mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const secureDirectory = "/home/ubuntu/.rinovabd-v2";
const tokenPath = `${secureDirectory}/admin-access-token.txt`;
const requestPath = fileURLToPath(new URL("./set-admin-secret-request.json", import.meta.url));
const token = randomBytes(32).toString("base64url");
const code = `async () => cloudflare.request({ method: "PUT", path: "/accounts/" + accountId + "/workers/scripts/rinovabd-v2-api/secrets", body: { name: "ADMIN_API_TOKEN", type: "secret_text", text: ${JSON.stringify(token)} } })`;

await mkdir(secureDirectory, { recursive: true, mode: 0o700 });
await writeFile(tokenPath, `${token}\n`, { mode: 0o600 });
await chmod(tokenPath, 0o600);
await writeFile(requestPath, `${JSON.stringify({ code })}\n`, { mode: 0o600 });
await chmod(requestPath, 0o600);
