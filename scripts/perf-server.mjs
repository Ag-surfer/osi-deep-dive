// Minimal gzip static server for the Lighthouse perf harness. GitHub Pages serves
// compressed; serving the static export with gzip here makes the measured transfer
// sizes and perf scores realistic (a plain static server would over-report sizes).
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { gzipSync } from "node:zlib";
import { extname, join, normalize } from "node:path";

const DIR = "out";
const PORT = 9009;
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".xml": "application/xml",
  ".txt": "text/plain",
  ".json": "application/json",
  ".woff2": "font/woff2",
  ".ico": "image/x-icon",
};

createServer(async (req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  let fp = join(DIR, normalize(pathname).replace(/^(\.\.[/\\])+/, ""));
  try {
    if ((await stat(fp)).isDirectory()) fp = join(fp, "index.html");
  } catch {
    if (!extname(fp)) fp = join(fp, "index.html");
  }
  try {
    const buf = await readFile(fp);
    const gz = gzipSync(buf);
    res.writeHead(200, {
      "content-type": TYPES[extname(fp)] ?? "application/octet-stream",
      "content-encoding": "gzip",
      "cache-control": "no-cache",
    });
    res.end(gz);
  } catch {
    res.writeHead(404, { "content-type": "text/html" });
    res.end("<h1>404</h1>");
  }
}).listen(PORT, () => console.log(`perf-server ready on ${PORT}`));
