// ============================================
// APP.JS - Lista de Presentes de Casamento
// Aysnara & Evandro - 06/05/2026
// Com Sincronização na Nuvem (JSONBin.io)
// ============================================

// CONFIGURAÇÕES DO JSONBIN
const BIN_ID = '69d5a3f2aaba882197d4e4b5';
const API_KEY = '$2a$10$Q3UOEobQ/12x0P8MZMorteJ/zniJLV0pSy2.xtaaTjzKT5g87oML6';

let currentFilter = 'all';
let presentes = [];

// ============================================
// FUNÇÕES DE SINCRONIZAÇÃO COM A NUVEM
// ============================================

// Carregar dados da nuvem
async function carregarDaNuvem() {
    try {
        console.log("🔄 Carregando dados da nuvem...");
        
        const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
            method: 'GET',
            headers: {
                'X-Master-Key': API_KEY,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (data.record && data.record.presentes) {
            presentes = data.record.presentes;
            console.log("✅ Dados carregados da nuvem:", presentes.length, "presentes");
        } else {
            console.log("⚠️ Nenhum dado encontrado, usando dados locais");
            carregarDadosLocais();
        }
        
        salvarNoLocalStorage();
        renderPresentes();
        
        // Atualizar admin se estiver aberto
        if (typeof renderAdminPresentesList === 'function') {
            renderAdminPresentesList();
        }
        if (typeof renderPurchasedList === 'function') {
            renderPurchasedList();
        }
        
    } catch(error) {
        console.error("❌ Erro ao carregar da nuvem:", error);
        console.log("📱 Usando dados do localStorage...");
        carregarDadosLocais();
        renderPresentes();
    }
}

// Salvar dados na nuvem
async function salvarNaNuvem() {
    try {
        console.log("💾 Salvando dados na nuvem...");
        
        const dadosParaSalvar = {
            presentes: presentes,
            ultimaAtualizacao: new Date().toISOString()
        };
        
        const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
            method: 'PUT',
            headers: {
                'X-Master-Key': API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dadosParaSalvar)
        });
        
        if (response.ok) {
            console.log("✅ Dados salvos na nuvem com sucesso!");
        } else {
            console.log("⚠️ Erro ao salvar na nuvem");
        }
        
    } catch(error) {
        console.error("❌ Erro ao salvar na nuvem:", error);
    }
}

// Carregar dados locais (fallback)
function carregarDadosLocais() {
    const stored = localStorage.getItem('presentes_casamento');
    
    if (stored) {
        presentes = JSON.parse(stored);
        console.log("📱 Dados carregados do localStorage:", presentes.length, "presentes");
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
        console.log("📱 Dados iniciais criados no localStorage");
    }
    
    salvarNoLocalStorage();
}

// Salvar no localStorage e sincronizar com nuvem
function salvarNoLocalStorage() {
    localStorage.setItem('presentes_casamento', JSON.stringify(presentes));
    salvarNaNuvem();
}

// Função global para salvar dados
window.salvarDadosGlobal = async function() {
    localStorage.setItem('presentes_casamento', JSON.stringify(presentes));
    await salvarNaNuvem();
    
    // Atualizar interfaces
    renderPresentes();
    if (typeof renderAdminPresentesList === 'function') {
        renderAdminPresentesList();
    }
    if (typeof renderPurchasedList === 'function') {
        renderPurchasedList();
    }
};

// ============================================
// CONTADOR REGRESSIVO
// ============================================

function iniciarContador() {
    const daysElem = document.getElementById('days');
    if (!daysElem) return;
    
    function atualizarContador() {
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
    }
    
    atualizarContador();
    setInterval(atualizarContador, 1000);
}

// ============================================
// FUNÇÕES DOS PRESENTES
// ============================================

function loadPresentes() {
    carregarDaNuvem();
}

function renderPresentes() {
    const container = document.getElementById('presentesList');
    if (!container) return;
    
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
                        <i class="fas fa-user"></i> Comprado por: ${escapeHtml(presente.comprador || 'Anônimo')}<br>
                        <i class="fas fa-calendar"></i> Em: ${new Date(presente.dataCompra).toLocaleDateString('pt-BR')} às ${new Date(presente.dataCompra).toLocaleTimeString('pt-BR')}
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
}

window.marcarComoComprado = async function(id) {
    const presente = presentes.find(p => p.id === id);
    if (!presente || presente.comprado) return;
    
    const compradorNome = prompt('🎉 Parabéns pela compra!\n\nPor favor, digite seu nome para registrarmos sua gentileza:', 'Convidado');
    
    if (compradorNome && compradorNome.trim()) {
        presente.comprado = true;
        presente.comprador = compradorNome.trim();
        presente.dataCompra = new Date().toISOString();
        
        await window.salvarDadosGlobal();
        
        alert(`✅ Obrigado ${compradorNome}!\n\n🎁 Presente: ${presente.nome}\n💰 Valor: R$ ${presente.preco.toFixed(2)}\n\nSua gentileza foi registrada com sucesso!`);
        
    } else if (compradorNome === '') {
        alert('❌ Por favor, digite seu nome para confirmar a compra.');
    }
};

function escapeHtml(text) {
    if (!text) return '';
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
    iniciarContador();
    loadPresentes();
    setupFilters();
});
