import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises"; // 👈 Asegúrate de que tenga el "/promises"

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FILE_PATH = path.resolve(__dirname, "../data/sanciones.json");

router.get("/", async (req, res, next) => {
  try {
    console.log("Intentando leer:", FILE_PATH);
    
    // Con fs/promises, esto ahora sí funcionará perfecto
    const data = await fs.readFile(FILE_PATH, "utf-8"); 
    res.json(JSON.parse(data));
    
  } catch (err) {
    console.error("DEBUG REAL:", err); 
    err.message = "Error al acceder al archivo de sanciones";
    err.status = 500;
    next(err); 
  }
});

export default router;