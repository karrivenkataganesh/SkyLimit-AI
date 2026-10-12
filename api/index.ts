import express, { type Request, type Response } from "express";
import { apiRouter } from "../backend/routes/apiRoutes.ts";

const app = express();

// Top-level request parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// Modular backend router
app.use("/api", apiRouter);

// Subsystem redirection routes
app.get("/frontend", (_req: Request, res: Response) => {
  res.redirect("/#curriculum?category=frontend");
});

app.get("/backend", (_req: Request, res: Response) => {
  res.redirect("/#curriculum?category=backend");
});

app.get("/java-core", (_req: Request, res: Response) => {
  res.redirect("/#curriculum?category=java-core");
});

app.get("/python", (_req: Request, res: Response) => {
  res.redirect("/#curriculum?category=python");
});

export default app;
