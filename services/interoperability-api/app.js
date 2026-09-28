const express = require("express");
const cors = require("cors");
const config = require("../../src/config");
const correlation = require("../../src/common/correlation");
const { notFound, errorHandler } = require("../../src/common/errors");
const { tokenRoute, requireFeatureQuery } = require("./auth");
const { queryWrapper } = require("./wrapper");
const { layerMetadata } = require("./mapper");

const app = express();
app.use(cors());
app.use(express.json());
app.use(correlation);
app.use((req, res, next) => { req.service = "interoperability-api-demo"; next(); });

app.get("/health", (req, res) => res.json({ status: "ok", service: req.service }));
app.post("/oauth/token", tokenRoute);

app.get("/arcgis/rest/services/Interoperabilidad/FeatureServer", requireFeatureQuery, (req, res) => {
  res.json({ currentVersion: 11.5, serviceDescription: "Servicio de interoperabilidad UNICEF-MARN (demo)", layers: [{ id: 0, name: "Expedientes ambientales" }] });
});

app.get("/arcgis/rest/services/Interoperabilidad/FeatureServer/0", requireFeatureQuery, (req, res) => res.json(layerMetadata()));

async function queryFeatureLayer(req, res, next) {
  try {
    const where = req.query.where || "1=1";
    const outFields = req.query.outFields || "*";
    const returnGeometry = String(req.query.returnGeometry || "false").toLowerCase() === "true";
    const result = await queryWrapper({ where, outFields, returnGeometry, correlationId: req.correlationId });
    res.set("x-cache", result.cache);
    res.json({ ...result.data, metadata: { source: result.source, cache: result.cache, correlationId: req.correlationId, requestedAt: new Date().toISOString() } });
  } catch (error) { next(error); }
}

app.get("/arcgis/rest/services/Interoperabilidad/FeatureServer/0/query", requireFeatureQuery, queryFeatureLayer);
app.get("/v1/expedientes/query", requireFeatureQuery, queryFeatureLayer);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
