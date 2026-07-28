/**
 * Local dev server for Patrick — serves the front + mounts POST /api/chat.
 * Run:  npm install   then   npm run dev
 * Open: http://localhost:3000
 *
 * Loads .env.local (AWS keys + BEDROCK_* ids) BEFORE requiring the handler,
 * so the real Bedrock mode turns on when those are set. If they're missing or
 * a Bedrock call fails, the handler falls back to the mock automatically.
 */
require("dotenv").config({ path: require("path").join(__dirname, ".env.local") });

const http = require("http");
const fs = require("fs");
const path = require("path");
const handler = require("./api/chat.js");

const PORT = process.env.PORT || 3000;
const TYPES = { ".html":"text/html", ".js":"text/javascript", ".css":"text/css", ".json":"application/json", ".svg":"image/svg+xml" };

const server = http.createServer((req, res) => {
  if (req.method === "POST" && req.url === "/api/chat") return handler(req, res);

  // static files (index.html at "/")
  const rel = req.url === "/" ? "/index.html" : req.url.split("?")[0];
  const fp = path.join(__dirname, path.normalize(rel));
  if (!fp.startsWith(__dirname)) { res.statusCode = 403; return res.end("Forbidden"); }
  fs.readFile(fp, (err, data) => {
    if (err) { res.statusCode = 404; return res.end("Not found"); }
    res.setHeader("Content-Type", TYPES[path.extname(fp)] || "text/plain");
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`\n🍁 Patrick dev server → http://localhost:${PORT}`);
  console.log(`   Bedrock mode: ${handler.BEDROCK_READY ? "ON (real KB + Claude)" : "OFF (mock fallback — set BEDROCK_KB_ID + BEDROCK_CLAUDE_PROFILE in .env.local)"}\n`);
});
