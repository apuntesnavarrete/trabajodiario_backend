import fs from "fs";

/**
 * Función para leer un archivo JSON, mezclar datos nuevos y guardarlo.
 * @param {string} file - Ruta del archivo JSON.
 * @param {Array} nuevos - Datos nuevos a agregar/actualizar.
 * @param {Function} keyFn - Función que devuelve la clave única para cada registro.
 * @returns {Promise<Array>} - Datos resultantes del merge.
 */
export async function mergeData(file, nuevos, keyFn) {
  let raw = "";
  try {
    raw = await fs.promises.readFile(file, "utf8");
  } catch {
    raw = "";
  }

  const existentes = raw ? JSON.parse(raw) : [];

  const map = new Map();
  existentes.forEach(item => map.set(keyFn(item), item));

  nuevos.forEach(n => {
    // validar campos mínimos
    if (!n.teamId || !n.participantId) {
      console.warn("[mergeData] Registro ignorado, faltan IDs:", n);
      return;
    }
    const k = keyFn(n);
    map.set(k, map.has(k) ? { ...map.get(k), ...n } : n);
  });

  const resultado = Array.from(map.values());
  await fs.promises.writeFile(file, JSON.stringify(resultado, null, 2), "utf8");
  return resultado;
}

/**
 * Función para generar clave única de un jugador en un partido.
 * @param {Object} o - Registro de asistencia o gol.
 * @returns {string} - Clave única: "teamId-participantId-partidoId"
 */
export function keyByPlayer(o) {
  return `${String(o.teamId ?? "").trim()}-${String(o.participantId ?? "").trim()}-${String(o.partidoId ?? "").trim()}`;
}
