/* Formulaire de contact : vérification des champs, ouverture de la messagerie avec le message prêt,
   boutons « copier le message » et « copier l'adresse ». */
import { $ } from "./utils.js";
import { SITE } from "./content.js";
import { ICON_COPY } from "./page.js";

const ICON_OK = `<svg viewBox="0 -960 960 960" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/></svg>`;

/** Règles de validation : id du champ → test. */
const RULES = [
  ["f-name", v => v.trim().length > 1],
  ["f-email", v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)],
  ["f-type", v => !!v],
  ["f-msg", v => v.trim().length > 5],
];

const form = $("#form");

/** Texte du message, tel qu'il sera envoyé. */
function composedMessage() {
  const f = new FormData(form);
  return `Nom : ${f.get("name")}\nEmail : ${f.get("email")}\nEntreprise : ${f.get("company") || "—"}\nType : ${f.get("type")}\n\n${f.get("message")}`;
}

/** Sélectionne le texte voisin du bouton quand le presse-papiers est indisponible. */
function selectNextTo(button) {
  const range = document.createRange();
  range.selectNodeContents(button.previousElementSibling || button);
  const selection = getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
}

function onSubmit(e) {
  e.preventDefault();
  let firstInvalid = null;
  RULES.forEach(([id, test]) => {
    const field = $("#" + id);
    const invalid = !test(field.value);
    field.closest(".field").classList.toggle("err", invalid);
    field.setAttribute("aria-invalid", invalid);
    if (invalid && !firstInvalid) firstInvalid = field;
  });
  if (firstInvalid) {
    firstInvalid.focus();
    return;
  }
  $("#status").hidden = false;
  $("#copy-msg").focus();
  // ouvre la messagerie
  const subject = "Projet : " + $("#f-type").value + " - " + $("#f-name").value;
  const mailto = document.createElement("a");
  mailto.href =
    "mailto:" +
    SITE.email +
    "?subject=" +
    encodeURIComponent(subject) +
    "&body=" +
    encodeURIComponent(composedMessage());
  mailto.target = "_top";
  document.body.appendChild(mailto);
  mailto.click();
  mailto.remove();
}

/** Efface l'erreur d'un champ dès qu'on le corrige. */
function onInput(e) {
  const field = e.target.closest(".field");
  if (field && field.classList.contains("err")) {
    field.classList.remove("err");
    e.target.removeAttribute("aria-invalid");
  }
}

async function copyMessage(button) {
  const label = button.textContent;
  try {
    await navigator.clipboard.writeText(composedMessage());
    button.textContent = "Copié";
  } catch {
    selectNextTo(button);
    button.textContent = "Sélectionné, copie avec Ctrl+C";
  }
  setTimeout(() => (button.textContent = label), 2200);
}

async function copyEmail(button) {
  try {
    await navigator.clipboard.writeText(SITE.email);
  } catch {
    selectNextTo(button);
    return;
  }
  button.innerHTML = ICON_OK;
  button.classList.add("ok");
  button.setAttribute("aria-label", "Adresse copiée");
  button.title = "Copié";
  setTimeout(() => {
    button.innerHTML = ICON_COPY;
    button.classList.remove("ok");
    button.setAttribute("aria-label", "Copier l'adresse email");
    button.title = "Copier";
  }, 2000);
}

export function initContact() {
  form.addEventListener("submit", onSubmit);
  form.addEventListener("input", onInput);
  document.addEventListener("click", e => {
    const button = e.target.closest && e.target.closest("button");
    if (!button) return;
    if (button.id === "copy-msg") copyMessage(button);
    if (button.id === "copy-email") copyEmail(button);
  });
}
