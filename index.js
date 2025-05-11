const express = require('express');
const ExcelJS = require("exceljs");
const path = require("path");
const cors = require("cors");
const fs = require('fs').promises;

const QRCode = require("qrcode");
const PDFDocument = require("pdfkit");

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

  // Lista de serviços que NÃO devem aparecer no frontend
  const servicosExcluidos = ['osiris_download.html', 'teste.html'];

  try {
    const files = await fs.readdir(servicesPath);
    const htmlFiles = [];

    for (const file of files) {
      const filePath = path.join(servicesPath, file);
      const stats = await fs.stat(filePath);

      if (stats.isFile() && file.endsWith('.html') && !servicosExcluidos.includes(file)) {
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
  const nomeArquivo = dados.nomeArquivo; // Recebe o nome do arquivo do frontend
  console.log(dados);

  try {
    if (!nomeArquivo) {
      return res.status(400).json({ message: "O nome do arquivo não foi enviado." });
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(nomeArquivo); // Usa o nome do arquivo enviado
    const worksheet = workbook.worksheets[0];

    for (let cell in dados) {
      const valor = dados[cell];
      
      
      // Verifica se a célula existe antes de atribuir o valor
      if (cell.length <= 3 && (typeof valor === 'string' || typeof valor === 'number')) {
        const celula = worksheet.getCell(cell);
        celula.value = valor;
        console.log(`Transferindo Célula ${cell} -> ${celula}`);
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

// Rota para gerar o PDF com QR Code de Wi-Fi
app.post('/gerar-pdf-wifi', async (req, res) => {
  const { ssid, password } = req.body;

  if (!ssid || !password) {
    return res.status(400).json({ message: 'SSID e senha são obrigatórios.' });
  }

  const wifiString = `WIFI:T:WPA;S:${ssid};P:${password};;`;

  try {
    const qrDataUrl = await QRCode.toDataURL(wifiString);
    const doc = new PDFDocument();
    const filename = `wifi_${Date.now()}.pdf`;
    const filepath = path.join(__dirname, filename);
    const stream = doc.pipe(require('fs').createWriteStream(filepath));

    doc.fontSize(20).text('Informações de Wi-Fi', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text(`SSID: ${ssid}`);
    doc.text(`Senha: ${password}`);
    doc.moveDown();

    const base64Data = qrDataUrl.replace(/^data:image\/png;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');

    doc.image(buffer, {
      fit: [200, 200],
      align: 'center'
    });

    doc.end();

    stream.on('finish', () => {
      res.download(filepath, filename, () => {
        fs.unlink(filepath).catch(err => console.error("Erro ao remover arquivo:", err));
      });
    });

  } catch (err) {
    console.error("Erro ao gerar PDF de Wi-Fi:", err);
    res.status(500).json({ message: 'Erro ao gerar o PDF.' });
  }
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
