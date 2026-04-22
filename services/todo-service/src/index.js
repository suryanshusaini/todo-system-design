import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import todoRouter from "./routes/todoRoutes.js";
import { connectRedis } from "./services/redisService.js";

const app = express();
const PORT = process.env.TODO_PORT || 4002;

// ── CORS ──────────────────────────────────────────────
const ORIGINS = (process.env.TODO_CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || ORIGINS.includes(origin)) return cb(null, true);
      cb(new Error(`CORS: ${origin} not allowed`));
    },
    credentials: true,
  })
);

app.use(express.json());

// ── Routes ────────────────────────────────────────────
app.use(todoRouter);

// ── Health ────────────────────────────────────────────
app.get("/health", (_req, res) => res.json({ ok: true, service: "todo" }));

// ── Global error handler ──────────────────────────────
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err?.message || err);
  res.status(500).json({ error: "internal_server_error" });
});

// ── Connect & start ───────────────────────────────────
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/todo-saas";
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

async function start() {
  await mongoose.connect(MONGO_URI);
  console.log("MongoDB connected:", MONGO_URI);

  await connectRedis(REDIS_URL);

  app.listen(PORT, () => console.log(`todo-service listening on :${PORT}`));
}

start().catch((err) => {
  console.error("Startup failed:", err.message);
  process.exit(1);
});
