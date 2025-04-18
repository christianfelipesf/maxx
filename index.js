const express = require('express');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const port = 3000;

// Defina o diretório onde os arquivos estáticos estão localizados como a pasta ATUAL (__dirname)
// *** E configure qual arquivo usar como índice padrão para diretórios ***
app.use(express.static(__dirname, { index: 'indexnewst.html' }));

// *** Remova a rota explícita para '/', pois express.static agora lida com isso ***
// app.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname, 'indexnewst.html'));
// });


// Endpoint para listar os serviços (arquivos HTML DENTRO da pasta 'servicos/')
app.get('/api/services', async (req, res) => {
    // Caminho para a pasta 'servicos' que está diretamente na raiz do projeto
    const servicesPath = path.join(__dirname, 'servicos');

    try {
        // Lê o conteúdo do diretório 'servicos'
        const files = await fs.readdir(servicesPath);

        // Filtra apenas:
        // 1. Aquilo que é um arquivo (não subpasta, etc.)
        // 2. Aquilo que tem a extensão .html
        const htmlFiles = [];
         for (const file of files) {
             const filePath = path.join(servicesPath, file);
             const stats = await fs.stat(filePath);

             if (stats.isFile() && file.endsWith('.html')) {
                 htmlFiles.push(file); // Adiciona apenas o nome do arquivo
             }
         }

        // Retorna a lista de nomes de arquivos HTML como JSON
        res.json(htmlFiles);

    } catch (error) {
        console.error('Erro ao ler a pasta de serviços:', error);
        res.status(500).json({ message: 'Erro ao listar os serviços.', error: error.message });
    }
});


// Inicie o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});