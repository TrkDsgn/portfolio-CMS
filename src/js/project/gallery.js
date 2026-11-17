/* Galerie d'une étude de cas : images, animations codées et blocs de texte (champ « media » du CMS).
   Les animations visibles partagent une seule horloge (~30 images/s) ; celles hors écran ne sont pas dessinées. */
import { $, $$, reducedMotion } from "../utils.js";
import { ASSETS, IMAGES } from "../content.js";
import { app, dom } from "../state.js";
import { getLoop, imagesFor } from "../loops/index.js";
import { revealText, EASE_RISE } from "../reveal.js";

const loopImages = {};
let activeLoops = [];
let visibilityObserver = null;
let resizeObserver = null;
let galleryObserver = null;

/** Charge (une fois) les images dessinées par les animations du projet.
    Animations réduites : l'image fixe est redessinée quand une image arrive (sinon elle resterait vide). */
function preloadLoopImages(P) {
  const names = imagesFor(P.media.filter(item => item.loop).map(item => item.loop));
  names.forEach(name => {
    if (!loopImages[name] && ASSETS[name]) {
      const image = new Image();
      image.addEventListener("load", () => {
        if (reducedMotion.matches) activeLoops.forEach(loop => drawLoop(loop, loop.def.still));
      });
      image.src = ASSETS[name];
      loopImages[name] = image;
    }
  });
}

/** Arrête les animations de l'étude de cas précédente. */
export function stopLoops() {
  activeLoops = [];
  if (visibilityObserver) visibilityObserver.disconnect();
  if (resizeObserver) resizeObserver.disconnect();
}

/** Ajuste la résolution du canvas à sa taille affichée. */
function sizeLoop(loop) {
  const rect = loop.canvas.getBoundingClientRect();
  const density = Math.min(devicePixelRatio || 1, loop.def && loop.def.hd ? 2 : 1.25);
  const w = Math.max(2, Math.round(rect.width * density));
  const h = Math.max(2, Math.round(rect.height * density));
  if (loop.canvas.width !== w || loop.canvas.height !== h) {
    loop.canvas.width = w;
    loop.canvas.height = h;
  }
}

function drawLoop(loop, progress) {
  sizeLoop(loop);
  loop.def.draw(loop.ctx, loop.canvas.width, loop.canvas.height, progress, loopImages);
}

/** Bloc de texte de la galerie : titre, paragraphe, liste. */
function textBlock(item) {
  const block = document.createElement("div");
  block.className = "gtxt";
  block.innerHTML = `<h2></h2><div>${item.text ? '<p class="t-body"></p>' : ""}${item.list ? "<dl></dl>" : ""}</div>`;
  block.querySelector("h2").textContent = item.h || "";
  const paragraph = block.querySelector(".t-body");
  if (paragraph) paragraph.textContent = item.text;
  (item.list || []).forEach(entry => {
    const row = document.createElement("div");
    row.innerHTML = '<dt><b></b></dt><dd class="t-body"></dd>';
    row.querySelector("b").textContent = entry.b;
    row.querySelector("dd").textContent = entry.s;
    block.querySelector("dl").appendChild(row);
  });
  return block;
}

const SPAN_CLASS = { full: "g4", half: "g2", third: "g3" };
/* Largeur affichée des images selon leur largeur dans la galerie (pour choisir la bonne version) */
const SIZES = {
  full: "(max-width:1199.98px) 100vw, 62vw",
  half: "(max-width:799.98px) 100vw, (max-width:1199.98px) 50vw, 31vw",
  third: "(max-width:799.98px) 100vw, (max-width:1199.98px) 50vw, 21vw",
};

