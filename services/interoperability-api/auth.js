const crypto = require("crypto");
const config = require("../../src/config");
const { sign, verify } = require("../../src/security/jwt");

function tokenRoute(req, res) {
  const { grant_type: grantType = "client_credentials", client_id: clientId, client_secret: clientSecret } = req.body || {};
  if (grantType !== "client_credentials" || clientId !== config.clientId || clientSecret !== config.clientSecret) {
    return res.status(401).json({ status: "error", message: "Credenciales de cliente inválidas" });
  }
  const now = Math.floor(Date.now() / 1000);
  const scope = "feature:query";
  const accessToken = sign({ iss: "auth-api-tercer-prototipo", sub: clientId, scope, iat: now, exp: now + 3600, jti: crypto.randomUUID() }, config.jwtSecret);
  return res.json({ access_token: accessToken, token_type: "Bearer", expires_in: 3600, scope });
}

function requireFeatureQuery(req, res, next) {
  const [scheme, bearerToken] = (req.get("authorization") || "").split(" ");
  const token = scheme === "Bearer" ? bearerToken : req.query.token;
  if (!token) return res.status(401).json({ status: "error", message: "Se requiere un Bearer token o un parámetro token" });
  try {
    const payload = verify(token, config.jwtSecret);
    if (!String(payload.scope || "").split(" ").includes("feature:query")) {
      return res.status(403).json({ status: "error", message: "El token no tiene el alcance feature:query" });
    }
    req.auth = payload;
    next();
  } catch (error) { return res.status(401).json({ status: "error", message: error.message }); }
}

module.exports = { tokenRoute, requireFeatureQuery };
