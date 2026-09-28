function notFound(req, res) {
  res.status(404).json({
    status: "error",
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
    correlationId: req.correlationId
  });
}

function errorHandler(error, req, res, next) {
  console.error({ service: req.service, correlationId: req.correlationId, error: error.message });
  res.status(error.statusCode || 500).json({
    status: "error",
    message: error.statusCode ? error.message : "Error interno del servidor",
    correlationId: req.correlationId
  });
}

module.exports = { notFound, errorHandler };
