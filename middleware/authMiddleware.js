import { verifyToken } from "../config/jwt.js";

export function checkAuth(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // "Bearer token"

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    // ⚠️ Si el token expiró, jwt lanza un error con nombre 'TokenExpiredError'
    if (err.name === "TokenExpiredError") {
      console.log("⚠️ Token expirado");
      return res.status(401).json({ message: "Token expired" });
    }

    console.log("❌ Error al verificar token:", err.message);
    return res.status(403).json({ message: "Invalid token" });
  }
}

