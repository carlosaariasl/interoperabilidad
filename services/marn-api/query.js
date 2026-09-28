const records = require("./data/expedientes");
const allowedFields = new Set(Object.keys(records[0]));

function parseWhere(where = "1=1") {
  const normalized = String(where).trim();
  if (!normalized || normalized.toUpperCase() === "1=1") return () => true;

  const clauses = normalized.split(/\s+AND\s+/i).map((clause) => {
    const match = clause.match(/^([A-Za-z_]+)\s*=\s*'([^']*)'$/);
    if (!match || !allowedFields.has(match[1])) {
      const error = new Error("El parámetro where no tiene un formato permitido");
      error.statusCode = 400;
      throw error;
    }
    return { field: match[1], value: match[2].toLowerCase() };
  });
  return (record) => clauses.every(({ field, value }) => String(record[field]).toLowerCase() === value);
}

function selectFields(record, outFields = "*") {
  if (outFields === "*") return { ...record };
  const fields = String(outFields).split(",").map((field) => field.trim()).filter(Boolean);
  if (fields.some((field) => !allowedFields.has(field))) {
    const error = new Error("outFields contiene un campo no permitido");
    error.statusCode = 400;
    throw error;
  }
  return Object.fromEntries(fields.map((field) => [field, record[field]]));
}

function queryExpedientes({ where, outFields }) {
  return records.filter(parseWhere(where)).map((record) => selectFields(record, outFields));
}

module.exports = { queryExpedientes, allowedFields };
