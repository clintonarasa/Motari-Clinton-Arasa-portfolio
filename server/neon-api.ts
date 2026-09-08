import type { IncomingMessage, ServerResponse } from "node:http";
import { Pool } from "pg";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";

const LOCAL_USER_ID = "00000000-0000-0000-0000-000000000001";
const allowedTables = new Set([
  "users", "skills", "experience", "projects", "education", "certifications",
  "awards", "hobbies", "references", "blog_posts", "newsletter_subscribers",
]);
const allowedColumns = /^[a-z][a-z0-9_]*$/;
const sessionCookie = "portfolio_session";
const maxJsonBodyBytes = 1024 * 1024;
const allowedUploadTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const loginWindowMs = 15 * 60 * 1000;
const loginMaxAttempts = 5;
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const userScopedTables = new Set([...allowedTables].filter((table) => table !== "users" && table !== "newsletter_subscribers"));

function clientAddress(request: IncomingMessage) {
  return request.headers["x-forwarded-for"]?.toString().split(",")[0].trim() || request.socket.remoteAddress || "unknown";
}

function loginRateLimit(request: IncomingMessage) {
  const key = clientAddress(request);
  const now = Date.now();
  const current = loginAttempts.get(key);
  if (!current || current.resetAt <= now) {
    loginAttempts.set(key, { count: 1, resetAt: now + loginWindowMs });
    return { allowed: true, retryAfter: 0 };
  }
  current.count += 1;
  return { allowed: current.count <= loginMaxAttempts, retryAfter: Math.ceil((current.resetAt - now) / 1000) };
}

