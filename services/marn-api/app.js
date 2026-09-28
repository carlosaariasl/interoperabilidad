const express = require("express");
const cors = require("cors");
const config = require("../../src/config");
const correlation = require("../../src/common/correlation");
const { notFound, errorHandler } = require("../../src/common/errors");
const { queryExpedientes } = require("./query");

const app = express();
app.use(cors());
app.use(express.json());
app.use(correlation);
app.use((req, res, next) => { req.service = "marn-api-institucional-demo"; next(); });
app.get("/health", (req, res) => res.json({ status: "ok", service: req.service }));

app.get("/v1/expedientes/query", (req, res, next) => {
  try {
    if (req.get("x-api-key") !== config.marnInternalApiKey) {
      return res.status(401).json({ status: "error", message: "API institucional: clave interna requerida" });
    }
    const records = queryExpedientes({ where: req.query.where, outFields: req.query.outFields || "*" });
    res.json({ status: "success", source: "MARN API institucional simulada", count: records.length, records, correlationId: req.correlationId });
  } catch (error) { next(error); }
});

app.use(notFound);
app.use(errorHandler);
module.exports = app;
