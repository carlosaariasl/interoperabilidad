const { start: startMarn } = require("../services/marn-api/server");
const { start: startInterop } = require("../services/interoperability-api/server");

startMarn();
startInterop();
