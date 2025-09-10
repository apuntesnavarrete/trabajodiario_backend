const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors'); // <- IMPORTANTE
const app = express();

app.use(express.json()); // <- para poder usar req.body
app.use(cors({ origin: '*' })); // <- permite peticiones desde cualquier origen

const FILE_PATH = path.join(__dirname, 'partidos.json');
const FILE_PLANTELES = path.join(__dirname, 'planteles.json'); // <- nuevo archivo

app.get('/pro/partidos.json', (req, res) => {
  res.sendFile(FILE_PATH);
});

app.post('/pro/partidos.json', (req, res) => {
  const nuevosDatos = req.body;
  console.log(nuevosDatos);
  fs.readFile(FILE_PATH, 'utf8', (err, data) => {
    let jsonExistente = {};
    if (!err) {
      try { jsonExistente = JSON.parse(data); } catch(e) {}
    }
    const dia = nuevosDatos.dia;
    const trabajosDia = nuevosDatos.trabajos || [];
    jsonExistente[dia] = trabajosDia;

    fs.writeFile(FILE_PATH, JSON.stringify(jsonExistente, null, 2), (err) => {
      if (err) return res.status(500).json({ error: 'No se pudo guardar JSON' });
      res.json({ ok: true, message: 'Datos guardados correctamente' });
    });
  });
});

app.get('/pro/planteles.json', (req, res) => {
  res.sendFile(FILE_PLANTELES);
});

app.listen(3004, () => console.log('Servidor Node corriendo en puerto 3004'));

