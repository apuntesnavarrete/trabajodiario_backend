const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3004;

app.use(cors());
app.use(express.json()); // <--- importante para recibir JSON

const FILE_PATH = path.join(__dirname, 'partidos.json');

// =====================
// Obtener partidos
// =====================
app.get('/pro/partidos.json', (req, res) => {
  fs.readFile(FILE_PATH, 'utf8', (err, data) => {
    if (err) {
      res.status(500).json({ error: 'No se pudo leer el archivo JSON' });
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.send(data);
    }
  });
});

// =====================
// Guardar partidos desde Angular
// =====================
app.post('/pro/partidos.json', (req, res) => {
  const nuevosDatos = req.body; // debe venir el objeto completo: {usuario, dia, trabajos}
  
  // Leer los datos existentes
  fs.readFile(FILE_PATH, 'utf8', (err, data) => {
    let jsonExistente = {};
    if (!err) {
      try {
        jsonExistente = JSON.parse(data);
      } catch (e) {
        console.error('Error parseando JSON existente:', e);
      }
    }

    // Actualizar los partidos del día correspondiente
    const dia = nuevosDatos.dia;
    const trabajosDia = nuevosDatos.trabajos || [];
    jsonExistente[dia] = trabajosDia;

    // Guardar de nuevo en el archivo
    fs.writeFile(FILE_PATH, JSON.stringify(jsonExistente, null, 2), (err) => {
      if (err) {
        res.status(500).json({ error: 'No se pudo guardar el archivo JSON' });
      } else {
        res.json({ ok: true, message: 'Datos guardados correctamente' });
      }
    });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
