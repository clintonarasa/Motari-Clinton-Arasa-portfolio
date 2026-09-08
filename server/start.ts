import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { Pool } from "pg";
import { ensureNeonSchema, neonApiMiddleware } from "./neon-api";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) throw new Error("SESSION_SECRET must be at least 32 characters");
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 5 });
await ensureNeonSchema(pool);
const api = neonApiMiddleware(pool, process.env.SESSION_SECRET, true);
const contentTypes: Record<string, string> = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml" };
pool.on("error", (error) => console.error("Database pool error", error));

const server = createServer(async (request, response) => {
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("X-Frame-Options", "DENY");
  response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  response.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  if (request.url === "/api/health" && request.method === "GET") {
    try {
      await pool.query("SELECT 1");
      response.setHeader("Content-Type", "application/json");
      response.end(JSON.stringify({ status: "ok" }));
    } catch {
      response.statusCode = 503;
      response.setHeader("Content-Type", "application/json");
      response.end(JSON.stringify({ status: "unavailable" }));
    }
    return;
  }
  if (request.url?.startsWith("/api/")) return api(request, response, () => response.end());
  const requested = request.url?.split("?")[0] || "/";
  const filePath = path.resolve(process.cwd(), "dist", requested === "/" ? "index.html" : requested.slice(1));
  try {
    const file = await readFile(filePath);
    response.setHeader("Content-Type", contentTypes[path.extname(filePath)] || "application/octet-stream");
    response.end(file);
  } catch {
    response.setHeader("Content-Type", "text/html");
    response.end(await readFile(path.resolve(process.cwd(), "dist", "index.html")));
  }
});

const shutdown = async () => {
  server.close();
  await pool.end();
};

process.once("SIGTERM", shutdown);
process.once("SIGINT", shutdown);

server.listen(Number(process.env.PORT) || 3000, () => {
  console.log(`Portfolio server listening on port ${process.env.PORT || 3000}`);
});
