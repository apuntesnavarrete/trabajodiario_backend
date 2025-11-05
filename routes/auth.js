import express from "express";
import bcrypt from "bcryptjs";
import { createToken , createRefreshToken , verifyRefreshToken} from "../config/jwt.js";
import { users } from "../data/users.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = users.find((u) => u.username === username);
  if (!user) return res.status(404).json({ message: "User not found" });

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword)
    return res.status(401).json({ message: "Wrong password" });


  const accessToken = createToken(user);
  const refreshToken = createRefreshToken(user);


   // 🍪 Cookie solo en modo desarrollo (sin HTTPS)
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,     // 🔒 protege del acceso JS
    secure: false,      // ⚙️ permite HTTP
    sameSite: "lax",    // 🧭 permite funcionar localmente
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
  });

 res.json({
    accessToken,
    role: user.role,
  });});


router.post("/refresh", (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: "No refresh token" });

  try {
    const payload = jwt.verify(token, process.env.REFRESH_SECRET);
    const newAccess = createToken({ username: payload.username });
    res.json({ accessToken: newAccess });
  } catch {
    res.status(403).json({ message: "Invalid refresh token" });
  }
});

router.get("/check-cookie", (req, res) => {
  const refresh = req.cookies?.refreshToken;
  if (refresh) {
    return res.json({ ok: true, hasRefresh: true });
  } else {
    return res.json({ ok: true, hasRefresh: false });
  }
});

export default router;
