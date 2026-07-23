// CORS_ORIGIN accepts a comma-separated list of allowed origins (or "*" for
// any origin). Shared between Express's cors() and Socket.IO's own cors
// option so both stay in sync from one env var.
export function getCorsOrigin(): string | string[] {
  const raw = process.env.CORS_ORIGIN ?? "*";
  if (raw === "*") return "*";
  return raw.split(",").map((origin) => origin.trim()).filter(Boolean);
}
