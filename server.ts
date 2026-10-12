import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { apiRouter } from "./backend/routes/apiRoutes.ts";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// 1. Mandatory Top-Level Request Deserialization
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// 2. Health check route mounted early for Cloud Run probes
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// 3. Mount modular API router
app.use("/api", apiRouter);

// 4. Subsystem Redirection Routes
app.get("/frontend", (_req, res) => {
  res.redirect("/#curriculum?category=frontend");
});

app.get("/backend", (_req, res) => {
  res.redirect("/#curriculum?category=backend");
});

app.get("/java-core", (_req, res) => {
  res.redirect("/#curriculum?category=java-core");
});

app.get("/python", (_req, res) => {
  res.redirect("/#curriculum?category=python");
});

// 5. Start Express server with dynamic Vite dev middleware or production static files
async function startServer() {
  const distPath = fs.existsSync(path.resolve(__dirname, "dist"))
    ? path.resolve(__dirname, "dist")
    : path.resolve(process.cwd(), "dist");
  const hasDist = fs.existsSync(path.join(distPath, "index.html"));
  const isProduction =
    process.env.NODE_ENV === "production" ||
    Boolean(process.env.K_SERVICE) ||
    hasDist;

  if (!isProduction) {
    // Dynamic import of Vite in development mode only
    try {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
      console.log("[Airline Overbooking Manager] Vite development middleware mounted.");
    } catch (viteErr) {
      console.warn("[Airline Overbooking Manager] Vite failed to load in dev mode, falling back to static files:", viteErr);
      if (hasDist) {
        app.use(express.static(distPath));
        app.get("*", (_req, res) => {
          res.sendFile(path.join(distPath, "index.html"));
        });
      }
    }
  } else {
    // Production Mode: Instant static serving from dist/
    console.log(`[Airline Overbooking Manager] Running in PRODUCTION mode from ${distPath}`);
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Airline Overbooking Manager] Server successfully listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("[Airline Overbooking Manager] Fatal startup failure:", err);
  process.exit(1);
});
