const config = {
  marnPort: Number(process.env.MARN_PORT || 3902),
  interopPort: Number(process.env.INTEROP_PORT || 3903),
  clientId: process.env.CLIENT_ID || "arcgis-demo-client",
  clientSecret: process.env.CLIENT_SECRET || "arcgis-demo-secret",
  jwtSecret: process.env.JWT_SECRET || "change-this-local-secret",
  marnInternalApiKey: process.env.MARN_INTERNAL_API_KEY || "marn-local-internal-key",
  cacheTtlMs: Number(process.env.CACHE_TTL_MS || 30000),
  marnApiUrl: process.env.MARN_API_URL || `http://localhost:${process.env.MARN_PORT || 3902}`
};

module.exports = config;
