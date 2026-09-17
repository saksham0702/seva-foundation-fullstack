import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import path from "path";
import cookieParser from "cookie-parser";
import router from "./routes";

const app = express();

// ── CORS — allow frontend origin and credentials (cookies) ────────────────────
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true, // required for HTTP-only cookie to be sent cross-origin
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ── Body & cookie parsers ─────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Static files ──────────────────────────────────────────────────────────────
app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "uploads"))
);

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/api", (_req: Request, res: Response) => {
  res.json({ success: true, message: "API is running..." });
});

// ── Application routes ────────────────────────────────────────────────────────
app.use("/api", router);

// ── Global error handler ──────────────────────────────────────────────────────
// Must be LAST — catches any error thrown or passed via next(err)
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("[ERROR]", err.message);

  // MongoDB E11000 duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || err.keyValue || {})[0] || "field";
    const val = err.keyValue ? err.keyValue[field] : "";
    return res.status(409).json({
      success: false,
      message: `A record with this ${field} ("${val}") already exists. Please try changing it.`,
    });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

export default app;