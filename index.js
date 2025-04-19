const express = require('express');
const ExcelJS = require("exceljs");
const path = require("path");
const cors = require("cors");
const fs = require('fs').promises;

const app = express();
const port = 3000;

// Middleware para aceitar JSON no corpo da requisição
app.use(express.json());

// Middleware CORS — permite requisições do domínio do frontend
app.use(cors({
  origin: "https://maxx-isn6.onrender.com", // ou "*" se quiser permitir tudo durante testes
}));

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

// Rota POST para gerar planilha
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

  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile("formulario_limpo.xlsx");
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
      fs.unlink(filepath); // Apaga o arquivo após download
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