/** Remplit #gallery avec les médias du projet. */
export function renderMedia(P) {
  preloadLoopImages(P);
  const gallery = $("#gallery");
  visibilityObserver = new IntersectionObserver(
    entries =>
      entries.forEach(entry => {
        const loop = activeLoops.find(l => l.fig === entry.target);
        if (loop) loop.visible = entry.isIntersecting;
      }),
    { root: dom.project },
  );
  resizeObserver = new ResizeObserver(() =>
    activeLoops.forEach(loop => {
      if (reducedMotion.matches) drawLoop(loop, loop.def.still);
    }),
  );

  let imageCount = 0;
  P.media.forEach((item, i) => {
    if (item.text) {
      gallery.appendChild(textBlock(item));
      return;
    }
    const fig = document.createElement("figure");
    fig.className = SPAN_CLASS[item.span] || "g2";
    if (item.rows === 2) {
      fig.classList.add("rs2");
      fig.style.setProperty("--ar", item.ratio);
    }
    fig.dataset.k = 99;
    if (item.bg) fig.style.background = item.bg;

    if (item.loop) {
      const def = getLoop(item.loop);
      fig.style.aspectRatio = def.ratio;
      const canvas = document.createElement("canvas");
      canvas.setAttribute("role", "img");
      canvas.setAttribute("aria-label", def.label);
      fig.appendChild(canvas);
      // t0 décalé pour que deux animations voisines ne soient pas synchronisées
      const loop = { fig, canvas, ctx: canvas.getContext("2d"), def, visible: false, t0: performance.now() + i * 137 };
      activeLoops.push(loop);
      visibilityObserver.observe(fig);
      resizeObserver.observe(fig);
    } else {
      const src = item.src || ASSETS[item.img];
      const info = IMAGES[src];
      // sans ratio indiqué, le cadre prend les proportions de l'image (connues au build, sinon au chargement)
      fig.style.aspectRatio = item.ratio || (info ? info.w + "/" + info.h : "16/9");
      const image = document.createElement("img");
      if (info && info.srcset.length > 1) {
        image.srcset = info.srcset.map(([width, url]) => `${url} ${width}w`).join(", ");
        image.sizes = SIZES[fig.classList.contains("rs2") ? "half" : item.span] || SIZES.half;
      }
      // les deux premiers visuels sont chargés tout de suite, les suivants en approchant
      if (imageCount++ >= 2) image.loading = "lazy";
      image.src = src;
      image.alt = item.alt || item.cap || "";
      image.decoding = "async";
      if (!item.ratio && !info) {
        image.addEventListener(
          "load",
          () => {
            if (image.naturalWidth) fig.style.aspectRatio = image.naturalWidth + "/" + image.naturalHeight;
          },
          { once: true },
        );
      }
      if (item.fit) image.style.objectFit = item.fit;
      if (item.pos) image.style.objectPosition = "center " + item.pos;
      fig.appendChild(image);
    }

    if (item.cap) {
      const caption = document.createElement("figcaption");
      caption.className = "t-micro";
      caption.textContent = item.cap;
      fig.appendChild(caption);
    }
    gallery.appendChild(fig);
  });
  requestAnimationFrame(() => activeLoops.forEach(loop => drawLoop(loop, reducedMotion.matches ? loop.def.still : 0)));
}

/* Horloge commune des animations */
let lastTick = 0;
function tick(now) {
  if (now - lastTick >= 32) {
    lastTick = now;
    if (app.view === "project" && !reducedMotion.matches) {
      activeLoops.forEach(loop => {
        if (!loop.visible) return;
        const d = loop.def.dur;
        drawLoop(loop, ((((now - loop.t0) % d) + d) % d) / d);
      });
    }
  }
  requestAnimationFrame(tick);
}

export function startLoopClock() {
  requestAnimationFrame(tick);
}

/* Entrée des visuels : chaque visuel sort du sol (masque qui s'ouvre vers le haut + image qui remonte dans son cadre) */
function riseFigure(fig, delay) {
  fig.style.clipPath = "";
  fig.style.visibility = "";
  fig.animate(
    [
      { clipPath: "inset(100% 0 0 0)", transform: "translateY(8rem)" },
      { clipPath: "inset(0% 0 0 0)", transform: "translateY(0)" },
    ],
    { duration: 720, delay, easing: EASE_RISE, fill: "backwards" },
  );
  const inner = fig.querySelector("canvas, img");
  if (inner) {
    inner.animate([{ transform: "translateY(-18%) scale(1.18)" }, { transform: "translateY(0) scale(1)" }], {
      duration: 820,
      delay,
      easing: EASE_RISE,
      fill: "backwards",
    });
  }
}

/** Anime l'arrivée des visuels et des blocs de texte : tout de suite s'ils sont à l'écran, sinon au défilement.
    fromCover : vrai si l'on arrive depuis l'accueil (la caméra vient de zoomer), pour décaler le départ. */
export function animateGallery(fromCover) {
  if (galleryObserver) galleryObserver.disconnect();
  if (reducedMotion.matches || !Element.prototype.animate) return;
  const project = dom.project;
  let batch = 0;
  let batchTime = 0;
  galleryObserver = new IntersectionObserver(
    entries => {
      const now = performance.now();
      if (now - batchTime > 200) batch = 0;
      batchTime = now;
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        galleryObserver.unobserve(entry.target);
        riseFigure(entry.target, batch++ * 60);
      });
    },
    { root: project, rootMargin: "0px 0px -6% 0px" },
  );
  const viewportHeight = innerHeight;
  const base = fromCover ? 120 : 40;
  let n = 0;
  const textObserver = new IntersectionObserver(
    entries =>
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        textObserver.unobserve(entry.target);
        revealText(entry.target, 0);
      }),
    { root: project, rootMargin: "0px 0px -10% 0px" },
  );
  $$("#gallery .gtxt", project).forEach(block => {
    if (block.getBoundingClientRect().top < viewportHeight) revealText(block, base + 200);
    else textObserver.observe(block);
  });
  $$("#gallery figure", project).forEach(fig => {
    const rect = fig.getBoundingClientRect();
    if (rect.top < viewportHeight && rect.bottom > 0) riseFigure(fig, base + n++ * 70);
    else {
      fig.style.clipPath = "inset(100% 0 0 0)";
      galleryObserver.observe(fig);
    }
  });
}
