import cors from "cors";

// Configuración CORS con cookies habilitadas
export default cors({
  origin: ["http://localhost:5175", "http://50.21.187.205"], // 👈 sin "/"
  credentials: true, // permite cookies o encabezados con credenciales
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
});