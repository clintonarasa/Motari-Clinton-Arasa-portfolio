import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Pool } from "pg";
import { ensureNeonSchema, neonApiMiddleware } from "../server/neon-api.js";

let pool: Pool | undefined;
let schemaReady: Promise<void> | undefined;
let api: ReturnType<typeof neonApiMiddleware> | undefined;

function getApi() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
  if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
    throw new Error("SESSION_SECRET must be at least 32 characters");
  }
  pool ??= new Pool({ connectionString: process.env.DATABASE_URL, max: 5 });
  schemaReady ??= ensureNeonSchema(pool);
  api ??= neonApiMiddleware(pool, process.env.SESSION_SECRET, true);
  return { api, schemaReady };
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("X-Frame-Options", "DENY");
  response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  response.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");

  if (request.url === "/api/health") {
    try {
      const { schemaReady } = getApi();
      await schemaReady;
      await pool?.query("SELECT 1");
      return response.status(200).json({ status: "ok" });
    } catch {
      return response.status(503).json({ status: "unavailable" });
    }
  }

  try {
    const { api, schemaReady } = getApi();
    await schemaReady;
    return api(request, response, () => response.status(404).json({ error: "Not found" }));
  } catch (error) {
    console.error("API initialization failed", error);
    return response.status(500).json({ error: "API unavailable" });
  }
}
