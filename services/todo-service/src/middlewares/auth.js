import jwt from "jsonwebtoken";

// Middleware: reads Bearer token from Authorization header
export function auth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: "unauthorized" });
  }
  try {
    const payload = jwt.verify(token, process.env.TODO_JWT_SECRET);
    req.user = { id: payload.sub, premium: !!payload.premium, name: payload.name };
    next();
  } catch {
    return res.status(401).json({ error: "unauthorized" });
  }
}
