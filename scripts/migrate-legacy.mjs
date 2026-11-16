// Migration ponctuelle : découpe l'ancien index.html monolithique (8 Mo) en
//   - public/images/*      (images base64 → fichiers)
//   - content/*.json       (objets SITE et PROJECTS → contenu éditable par le CMS)
//   - src/css, src/js      (CSS et JS extraits)
//   - src/index.html       (gabarit)
// Usage : node scripts/migrate-legacy.mjs "<chemin vers site-vercel/index.html>"
// Le fichier source n'est jamais modifié.
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const SRC = process.argv[2];
if (!SRC) { console.error("Usage : node scripts/migrate-legacy.mjs <index.html>"); process.exit(1); }
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const html = fs.readFileSync(SRC, "utf8");
const out = (rel, data) => { const p = path.join(ROOT, rel); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, data); };

const EXT = { "image/webp": "webp", "image/jpeg": "jpg", "image/png": "png", "image/svg+xml": "svg", "image/gif": "gif" };
function writeDataUri(name, uri) {
  const m = uri.match(/^data:([a-z]+\/[a-z+]+);base64,(.+)$/);
  if (!m) throw new Error("data URI invalide pour " + name);
  const file = `images/${name}.${EXT[m[1]]}`;
  out("public/" + file, Buffer.from(m[2], "base64"));
  return "/" + file;
}

// ---- 1. Découpe des grands blocs ------------------------------------------
const styleStart = html.indexOf("<style>\n", html.indexOf("fonts.googleapis.com/css2"));
const styleEnd = html.indexOf("</style>", styleStart);
const css = html.slice(styleStart + "<style>\n".length, styleEnd);
const headTop = html.slice(0, styleStart);

const bodyStart = html.indexOf("<body>") + "<body>".length;
const edBar = html.indexOf('<div class="ed-bar"');
const markup = html.slice(bodyStart, edBar).trim();

const scripts = [...html.matchAll(/<script data-own>\n?([\s\S]*?)<\/script>/g)].map(m => m[1]);
if (scripts.length !== 2) throw new Error("2 scripts attendus, trouvés : " + scripts.length);
const [loopsJs, mainJsRaw] = scripts;

// ---- 2. Images -----------------------------------------------------------
const assetsLine = mainJsRaw.match(/const ASSETS = (\{[^\n]*\});/);
const ASSETS_RAW = JSON.parse(assetsLine[1]);
const assets = {};
for (const [k, v] of Object.entries(ASSETS_RAW)) assets[k] = writeDataUri(k, v);
const logoMatch = mainJsRaw.match(/setProperty\("--logo", 'url\("(data:[^"]+)"\)'\)/);
const logoUrl = writeDataUri("logo", logoMatch[1]);
console.log(`Images extraites : ${Object.keys(assets).length + 1}`);

// ---- 3. Contenu ------------------------------------------------------------
const cStart = mainJsRaw.indexOf("const SITE = {");
const pStart = mainJsRaw.indexOf("const PROJECTS = [");
const cEnd = mainJsRaw.indexOf("\n];", pStart) + 3;
const ctx = { ASSETS: assets };
vm.createContext(ctx);
vm.runInContext(mainJsRaw.slice(cStart, cEnd) + "\nthis.SITE = SITE; this.PROJECTS = PROJECTS;", ctx);
const SITE = JSON.parse(JSON.stringify(ctx.SITE));
const PROJECTS = JSON.parse(JSON.stringify(ctx.PROJECTS));

SITE.seo = { title: "Tarik Bouabid Portfolio", description: "Portfolio UX/UI de Tarik Bouabid, product designer." };
out("content/site.json", JSON.stringify(SITE, null, 2) + "\n");

const round = n => Math.round(n * 10000) / 10000;
PROJECTS.forEach((P, i) => {
  P.order = i + 1;
  P.media = (P.media || []).map(m => {
    const o = {};
    if (m.loop) o.type = "animation";
    else if (m.text != null) o.type = "texte";
    else o.type = "image";
    for (const [k, v] of Object.entries(m)) {
      if (k === "img") o.src = assets[v];
      else if (k === "ratio") o.ratio = round(v);
      else o[k] = v;
    }
    return o;
  });
  const { slug, order, ...rest } = P;
  out(`content/projects/${slug}.json`, JSON.stringify({ order, slug, ...rest }, null, 2) + "\n");
});
console.log(`Projets : ${PROJECTS.map(p => p.slug).join(", ")}`);

// ---- 4. JS principal -------------------------------------------------------
let mainJs = mainJsRaw;
// Contenu et images → fournis par /content.js (généré au build depuis content/)
mainJs = mainJs.replace(assetsLine[0], "const ASSETS = window.__CONTENT.assets;");
mainJs = mainJs.slice(0, mainJs.indexOf("const SITE = {")) +
  "const SITE = window.__CONTENT.site;\nconst PROJECTS = window.__CONTENT.projects;" +
  mainJs.slice(mainJs.indexOf("\n];", mainJs.indexOf("const PROJECTS = [")) + 3);
mainJs = mainJs.replace(logoMatch[0], `setProperty("--logo", 'url("${logoUrl}")')`);
// Ancien éditeur intégré (lié à l'hébergement précédent) → remplacé par le CMS /admin
const edStart = mainJs.indexOf("/* ============================ Mode édition");
const edEnd = mainJs.indexOf('document.body.classList.add("loading");');
mainJs = mainJs.slice(0, edStart) + mainJs.slice(edEnd);
mainJs = mainJs.replace("\napplyEdits();", "");
// Images ajoutées depuis le CMS : sans ratio renseigné, on prend celui de l'image
const IMG_LINE = 'im.decoding="async";';
if (mainJs.split(IMG_LINE).length !== 2) throw new Error("ligne image introuvable ou multiple");
mainJs = mainJs.replace(IMG_LINE,
  IMG_LINE + '\n      if(!m.ratio) im.addEventListener("load", ()=>{ if(im.naturalWidth) fig.style.aspectRatio = im.naturalWidth + "/" + im.naturalHeight; }, { once:true });');

out("src/js/main.js", mainJs.trim() + "\n");
out("src/js/loops.js", loopsJs.trim() + "\n");
out("src/css/styles.css", css.replace(/\/\* Mode édition[\s\S]*?(?=\n\/\*|$)/, "").trim() + "\n");

// ---- 5. Gabarit HTML -------------------------------------------------------
const head = headTop
  .replace(/<title>[^<]*<\/title>/, "<title>{{seo.title}}</title>")
  .replace(/<meta name="description" content="[^"]*">/,
    '<meta name="description" content="{{seo.description}}">\n<meta property="og:title" content="{{seo.title}}">\n<meta property="og:description" content="{{seo.description}}">\n<meta property="og:type" content="website">')
  .replace(/href="(favicon\.ico|favicon\.svg|apple-touch-icon\.png)\?v=2"/g, 'href="/$1?v=2"')
  .replace(/<meta name="claude:viewport-fit-sides"[^>]*>\n/, "");
const tpl = head +
  '<link rel="stylesheet" href="/css/styles.css?v={{v}}">\n</head>\n<body>\n' + markup + "\n\n" +
  '<script src="/content.js?v={{v}}"></script>\n<script src="/js/loops.js?v={{v}}"></script>\n<script src="/js/main.js?v={{v}}"></script>\n</body>\n</html>\n';
out("src/index.html", tpl);
console.log("Migration terminée.");
