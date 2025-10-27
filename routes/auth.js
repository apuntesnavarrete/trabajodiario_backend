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

  res.json({ accessToken, refreshToken, role: user.role });
});

// refresh token endpoint
router.post("/refresh", (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ message: "No token provided" });

  const decoded = verifyRefreshToken(refreshToken);
  if (!decoded) return res.status(403).json({ message: "Invalid refresh token" });

  // create new access token
  const newAccessToken = createToken(decoded);
  res.json({ accessToken: newAccessToken });
});

export default router;
