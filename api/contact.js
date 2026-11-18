// Formulaire de contact : reçoit le message du site et l'envoie par e-mail (service Resend).
// Fonction serverless Node.js exécutée par Vercel (POST /api/contact).
//
// Variables d'environnement (Vercel → Settings → Environment Variables) :
//   RESEND_API_KEY  clé d'API Resend (obligatoire pour l'envoi)
//   CONTACT_TO      adresse qui reçoit les messages (par défaut : l'e-mail de content/site.json)
//   CONTACT_FROM    expéditeur (par défaut : « Portfolio <onboarding@resend.dev> », qui n'envoie
//                   qu'à l'adresse du compte Resend ; avec un domaine vérifié, mettre contact@mondomaine.fr)
import site from "../content/site.json" with { type: "json" };

const TYPES = ["Poste en CDI", "Mission freelance", "Collaboration ou conférence", "Autre"];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LIMIT = 5; // messages au plus…
const WINDOW_MS = 10 * 60 * 1000; // … par adresse IP et par tranche de 10 minutes
const recent = new Map();

const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

function reply(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

/** Corps de la requête (déjà lu par Vercel, ou lu ici en local). */
async function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  let raw = "";
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 20000) break;
  }
  try {
    return JSON.parse(raw || "{}");
  } catch {
    return {};
  }
}

/** Limite simple contre les envois en rafale (par instance de la fonction). */
function tooMany(ip) {
  const now = Date.now();
  const list = (recent.get(ip) || []).filter(t => now - t < WINDOW_MS);
  list.push(now);
  recent.set(ip, list);
  return list.length > LIMIT;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return reply(res, 405, { ok: false, error: "method" });

  // n'accepte que les envois depuis le site lui-même
  const origin = req.headers.origin;
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  if (origin && host && new URL(origin).host !== host) return reply(res, 403, { ok: false, error: "origin" });

  const body = await readBody(req);
  const clean = (v, max) =>
    String(v ?? "")
      .trim()
      .slice(0, max);
  const name = clean(body.name, 100);
  const email = clean(body.email, 200);
  const company = clean(body.company, 120);
  const type = clean(body.type, 60);
  const message = clean(body.message, 5000);

  // champ piège invisible : rempli seulement par les robots → on fait comme si tout allait bien
  if (clean(body.website, 200)) return reply(res, 200, { ok: true });

  if (name.length < 2 || !EMAIL.test(email) || !TYPES.includes(type) || message.length < 6) {
    return reply(res, 400, { ok: false, error: "invalid" });
  }
  const ip = String(req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "")
    .split(",")[0]
    .trim();
  if (tooMany(ip)) return reply(res, 429, { ok: false, error: "rate" });

  const key = process.env.RESEND_API_KEY;
  if (!key) return reply(res, 503, { ok: false, error: "not-configured" });

  const to = process.env.CONTACT_TO || site.email;
  const from = process.env.CONTACT_FROM || "Portfolio <onboarding@resend.dev>";
  const subject = `Portfolio · ${type} · ${name}`;
  const text = `Nom : ${name}\nEmail : ${email}\nEntreprise : ${company || "—"}\nType : ${type}\n\n${message}`;
  const html = `<p><b>Nom :</b> ${esc(name)}<br><b>Email :</b> ${esc(email)}<br><b>Entreprise :</b> ${esc(company || "—")}<br><b>Type :</b> ${esc(type)}</p><p style="white-space:pre-line">${esc(message)}</p>`;

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [to], reply_to: email, subject, text, html }),
    });
    if (!r.ok) {
      console.error("Resend", r.status, await r.text());
      return reply(res, 502, { ok: false, error: "send" });
    }
    return reply(res, 200, { ok: true });
  } catch (err) {
    console.error(err);
    return reply(res, 502, { ok: false, error: "send" });
  }
}
