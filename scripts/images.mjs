// Images responsives : pour chaque image de public/images, génère des versions WebP plus petites
// (480, 960, 1600 px de large) dans dist/images/_r/. Le site choisit la bonne taille selon l'écran (srcset).
// Les originaux restent servis tels quels (les animations dessinées en canvas en ont besoin).
// Un cache (node_modules/.cache) évite de recalculer les images inchangées.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import sharp from "sharp";

const WIDTHS = [480, 960, 1600];
const QUALITY = 78;
const EXTENSIONS = /\.(jpe?g|png|webp)$/i;
const SKIP = /^(logo|favicon|apple-touch-icon)/; // petites images d'interface

function listImages(dir, base = dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return listImages(full, base);
    if (!EXTENSIONS.test(entry.name) || SKIP.test(entry.name)) return [];
    return [path.relative(base, full)];
  });
}

/**
 * @param {string} imagesDir  dossier source (public/images)
 * @param {string} outDir     dossier de sortie (dist/images/_r)
 * @param {string} cacheDir   dossier de cache
 * @returns {Promise<Record<string, {w:number,h:number,srcset:[number,string][]}>>} URL d'origine → infos
 */
export async function buildResponsiveImages(imagesDir, outDir, cacheDir) {
  fs.mkdirSync(outDir, { recursive: true });
  fs.mkdirSync(cacheDir, { recursive: true });
  const manifest = {};
  let generated = 0;

  await Promise.all(
    listImages(imagesDir).map(async rel => {
      const source = path.join(imagesDir, rel);
      const buffer = fs.readFileSync(source);
      const hash = crypto.createHash("sha1").update(buffer).digest("hex").slice(0, 8);
      const meta = await sharp(buffer).metadata();
      const url = "/images/" + rel.split(path.sep).join("/");
      const stem = rel.replace(EXTENSIONS, "").split(path.sep).join("_");
      const srcset = [];

      for (const width of WIDTHS.filter(w => w < meta.width)) {
        const name = `${stem}-${width}.${hash}.webp`;
        const cached = path.join(cacheDir, name);
        if (!fs.existsSync(cached)) {
          await sharp(buffer).resize({ width }).webp({ quality: QUALITY }).toFile(cached);
          generated++;
        }
        fs.copyFileSync(cached, path.join(outDir, name));
        srcset.push([width, `/images/_r/${name}`]);
      }
      srcset.push([meta.width, url]); // l'original reste la plus grande version
      manifest[url] = { w: meta.width, h: meta.height, srcset };
    }),
  );

  return { manifest, generated };
}
