// Sert dist/ tel que Vercel le servira : http://localhost:4000 (lancer après npm run build).
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { ROOT } from "./build.mjs";

const DIST = path.join(ROOT, "dist");
const PORT = Number(process.env.PORT) || 4000;
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".map": "application/json",
  ".json": "application/json",
  ".yml": "text/yaml; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".mp4": "video/mp4",
};

http
  .createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (p.endsWith("/")) p += "index.html";
    let file = path.join(DIST, p);
    if (!file.startsWith(DIST + path.sep)) file = null;
    if (file && !fs.existsSync(file) && fs.existsSync(file + ".html")) file += ".html"; // cleanUrls
    if (!file || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      return res.end("Introuvable");
    }
    res.writeHead(200, { "Content-Type": TYPES[path.extname(file).toLowerCase()] || "application/octet-stream" });
    fs.createReadStream(file).pipe(res);
  })
  .listen(PORT, () => console.log(`Build servi sur http://localhost:${PORT}`));
