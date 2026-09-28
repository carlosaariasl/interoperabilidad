const interopUrl = process.env.INTEROP_API_URL || "http://localhost:3903";

async function main() {
  const tokenResponse = await fetch(`${interopUrl}/oauth/token`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      grant_type: "client_credentials",
      client_id: process.env.CLIENT_ID || "arcgis-demo-client",
      client_secret: process.env.CLIENT_SECRET || "arcgis-demo-secret"
    })
  });
  const tokenBody = await tokenResponse.json();
  if (!tokenResponse.ok) throw new Error(JSON.stringify(tokenBody));

  const query = new URL(`${interopUrl}/arcgis/rest/services/Interoperabilidad/FeatureServer/0/query`);
  query.searchParams.set("where", process.env.WHERE || "DEPARTAMENTO='Guatemala'");
  query.searchParams.set("outFields", "NUMERO_INSTRUMENTO,MUNICIPIO,NOMBRE_PROYECTO,CATEGORIA,ESTADO_DICTAMEN");
  query.searchParams.set("returnGeometry", "true");
  query.searchParams.set("f", "json");

  const response = await fetch(query, { headers: { authorization: `${tokenBody.token_type} ${tokenBody.access_token}` } });
  const body = await response.json();
  console.log(JSON.stringify({ status: response.status, cache: response.headers.get("x-cache"), body }, null, 2));
  if (!response.ok) process.exitCode = 1;
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
