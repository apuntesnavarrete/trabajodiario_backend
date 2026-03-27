import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { checkAuth } from "../middleware/authMiddleware.js";

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

// POST nuevo partido
router.post("/", checkAuth, (req, res) => {
  const datos = Array.isArray(req.body) ? req.body : [req.body];

  fs.readFile(FILE_PATH, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "No se pudo leer JSON" });

    let partidos = [];

    try {
      const json = JSON.parse(data);
      partidos = json.matches || []; // ✅ SIEMPRE array
    } catch {
      partidos = [];
    }

    // generar IDs correctos
    let maxId = partidos.length
      ? Math.max(...partidos.map(p => p.id || 0))
      : 0;

    const nuevos = datos.map(p => ({
      ...p,
      id: ++maxId
    }));

    partidos.push(...nuevos);

    // ✅ guardar SIEMPRE como { matches: [] }
    const updated = { matches: partidos };
    console.log("updated")

    console.log(updated)

    fs.writeFile(FILE_PATH, JSON.stringify(updated, null, 2), err => {
      if (err) return res.status(500).json({ error: "No se pudo guardar JSON" });

      res.json({ ok: true, nuevos });
    });
  });
});

router.get("/test-slow", (req, res) => {
  setTimeout(() => {
    res.send("respuesta lenta");
  }, 1000); // 1 segundo
});

export default router;
