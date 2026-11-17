/* Repli quand WebGL n'est pas disponible : une simple grille de vignettes cliquables. */
import { $, esc } from "./utils.js";
import { PROJECTS } from "./content.js";
import { dom } from "./state.js";
import { drawProjectCover } from "./webgl/tiles.js";

export function showFallback() {
  dom.canvas.hidden = true;
  const grid = document.createElement("div");
  grid.className = "fallback";
  PROJECTS.forEach(P => {
    const link = document.createElement("a");
    link.href = "#projet-" + P.slug;
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 512;
    link.appendChild(canvas);
    link.insertAdjacentHTML(
      "beforeend",
      `<span class="t-micro">${esc(P.title)} — ${esc(P.category)} — ${esc(P.year)}</span>`,
    );
    grid.appendChild(link);
    drawProjectCover(canvas.getContext("2d"), P, 0, 0, 1024, 512);
  });
  document.body.insertBefore(grid, $("#frame"));
}
