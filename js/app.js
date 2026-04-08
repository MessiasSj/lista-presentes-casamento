// ============================================
// APP.JS - Lista de Presentes de Casamento
// Sincronização com Sheet.best (Nuvem)
// CORRIGIDO: Exclusão, Adição e Compra funcionando
// ============================================

// SUA URL DO SHEET.BEST
const API_URL = 'https://api.sheetbest.com/sheets/b9510bd2-4034-435c-947b-6cd5cb677199';

let currentFilter = 'all';
let presentes = [];

// ============================================
// FUNÇÕES DE SINCRONIZAÇÃO COM A NUVEM
// ============================================

// Carregar dados da planilha
async function carregarDaNuvem() {
    try {
        console.log("🔄 Carregando dados da planilha...");
        
        const response = await fetch(API_URL);
        
        if (!response.ok) throw new Error('Falha na requisição');
        
        const dados = await response.json();
        
        if (dados && dados.length > 0) {
            // Converter os dados para o formato padronizado
            presentes = dados.map(item => ({
                id: String(item.id),
                nome: item.nome,
                url: item.url,
                preco: parseFloat(String(item.preco).replace('R$', '').replace(',', '.').trim()),
                imagem: item.imagem || '',
                comprado: item.comprado === 'TRUE' || item.comprado === true,
                comprador: item.comprador || null,
                dataCompra: item.dataCompra || null
            }));
            console.log("✅ Dados carregados da nuvem:", presentes.length, "presentes");
        } else {
            console.log("⚠️ Nenhum dado encontrado na planilha");
            presentes = [];
        }
        
        salvarNoLocalStorage();
        renderPresentes();
        
        // Atualizar admin se estiver logado
        if (typeof window.atualizarAdmin === 'function') {
            window.atualizarAdmin();
        }
        
    } catch(error) {
        console.error("❌ Erro ao carregar da nuvem:", error);
        console.log("📱 Usando dados do localStorage...");
        carregarDadosLocais();
        renderPresentes();
    }
}

