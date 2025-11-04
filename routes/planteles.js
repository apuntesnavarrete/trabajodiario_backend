import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { checkAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BASE_PATH = path.resolve(__dirname, "../data"); // carpeta data relativa al proyecto

// GET planteles generales
router.get("/", (req, res) => {
  const file = path.resolve(BASE_PATH, "planteles.json");
  res.sendFile(file, err => {
    if (err) res.status(500).json({ error: "No se pudo leer planteles.json" });
  });
});

// GET planteles por torneo
router.get("/:torneoId", (req, res) => {
  const torneoId = req.params.torneoId;
  const file = path.resolve(BASE_PATH, `planteles_${torneoId}.json`);
  if (!fs.existsSync(file)) return res.status(404).json({ error: "Archivo no encontrado" });
  res.sendFile(file, err => {
    if (err) res.status(500).json({ error: "Error al leer archivo" });
  });
});

// POST para guardar planteles
router.post("/:torneoId",checkAuth, async (req, res) => {
  try {
    const torneoId = req.params.torneoId;
    const data = req.body;
    const file = path.resolve(BASE_PATH, `planteles_${torneoId}.json`);
    await fs.promises.writeFile(file, JSON.stringify(data, null, 2), "utf8");
    res.json({ ok: true, message: `Archivo planteles_${torneoId}.json guardado` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al guardar el archivo de planteles" });
  }
});

export default router;

