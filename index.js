const express = require('express');
const ExcelJS = require("exceljs");
const path = require("path");
const cors = require("cors");
const fs = require('fs').promises;

const app = express();
const port = 3000;

// Middleware para aceitar JSON no corpo da requisição
app.use(express.json());

const crypto = require("crypto");


// Middleware CORS — permite requisições do domínio do frontend
app.use(cors({ origin: "*" }));

// Servir arquivos estáticos
app.use(express.static(__dirname, { index: 'indexnewst.html' }));

// Rota para listar arquivos HTML da pasta 'servicos'
app.get('/api/services', async (req, res) => {
  const servicesPath = path.join(__dirname, 'servicos');

  try {
    const files = await fs.readdir(servicesPath);
    const htmlFiles = [];

    for (const file of files) {
      const filePath = path.join(servicesPath, file);
      const stats = await fs.stat(filePath);

      if (stats.isFile() && file.endsWith('.html')) {
        htmlFiles.push(file);
      }
    }

    res.json(htmlFiles);
  } catch (error) {
    console.error('Erro ao ler a pasta de serviços:', error);
    res.status(500).json({ message: 'Erro ao listar os serviços.', error: error.message });
  }
});
// Gera um nome de arquivo com hash aleatório
const generateFilename = () => {
  return crypto.randomBytes(8).toString("hex") + ".xlsx";
};

app.post("/gerar-planilha", async (req, res) => {
  const dados = req.body;
  console.log(dados);

  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile("formulario_limpo.xlsx");
    const worksheet = workbook.worksheets[0];

    for (let cell in dados) {
      const valor = dados[cell];
      if (typeof valor === 'string' || typeof valor === 'number') {
        worksheet.getCell(cell).value = valor;
      }
    }

    let row = 27;
    dados.produtos.forEach((produto) => {
      worksheet.getCell(`C${row}`).value = `${produto.nome} (${produto.quantidade})`;
      worksheet.getCell(`D${row}`).value = Number(produto.total);
      worksheet.getCell(`E${row}`).value = Number(produto.valor);
      row++;
    });

    const filename = generateFilename();
    res.setHeader("X-Filename", filename);

    const filepath = path.join(__dirname, filename);
    await workbook.xlsx.writeFile(filepath);

    res.download(filepath, filename, () => {
      fs.unlink(filepath, (err) => {
        if (err) console.error("Erro ao deletar o arquivo:", err);
      });
    });

  } catch (error) {
    console.error("Erro ao gerar planilha:", error);
    res.status(500).json({ message: "Erro ao gerar a planilha.", error: error.message });
  }
});


// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
