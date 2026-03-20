import express from "express";
import cors from "./config/cors.js";
import morganLogger from "./config/morgan.js";
import slowMonitor from "./middleware/slowMonitor.js";
import partidosRoutes from "./routes/partidos.js";
import plantelesRoutes from "./routes/planteles.js";
import asistenciasRoutes from "./routes/asistencias.js";
import calendarioRoutes from "./routes/calendario.js";

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
 app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: "La ruta no existe"
  });
});



const PORT = 3004;
app.listen(PORT, () => console.log(`✅ Servidor corriendo en puerto ${PORT}`));


