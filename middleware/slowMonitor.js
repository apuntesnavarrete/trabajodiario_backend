import fs from "fs";
import path from "path";

// Carpeta donde se guardarán los logs de rutas lentas
const logDir = "./logs";
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

export default function slowMonitor(req, res, next) {
  const start = Date.now(); // tiempo inicial

  // Cuando la respuesta termine
  res.on("finish", () => {
    const duration = Date.now() - start;
    const limit = 500; // ms: umbral para considerar lento

    if (duration > limit) {
      const msg = `⚠️ Slow response: ${req.method} ${req.originalUrl} → ${duration} ms\n`;
      console.warn(msg); // mostrar en consola

      // guardar en archivo slow.log
      fs.appendFileSync(path.join(logDir, "slow.log"), `[${new Date().toISOString()}] ${msg}`);
    }
  });

  next(); // continuar con la siguiente función/middleware
}
