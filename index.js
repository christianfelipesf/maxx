const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

const PORT = process.env.PORT || 3000;

// Configurar para servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Rota para buscar os arquivos HTML da pasta 'servicos'
app.get('/servicos', (req, res) => {
    const servicosPath = path.join(__dirname, 'servicos');
    
    fs.readdir(servicosPath, (err, files) => {
        if (err) {
            return res.status(500).send('Erro ao ler a pasta de serviços');
        }

        // Filtrando apenas arquivos .html
        const htmlFiles = files.filter(file => file.endsWith('.html'));
        
        res.json(htmlFiles);
    });
});

// Rota para servir arquivos específicos (pode ser usada para download ou visualização)
app.get('/servicos/:fileName', (req, res) => {
    const { fileName } = req.params;
    const filePath = path.join(__dirname, 'servicos', fileName);

    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).send('Arquivo não encontrado');
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em: http://localhost:${PORT}`);
});
