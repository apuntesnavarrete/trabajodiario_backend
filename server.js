// ---------- Dependencias ----------
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

// ---------- Configuración ----------
const app = express();
app.use(express.json());
app.use(cors({ origin: '*' })); // permite peticiones desde cualquier origen

// ---------- Rutas de archivos ----------
const FILE_PATH = path.join(__dirname, 'partidos.json');
const FILE_PLANTELES = path.join(__dirname, 'planteles.json');
const FILE_ASISTENCIA = path.join(__dirname, 'planteles_asistencia.json');

// ---------- Función genérica para leer, mezclar y guardar ----------
async function mergeData(file, nuevos, keyFn) {
  let raw = '';
  try {
    raw = await fs.promises.readFile(file, 'utf8');
  } catch {
    raw = '';
  }

  const existentes = raw ? JSON.parse(raw) : [];

  const map = new Map();
  existentes.forEach(item => map.set(keyFn(item), item));

  nuevos.forEach(n => {
    // validar campos
    if (!n.teamId || !n.participantId) {
      console.warn('[mergeData] Registro ignorado, faltan IDs:', n);
      return;
    }
    const k = keyFn(n);
    map.set(k, map.has(k) ? { ...map.get(k), ...n } : n);
  });

  const resultado = Array.from(map.values());
  await fs.promises.writeFile(file, JSON.stringify(resultado, null, 2), 'utf8');
  return resultado;
}

// ---------- Clave única para asistencias/goles ----------
const keyByPlayer = o =>
  `${String(o.teamId ?? '').trim()}-${String(o.participantId ?? '').trim()}`;

// ---------- Endpoints ----------

// ---- Partidos ----
app.get('/pro/partidos.json', (req, res) => {
  res.sendFile(FILE_PATH);
});

app.post('/pro/partidos.json', (req, res) => {
  const nuevosDatos = req.body;
  console.log('[POST /partidos]', nuevosDatos);

  fs.readFile(FILE_PATH, 'utf8', (err, data) => {
    let jsonExistente = {};
    if (!err && data) {
      try {
        jsonExistente = JSON.parse(data);
      } catch (e) {
        console.error('Error al parsear partidos.json:', e);
      }
    }

    const dia = nuevosDatos.dia;
    const trabajosDia = nuevosDatos.trabajos || [];
    jsonExistente[dia] = trabajosDia;

    fs.writeFile(FILE_PATH, JSON.stringify(jsonExistente, null, 2), err2 => {
      if (err2) {
        return res.status(500).json({ error: 'No se pudo guardar JSON' });
      }
      res.json({ ok: true, message: 'Datos guardados correctamente' });
    });
  });
});

// ---- Planteles ----
app.get('/pro/planteles.json', (req, res) => {
  res.sendFile(FILE_PLANTELES);
});

// ---- Asistencias ----
app.get('/pro/planteles_asistencia.json', (req, res) => {
  res.sendFile(FILE_ASISTENCIA);
});

app.post('/pro/planteles_asistencia.json', async (req, res) => {
  try {
    const nuevas = Array.isArray(req.body) ? req.body : [req.body];
    const data = await mergeData(FILE_ASISTENCIA, nuevas, keyByPlayer);
    res.json({
      ok: true,
      message: 'Asistencias actualizadas o agregadas',
      total: data.length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al guardar el archivo de asistencias' });
  }
});

// ---- Goles ----
app.post('/pro/planteles_goles.json', async (req, res) => {
  try {
    const nuevos = Array.isArray(req.body) ? req.body : [req.body];
    const data = await mergeData(FILE_ASISTENCIA, nuevos, keyByPlayer);
    res.json({
      ok: true,
      message: 'Goles actualizados o agregados',
      total: data.length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al guardar goles' });
  }
});

// ---------- Inicio del servidor ----------
const PORT = 3004;
app.listen(PORT, () =>
  console.log(`✅ Servidor Node corriendo en puerto ${PORT}`)
);

