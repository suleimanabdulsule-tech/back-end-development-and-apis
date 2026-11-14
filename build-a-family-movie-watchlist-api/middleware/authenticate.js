import jwt from "jsonwebtoken";

export function authenticate(req, res, next) {
  const match = /^Bearer\s+(\S+)$/i.exec(req.headers.authorization ?? "");

  if (!match) {
    return res.status(401).json({ error: "No token provided." });
  }

  try {
    req.user = jwt.verify(match[1], process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });
  } catch {
    return res.status(401).json({ error: "Invalid or expired token." });
  }

  return next();
}
