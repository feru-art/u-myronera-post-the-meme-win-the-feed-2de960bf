// Post the Meme, Win the Feed — make.fun entry program (program/v1, node22).
// Copies the validated post address from POST.json to /output/POST.json.
// Stdlib only, no network, no reads outside this repository.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

// Accepts https://x.com/<handle>/status/<digits> and the twitter.com,
// www./mobile. and /i/web/status/<id> variants.
const POST_URL_PATTERN =
  /^https:\/\/(www\.|mobile\.)?(x\.com|twitter\.com)\/([A-Za-z0-9_]+)\/(i\/web\/)?status\/(\d+)$/;

const postPath = new URL("./POST.json", import.meta.url);

const raw = readFileSync(postPath, "utf8");
if (raw.length === 0 || raw.trim().length === 0) {
  throw new Error("POST.json is empty (no post address to submit)");
}

let parsed: unknown;
try {
  parsed = JSON.parse(raw);
} catch {
  throw new Error("POST.json is not valid JSON");
}

if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
  throw new Error("POST.json must be a JSON object");
}

const url = (parsed as { url?: unknown }).url;
if (typeof url !== "string" || url.length === 0) {
  throw new Error("POST.json must contain a url string");
}

// Reject any query string or fragment outright.
if (url.includes("?") || url.includes("#")) {
  throw new Error("post url must not carry a query string or fragment");
}

if (!url.startsWith("https://")) {
  throw new Error("post url must use https");
}

const match = POST_URL_PATTERN.exec(url);
if (match === null) {
  throw new Error("post url is not a valid X post address");
}

const handle = match[3];
const statusId = match[5];
if (handle.length === 0 || statusId.length === 0) {
  throw new Error("post url is missing a handle or status id");
}
if (!/^\d+$/.test(statusId)) {
  throw new Error("post status id must be all digits");
}

mkdirSync("/output", { recursive: true });
writeFileSync("/output/POST.json", JSON.stringify({ url }, null, 2) + "\n", "utf8");
console.log(`wrote post ${url} to /output/POST.json`);
