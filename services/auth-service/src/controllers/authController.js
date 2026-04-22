import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

function signToken(user) {
  return jwt.sign(
    {
      sub: String(user._id),
      email: user.email || undefined,
      username: user.username || undefined,
      name: user.name,
      premium: !!user.premium
    },
    process.env.AUTH_JWT_SECRET,
    {
      issuer: process.env.AUTH_JWT_ISSUER || "todo-saas",
      audience: process.env.AUTH_JWT_AUDIENCE || "todo-saas-web",
      expiresIn: "7d"
    }
  );
}

function setAuthCookie(res, token) {
  res.cookie(process.env.AUTH_COOKIE_NAME || "todo_saas_token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/"
  });
}

// POST /auth/register
export async function register(req, res) {
  const { username, password, name } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "username_and_password_required" });
  }
  if (username.length < 3) return res.status(400).json({ error: "username_too_short" });
  if (password.length < 6) return res.status(400).json({ error: "password_too_short" });

  const existing = await User.findOne({ username }).lean();
  if (existing) return res.status(409).json({ error: "username_taken" });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ username, passwordHash, name: name || username });

  const token = signToken(user);
  setAuthCookie(res, token);
  res.status(201).json({ ok: true, user: { id: String(user._id), username: user.username, name: user.name, premium: false } });
}

// POST /auth/login
export async function login(req, res) {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: "fields_required" });

  const user = await User.findOne({ username }).lean();
  if (!user?.passwordHash) return res.status(401).json({ error: "invalid_credentials" });

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return res.status(401).json({ error: "invalid_credentials" });

  const token = signToken(user);
  setAuthCookie(res, token);
  res.json({ ok: true, user: { id: String(user._id), username: user.username, name: user.name, premium: user.premium } });
}

// POST /auth/logout
export function logout(req, res) {
  res.clearCookie(process.env.AUTH_COOKIE_NAME || "todo_saas_token", { path: "/", sameSite: "lax", secure: false });
  res.json({ ok: true });
}

// GET /me
export async function me(req, res) {
  const user = await User.findById(req.userPayload.sub).lean();
  if (!user) return res.status(401).json({ error: "unauthorized" });
  res.json({
    user: {
      id: String(user._id),
      email: user.email || null,
      username: user.username || null,
      name: user.name,
      premium: !!user.premium
    }
  });
}

// GET /token  — exchange httpOnly cookie for a Bearer token (for todo-service)
export async function token(req, res) {
  const user = await User.findById(req.userPayload.sub).lean();
  if (!user) return res.status(401).json({ error: "unauthorized" });
  const fresh = signToken(user);
  setAuthCookie(res, fresh); // roll the cookie too
  res.json({ token: fresh });
}

// Called after Google OAuth succeeds
export async function googleCallback(user, res) {
  const token = signToken(user);
  setAuthCookie(res, token);
  const origin = process.env.AUTH_CORS_ORIGIN || "http://localhost:5173";
  res.redirect(origin + "/app");
}
