// Connexion GitHub pour Decap CMS (étape 2) : échange le code contre un jeton
// et le transmet à la fenêtre /admin qui a ouvert la popup.
import { originOf } from "./auth.js";

function page(res, status, payload, origin) {
  const msg = JSON.stringify(`authorization:github:${status}:${JSON.stringify(payload)}`).replace(/</g, "\\u003c");
  const allowed = JSON.stringify(origin);
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Set-Cookie", "decap_oauth_state=; Path=/api; HttpOnly; Secure; SameSite=Lax; Max-Age=0");
  res.end(`<!doctype html><meta charset="utf-8"><title>Connexion…</title><p>Connexion en cours…</p>
<script>
(function () {
  var allowed = ${allowed};
  function receive(e) {
    if (e.origin !== allowed) return;
    window.removeEventListener("message", receive, false);
    window.opener.postMessage(${msg}, allowed);
  }
  window.addEventListener("message", receive, false);
  window.opener && window.opener.postMessage("authorizing:github", allowed);
})();
</script>`);
}

function cookie(req, name) {
  const m = (req.headers.cookie || "").match(new RegExp("(?:^|;\\s*)" + name + "=([^;]+)"));
  return m ? m[1] : null;
}

export default async function handler(req, res) {
  const origin = originOf(req);
  const url = new URL(req.url, origin);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!code || !state || state !== cookie(req, "decap_oauth_state")) {
    return page(res, "error", { message: "Requête de connexion invalide ou expirée. Réessaie." }, origin);
  }
  try {
    const r = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: `${origin}/api/callback`,
      }),
    });
    const data = await r.json();
    if (!data.access_token) throw new Error(data.error_description || data.error || "jeton absent");
    return page(res, "success", { token: data.access_token, provider: "github" }, origin);
  } catch (err) {
    return page(res, "error", { message: "Connexion GitHub impossible : " + err.message }, origin);
  }
}
