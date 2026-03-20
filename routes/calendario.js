import express from "express";
//import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
//import { checkAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// equivalente a __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FILE_PATH = path.resolve(__dirname, "../data/calendario.json"); // ruta absoluta segura

// GET todos los partidos
router.get("/", (req, res) => {
  res.sendFile(FILE_PATH, err => {
    if (err) res.status(500).json({ error: "No se pudo leer partidos.json" });
  });
});

router.get("/test-slow", (req, res) => {
  setTimeout(() => {
    res.send("respuesta lenta");
  }, 1000); // 1 segundo
});

export default router;
