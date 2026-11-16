// Connexion GitHub pour Decap CMS (étape 1) : redirige vers GitHub.
// Fonction serverless Node.js exécutée par Vercel.
import crypto from "node:crypto";

export function originOf(req) {
  const proto = (req.headers["x-forwarded-proto"] || "https").split(",")[0].trim();
  const host = (req.headers["x-forwarded-host"] || req.headers.host || "").split(",")[0].trim();
  return `${proto}://${host}`;
}

export default function handler(req, res) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    res.statusCode = 500;
    return res.end("Variable GITHUB_CLIENT_ID manquante dans Vercel.");
  }
  const state = crypto.randomBytes(16).toString("hex");
  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", `${originOf(req)}/api/callback`);
  url.searchParams.set("scope", "repo,user");
  url.searchParams.set("state", state);
  res.setHeader("Set-Cookie", `decap_oauth_state=${state}; Path=/api; HttpOnly; Secure; SameSite=Lax; Max-Age=600`);
  res.statusCode = 302;
  res.setHeader("Location", url.toString());
  res.end();
}
