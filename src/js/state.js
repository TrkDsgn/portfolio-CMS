/* État partagé entre les modules : caméra du plan de travail, navigation, éléments de la page. */
import { $ } from "./utils.js";
import { PROJECTS } from "./content.js";

/** Nombre maximum de projets sur la grille d'accueil. */
export const MAX_PROJECTS = 16;
/** Nombre de projets réellement posés sur la grille. */
export const gridCount = Math.min(PROJECTS.length, MAX_PROJECTS);

/** Caméra et rendu du plan de travail. */
export const camera = {
  off: [0, 0], // position du centre de la vue, en unités monde
  prev: [0, 0], // position à l'image précédente (pour mesurer la vitesse)
  vel: [0, 0], // inertie après un glisser
  target: null, // destination de la molette (suivie en douceur)
  zoom: 1,
  curve: 0.32, // courbure de la grille (0 = plate)
  shift: 0, // décalage horizontal quand un panneau est ouvert
  aberration: 0, // séparation des couleurs pendant un mouvement rapide
  dir: [0, 1], // direction du mouvement
  hover: [1e6, 1e6], // cluster survolé
  hoverAmt: 0,
  dirty: true, // le canvas doit être redessiné
  cell: 72, // taille d'une cellule de la grille, en px
  W: 1,
  H: 1,
  dpr: 1,
  headPx: 144, // hauteur de l'en-tête
};

/** Navigation et interactions en cours. */
export const app = {
  view: "home", // "home" | "about" | "contact" | "project"
  pendingCluster: null, // cluster cliqué, pour que la caméra aille sur celui-là
  homeState: null, // position de la caméra avant d'ouvrir un projet
  dragging: false,
  hoverId: -1, // projet survolé
};

/** Éléments fixes de la page. */
export const dom = {
  canvas: $("#gl"),
  frame: $("#frame"),
  pill: $("#pill"),
  project: $("#project"),
  panelAbout: $("#panel-about"),
  panelContact: $("#panel-contact"),
  ticker: $("#ticker"),
  hovertag: $("#hovertag"),
};
