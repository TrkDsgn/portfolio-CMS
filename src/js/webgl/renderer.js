/* Rendu WebGL du plan de travail : initialisation, atlas des couvertures, taille, couleurs, dessin. */
import { mobileQuery, reducedMotion } from "../utils.js";
import { PROJECTS } from "../content.js";
import { camera, dom, MAX_PROJECTS, gridCount } from "../state.js";
import { cellSize, viewCenter, projection, curveNow } from "../camera.js";
import { VERTEX_SHADER, FRAGMENT_SHADER } from "./shaders.js";
import { drawCluster } from "./tiles.js";
import { inkCanvas, updateInk, inkActive, resizeInk, readInkColors } from "./ink.js";

const gl = dom.canvas.getContext("webgl", { antialias: false, alpha: false, premultipliedAlpha: false });
/** Colonnes de l'atlas (2 × 2 couvertures jusqu'à 4 projets, sinon 4 × 4). */
const ATLAS_COLS = PROJECTS.length <= 4 ? 2 : 4;
const UNIFORMS = [
  "uRes",
  "uDpr",
  "uOff",
  "uZoom",
  "uCenter",
  "uFocal",
  "uTilt",
  "uRadius",
  "uHeight",
  "uCurve",
  "uCell",
  "uTex",
  "uN",
  "uBg",
  "uLine",
  "uDeep",
  "uCols",
  "uAb",
  "uDir",
  "uTiles",
  "uSpectrum",
  "uTime",
  "uS0",
  "uS1",
  "uS2",
  "uS3",
  "uInk",
  "uInkOn",
  "uOrbit",
  "uPaint",
  "uLineAlpha",
  "uGlobeAlpha",
];
const uni = {};
let atlasTexture;
let inkTexture;
let colors = {};

/** Prépare WebGL. Renvoie false si le navigateur ne le permet pas. */
export function initGL() {
  if (!gl) return false;
  gl.getExtension("OES_standard_derivatives"); // filets nets à toutes les distances (fwidth)
  const compile = (type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
    return shader;
  };
  const program = gl.createProgram();
  gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX_SHADER));
  gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAGMENT_SHADER));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, "a");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  UNIFORMS.forEach(name => (uni[name] = gl.getUniformLocation(program, name)));

  // Texture provisoire (1 pixel) en attendant l'atlas
  atlasTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, atlasTexture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([40, 38, 36, 255]));

  // Texture de l'encre (traînée de couleur de la souris)
  inkTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, inkTexture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return true;
}

/** Dessine les vignettes de tous les projets dans une seule texture (taille en puissance de 2, requise pour les mipmaps). */
export async function buildAtlas() {
  const SW = 1024;
  const SH = 512;
  const atlas = document.createElement("canvas");
  atlas.width = SW * ATLAS_COLS;
  atlas.height = SH * ATLAS_COLS;
  const c = atlas.getContext("2d");
  const list = PROJECTS.slice(0, MAX_PROJECTS);
  for (let i = 0; i < list.length; i++) {
    await drawCluster(c, list[i], (i % ATLAS_COLS) * SW, Math.floor(i / ATLAS_COLS) * SH, SW, SH);
  }
  if (!gl) return;
  gl.bindTexture(gl.TEXTURE_2D, atlasTexture);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true); // bords nets entre vignettes et grille
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlas);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  camera.dirty = true;
}

/** Couleur CSS quelconque → [r, g, b] entre 0 et 1. */
function toRGB(value) {
  const ctx = document.createElement("canvas").getContext("2d");
  ctx.fillStyle = value.trim();
  const normalized = ctx.fillStyle;
  if (normalized[0] === "#") {
    const n = parseInt(normalized.slice(1), 16);
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  }
  const m = normalized.match(/[\d.]+/g);
  return [m[0] / 255, m[1] / 255, m[2] / 255];
}

