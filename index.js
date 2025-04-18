const express = require('express');
const path = require('path');
const fs = require('fs').promises; // Usamos a versão de promises para assincronismo

const app = express();
const port = 3000;

// Defina o diretório onde os arquivos estáticos estão localizados como a pasta atual
// Isso torna todos os arquivos na raiz acessíveis diretamente via URL
app.use(express.static(__dirname));

// Rota para a página inicial (opcional, mas mantém a URL limpa para a raiz)
// O express.static já serviria indexnewst.html automaticamente se for o único index.*
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'indexnewst.html')); // Assume que indexnewst.html está na raiz
});

// Endpoint para listar os serviços (arquivos HTML na pasta raiz)
app.get('/api/services', async (req, res) => {
    const rootPath = __dirname; // Caminho para a pasta raiz
    // Lista de arquivos para EXCLUIR da lista de serviços
    const excludedFiles = ['index.js', 'indexnewst.html', 'package.json', 'package-lock.json', 'node_modules']; // Adicione outros arquivos/pastas conforme necessário

    try {
        // Lê o conteúdo do diretório raiz
        const files = await fs.readdir(rootPath);

        // Filtra:
        // 1. Apenas arquivos com extensão .html
        // 2. Exclui arquivos listados em excludedFiles
        // 3. Garante que seja um arquivo e não um diretório (fs.stat) - Mais robusto
         const htmlFiles = [];
         for (const file of files) {
             const filePath = path.join(rootPath, file);
             const stats = await fs.stat(filePath); // Obtém informações do arquivo/diretório

             if (stats.isFile() && file.endsWith('.html') && !excludedFiles.includes(file)) {
                 htmlFiles.push(file); // Adiciona apenas o nome do arquivo
             }
         }


        // Retorna a lista de nomes de arquivos HTML como JSON
        res.json(htmlFiles);

    } catch (error) {
        console.error('Erro ao ler a pasta raiz para serviços:', error);
        // Em caso de erro, retorna um erro 500
        res.status(500).json({ message: 'Erro ao listar os serviços.', error: error.message });
    }
});


// Inicie o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});