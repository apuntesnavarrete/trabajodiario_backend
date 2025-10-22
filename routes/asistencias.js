import express from "express";
import { mergeData, keyByPlayer } from "../utils/mergeData.js";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ruta absoluta correcta
const FILE_ASISTENCIA = resolve(__dirname, "../data/planteles_asistencia.json");
// GET archivo de asistencias
router.get("/pro/planteles_asistencia.json", (req, res) => {
  res.sendFile(FILE_ASISTENCIA, err => {
    if (err) res.status(500).json({ error: "No se pudo leer planteles_asistencia.json" });
  });
});

// POST asistencias
router.post("/pro/planteles_asistencia.json", async (req, res) => {
  try {
    const nuevas = Array.isArray(req.body) ? req.body : [req.body];
    const data = await mergeData(FILE_ASISTENCIA, nuevas, keyByPlayer);
    res.json({ ok: true, message: "Asistencias actualizadas", total: data.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al guardar asistencias" });
  }
});

// POST goles (puede usar mismo archivo y función)
router.post("/pro/planteles_goles.json", async (req, res) => {
  try {
    const nuevos = Array.isArray(req.body) ? req.body : [req.body];
    const data = await mergeData(FILE_ASISTENCIA, nuevos, keyByPlayer);
    res.json({ ok: true, message: "Goles actualizados", total: data.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al guardar goles" });
  }
});

export default router;