function sessionToken(secret: string, userId: string, email: string) {
  const payload = Buffer.from(JSON.stringify({ userId, email, exp: Date.now() + 1000 * 60 * 60 * 24 * 7 })).toString("base64url");
  const signature = crypto.createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

function sessionUser(secret: string, request: IncomingMessage) {
  const raw = request.headers.cookie?.split(";").map((item) => item.trim()).find((item) => item.startsWith(`${sessionCookie}=`))?.split("=")[1];
  if (!raw) return null;
  const [payload, signature] = raw.split(".");
  const expected = crypto.createHmac("sha256", secret).update(payload).digest("base64url");
  if (!payload || !signature || signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  try {
    const value = JSON.parse(Buffer.from(payload, "base64url").toString()) as { userId: string; email: string; exp: number };
    return value.exp > Date.now() ? value : null;
  } catch {
    return null;
  }
}

function json(response: ServerResponse, status: number, body: unknown) {
  response.statusCode = status;
  response.setHeader("Content-Type", "application/json");
  response.end(JSON.stringify(body));
}

async function readBody(request: IncomingMessage) {
  let value = "";
  for await (const chunk of request) {
    value += chunk;
    if (Buffer.byteLength(value, "utf8") > maxJsonBodyBytes) throw new Error("Request body is too large");
  }
  try {
    return value ? JSON.parse(value) : {};
  } catch {
    throw new Error("Invalid JSON body");
  }
}

function filtersFrom(url: URL) {
  const raw = url.searchParams.get("filters");
  return raw ? JSON.parse(raw) as Array<{ column: string; value: unknown }> : [];
}

export async function ensureNeonSchema(pool: Pool) {
  await pool.query(`
    ALTER TABLE users
      ADD COLUMN IF NOT EXISTS site_title TEXT,
      ADD COLUMN IF NOT EXISTS accent_color TEXT,
      ADD COLUMN IF NOT EXISTS logo_url TEXT,
      ADD COLUMN IF NOT EXISTS resume_url TEXT,
      ADD COLUMN IF NOT EXISTS resume_name TEXT,
      ADD COLUMN IF NOT EXISTS favicon_url TEXT;
    ALTER TABLE projects ADD COLUMN IF NOT EXISTS video_url TEXT;
    CREATE TABLE IF NOT EXISTS portfolio_assets (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      kind TEXT NOT NULL,
      filename TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      data BYTEA NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}

export function neonApiMiddleware(pool: Pool, configuredSecret?: string, secureCookies = false) {
  const sessionSecret = configuredSecret || crypto.randomBytes(32).toString("hex");
  const secureCookie = secureCookies || process.env.NODE_ENV === "production" ? "; Secure" : "";
  return async (request: IncomingMessage, response: ServerResponse, next: () => void) => {
    if (request.url === "/api/auth/login" && request.method === "POST") {
      const rate = loginRateLimit(request);
      if (!rate.allowed) {
        response.setHeader("Retry-After", String(rate.retryAfter));
        return json(response, 429, { error: "Too many login attempts. Try again later." });
      }
      let body: Record<string, unknown>;
      try {
        body = await readBody(request) as Record<string, unknown>;
      } catch {
        return json(response, 400, { error: "Invalid request body" });
      }
      const result = await pool.query("SELECT id, email, password_hash, is_admin FROM users WHERE lower(email) = lower($1) LIMIT 1", [body.email]);
      const user = result.rows[0];
      const password = typeof body.password === "string" ? body.password : "";
      if (!user || !user.is_admin || !user.password_hash || !(await bcrypt.compare(password, user.password_hash))) return json(response, 401, { error: "Invalid email or password" });
      loginAttempts.delete(clientAddress(request));
      response.setHeader("Set-Cookie", `${sessionCookie}=${sessionToken(sessionSecret, user.id, user.email)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=604800${secureCookie}`);
      return json(response, 200, { data: { user: { id: user.id, email: user.email } } });
    }
    if (request.url === "/api/auth/session" && request.method === "GET") {
      const user = sessionUser(sessionSecret, request);
      return json(response, 200, { data: { user: user ? { id: user.userId, email: user.email } : null } });
    }
    if (request.url === "/api/auth/logout" && request.method === "POST") {
      response.setHeader("Set-Cookie", `${sessionCookie}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${secureCookie}`);
      return json(response, 200, { data: null });
    }
    if (request.url?.startsWith("/api/neon-assets/") && request.method === "GET") {
      const assetId = request.url.split("?")[0].split("/").pop();
      if (!assetId || !/^[0-9a-f-]{36}$/i.test(assetId)) return json(response, 404, { error: "Asset not found" });
      const result = await pool.query("SELECT mime_type, data FROM portfolio_assets WHERE id = $1 LIMIT 1", [assetId]);
      const asset = result.rows[0];
      if (!asset) return json(response, 404, { error: "Asset not found" });
      response.setHeader("Content-Type", asset.mime_type);
      response.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      return response.end(asset.data);
    }
    if (request.url?.startsWith("/api/neon-upload") && request.method === "POST") {
      const user = sessionUser(sessionSecret, request);
      if (!user) return json(response, 401, { error: "Authentication required" });
      const uploadPath = request.headers["x-upload-path"];
      const mimeType = request.headers["content-type"];
      const contentLength = Number(request.headers["content-length"] || 0);
      if (typeof uploadPath !== "string" || uploadPath.includes("..") || typeof mimeType !== "string" || !allowedUploadTypes.has(mimeType) || contentLength > 20 * 1024 * 1024) {
        return json(response, 400, { error: "Invalid upload metadata or file type" });
      }
      const chunks: Buffer[] = [];
      for await (const chunk of request) chunks.push(Buffer.from(chunk));
      const data = Buffer.concat(chunks);
      if (data.length > 20 * 1024 * 1024) return json(response, 413, { error: "File exceeds the 20MB limit" });
      const asset = await pool.query(
        "INSERT INTO portfolio_assets (user_id, kind, filename, mime_type, data) VALUES ($1, $2, $3, $4, $5) RETURNING id",
        [user.userId, uploadPath.split("/")[0] || "asset", uploadPath.split("/").pop() || "upload", mimeType, data],
      );
      return json(response, 201, { data: { id: asset.rows[0].id, publicUrl: `/api/neon-assets/${asset.rows[0].id}` } });
    }
    if (!request.url?.startsWith("/api/neon")) return next();
    try {
      const url = new URL(request.url, "http://localhost");
      const table = url.searchParams.get("table") || "";
      const operation = url.searchParams.get("operation") || "select";
      if (!allowedTables.has(table)) return json(response, 400, { error: "Unsupported table" });
      const user = sessionUser(sessionSecret, request);
      if (table === "newsletter_subscribers" && !user) return json(response, 401, { error: "Authentication required" });
      if (operation !== "select" && (!user || !user.userId)) return json(response, 401, { error: "Authentication required" });
      const filters = filtersFrom(url);
      if (filters.some((filter) => !allowedColumns.test(filter.column))) return json(response, 400, { error: "Invalid filter" });
      const values = filters.map((filter) => filter.value);
      const where = filters.length ? ` WHERE ${filters.map((filter, i) => `"${filter.column}" = $${i + 1}`).join(" AND ")}` : "";
      const order = url.searchParams.get("order");
      const orderValue = order ? JSON.parse(order) as { column: string; ascending: boolean } : null;
      const orderSql = orderValue && allowedColumns.test(orderValue.column) ? ` ORDER BY "${orderValue.column}" ${orderValue.ascending === false ? "DESC" : "ASC"}` : "";
      const limit = Number(url.searchParams.get("limit"));
      const limitSql = Number.isInteger(limit) && limit > 0 ? ` LIMIT ${limit}` : "";

      if (operation === "select") {
        const columns = table === "users" ? "id, email, full_name, avatar_url, bio, title, summary, phone, location, linkedin_url, github_url, site_title, accent_color, logo_url, resume_url, resume_name, favicon_url, created_at, updated_at" : "*";
        const result = await pool.query(`SELECT ${columns} FROM "${table}"${where}${orderSql}${limitSql}`, values);
        return json(response, 200, { data: url.searchParams.get("single") === "true" ? result.rows[0] || null : result.rows, count: result.rowCount });
      }

      const body = await readBody(request);
      if (operation === "delete") {
        const isUserScoped = userScopedTables.has(table);
        const deleteFilters = user && isUserScoped ? `${where ? `${where} AND` : " WHERE"} user_id = $${values.length + 1}` : where;
        const result = await pool.query(`DELETE FROM "${table}"${deleteFilters}`, user && isUserScoped ? [...values, user.userId] : values);
        return json(response, 200, { data: null, count: result.rowCount });
      }

      if (operation === "update") {
        const record = body.payload as Record<string, unknown>;
        const columns = Object.keys(record).filter((column) => allowedColumns.test(column) && column !== "id" && column !== "user_id");
        const updateValues = columns.map((column) => record[column]);
        const securedFilters = user && userScopedTables.has(table) ? [...filters, { column: "user_id", value: user.userId }] : filters;
        const securedValues = securedFilters.map((filter) => filter.value);
        const updateWhere = securedFilters.length ? ` WHERE ${securedFilters.map((filter, i) => `"${filter.column}" = $${columns.length + i + 1}`).join(" AND ")}` : "";
        const result = await pool.query(
          `UPDATE "${table}" SET ${columns.map((column, i) => `"${column}" = $${i + 1}`).join(", ")}${updateWhere} RETURNING *`,
          [...updateValues, ...securedValues],
        );
        return json(response, 200, { data: result.rows });
      }

      const records = operation === "insert" ? body.payload : [body.payload];
      const rows = Array.isArray(records) ? records : [records];
      const results = [];
      await pool.query(
        `INSERT INTO users (id, email) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING`,
        [LOCAL_USER_ID, "admin@portfolio.local"],
      );
      for (const row of rows) {
        const record = { ...(row as Record<string, unknown>) };
        if (userScopedTables.has(table) && user) record.user_id = user.userId;
        const columns = Object.keys(record).filter((column) => allowedColumns.test(column));
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(", ");
        const conflictSql = table === "users" && columns.includes("id")
          ? ` ON CONFLICT (id) DO UPDATE SET ${columns.filter((column) => column !== "id").map((column) => `"${column}" = EXCLUDED."${column}"`).join(", ")}`
          : "";
        const result = await pool.query(
          `INSERT INTO "${table}" (${columns.map((column) => `"${column}"`).join(", ")}) VALUES (${placeholders})${conflictSql} RETURNING *`,
          columns.map((column) => record[column]),
        );
        results.push(result.rows[0]);
      }
      return json(response, 200, { data: results });
    } catch (error) {
      console.error("Database request failed", error);
      return json(response, 500, { error: "Database request failed" });
    }
  };
}
