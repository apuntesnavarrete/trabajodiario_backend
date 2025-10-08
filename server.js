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
const FILE_PATH_ED = path.join(__dirname, 'partidos_ed.json');

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
  `${String(o.teamId ?? '').trim()}-${String(o.participantId ?? '').trim()}-${String(o.partidoId ?? '').trim()}`;
// ---------- Endpoints ----------

// ---- Partidos ----
app.get('/partidos', (req, res) => {
  res.sendFile(FILE_PATH);
});

app.get('/ed/partidos.json', (req, res) => {
  res.sendFile(FILE_PATH_ED);
});

app.post('/partidos', (req, res) => {
  const datos = req.body; // puede ser 1 partido o un array
  console.log('[POST /partidos] Recibido:', datos);

  // 1. Leer archivo actual
  fs.readFile(FILE_PATH, 'utf8', (err, data) => {
    if (err) {
      console.error('Error al leer partidos.json:', err);
      return res.status(500).json({ error: 'No se pudo leer JSON' });
    }

    let partidos = [];
    if (data) {
      try {
        partidos = JSON.parse(data);
      } catch {
        partidos = [];
      }
    }

    // 2. Normalizar los datos recibidos (array u objeto)
    let nuevos = Array.isArray(datos) ? datos : [datos];

    // 3. Calcular IDs únicos
    let maxId = partidos.length > 0 ? Math.max(...partidos.map(p => p.id || 0)) : 0;

    // 4. Asignar un ID nuevo a cada partido, ignorando el que venga del frontend
    nuevos = nuevos.map(p => ({
      ...p,
      id: ++maxId, // incrementa y asigna
    }));

    // 5. Agregar al array principal
    partidos.push(...nuevos);

    // 6. Guardar archivo
    fs.writeFile(FILE_PATH, JSON.stringify(partidos, null, 2), err => {
      if (err) {
        console.error('Error al guardar partidos.json:', err);
        return res.status(500).json({ error: 'No se pudo guardar JSON' });
      }
      res.json({ ok: true, message: 'Partido(s) agregado(s) correctamente', nuevos });
    });
  });
});




app.put('/partidos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const updatedData = req.body;

  // Leer archivo actual
  fs.readFile(FILE_PATH, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Error reading file' });

    let partidos = JSON.parse(data);

    // Buscar partido por id
    const index = partidos.findIndex(p => p.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Partido not found' });
    }

    // Reemplazar los datos del partido
    partidos[index] = { ...partidos[index], ...updatedData };

    // Guardar archivo actualizado
    fs.writeFile(FILE_PATH, JSON.stringify(partidos, null, 2), err => {
      if (err) return res.status(500).json({ error: 'Error saving file' });
      res.json({ ok: true, message: 'Partido updated' });
    });
  });
});

app.delete('/partidos/:id', (req, res) => {
  const id = parseInt(req.params.id);

  fs.readFile(FILE_PATH, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'No se pudo leer JSON' });

    let partidos = [];
    try {
      partidos = JSON.parse(data);
    } catch {
      partidos = [];
    }

    const nuevos = partidos.filter(p => p.id !== id);

    if (nuevos.length === partidos.length) {
      return res.status(404).json({ error: 'Partido no encontrado' });
    }

    fs.writeFile(FILE_PATH, JSON.stringify(nuevos, null, 2), err => {
      if (err) return res.status(500).json({ error: 'No se pudo guardar JSON' });
      res.json({ ok: true, message: `Partido ${id} eliminado` });
    });
  });
});

// ---- Planteles ----
app.get('/pro/planteles.json', (req, res) => {
  res.sendFile(FILE_PLANTELES);
});

app.get('/planteles/:torneoId', (req, res) => {
  const torneoId = req.params.torneoId;
  const filePath = path.join(__dirname, `planteles_${torneoId}.json`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Archivo no encontrado' });
  }

  res.sendFile(filePath);
});

// ---- Subir y guardar planteles ----
app.post('/planteles/:torneoId', async (req, res) => {
  try {
    const torneoId = req.params.torneoId;
    const data = req.body;

    if (!torneoId) {
      return res.status(400).json({ error: 'torneoId requerido' });
    }

    const fileName = `planteles_${torneoId}.json`;
    const filePath = path.join(__dirname, fileName);

    await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');

    res.json({ ok: true, message: `Archivo ${fileName} guardado correctamente` });
  } catch (err) {
    console.error('Error al guardar planteles:', err);
    res.status(500).json({ error: 'Error al guardar el archivo de planteles' });
  }
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

