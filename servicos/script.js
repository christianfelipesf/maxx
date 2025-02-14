// Carregar dados do LocalStorage
let contador = localStorage.getItem("contador") ? parseInt(localStorage.getItem("contador")) : 0;
let atendimentosWhatsApp = localStorage.getItem("atendimentosWhatsApp") ? parseInt(localStorage.getItem("atendimentosWhatsApp")) : 0;
let indicacoes = localStorage.getItem("indicacoes") ? parseInt(localStorage.getItem("indicacoes")) : 0;
let servicos = JSON.parse(localStorage.getItem("servicos")) || [];
let nomeLoja = localStorage.getItem("nomeLoja") || "";

if (nomeLoja) {
// Atribua a função que você deseja chamar aqui
    document.getElementById("nomeLoja").disabled = true; // Desabilita o input
}

// Carregar nome da loja e exibir
document.getElementById("nomeLoja").value = nomeLoja;
document.getElementById("contador").innerText = contador;
document.getElementById("whatsappContador").innerText = atendimentosWhatsApp;
document.getElementById("indicacoes").value = indicacoes;
carregarServicos();

// Funções de adicionar e diminuir clientes
function adicionar() {
    contador++;
    localStorage.setItem("contador", contador);
    document.getElementById("contador").innerText = contador;
}

function diminuir() {
    if (contador > 0) {
        contador--;
        localStorage.setItem("contador", contador);
    }
    document.getElementById("contador").innerText = contador;
}

// Funções de adicionar e diminuir atendimentos via WhatsApp
function adicionarWhatsApp() {
    atendimentosWhatsApp++;
    localStorage.setItem("atendimentosWhatsApp", atendimentosWhatsApp);
    document.getElementById("whatsappContador").innerText = atendimentosWhatsApp;
}

function diminuirWhatsApp() {
    if (atendimentosWhatsApp > 0) {
        atendimentosWhatsApp--;
        localStorage.setItem("atendimentosWhatsApp", atendimentosWhatsApp);
    }
    document.getElementById("whatsappContador").innerText = atendimentosWhatsApp;
}

// Salvar e carregar o número de indicações
document.getElementById("indicacoes").addEventListener("input", function() {
    indicacoes = parseInt(document.getElementById("indicacoes").value);
    localStorage.setItem("indicacoes", indicacoes);
});

// Trancar ou destrancar o campo de nome da loja
function trancarDestrancar() {
    const nomeLojaInput = document.getElementById("nomeLoja");
    const nomeLojaBotao = document.querySelector("button.is-small.is-primary");

    if (nomeLojaInput.disabled) {
        nomeLojaInput.disabled = false;
        nomeLojaBotao.innerText = "Salvar Nome";
    } else {
        nomeLojaInput.disabled = true;
        localStorage.setItem("nomeLoja", nomeLojaInput.value);
        nomeLojaBotao.innerText = "Alterar Nome";
    }
}

// Adicionar serviço ao dia
function adicionarServico() {
    const tipoServico = prompt("Digite o tipo de serviço:");

    if (tipoServico) {
        // Adiciona o serviço com quantidade 0
        servicos.push({ tipo: tipoServico, quantidade: 0 });
        localStorage.setItem("servicos", JSON.stringify(servicos));
        carregarServicos();
    }
}

// Carregar e exibir os serviços
function carregarServicos() {
    const container = document.getElementById("servicos");
    container.innerHTML = ""; // Limpar serviços exibidos

    servicos.forEach((servico, index) => {
        const div = document.createElement("div");
        div.classList.add("field");
        div.innerHTML = `
            <label class="label">${servico.tipo}</label>
            <div class="control">
                <input class="input" type="text" value="${servico.tipo}" disabled>
            </div>
            <label class="label">Quantidade</label>
            <div class="control">
                <input class="input" type="number" value="${servico.quantidade}" onchange="atualizarQuantidade(${index}, this.value)">
                <button class="button is-small is-info" onclick="alterarQuantidade(${index}, 1)">+</button>
                <button class="button is-small is-danger" onclick="alterarQuantidade(${index}, -1)">-</button>
            </div>
        `;
        container.appendChild(div);
    });
}

// Alterar a quantidade de um serviço específico
function alterarQuantidade(index, valor) {
    servicos[index].quantidade += valor;
    if (servicos[index].quantidade < 0) servicos[index].quantidade = 0; // Não permite quantidade negativa
    localStorage.setItem("servicos", JSON.stringify(servicos));
    carregarServicos();
}

// Atualizar a quantidade de um serviço específico via input
function atualizarQuantidade(index, novaQuantidade) {
    servicos[index].quantidade = parseInt(novaQuantidade);
    localStorage.setItem("servicos", JSON.stringify(servicos));
}

// Copiar dados para o clipboard
function copiarDados() {
const nomeLoja = document.getElementById("nomeLoja").value || "Loja Desconhecida";
const dataAtual = new Date().toLocaleDateString('pt-BR');
const servicosTexto = servicos.map(servico => `${servico.tipo}: ${servico.quantidade}`).join("\n");

const texto = `✅Data: ${dataAtual}

✅Quantidade de atendimento: ${atendimentosWhatsApp} via WhatsApp
${contador - atendimentosWhatsApp} em loja

✅Serviços prestados:
${servicosTexto}

✅Indicação: ${indicacoes} até o momento

✅Nome da Loja: ${nomeLoja}`;

        navigator.clipboard.writeText(texto).then(() => {
            alert("Dados copiados com sucesso!");
        }).catch(err => {
            console.error("Erro ao copiar: ", err);
        });
    }

// Exportar dados como arquivo de texto
function exportarDados() {
    const nomeLoja = prompt("Digite o nome da loja para exportar os dados:");
    if (!nomeLoja) {
        alert("Nome da loja é obrigatório!");
        return;
    }

    const dataAtual = new Date().toLocaleDateString('pt-BR');
    const servicosTexto = servicos.map(servico => `${servico.tipo}: ${servico.quantidade}`).join("\n");

    const texto = `✅Data: ${dataAtual}

✅Quantidade de atendimento: ${atendimentosWhatsApp} via WhatsApp
${contador} em loja

✅Serviços prestados:
${servicosTexto}

✅Indicação: ${indicacoes} até o momento`;

    const blob = new Blob([texto], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Controle_Diario_${nomeLoja.replace(/\s+/g, '_')}_${dataAtual.replace(/\//g, '-')}.txt`;
    link.click();
}

function zerarTudo() {
// Exibir um aviso antes de apagar os dados
let confirmar = confirm("Tem certeza de que deseja apagar todos os dados? Esta ação não pode ser desfeita.");

if (confirmar) {
    localStorage.clear();
    contador = 0;
    atendimentosWhatsApp = 0;
    indicacoes = 0;
    servicos = [];
    localStorage.setItem("contador", contador);
    localStorage.setItem("atendimentosWhatsApp", atendimentosWhatsApp);
    localStorage.setItem("indicacoes", indicacoes);
    localStorage.setItem("servicos", JSON.stringify(servicos));

    // Atualizar a tela
    document.getElementById("nomeLoja").value = ""; 
    document.getElementById("nomeLoja").disabled = false; 

    document.getElementById("contador").innerText = contador;
    document.getElementById("whatsappContador").innerText = atendimentosWhatsApp;
    document.getElementById("indicacoes").value = indicacoes;
    carregarServicos();

    //alert("Todos os dados foram apagados com sucesso!");
} /*else {
    alert("Ação cancelada. Nenhum dado foi apagado.");
}*/
}