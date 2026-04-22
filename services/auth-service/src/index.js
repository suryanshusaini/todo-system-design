import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "./models/User.js";
import authRouter from "./routes/authRoutes.js";
import premiumRouter from "./routes/premiumRoutes.js";

const app = express();
const PORT = process.env.AUTH_PORT || 4001;

// ── CORS ──────────────────────────────────────────────
const ORIGINS = (process.env.AUTH_CORS_ORIGIN || "http://localhost:5173")
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

// ── Body parsers ──────────────────────────────────────
// Raw body for Razorpay webhook signature verification
app.use("/premium/webhook", express.raw({ type: "application/json" }));
app.use(express.json());
app.use(cookieParser());

// ── Passport / Google OAuth ───────────────────────────
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || "REPLACE_ME",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "REPLACE_ME",
      callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:4001/auth/google/callback",
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
          user = await User.create({
            googleId: profile.id,
            email,
            name: profile.displayName || email || "User",
          });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

app.use(passport.initialize());

// ── Routes ────────────────────────────────────────────
app.use(authRouter);
app.use(premiumRouter);

// ── Health ────────────────────────────────────────────
app.get("/health", (_req, res) => res.json({ ok: true, service: "auth" }));

// ── Global error handler ──────────────────────────────
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err?.message || err);
  res.status(500).json({ error: "internal_server_error" });
});

// ── Connect & start ───────────────────────────────────
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/todo-saas";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected:", MONGO_URI);
    app.listen(PORT, () => console.log(`auth-service listening on :${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });
