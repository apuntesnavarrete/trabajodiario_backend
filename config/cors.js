import cors from "cors";
const frontendProd = process.env.FRONTEND_URL; 

const allowedOrigins = [
  frontendProd,
  "http://localhost:5174"
];


// Configuración CORS con cookies habilitadas
export default cors({
 origin: function (origin, callback) {
    // Si no hay origin (Postman) o está en la lista, permitimos
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("Origen bloqueado por CORS:", origin); // Útil para debug
      callback(new Error("No permitido por CORS"));
    }
  },
  credentials: true, // permite cookies o encabezados con credenciales
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
});