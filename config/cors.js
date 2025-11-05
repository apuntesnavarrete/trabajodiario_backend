import cors from "cors";

// Configuración CORS con cookies habilitadas
export default cors({
  origin: ["http://localhost:5175", "http://50.21.187.205/"], // tu frontend (Vite usa este puerto)
  credentials: true,               // 👈 permite enviar y recibir cookies
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
});