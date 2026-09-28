# Tercer prototipo local UNICEF–MARN–ArcGIS

Este prototipo simula el flujo que ArcGIS Enterprise utilizaría para consultar la plataforma de interoperabilidad:

```text
Consumidor ArcGIS simulado
        │  POST /oauth/token
        │  GET FeatureServer/0/query + Bearer JWT
        ▼
API de interoperabilidad :3903
        │  valida JWT, scope, consulta y contrato de 17 campos
        │  caché + correlation ID + transformación FeatureSet
        ▼
API institucional MARN simulada :3902
        │  x-api-key interna
        ▼
Datos ficticios con los campos requeridos por ArcGIS
```

## Estructura

- `services/marn-api`: fuente institucional simulada. En producción representa la API de MARN que consulta una vista autorizada de Oracle.
- `services/interoperability-api`: wrapper y API que ArcGIS consumiría. Expone una ruta compatible con `FeatureServer/0/query`.
- `consumer/arcgis-client.js`: cliente de consola que simula a ArcGIS Enterprise.
- `src/common`: caché TTL, correlación y errores compartidos.
- `scripts/smoke-test.js`: prueba automática de token, consulta, caché, 401 y 400.

## Ejecución

Desde esta carpeta:

```bash
npm install
npm run dev
```

En una segunda terminal:

```bash
npm run consumer
npm run test:flow
```

La API institucional escucha en `3902` y la plataforma en `3903`.

## Pruebas manuales en Postman

### 1. Health checks

```text
GET http://localhost:3902/health
GET http://localhost:3903/health
```

### 2. Obtener token de la plataforma

```text
POST http://localhost:3903/oauth/token
Content-Type: application/json
```

```json
{
  "grant_type": "client_credentials",
  "client_id": "arcgis-demo-client",
  "client_secret": "arcgis-demo-secret"
}
```

Guarda `access_token` y úsalo como `Authorization: Bearer <token>`. La colección también incluye una prueba con `?token=<token>` para simular la forma utilizada por algunos servicios ArcGIS REST.

### 3. Consultar el Feature Layer simulado

```text
GET http://localhost:3903/arcgis/rest/services/Interoperabilidad/FeatureServer/0/query?where=MUNICIPIO%3D%27Guatemala%27&outFields=*&returnGeometry=true&f=json
```

Headers:

```text
Authorization: Bearer <token>
X-Correlation-Id: prueba-arcgis-001
```

La respuesta contiene `features[]`, `attributes`, `geometry`, `spatialReference` y metadatos de `cache` y `correlationId`.

### 4. Repetir para demostrar caché

Envía dos veces la misma consulta. La primera respuesta tendrá `X-Cache: MISS`; la segunda, `X-Cache: HIT`.

### 5. Consultas de ejemplo

```text
where=DEPARTAMENTO='Guatemala'
where=CATEGORIA='B1'
where=ESTADO_DICTAMEN='VIGENTE'
where=DEPARTAMENTO='Guatemala' AND CATEGORIA='A'
```

## Casos que demuestra

- `200`: consulta válida y respuesta `FeatureSet`.
- `401`: ausencia de token o token inválido.
- `403`: token sin el scope `feature:query`.
- `400`: filtro o campo no permitido.
- `502`: error de la API institucional o contrato inválido.
- `X-Correlation-Id`: trazabilidad entre consumidor, wrapper y API institucional.
- `X-Cache`: evidencia de `MISS` y `HIT`.

## Relación con el prototipo real

Los datos son ficticios, pero utilizan los 17 campos requeridos: `DEPARTAMENTO`, `MUNICIPIO`, `NOMBRE_PROYECTO`, `CATEGORIA`, `NUMERO_INSTRUMENTO`, `FECHA_PRESENTACION`, `DIRECCION_PROYECTO`, `TIPO_INVERSION`, `DESCRIPCION_PROYECTO`, `FECHA_RESOLUCION`, `SECTOR`, `SUBSECTOR`, `ACTIVIDAD_ECONOMICA`, `ESTADO_DICTAMEN`, `LATITUD`, `LONGITUD` y `PLATAFORMA`. Las fechas se guardan como `YYYY-MM-DD` en la fuente simulada y se convierten a milisegundos Unix en la respuesta FeatureSet, como suele requerir ArcGIS.

Para conectarlo con MARN, se reemplaza `services/marn-api` por un cliente HTTPS hacia la API institucional real. El endpoint que debe consumir ArcGIS puede conservar la forma:

```text
/arcgis/rest/services/Interoperabilidad/FeatureServer/0/query
```

La URL cambiaría de `localhost:3903` al dominio de la plataforma desplegada en AWS.
