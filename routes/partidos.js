import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { checkAuth } from "../middleware/authMiddleware";

const router = express.Router();

// equivalente a __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FILE_PATH = path.resolve(__dirname, "../data/partidos.json"); // ruta absoluta segura

// GET todos los partidos
router.get("/", (req, res) => {
  res.sendFile(FILE_PATH, err => {
    if (err) res.status(500).json({ error: "No se pudo leer partidos.json" });
  });
});

// POST nuevo partido
router.post("/", checkAuth, (req, res) => {
  const datos = Array.isArray(req.body) ? req.body : [req.body];

  fs.readFile(FILE_PATH, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "No se pudo leer JSON" });

    let partidos = [];
    if (data) {
      try {
        partidos = JSON.parse(data);
      } catch {
        partidos = [];
      }
    }

    let maxId = partidos.length ? Math.max(...partidos.map(p => p.id || 0)) : 0;
    const nuevos = datos.map(p => ({ ...p, id: ++maxId }));

    partidos.push(...nuevos);

    fs.writeFile(FILE_PATH, JSON.stringify(partidos, null, 2), err => {
      if (err) return res.status(500).json({ error: "No se pudo guardar JSON" });
      res.json({ ok: true, nuevos });
    });
  });
});

// PUT actualizar partido
router.put("/:id",checkAuth, (req, res) => {
  const id = parseInt(req.params.id);
  const updatedData = req.body;

  fs.readFile(FILE_PATH, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Error reading file" });

    let partidos = JSON.parse(data);
    const index = partidos.findIndex(p => p.id === id);
    if (index === -1) return res.status(404).json({ error: "Partido no encontrado" });

    partidos[index] = { ...partidos[index], ...updatedData };

    fs.writeFile(FILE_PATH, JSON.stringify(partidos, null, 2), err => {
      if (err) return res.status(500).json({ error: "Error saving file" });
      res.json({ ok: true, message: "Partido actualizado" });
    });
  });
});

// DELETE partido
router.delete("/:id",checkAuth, (req, res) => {
  const id = parseInt(req.params.id);

  fs.readFile(FILE_PATH, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "No se pudo leer JSON" });

    let partidos = [];
    try {
      partidos = JSON.parse(data);
    } catch {}
    const nuevos = partidos.filter(p => p.id !== id);

    if (nuevos.length === partidos.length)
      return res.status(404).json({ error: "Partido no encontrado" });

    fs.writeFile(FILE_PATH, JSON.stringify(nuevos, null, 2), err => {
      if (err) return res.status(500).json({ error: "No se pudo guardar JSON" });
      res.json({ ok: true, message: `Partido ${id} eliminado` });
    });
  });
});

export default router;
