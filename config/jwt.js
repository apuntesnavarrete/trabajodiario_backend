import jwt from "jsonwebtoken";

const SECRET_KEY = "my_secret_key_123";
const REFRESH_SECRET_KEY = "my_refresh_secret_123"; // 🔒 separate secret

export function createToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role },
    SECRET_KEY,
    { expiresIn: "20m" }
  );
}

export function createRefreshToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role },
    REFRESH_SECRET_KEY,
    { expiresIn: "7d" } // refresh token lasts 7 days
  );
}

export function verifyToken(token) {
  try { return jwt.verify(token, SECRET_KEY); } 
  catch { return null; }
}

export function verifyRefreshToken(token) {
  try { return jwt.verify(token, REFRESH_SECRET_KEY); } 
  catch { return null; }
}

