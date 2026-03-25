// Criamos um objeto para guardar o índice de cada carrossel separadamente
let indicesCarrossel = {
    'track1': 0,
    'track2': 0
};

function moverCarrossel(direcao, idTrack) {
    const track = document.getElementById(idTrack);
    const produtos = track.querySelectorAll('.produto');
    const totalProdutos = produtos.length;
    
    // Pega a largura do produto
    const larguraProduto = produtos[0].offsetWidth + 20; 

    // Atualiza o índice específico deste carrossel
    indicesCarrossel[idTrack] += direcao;

    // Lógica de limites para este carrossel específico
    if (indicesCarrossel[idTrack] < 0) {
        indicesCarrossel[idTrack] = 0;
    } else if (indicesCarrossel[idTrack] > totalProdutos - 1) {
        indicesCarrossel[idTrack] = totalProdutos - 1; 
    }

    // Aplica o movimento apenas no track correto
    const deslocamento = -indicesCarrossel[idTrack] * larguraProduto;
    track.style.transform = `translateX(${deslocamento}px)`;
}
function irParaResultados() {
    const termo = document.getElementById('inputBusca').value;
    if (termo.trim() !== "") {
        // Redireciona passando o termo na URL
        window.location.href = `index_Resultados.html?busca=${encodeURIComponent(termo)}`;
    } else {
        // Se estiver vazio, apenas vai para a página
        window.location.href = `index_Resultados.html`;
    }
}
// UNIFICANDO O CARREGAMENTO DA PÁGINA
window.onload = function() {
    // 1. Renderiza o carrinho (essencial para todas as páginas)
    renderizarCarrinho();

    // 2. Lógica de Busca: Verifica se veio um termo pela URL
    const urlParams = new URLSearchParams(window.location.search);
    const termoBuscado = urlParams.get('busca');

    if (termoBuscado) {
        const inputBusca = document.getElementById('inputBusca');
        if (inputBusca) {
            inputBusca.value = decodeURIComponent(termoBuscado);
            // Pequeno delay para garantir que o navegador carregou os produtos antes de filtrar
            setTimeout(filtrarProdutos, 100); 
        }
    }
};
const inputElement = document.getElementById('inputBusca');
if (inputElement) {
    inputElement.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            irParaResultados();
        }
    });
}

// --- LÓGICA DA BUSCA ---
function filtrarProdutos() {
    let input = document.getElementById('inputBusca').value.toLowerCase();
    let produtos = document.getElementsByClassName('produto');
    let mensagem = document.getElementById('mensagemNaoEncontrado');
    let encontrados = 0;

    for (let i = 0; i < produtos.length; i++) {
        let titulo = produtos[i].getElementsByTagName('h2')[0].innerText.toLowerCase();
        if (titulo.includes(input)) {
            produtos[i].style.display = ""; 
            encontrados++;
        } else {
            produtos[i].style.display = "none";
        }
    }

    if (mensagem) {
        mensagem.style.display = (encontrados === 0) ? "block" : "none";
    }
}

// --- LÓGICA DO CARRINHO ---
let carrinho = JSON.parse(localStorage.getItem('carrinhoSalvo')) || [];


function adicionarAoCarrinho(botao, nomeBase, precoBase) {
    // 1. Encontra o card do produto onde o botão foi clicado
    const produtoCard = botao.closest('.produto');

    // 2. Busca todos os selects dentro desse card específico
    const selects = produtoCard.querySelectorAll('select');
    
    let precoAdicional = 0;
    let detalhes = [];

    selects.forEach(select => {
        const valorRaw = select.value; // Pega o valor (ex: "200|16gb" ou "Intel")

        if (valorRaw.includes('|')) {
            // Se tiver o símbolo |, separa o preço do nome
            const partes = valorRaw.split('|');
            precoAdicional += parseFloat(partes[0]); // Soma o valor extra (200)
            detalhes.push(partes[1]); // Guarda o nome da peça (16gb)
        } else {
            // Se não tiver |, é apenas o nome (ex: "Intel")
            detalhes.push(valorRaw);
        }
    });

    // 3. Calcula o preço final e formata o nome
    const precoFinal = precoBase + precoAdicional;
    const infoExtra = detalhes.length > 0 ? ` (${detalhes.join(', ')})` : "";
    const nomeCompleto = nomeBase + infoExtra;

    // 4. Adiciona ao carrinho e atualiza a tela
    carrinho.push({ nome: nomeCompleto, preco: precoFinal });
    renderizarCarrinho();

    // Feedback para o usuário
    console.log("Adicionado:", nomeCompleto, "Preço:", precoFinal);
}

function renderizarCarrinho() {
    const listaHtml = document.getElementById('itensCarrinho');
    const totalHtml = document.getElementById('valorTotal');
    const contadorHtml = document.getElementById('contador-carrinho');
    
    if (!listaHtml) return; // Proteção caso não exista a lista na página

    listaHtml.innerHTML = ""; 
    let totalAcumulado = 0;

    carrinho.forEach((item, index) => {
        listaHtml.innerHTML += `
            <li>
                ${item.nome} - R$ ${item.preco.toFixed(2)}
                <button onclick="removerDoCarrinho(${index})" style="padding:0 5px; margin-left:10px; cursor:pointer;">x</button>
            </li>`;
        totalAcumulado += item.preco;
    });

    if (totalHtml) totalHtml.innerText = totalAcumulado.toFixed(2);
    if (contadorHtml) contadorHtml.innerText = carrinho.length;

    // Salva no navegador para não perder ao atualizar a página
    localStorage.setItem('carrinhoSalvo', JSON.stringify(carrinho));
}

function removerDoCarrinho(index) {
    carrinho.splice(index, 1);
    renderizarCarrinho();
}

function limparCarrinho() {
    carrinho = [];
    localStorage.removeItem('carrinhoSalvo');
    renderizarCarrinho();
}
// --- LÓGICA DO CHECKOUT (WHATSAPP) ---

// 1. Primeiro, precisamos "pegar" o botão do HTML
const checkoutBtn = document.getElementById('checkout');

if (checkoutBtn) {
    checkoutBtn.addEventListener("click", function() {
        // Se o carrinho estiver vazio, avisa o usuário
        if (carrinho.length === 0) {
            alert("Seu carrinho está vazio!");
            return;
        }

        let message = "Olá, gostaria de finalizar meu pedido:%0A%0A";
        let totalFinal = 0;

        // 2. Usamos o array 'carrinho' que já existe no seu código
        carrinho.forEach((item, index) => {
            message += `${index + 1}. *${item.nome}* - R$ ${item.preco.toFixed(2)}%0A`;
            totalFinal += item.item ? item.item.preco : item.preco; // Garante que pega o preço correto
        });

        // Pega o valor total que aparece na tela
        const totalTexto = document.getElementById('valorTotal').innerText;
        message += `%0A*Total: R$ ${totalTexto}*`;

        // 3. Configura o número e a URL
        const phone = "5511999999999"; // Substitua pelo seu número real
        const url = `https://wa.me/${phone}?text=${message}`;

        // 4. Abre o WhatsApp
        window.open(url, "_blank");
    });
}