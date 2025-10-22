import morgan from "morgan";
import fs from "fs";
import path from "path";

// Carpeta de logs
const logDir = "./logs";
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

// Stream para guardar logs en archivo
const logStream = fs.createWriteStream(path.join(logDir, "access.log"), {
  flags: "a", // append
});

// Exportamos un array de middlewares de Morgan
export default [
  // Log básico en consola
  morgan(":remote-addr :method :url :status :res[content-length] - :response-time ms"),
  // Log completo en archivo
  morgan("combined", { stream: logStream }),
];