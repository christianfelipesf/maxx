const express = require('express');
const ExcelJS = require("exceljs");
const path = require("path");
const cors = require("cors");
const fs = require('fs').promises;

const app = express();
const port = 3000;

// Defina o diretório onde os arquivos estáticos estão localizados como a pasta ATUAL (__dirname)
// *** E configure qual arquivo usar como índice padrão para diretórios ***
app.use(express.static(__dirname, { index: 'indexnewst.html' }));
app.use(cors());
app.use(cors({
  origin: "https://maxx-isn6.onrender.com",
}));
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

app.post("/gerar-planilha", async (req, res) => {
  const formulas = {
    C9: "NOME",
    C13: "FONE",
    D15: "BANCO",
    E15: "AGENCIA",
    F15: "CONTA_CORRENTE",
    C15: "CODIGO_PIX",
    C21: "DATA_INICIAL",
    D21: "DATA_FINAL",
    F21: "DIAS_CORRIDOS",
    C23: "MOTIVO_DAS_DESPESAS",
    D61: "VALOR_TOTAL",
    C70: "NOME_SOLICITANTE",
    D70: "DATA",
  };
  const dados = req.body;

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile("ad4.xlsx");
  const worksheet = workbook.worksheets[0];

  for (const cell in formulas) {
    const campo = formulas[cell];
    if (dados[campo]) {
      worksheet.getCell(cell).value = dados[campo];
    }
  }

  let row = 27;
  dados.produtos.forEach((produto) => {
    worksheet.getCell(`C${row}`).value = `${produto.nome} (${produto.quantidade})`;
    worksheet.getCell(`D${row}`).value = Number(produto.total);
    worksheet.getCell(`E${row}`).value = Number(produto.valor);
    row++;
  });

  const filename = `despesas-${Date.now()}.xlsx`;
  const filepath = path.join(__dirname, filename);
  await workbook.xlsx.writeFile(filepath);

  res.download(filepath, "Formulario_Preenchido.xlsx", () => {
    fs.unlinkSync(filepath);
  });
});

// Inicie o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});