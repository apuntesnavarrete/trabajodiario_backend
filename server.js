const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3004;

app.use(cors());

app.get('/pro/partidos.json', (req, res) => {
  const filePath = path.join(__dirname, 'partidos.json');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      res.status(500).json({ error: 'No se pudo leer el archivo JSON' });
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.send(data);
    }
  });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});