const app = require("./app");
const config = require("../../src/config");

function start() {
  return app.listen(config.marnPort, () => console.log(`[MARN API] http://localhost:${config.marnPort}`));
}

module.exports = { app, start };
