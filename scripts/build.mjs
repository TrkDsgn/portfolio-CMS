// Build du site : content/*.json + src/ + public/ → dist/
// Aucune dépendance : uniquement Node.js.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const r = (...p) => path.join(ROOT, ...p);
const readJson = f => JSON.parse(fs.readFileSync(f, "utf8"));

const DEFAULT_TILES = ["desktop", "swatch", "type", "phone", "flow", "desktop"];
const DEFAULT_PAL = { bg: "#18151E", fg: "#F3F1EC", accent: "#7145ED", soft: "#2F2B3B" };
const MAX_PROJECTS = 16; // limite de la grille d'accueil

// Complète un projet créé depuis le CMS pour que le front ne casse jamais.
function normalizeProject(P, file) {
  if (!P.slug) throw new Error(`${file} : le champ "slug" est obligatoire`);
  if (!P.title) throw new Error(`${file} : le champ "title" est obligatoire`);
  const arr = v => (Array.isArray(v) ? v : []);
  const out = {
    ...P,
    category: P.category || "",
    year: String(P.year ?? ""),
    summary: P.summary || "",
    pal: { ...DEFAULT_PAL, ...(P.pal || {}) },
    tiles: arr(P.tiles).length ? P.tiles : DEFAULT_TILES,
    context: P.context || "",
    role: arr(P.role),
    problem: P.problem || "",
    process: arr(P.process),
    solution: P.solution || "",
    resultsLabel: P.resultsLabel || "En bref",
    results: arr(P.results),
    images: arr(P.images).filter(Boolean),
    media: arr(P.media).filter(m => m && (m.src || m.loop || m.text != null)),
  };
  if (!out.cover) delete out.cover;
  for (const k of ["coverFx", "coverFy", "order"]) if (out[k] == null || out[k] === "") delete out[k];
  out.media.forEach(m => { if (!m.ratio) delete m.ratio; if (!m.span) m.span = "full"; });
  return out;
}

export function loadContent() {
  const site = readJson(r("content/site.json"));
  const dir = r("content/projects");
  const projects = fs.readdirSync(dir).filter(f => f.endsWith(".json"))
    .map(f => normalizeProject(readJson(path.join(dir, f)), f))
    .filter(p => p.draft !== true)
    .sort((a, b) => (a.order ?? 999) - (b.order ?? 999) || a.title.localeCompare(b.title));
  const slugs = new Set();
  projects.forEach(p => { if (slugs.has(p.slug)) throw new Error(`slug en double : ${p.slug}`); slugs.add(p.slug); });
  if (projects.length > MAX_PROJECTS) console.warn(`⚠ ${projects.length} projets : seuls ${MAX_PROJECTS} tiennent sur la grille.`);
  // Images utilisées par les animations (clé = nom de fichier sans extension)
  const assets = {};
  for (const f of fs.readdirSync(r("public/images"))) {
    const full = r("public/images", f);
    if (fs.statSync(full).isFile()) assets[f.replace(/\.[^.]+$/, "")] = "/images/" + f;
  }
  return { site, projects, assets };
}

export function renderContentJs(content) {
  return "window.__CONTENT = " + JSON.stringify(content).replace(/</g, "\\u003c") + ";\n";
}

const escHtml = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

export function renderIndex(content, version) {
  const seo = content.site.seo || {};
  const site = content.site;
  return fs.readFileSync(r("src/index.html"), "utf8")
    .replaceAll("{{site.name}}", escHtml(site.name))
    .replaceAll("{{site.role}}", escHtml(site.role || "product designer"))
    .replaceAll("{{site.hook}}", escHtml(site.hook))
    .replaceAll("{{seo.title}}", escHtml(seo.title || content.site.name))
    .replaceAll("{{seo.description}}", escHtml(seo.description || content.site.hook))
    .replaceAll("{{v}}", version);
}

function hashOf(files) {
  const h = crypto.createHash("sha1");
  files.forEach(f => h.update(fs.readFileSync(f)));
  return h.digest("hex").slice(0, 10);
}

function listFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(d =>
    d.isDirectory() ? listFiles(path.join(dir, d.name)) : [path.join(dir, d.name)]);
}

export function build() {
  const t0 = Date.now();
  const content = loadContent();
  const version = hashOf([...listFiles(r("src")), ...listFiles(r("content"))].sort());
  const dist = r("dist");
  fs.rmSync(dist, { recursive: true, force: true });
  fs.cpSync(r("public"), dist, { recursive: true, filter: s => !s.endsWith(".DS_Store") });
  fs.cpSync(r("src/css"), path.join(dist, "css"), { recursive: true });
  fs.cpSync(r("src/js"), path.join(dist, "js"), { recursive: true });
  fs.writeFileSync(path.join(dist, "content.js"), renderContentJs(content));
  fs.writeFileSync(path.join(dist, "index.html"), renderIndex(content, version));
  console.log(`✓ Build : ${content.projects.length} projets, version ${version}, ${Date.now() - t0} ms → dist/`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) build();
