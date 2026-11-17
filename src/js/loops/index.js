/* Registre des animations : nom (choisi dans le CMS) → animation.
   Une animation = { draw(ctx, W, H, p, A), ratio, dur (ms), still (image fixe si animations réduites), label, hd? }.
   Pour en ajouter une : la coder dans le fichier du projet, l'ajouter à son export, puis ajouter son nom
   dans public/admin/config.yml (le build vérifie que les deux listes correspondent). */
import electronik from "./electronik.js";
import kioui from "./kioui.js";
import laces from "./laces.js";
import prisme from "./prisme.js";
import mockups from "./mockups.js";

export const LOOPS = { ...electronik, ...kioui, ...laces, ...prisme, ...mockups };

/** Images utilisées par les animations (noms de fichiers de public/images, sans extension). */
export const LOOP_IMAGES = [
  "hero", "th0", "th1", "th2", "th3", "th4", "th5",
  "k_logo", "k_scanMascot", "k_pat0", "k_pat1", "k_pat2", "k_pat3", "k_pat4", "k_pat5", "k_pat6",
  "l_shoe1", "l_shoe2", "l_logo",
  "m_k_home", "m_k_recipe", "m_k_profile", "m_l_splash", "m_l_home", "m_l_product",
];

export const getLoop = name => LOOPS[name] || null;
