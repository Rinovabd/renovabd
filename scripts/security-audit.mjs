/** Rinovabd v2 release guard: inspect tracked source only for committed credential material; never read Cloudflare secret values. */
import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { promisify } from "node:util";
const run = promisify(execFile);
const { stdout } = await run("git", ["ls-files", "-z"]);
const patterns = [
  { name: "private-key-block", expression: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
  { name: "service-account-private-key", expression: /"private_key"\s*:\s*"-----BEGIN/i },
  { name: "credential-assignment", expression: /(?:ADMIN[-_]?(?:PASSWORD|API_TOKEN)|GOOGLE[-_]?SERVICE[-_]?ACCOUNT)\s*[:=]\s*["'][^"']{8,}/i },
];
const failures = [];
for (const path of stdout.split("\0").filter(Boolean)) { if (path.startsWith("node_modules/") || path.includes(".mcp/")) continue; const content = await readFile(path, "utf8").catch(() => ""); for (const pattern of patterns) if (pattern.expression.test(content)) failures.push({ path, rule: pattern.name }); }
if (failures.length) { console.error(JSON.stringify({ outcome: "failed", findings: failures }, null, 2)); process.exit(1); }
console.log(JSON.stringify({ outcome: "passed", scannedTrackedFiles: stdout.split("\0").filter(Boolean).length, rules: patterns.map((pattern) => pattern.name) }));
