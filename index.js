const express = require('express');
const path = require('path');
const fs = require('fs').promises; // Usamos a versão de promises para assincronismo

const app = express();
const port = 3000;

// Defina o diretório onde os arquivos estáticos (HTML, CSS, JS) estão localizados
// Certifique-se de que a pasta 'servicos' esteja dentro de 'public'
app.use(express.static(path.join(__dirname, 'public'))); // pasta "public"

// Rota para a página inicial
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'indexnewst.html')); // Altere para o nome correto do seu arquivo
});

// NOVA ROTA: Endpoint para listar os serviços (arquivos HTML)
app.get('/api/services', async (req, res) => {
    const servicesPath = path.join(__dirname, 'public', 'servicos'); // Caminho para a pasta servicos

    try {
        // Lê o conteúdo do diretório
        const files = await fs.readdir(servicesPath);

        // Filtra apenas os arquivos com extensão .html
        const htmlFiles = files.filter(file => file.endsWith('.html'));

        // Retorna a lista de nomes de arquivos HTML como JSON
        res.json(htmlFiles);

    } catch (error) {
        console.error('Erro ao ler a pasta de serviços:', error);
        // Em caso de erro (por exemplo, pasta não encontrada), retorna um erro 500
        res.status(500).json({ message: 'Erro ao listar os serviços.', error: error.message });
    }
});


// Inicie o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});