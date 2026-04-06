import express from "express";
import 'dotenv/config';
import cors from "./config/cors.js";
import morganLogger from "./config/morgan.js";
import slowMonitor from "./middleware/slowMonitor.js";
import partidosRoutes from "./routes/partidos.js";
import plantelesRoutes from "./routes/planteles.js";
import asistenciasRoutes from "./routes/asistencias.js";
import calendarioRoutes from "./routes/calendario.js";
import sancionesRoutes from "./routes/sanciones.js";

import authRoutes from "./routes/auth.js";
import cookieParser from "cookie-parser";


const app = express();
app.use(express.json());
app.use(cors);
app.use(morganLogger);
app.use(slowMonitor);
app.use(cookieParser());


// Rutas
app.use("/auth", authRoutes);
app.use("/partidos", partidosRoutes);
app.use("/planteles", plantelesRoutes);
app.use("/asistencias", asistenciasRoutes);
app.use("/calendario", calendarioRoutes);
app.use("/sanciones", sancionesRoutes);

 app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: "La ruta no existe"
  });
});
// --- MANEJADOR DE ERRORES CENTRALIZADO ---
app.use((err, req, res, next) => {
  // 1. Logueamos el error en la consola del servidor (para verlo en PM2 logs)
  console.error(`[${new Date().toISOString()}] ❌ Error: ${err.message}`);

  // 2. Definimos el estatus (por defecto 500 si no viene uno)
  const status = err.status || 500;

  // 3. Enviamos una respuesta única y limpia al frontend
  res.status(status).json({
    ok: false,
    error: err.message || "Error interno del servidor",
    instante: new Date().toLocaleTimeString()
  });
});


const PORT = 3004;
app.listen(PORT, () => console.log(`✅ Servidor corriendo en puerto ${PORT}`));


