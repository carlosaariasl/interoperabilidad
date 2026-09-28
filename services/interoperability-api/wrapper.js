const config = require("../../src/config");
const TtlCache = require("../../src/common/cache");
const { validateContract, toFeatureSet } = require("./mapper");
const cache = new TtlCache(config.cacheTtlMs);

async function callMarnApi({ where, outFields, correlationId }) {
  const url = new URL(`${config.marnApiUrl}/v1/expedientes/query`);
  url.searchParams.set("where", where); url.searchParams.set("outFields", outFields);
  const response = await fetch(url, { headers: { "x-api-key": config.marnInternalApiKey, "x-correlation-id": correlationId } });
  const body = await response.json();
  if (!response.ok) { const error = new Error(body.message || "La API institucional no respondió correctamente"); error.statusCode = response.status >= 500 ? 502 : response.status; throw error; }
  return body.records;
}

async function queryWrapper({ where, outFields, returnGeometry, correlationId }) {
  const key = JSON.stringify({ where, outFields, returnGeometry });
  const cached = cache.get(key);
  if (cached) return { ...cached, cache: "HIT" };
  const records = await callMarnApi({ where, outFields, correlationId });
  validateContract(records);
  const result = { data: toFeatureSet(records, { returnGeometry, outFields }), source: "MARN API institucional simulada", cache: "MISS" };
  cache.set(key, result);
  return result;
}

module.exports = { queryWrapper };
