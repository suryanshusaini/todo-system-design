import jwt from "jsonwebtoken";

// Middleware: reads httpOnly cookie and attaches `req.userPayload`
export function verifyToken(req, res, next) {
  const cookieName = process.env.AUTH_COOKIE_NAME || "todo_saas_token";
  const token = req.cookies?.[cookieName];
  if (!token) {
    return res.status(401).json({ error: "unauthorized" });
  }
  try {
    const payload = jwt.verify(token, process.env.AUTH_JWT_SECRET, {
      issuer: process.env.AUTH_JWT_ISSUER || "todo-saas",
      audience: process.env.AUTH_JWT_AUDIENCE || "todo-saas-web"
    });
    req.userPayload = payload;
    next();
  } catch {
    return res.status(401).json({ error: "unauthorized" });
  }
}
