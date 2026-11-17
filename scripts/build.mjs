// Build du site : content/*.json + src/ + public/ → dist/
//   - le contenu du CMS devient dist/content.js (window.__CONTENT)
//   - le CSS (src/css/main.css et ses @import) et le JS (src/js/main.js et ses modules)
//     sont assemblés et minifiés par esbuild, avec un nom versionné (main.<hash>.css/js)
//   - les images reçoivent des versions plus légères (scripts/images.mjs)
//   - le contenu est vérifié (champs obligatoires, slugs uniques, animations existantes)
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath, pathToFileURL } from "node:url";

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
  out.media.forEach(m => {
    if (!m.ratio) delete m.ratio;
    if (!m.span) m.span = "full";
  });
  return out;
}

export function loadContent() {
  const site = readJson(r("content/site.json"));
  const dir = r("content/projects");
  const projects = fs
    .readdirSync(dir)
    .filter(f => f.endsWith(".json"))
    .map(f => normalizeProject(readJson(path.join(dir, f)), f))
    .filter(p => p.draft !== true)
    .sort((a, b) => (a.order ?? 999) - (b.order ?? 999) || a.title.localeCompare(b.title));
  const slugs = new Set();
  projects.forEach(p => {
    if (slugs.has(p.slug)) throw new Error(`slug en double : ${p.slug}`);
    slugs.add(p.slug);
  });
  if (projects.length > MAX_PROJECTS)
    console.warn(`⚠ ${projects.length} projets : seuls ${MAX_PROJECTS} tiennent sur la grille.`);
  // Images utilisées par les animations (clé = nom de fichier sans extension)
  const assets = {};
  for (const f of fs.readdirSync(r("public/images"))) {
    const full = r("public/images", f);
    if (fs.statSync(full).isFile()) assets[f.replace(/\.[^.]+$/, "")] = "/images/" + f;
  }
  return { site, projects, assets, images: {} };
}

/** Vérifie que chaque animation choisie existe, et que la liste du CMS correspond au code. */
async function checkLoops(content) {
  const { LOOPS, imagesFor } = await import(pathToFileURL(r("src/js/loops/index.js")).href);
  const known = new Set(Object.keys(LOOPS));
  const missingImages = imagesFor([...known]).filter(name => !content.assets[name]);
  if (missingImages.length)
    throw new Error(`images des animations absentes de public/images : ${missingImages.join(", ")}`);
  for (const P of content.projects) {
    for (const m of P.media) {
      if (m.loop && !known.has(m.loop))
        throw new Error(`${P.slug} : l'animation « ${m.loop} » n'existe pas dans src/js/loops/`);
    }
  }
  const config = fs.readFileSync(r("public/admin/config.yml"), "utf8");
  const match = config.match(/name: loop[\s\S]*?options: \[([^\]]*)\]/);
  if (!match) return console.warn("⚠ liste des animations introuvable dans public/admin/config.yml");
  const inCms = match[1]
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
  const missingInCode = inCms.filter(n => !known.has(n));
  const missingInCms = [...known].filter(n => !inCms.includes(n));
  if (missingInCode.length)
    throw new Error(`config.yml propose des animations qui n'existent pas : ${missingInCode.join(", ")}`);
  if (missingInCms.length)
    console.warn(`⚠ animations absentes de la liste du CMS (config.yml) : ${missingInCms.join(", ")}`);
}

export function renderContentJs(content) {
  return "window.__CONTENT = " + JSON.stringify(content).replace(/</g, "\\u003c") + ";\n";
}

const escHtml = s =>
  String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

/** Remplit le gabarit src/index.html. files = { css, js } : chemins des feuilles de style et script. */
export function renderIndex(content, version, files = { css: "/css/main.css", js: "/js/main.js" }) {
  const seo = content.site.seo || {};
  const site = content.site;
  return fs
    .readFileSync(r("src/index.html"), "utf8")
    .replaceAll("{{site.name}}", escHtml(site.name))
    .replaceAll("{{site.hook}}", escHtml(site.hook))
    .replaceAll("{{seo.title}}", escHtml(seo.title || content.site.name))
    .replaceAll("{{seo.description}}", escHtml(seo.description || content.site.hook))
    .replaceAll("{{css}}", files.css)
    .replaceAll("{{js}}", files.js)
    .replaceAll("{{v}}", version);
}

function hashOf(buffers) {
  const h = crypto.createHash("sha1");
  buffers.forEach(b => h.update(b));
  return h.digest("hex").slice(0, 10);
}

/** Assemble et minifie le CSS et le JS avec esbuild. Renvoie leurs chemins publics. */
async function bundle(dist) {
  const esbuild = await import("esbuild");
  const result = await esbuild.build({
    entryPoints: { "css/main": r("src/css/main.css"), "js/main": r("src/js/main.js") },
    outdir: dist,
    entryNames: "[dir]/[name].[hash]",
    bundle: true,
    minify: true,
    format: "esm",
    target: ["es2020", "chrome105", "safari16", "firefox110"],
    external: ["/images/*", "/fonts/*"],
    sourcemap: "linked",
    metafile: true,
    logLevel: "warning",
  });
  const files = {};
  for (const [out, info] of Object.entries(result.metafile.outputs)) {
    if (!info.entryPoint) continue;
    const url = "/" + path.relative(dist, path.resolve(ROOT, out)).split(path.sep).join("/");
    files[url.endsWith(".css") ? "css" : "js"] = url;
  }
  return files;
}

export async function build() {
  const t0 = Date.now();
  const content = loadContent();
  await checkLoops(content);
  const dist = r("dist");
  fs.rmSync(dist, { recursive: true, force: true });
  fs.cpSync(r("public"), dist, { recursive: true, filter: s => !s.endsWith(".DS_Store") });

  const { buildResponsiveImages } = await import("./images.mjs");
  const { manifest, generated } = await buildResponsiveImages(
    r("public/images"),
    path.join(dist, "images/_r"),
    r("node_modules/.cache/portfolio-images"),
  );
  content.images = manifest;

  const files = await bundle(dist);
  const contentJs = renderContentJs(content);
  const version = hashOf([contentJs]);
  fs.writeFileSync(path.join(dist, "content.js"), contentJs);
  fs.writeFileSync(path.join(dist, "index.html"), renderIndex(content, version, files));

  const size = f => (fs.statSync(path.join(dist, f)).size / 1024).toFixed(1) + " Ko";
  console.log(
    `✓ Build : ${content.projects.length} projets · ${files.css} (${size(files.css)}) · ${files.js} (${size(files.js)})`,
  );
  console.log(
    `  images : ${Object.keys(manifest).length} images, ${generated} versions générées · ${Date.now() - t0} ms → dist/`,
  );
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  build().catch(err => {
    console.error("✗ Build impossible : " + err.message);
    process.exit(1);
  });
}
