import cors from "cors";

// Configuración CORS abierta (puedes limitar por dominio si quieres)
export default cors({
  origin: "*", // permite cualquier origen
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
});