// Função para atualizar um presente específico (PUT)
async function atualizarPresenteNaNuvem(presenteAtualizado) {
    try {
        // Busca o presente pelo ID
        const response = await fetch(`${API_URL}/id/${presenteAtualizado.id}`);
        const dados = await response.json();
        
        if (dados && dados.length > 0) {
            const linhaId = dados[0].id; // Pega o ID da linha
            
            // Prepara os dados atualizados
            const dadosAtualizados = {
                nome: presenteAtualizado.nome,
                url: presenteAtualizado.url,
                preco: `R$${presenteAtualizado.preco.toFixed(2).replace('.', ',')}`,
                imagem: presenteAtualizado.imagem || '',
                comprado: presenteAtualizado.comprado ? 'TRUE' : 'FALSE',
                comprador: presenteAtualizado.comprador || '',
                dataCompra: presenteAtualizado.dataCompra || ''
            };
            
            // Atualiza a linha específica
            const updateResponse = await fetch(`${API_URL}/id/${linhaId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosAtualizados)
            });
            
            if (updateResponse.ok) {
                console.log("✅ Presente atualizado na nuvem!");
                return true;
            }
        }
        return false;
    } catch(error) {
        console.error("❌ Erro ao atualizar:", error);
        return false;
    }
}

// Salvar TODOS os dados na planilha (usado para adicionar/excluir)
async function salvarNaNuvem() {
    try {
        console.log("💾 Salvando dados na nuvem...");
        
        // Prepara os dados para enviar
        const dadosParaSalvar = presentes.map(p => ({
            id: p.id,
            nome: p.nome,
            url: p.url,
            preco: `R$${p.preco.toFixed(2).replace('.', ',')}`,
            imagem: p.imagem || '',
            comprado: p.comprado ? 'TRUE' : 'FALSE',
            comprador: p.comprador || '',
            dataCompra: p.dataCompra || ''
        }));
        
        // Primeiro, limpa todos os dados existentes
        await fetch(API_URL, { method: 'DELETE' });
        
        // Depois, envia os dados atualizados
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosParaSalvar)
        });
        
        if (response.ok) {
            console.log("✅ Dados salvos na nuvem com sucesso!");
            return true;
        } else {
            console.log("⚠️ Erro ao salvar na nuvem");
            return false;
        }
        
    } catch(error) {
        console.error("❌ Erro ao salvar na nuvem:", error);
        return false;
    }
}

// Carregar dados locais (fallback)
function carregarDadosLocais() {
    const stored = localStorage.getItem('presentes_casamento');
    
    if (stored) {
        presentes = JSON.parse(stored);
        console.log("📱 Dados carregados do localStorage:", presentes.length, "presentes");
    } else {
        // Dados iniciais (apenas se não houver nada)
        if (presentes.length === 0) {
            presentes = [
                {
                    id: Date.now().toString(),
                    nome: "Jogo de Panelas Antiaderentes",
                    url: "https://www.magazineluiza.com.br/",
                    preco: 299.90,
                    imagem: "https://via.placeholder.com/300x200/D67A5A/FFFFFF?text=Jogo+de+Panelas",
                    comprado: false,
                    comprador: null,
                    dataCompra: null
                }
            ];
            console.log("📱 Dados iniciais criados");
            salvarNaNuvem(); // Sincroniza com a nuvem
        }
    }
    
    salvarNoLocalStorage();
}

// Salvar no localStorage
function salvarNoLocalStorage() {
    localStorage.setItem('presentes_casamento', JSON.stringify(presentes));
}

// Função global para salvar dados (usada pelo admin)
window.salvarDadosGlobal = async function() {
    salvarNoLocalStorage();
    const sucesso = await salvarNaNuvem();
    renderPresentes();
    
    // Atualizar admin se necessário
    if (typeof window.atualizarAdmin === 'function') {
        window.atualizarAdmin();
    }
    
    if (sucesso) {
        console.log("✅ Sincronização completa!");
    } else {
        console.warn("⚠️ Dados salvos apenas localmente. Verifique sua conexão.");
    }
};

// Função para marcar como comprado (atualização individual)
window.marcarComoComprado = async function(id) {
    const presente = presentes.find(p => String(p.id) === String(id));
    if (!presente || presente.comprado) return;
    
    const compradorNome = prompt('🎉 Parabéns pela compra!\n\nPor favor, digite seu nome para registrarmos sua gentileza:', 'Convidado');
    
    if (compradorNome && compradorNome.trim()) {
        presente.comprado = true;
        presente.comprador = compradorNome.trim();
        presente.dataCompra = new Date().toISOString();
        
        // Tenta atualizar individualmente primeiro
        const atualizado = await atualizarPresenteNaNuvem(presente);
        
        if (!atualizado) {
            // Se falhar, faz o save completo
            await salvarNaNuvem();
        }
        
        salvarNoLocalStorage();
        renderPresentes();
        
        // Atualizar admin se necessário
        if (typeof window.atualizarAdmin === 'function') {
            window.atualizarAdmin();
        }
        
        alert(`✅ Obrigado ${compradorNome}!\n\n🎁 Presente: ${presente.nome}\n💰 Valor: R$ ${presente.preco.toFixed(2)}\n\nSua gentileza foi registrada com sucesso!`);
        
    } else if (compradorNome === '') {
        alert('❌ Por favor, digite seu nome para confirmar a compra.');
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
    
    // IMPORTANTE: Filtra corretamente sem duplicar
    let filteredPresentes = [...presentes]; // Cria uma cópia
    
    if (currentFilter === 'available') {
        filteredPresentes = filteredPresentes.filter(p => !p.comprado);
    } else if (currentFilter === 'purchased') {
        filteredPresentes = filteredPresentes.filter(p => p.comprado);
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
                        <i class="fas fa-calendar"></i> Em: ${presente.dataCompra ? new Date(presente.dataCompra).toLocaleDateString('pt-BR') : 'Data não registrada'}
                    </p>
                ` : ''}
                <a href="${presente.url}" target="_blank" class="presente-link ${presente.comprado ? 'btn-comprado' : ''}">
                    ${presente.comprado ? 'Presente já foi comprado' : 'Ver na Loja →'}
                </a>
                ${!presente.comprado ? `
                    <button onclick="marcarComoComprado('${presente.id}')" class="presente-link btn-comprar">
                        <i class="fas fa-gift"></i> Já comprei este presente
                    </button>
                ` : ''}
            </div>
        </div>
    `).join('');
}

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

// Exportar variáveis para admin.js
window.getPresentes = () => presentes;
window.setPresentes = (novaLista) => {
    presentes = novaLista;
    salvarNoLocalStorage();
};

// ============================================
// INICIALIZAÇÃO
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    iniciarContador();
    loadPresentes();
    setupFilters();
});
