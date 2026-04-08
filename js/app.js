// ============================================
// APP.JS - Lista de Presentes de Casamento
// Aysnara & Evandro - 06/05/2026
// ============================================

const STORAGE_KEY = 'presentes_casamento';
let currentFilter = 'all';
let presentes = [];

// ============================================
// CONTADOR REGRESSIVO - VERSÃO CORRIGIDA
// ============================================

function iniciarContador() {
    console.log("Iniciando contador..."); // Para debug
    
    // Verificar se os elementos existem
    const daysElem = document.getElementById('days');
    if (!daysElem) {
        console.log("Elementos do contador não encontrados!");
        return;
    }
    
    function atualizarContador() {
        try {
            // Data: 06 de Maio de 2026, às 16:00
            const dataCasamento = new Date(2026, 4, 6, 16, 0, 0);
            const agora = new Date();
            const diferenca = dataCasamento - agora;
            
            if (diferenca <= 0) {
                document.getElementById('days').textContent = '00';
                document.getElementById('hours').textContent = '00';
                document.getElementById('minutes').textContent = '00';
                document.getElementById('seconds').textContent = '00';
                return;
            }
            
            const dias = Math.floor(diferenca / (1000 * 60 * 60 * 24));
            const horas = Math.floor((diferenca % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutos = Math.floor((diferenca % (1000 * 60 * 60)) / (1000 * 60));
            const segundos = Math.floor((diferenca % (1000 * 60)) / 1000);
            
            document.getElementById('days').textContent = String(dias).padStart(2, '0');
            document.getElementById('hours').textContent = String(horas).padStart(2, '0');
            document.getElementById('minutes').textContent = String(minutos).padStart(2, '0');
            document.getElementById('seconds').textContent = String(segundos).padStart(2, '0');
            
            console.log("Contador atualizado:", dias, "dias");
        } catch(error) {
            console.log("Erro no contador:", error);
        }
    }
    
    atualizarContador();
    setInterval(atualizarContador, 1000);
}

// ============================================
// FUNÇÕES DOS PRESENTES - VERSÃO CORRIGIDA
// ============================================

function loadPresentes() {
    console.log("Carregando presentes...");
    
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        
        if (stored) {
            presentes = JSON.parse(stored);
            console.log("Presentes carregados do localStorage:", presentes.length);
        } else {
            // Dados iniciais
            presentes = [
                {
                    id: 1,
                    nome: "Jogo de Panelas Antiaderentes",
                    url: "https://www.magazineluiza.com.br/",
                    preco: 299.90,
                    imagem: "https://via.placeholder.com/300x200/D67A5A/FFFFFF?text=Jogo+de+Panelas",
                    comprado: false,
                    comprador: null,
                    dataCompra: null
                },
                {
                    id: 2,
                    nome: "Kit Taças de Cristal",
                    url: "https://www.americanas.com.br/",
                    preco: 159.90,
                    imagem: "https://via.placeholder.com/300x200/D67A5A/FFFFFF?text=Taças+de+Cristal",
                    comprado: false,
                    comprador: null,
                    dataCompra: null
                },
                {
                    id: 3,
                    nome: "Jogo de Cama Casal 400 fios",
                    url: "https://www.mercadolivre.com.br/",
                    preco: 249.90,
                    imagem: "https://via.placeholder.com/300x200/D67A5A/FFFFFF?text=Jogo+de+Cama",
                    comprado: false,
                    comprador: null,
                    dataCompra: null
                }
            ];
            savePresentes();
            console.log("Dados iniciais criados");
        }
        
        renderPresentes();
    } catch(error) {
        console.log("Erro ao carregar presentes:", error);
    }
}

function savePresentes() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(presentes));
    console.log("Presentes salvos");
}

function renderPresentes() {
    const container = document.getElementById('presentesList');
    if (!container) {
        console.log("Container 'presentesList' não encontrado!");
        return;
    }
    
    console.log("Renderizando presentes, total:", presentes.length);
    
    let filteredPresentes = presentes;
    if (currentFilter === 'available') {
        filteredPresentes = presentes.filter(p => !p.comprado);
    } else if (currentFilter === 'purchased') {
        filteredPresentes = presentes.filter(p => p.comprado);
    }
    
    if (filteredPresentes.length === 0) {
        container.innerHTML = '<div class="loading">Nenhum presente encontrado nesta categoria.</div>';
        return;
    }
    
    container.innerHTML = filteredPresentes.map(presente => `
        <div class="presente-card" data-id="${presente.id}">
            <img src="${presente.imagem || 'https://via.placeholder.com/300x200/E8C9BC/4A3728?text=Sem+Imagem'}" 
                 alt="${presente.nome}" 
                 class="presente-imagem"
                 onerror="this.src='https://via.placeholder.com/300x200/E8C9BC/4A3728?text=Imagem+não+disponível'">
            <div class="presente-info">
                <h3 class="presente-nome">${escapeHtml(presente.nome)}</h3>
                <p class="presente-preco">R$ ${presente.preco.toFixed(2)}</p>
                <span class="presente-status ${presente.comprado ? 'status-comprado' : 'status-disponivel'}">
                    ${presente.comprado ? '✓ Comprado' : '✓ Disponível'}
                </span>
                ${presente.comprado ? `
                    <p style="font-size: 0.85rem; color: var(--text-light); margin-bottom: 15px;">
                        Comprado por: ${escapeHtml(presente.comprador || 'Anônimo')}<br>
                        Em: ${new Date(presente.dataCompra).toLocaleDateString('pt-BR')}
                    </p>
                ` : ''}
                <a href="${presente.url}" target="_blank" class="presente-link ${presente.comprado ? 'btn-comprado' : ''}">
                    ${presente.comprado ? 'Presente já foi comprado' : 'Ver na Loja →'}
                </a>
                ${!presente.comprado ? `
                    <button onclick="marcarComoComprado(${presente.id})" class="presente-link btn-comprar">
                        <i class="fas fa-gift"></i> Já comprei este presente
                    </button>
                ` : ''}
            </div>
        </div>
    `).join('');
    
    console.log("Renderização concluída");
}

window.marcarComoComprado = function(id) {
    console.log("Marcando como comprado:", id);
    
    const presente = presentes.find(p => p.id === id);
    if (!presente || presente.comprado) return;
    
    const compradorNome = prompt('Parabéns pela compra! Por favor, digite seu nome para registrarmos sua gentileza:', 'Convidado');
    
    if (compradorNome && compradorNome.trim()) {
        presente.comprado = true;
        presente.comprador = compradorNome.trim();
        presente.dataCompra = new Date().toISOString();
        savePresentes();
        renderPresentes();
        alert(`Obrigado ${compradorNome}! O presente "${presente.nome}" foi marcado como comprado.`);
    } else if (compradorNome === '') {
        alert('Por favor, digite seu nome para confirmar a compra.');
    }
};

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function setupFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderPresentes();
        });
    });
}

// ============================================
// INICIALIZAÇÃO
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    console.log("Página carregada, iniciando...");
    iniciarContador();
    loadPresentes();
    setupFilters();
});
