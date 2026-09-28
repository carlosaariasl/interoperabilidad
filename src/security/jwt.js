const crypto = require("crypto");

function encode(value) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function sign(payload, secret) {
  const header = encode({ alg: "HS256", typ: "JWT" });
  const body = encode(payload);
  const unsigned = `${header}.${body}`;
  const signature = crypto.createHmac("sha256", secret).update(unsigned).digest("base64url");
  return `${unsigned}.${signature}`;
}

function verify(token, secret) {
  const parts = String(token || "").split(".");
  if (parts.length !== 3) throw new Error("Token mal formado");

  const unsigned = `${parts[0]}.${parts[1]}`;
  const expected = crypto.createHmac("sha256", secret).update(unsigned).digest("base64url");
  const received = Buffer.from(parts[2]);
  const expectedBuffer = Buffer.from(expected);
  if (received.length !== expectedBuffer.length || !crypto.timingSafeEqual(received, expectedBuffer)) {
    throw new Error("Firma de token inválida");
  }

  const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) throw new Error("Token expirado");
  return payload;
}

module.exports = { sign, verify };
