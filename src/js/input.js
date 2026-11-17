/* Interactions avec le plan de travail : glisser (souris et doigt), molette, flèches du clavier,
   survol d'un projet, et focus clavier sur la liste accessible des projets. */
import { $, reducedMotion, ease } from "./utils.js";
import { PROJECTS } from "./content.js";
import { camera, app, dom } from "./state.js";
import { tween, screenToWorld, clusterAt, clusterCenter, nearestCluster, cellSize } from "./camera.js";

const { canvas, hovertag } = dom;
let moved = false;
let last = [0, 0];
let lastT = 0;

/** Survol d'un cluster : il grossit et une étiquette suit la souris. setHover(null) l'efface. */
export function setHover(cluster, mx, my) {
  if (cluster) {
    if (camera.hover[0] !== cluster.cx || camera.hover[1] !== cluster.cy) {
      camera.hover = [cluster.cx, cluster.cy];
      camera.hoverAmt = 0;
      tween(camera, "hoverAmt", 1, 350, ease.out);
    }
    const P = PROJECTS[cluster.id];
    if (app.hoverId !== cluster.id) {
      hovertag.textContent = `${P.title} — ${P.category} — ${P.year}`;
      app.hoverId = cluster.id;
    }
    hovertag.style.transform = `translate(${mx + 16}px, ${my + 18}px)`;
    hovertag.classList.add("on");
    canvas.classList.add("on-card");
  } else {
    if (camera.hoverAmt > 0) tween(camera, "hoverAmt", 0, 250, ease.out);
    hovertag.classList.remove("on");
    canvas.classList.remove("on-card");
    app.hoverId = -1;
  }
}

function onPointerDown(e) {
  if (app.view === "project") return;
  app.dragging = true;
  moved = false;
  last = [e.clientX, e.clientY];
  lastT = performance.now();
  camera.vel = [0, 0];
  canvas.setPointerCapture(e.pointerId);
  canvas.classList.add("dragging");
}

function onPointerMove(e) {
  if (app.dragging) {
    const dx = e.clientX - last[0];
    const dy = e.clientY - last[1];
    if (Math.abs(dx) + Math.abs(dy) > 3) moved = true;
    camera.off[0] -= dx / camera.zoom;
    camera.off[1] -= dy / camera.zoom;
    const now = performance.now();
    const dt = Math.max(8, now - lastT);
    camera.vel = [((-dx / camera.zoom) * 16) / dt, ((-dy / camera.zoom) * 16) / dt];
    last = [e.clientX, e.clientY];
    lastT = now;
    camera.dirty = true;
    if (moved) setHover(null);
    return;
  }
  if (app.view === "home" && e.pointerType === "mouse") {
    const [wx, wy] = screenToWorld(e.clientX, e.clientY);
    setHover(clusterAt(wx, wy), e.clientX, e.clientY);
  }
}

/** Fin d'un glisser ; si le pointeur n'a pas bougé, c'est un clic sur un projet (ou dans le vide). */
function endDrag(e) {
  if (!app.dragging) return;
  app.dragging = false;
  canvas.classList.remove("dragging");
  if (reducedMotion.matches) camera.vel = [0, 0];
  if (moved) return;
  camera.vel = [0, 0];
  const [wx, wy] = screenToWorld(e.clientX, e.clientY);
  const cluster = clusterAt(wx, wy);
  if (cluster) {
    app.pendingCluster = cluster;
    location.hash = "projet-" + PROJECTS[cluster.id].slug;
  } else if (app.view !== "home") {
    location.hash = "";
  }
}

function onWheel(e) {
  if (app.view === "project") return;
  e.preventDefault();
  const scale = e.deltaMode === 1 ? 32 : 1; // molette en lignes → px
  const dx = (e.shiftKey ? e.deltaY : e.deltaX) * scale;
  const dy = (e.shiftKey ? 0 : e.deltaY) * scale;
  if (reducedMotion.matches) {
    camera.off[0] += dx / camera.zoom;
    camera.off[1] += dy / camera.zoom;
    camera.dirty = true;
  } else {
    camera.vel = [0, 0];
    if (!camera.target) camera.target = camera.off.slice();
    camera.target[0] += dx / camera.zoom;
    camera.target[1] += dy / camera.zoom;
    camera.dirty = true;
  }
  setHover(null);
}

function onKeyDown(e) {
  const step = cellSize() * 1.5;
  const move = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[e.key];
  if (!move) return;
  e.preventDefault();
  tween(camera, "off", [camera.off[0] + move[0], camera.off[1] + move[1]], 350, ease.out);
}

/** Focus clavier sur la liste accessible : la caméra va chercher le projet. */
function onListFocus(e) {
  const link = e.target.closest("[data-focus]");
  if (!link || app.view !== "home") return;
  const id = PROJECTS.findIndex(p => p.slug === link.dataset.focus);
  const cluster = nearestCluster(id);
  if (!cluster) return;
  tween(camera, "off", clusterCenter(cluster.cx, cluster.cy), 600, ease.inOut);
  camera.hover = [cluster.cx, cluster.cy];
  tween(camera, "hoverAmt", 1, 350, ease.out);
}

/** Branche les écouteurs. */
export function initInput() {
  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerup", endDrag);
  canvas.addEventListener("pointercancel", endDrag);
  canvas.addEventListener("pointerleave", () => {
    if (!app.dragging) setHover(null);
  });
  canvas.addEventListener("wheel", onWheel, { passive: false });
  canvas.addEventListener("keydown", onKeyDown);
  $("#projets-liste").addEventListener("focusin", onListFocus);
}
