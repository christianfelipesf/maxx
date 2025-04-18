const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;

// Rota principal serve o index.html da pasta atual
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em: http://localhost:${PORT}`);
});
