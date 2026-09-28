const crypto = require("crypto");

function correlation(req, res, next) {
  const id = req.get("x-correlation-id") || crypto.randomUUID();
  req.correlationId = id;
  res.set("x-correlation-id", id);
  next();
}

module.exports = correlation;
