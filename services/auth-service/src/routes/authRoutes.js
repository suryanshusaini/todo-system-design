import express from "express";
import passport from "passport";
import { verifyToken } from "../middlewares/verifyToken.js";
import {
  register,
  login,
  logout,
  me,
  token,
  googleCallback
} from "../controllers/authController.js";

const router = express.Router();

// Public routes
router.post("/auth/register", register);
router.post("/auth/login", login);
router.post("/auth/logout", logout);

// Protected routes (require valid cookie JWT)
router.get("/me", verifyToken, me);
router.get("/token", verifyToken, token);

// Google OAuth
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["openid", "profile", "email"], prompt: "consent" })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/auth/failure" }),
  (req, res) => googleCallback(req.user, res)
);

router.get("/auth/failure", (_req, res) =>
  res.status(401).json({ error: "google_auth_failed" })
);

export default router;
