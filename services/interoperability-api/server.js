const app = require("./app");
const config = require("../../src/config");

function start() {
  return app.listen(config.interopPort, () => {
    console.log(`[INTEROP API] http://localhost:${config.interopPort}`);
    console.log(`[ARCGIS QUERY] http://localhost:${config.interopPort}/arcgis/rest/services/Interoperabilidad/FeatureServer/0/query`);
  });
}

module.exports = { app, start };
