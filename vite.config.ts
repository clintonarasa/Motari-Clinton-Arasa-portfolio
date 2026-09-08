import { defineConfig, loadEnv, type ViteDevServer } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import type { IncomingMessage, ServerResponse } from "node:http";
import { componentTagger } from "lovable-tagger";
import { Pool } from "pg";
import { ensureNeonSchema, neonApiMiddleware } from "./server/neon-api";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const pool = env.DATABASE_URL ? new Pool({ connectionString: env.DATABASE_URL, max: 5 }) : null;
  return ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger(), pool && {
    name: "neon-api",
    configureServer(server: ViteDevServer) {
      const schemaReady = ensureNeonSchema(pool);
      const api = neonApiMiddleware(pool, env.SESSION_SECRET);
      server.middlewares.use(async (request: IncomingMessage, response: ServerResponse, next: () => void) => {
        await schemaReady;
        return api(request, response, next);
      });
    },
  }].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime"],
  },
  });
});
