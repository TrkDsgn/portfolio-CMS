// Serveur local : http://localhost:3000 (contenu relu à chaque chargement de page)
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { ROOT, loadContent, renderContentJs, renderIndex } from "./build.mjs";

const PORT = Number(process.env.PORT) || 3000;
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
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

function send(res, code, body, type = "text/plain; charset=utf-8") {
  res.writeHead(code, { "Content-Type": type, "Cache-Control": "no-store" });
  res.end(body);
}
function safeJoin(base, p) {
  const full = path.join(base, p);
  return full.startsWith(base + path.sep) ? full : null;
}

http
  .createServer((req, res) => {
    try {
      let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
      if (p === "/" || p === "/index.html")
        return send(res, 200, renderIndex(loadContent(), String(Date.now())), TYPES[".html"]);
      if (p === "/content.js") return send(res, 200, renderContentJs(loadContent()), TYPES[".js"]);
      if (p.endsWith("/")) p += "index.html";
      const base = p.startsWith("/css/") || p.startsWith("/js/") ? path.join(ROOT, "src") : path.join(ROOT, "public");
      const file = safeJoin(base, p);
      if (!file || !fs.existsSync(file) || !fs.statSync(file).isFile()) return send(res, 404, "Introuvable");
      send(res, 200, fs.readFileSync(file), TYPES[path.extname(file).toLowerCase()] || "application/octet-stream");
    } catch (err) {
      console.error(err);
      send(res, 500, "Erreur : " + err.message);
    }
  })
  .listen(PORT, () => console.log(`Site : http://localhost:${PORT}   ·   Admin : http://localhost:${PORT}/admin/`));
