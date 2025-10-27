import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
//volverla una variable de entorno
const SECRET_KEY = process.env.SECRET_KEY;
const REFRESH_SECRET_KEY = process.env.REFRESH_SECRET_KEY;

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

