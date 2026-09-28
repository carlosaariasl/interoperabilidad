const fieldDefinitions = [
  ["DEPARTAMENTO", "esriFieldTypeString"],
  ["MUNICIPIO", "esriFieldTypeString"],
  ["NOMBRE_PROYECTO", "esriFieldTypeString"],
  ["CATEGORIA", "esriFieldTypeString"],
  ["NUMERO_INSTRUMENTO", "esriFieldTypeString"],
  ["FECHA_PRESENTACION", "esriFieldTypeDate"],
  ["DIRECCION_PROYECTO", "esriFieldTypeString"],
  ["TIPO_INVERSION", "esriFieldTypeString"],
  ["DESCRIPCION_PROYECTO", "esriFieldTypeString"],
  ["FECHA_RESOLUCION", "esriFieldTypeDate"],
  ["SECTOR", "esriFieldTypeString"],
  ["SUBSECTOR", "esriFieldTypeString"],
  ["ACTIVIDAD_ECONOMICA", "esriFieldTypeString"],
  ["ESTADO_DICTAMEN", "esriFieldTypeString"],
  ["LATITUD", "esriFieldTypeDouble"],
  ["LONGITUD", "esriFieldTypeDouble"],
  ["PLATAFORMA", "esriFieldTypeString"]
];

const allFields = fieldDefinitions.map(([name, type]) => ({ name, type, alias: name }));
const dateFields = new Set(["FECHA_PRESENTACION", "FECHA_RESOLUCION"]);

function validateContract(records) {
  for (const record of records) {
    if (!record.NUMERO_INSTRUMENTO || !record.MUNICIPIO || !record.ESTADO_DICTAMEN) {
      const error = new Error("La respuesta institucional no cumple el contrato mínimo");
      error.statusCode = 502;
      throw error;
    }
    if (typeof record.LATITUD !== "number" || typeof record.LONGITUD !== "number") {
      const error = new Error("Las coordenadas institucionales no son válidas");
      error.statusCode = 502;
      throw error;
    }
  }
}

function toFeatureSet(records, { returnGeometry, outFields }) {
  const selectedNames = outFields === "*"
    ? allFields.map((field) => field.name)
    : String(outFields).split(",").map((field) => field.trim()).filter(Boolean);
  const selectedFields = allFields.filter((field) => selectedNames.includes(field.name));

  return {
    objectIdFieldName: "NUMERO_INSTRUMENTO",
    uniqueIdField: { name: "NUMERO_INSTRUMENTO", isSystemMaintained: false },
    geometryType: "esriGeometryPoint",
    spatialReference: { wkid: 4326 },
    fields: selectedFields,
    features: records.map((record) => {
      const attributes = Object.fromEntries(selectedNames
        .filter((name) => Object.hasOwn(record, name))
        .map((name) => [name, dateFields.has(name) ? Date.parse(`${record[name]}T00:00:00Z`) : record[name]]));
      const feature = { attributes };
      if (returnGeometry) {
        feature.geometry = { x: record.LONGITUD, y: record.LATITUD, spatialReference: { wkid: 4326 } };
      }
      return feature;
    })
  };
}

function layerMetadata() {
  return {
    currentVersion: 11.5,
    id: 0,
    name: "Instrumentos ambientales",
    type: "Feature Layer",
    displayField: "NOMBRE_PROYECTO",
    description: "Capa ficticia para validar el consumo ArcGIS de la plataforma de interoperabilidad",
    geometryType: "esriGeometryPoint",
    spatialReference: { wkid: 4326 },
    capabilities: "Query",
    objectIdField: "NUMERO_INSTRUMENTO",
    fields: allFields
  };
}

module.exports = { validateContract, toFeatureSet, layerMetadata };
