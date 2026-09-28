const base = process.env.INTEROP_API_URL || "http://localhost:3903";

async function request(url, options) {
  const response = await fetch(url, options);
  const body = await response.json();
  return { status: response.status, headers: response.headers, body };
}

async function main() {
  const tokenResult = await request(`${base}/oauth/token`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ grant_type: "client_credentials", client_id: "arcgis-demo-client", client_secret: "arcgis-demo-secret" })
  });
  if (tokenResult.status !== 200) throw new Error(`Token: ${JSON.stringify(tokenResult.body)}`);
  const authorization = { authorization: `Bearer ${tokenResult.body.access_token}` };
  const url = `${base}/arcgis/rest/services/Interoperabilidad/FeatureServer/0/query?where=MUNICIPIO%3D%27Guatemala%27&outFields=*&returnGeometry=true&f=json`;
  const first = await request(url, { headers: authorization });
  const second = await request(url, { headers: authorization });
  const unauthorized = await request(url);
  const invalidWhere = await request(`${base}/arcgis/rest/services/Interoperabilidad/FeatureServer/0/query?where=CAMPO_INEXISTENTE%3D%27x%27`, { headers: authorization });

  console.log(JSON.stringify({
    token: tokenResult.status,
    firstQuery: { status: first.status, cache: first.headers.get("x-cache"), features: first.body.features?.length },
    secondQuery: { status: second.status, cache: second.headers.get("x-cache"), features: second.body.features?.length },
    noToken: unauthorized.status,
    invalidWhere: invalidWhere.status
  }, null, 2));
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