/** Lit les couleurs de la grille dans les variables CSS (--bg, --line, --bg-deep, --spectrum-1…4). */
export function readColors() {
  const cs = getComputedStyle(document.documentElement);
  colors = {
    bg: toRGB(cs.getPropertyValue("--bg")),
    line: toRGB(cs.getPropertyValue("--line")),
    deep: toRGB(cs.getPropertyValue("--bg-deep")),
    spectrum: [1, 2, 3, 4].map(i => toRGB(cs.getPropertyValue(`--spectrum-${i}`))),
  };
  readInkColors();
  camera.dirty = true;
}

/** Adapte le canvas et la taille des cellules à la fenêtre. */
export function resize() {
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
  camera.cell = Math.round(9 * rem * (mobileQuery.matches ? 0.95 : 1));
  camera.headPx = dom.frame.getBoundingClientRect().height;
  document.documentElement.style.setProperty("--cell", camera.cell + "px");
  camera.dpr = Math.min(devicePixelRatio || 1, 1.5);
  camera.W = innerWidth;
  camera.H = innerHeight;
  dom.canvas.width = Math.round(camera.W * camera.dpr);
  dom.canvas.height = Math.round(camera.H * camera.dpr);
  if (gl) gl.viewport(0, 0, dom.canvas.width, dom.canvas.height);
  resizeInk(camera.W, camera.H);
  camera.dirty = true;
}

/** Met à jour l'encre ; renvoie true si elle bouge encore (il faut redessiner). */
export function stepInk(dt) {
  if (!gl || !updateInk(dt)) return false;
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, inkTexture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, inkCanvas);
  return true;
}

/** Dessine une image du plan de travail. */
export function render() {
  if (!gl) return;
  const [cx, cy] = viewCenter();
  const { focal, tilt, radius, height } = projection();
  gl.uniform2f(uni.uRes, dom.canvas.width, dom.canvas.height);
  gl.uniform1f(uni.uDpr, camera.dpr);
  gl.uniform2f(uni.uOff, camera.off[0], camera.off[1]);
  gl.uniform1f(uni.uZoom, camera.zoom);
  gl.uniform2f(uni.uCenter, cx, cy);
  gl.uniform1f(uni.uFocal, focal);
  gl.uniform1f(uni.uTilt, tilt);
  gl.uniform1f(uni.uRadius, radius);
  gl.uniform1f(uni.uHeight, height);
  gl.uniform1f(uni.uCurve, curveNow());
  gl.uniform1f(uni.uCell, cellSize());
  gl.uniform1f(uni.uN, gridCount);
  gl.uniform3fv(uni.uBg, colors.bg);
  gl.uniform3fv(uni.uLine, colors.line);
  gl.uniform3fv(uni.uDeep, colors.deep);
  gl.uniform1f(uni.uCols, ATLAS_COLS);
  gl.uniform1f(uni.uAb, reducedMotion.matches ? 0 : camera.aberration);
  gl.uniform2f(uni.uDir, camera.dir[0], camera.dir[1]);
  gl.uniform1f(uni.uTiles, camera.tiles);
  gl.uniform1f(uni.uSpectrum, camera.spectrum);
  gl.uniform1f(uni.uOrbit, camera.orbit);
  gl.uniform1f(uni.uPaint, camera.paint);
  gl.uniform1f(uni.uLineAlpha, 0.8); // filets discrets
  gl.uniform1f(uni.uGlobeAlpha, camera.globeAlpha);
  gl.uniform1f(uni.uTime, camera.time);
  ["uS0", "uS1", "uS2", "uS3"].forEach((name, i) => gl.uniform3fv(uni[name], colors.spectrum[i]));
  gl.uniform1f(uni.uInkOn, inkActive() ? 1 : 0);
  gl.uniform1i(uni.uTex, 0);
  gl.uniform1i(uni.uInk, 1);
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, inkTexture);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, atlasTexture);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}
