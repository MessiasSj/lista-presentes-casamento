// ============================================
// APP.JS - Lista de Presentes de Casamento
// Sincronização com Sheet.best (Nuvem)
// Com Carrossel e Botão Voltar ao Topo
// ============================================

// SUA URL DO SHEET.BEST
const API_URL = 'https://api.sheetbest.com/sheets/b9510bd2-4034-435c-947b-6cd5cb677199';

let currentFilter = 'all';
let presentes = [];

// Variáveis do carrossel
let currentSlide = 0;
let totalSlides = 0;
let slides = [];

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
        renderCarrossel();
        
        if (typeof window.atualizarAdmin === 'function') {
            window.atualizarAdmin();
        }
        
    } catch(error) {
        console.error("❌ Erro ao carregar da nuvem:", error);
        carregarDadosLocais();
        renderCarrossel();
    }
}

// Função para atualizar um presente específico (PUT)
async function atualizarPresenteNaNuvem(presenteAtualizado) {
    try {
        const response = await fetch(`${API_URL}/id/${presenteAtualizado.id}`);
        const dados = await response.json();
        
        if (dados && dados.length > 0) {
            const linhaId = dados[0].id;
            
            const dadosAtualizados = {
                nome: presenteAtualizado.nome,
                url: presenteAtualizado.url,
                preco: `R$${presenteAtualizado.preco.toFixed(2).replace('.', ',')}`,
                imagem: presenteAtualizado.imagem || '',
                comprado: presenteAtualizado.comprado ? 'TRUE' : 'FALSE',
                comprador: presenteAtualizado.comprador || '',
                dataCompra: presenteAtualizado.dataCompra || ''
            };
            
            const updateResponse = await fetch(`${API_URL}/id/${linhaId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosAtualizados)
            });
            
            return updateResponse.ok;
        }
        return false;
    } catch(error) {
        console.error("❌ Erro ao atualizar:", error);
        return false;
    }
}

// Salvar TODOS os dados na planilha
async function salvarNaNuvem() {
    try {
        console.log("💾 Salvando dados na nuvem...");
        
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
        
        await fetch(API_URL, { method: 'DELETE' });
        
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosParaSalvar)
        });
        
        if (response.ok) {
            console.log("✅ Dados salvos na nuvem com sucesso!");
            return true;
        }
        return false;
        
    } catch(error) {
        console.error("❌ Erro ao salvar na nuvem:", error);
        return false;
    }
}

function carregarDadosLocais() {
    const stored = localStorage.getItem('presentes_casamento');
    
    if (stored) {
        presentes = JSON.parse(stored);
        console.log("📱 Dados carregados do localStorage:", presentes.length, "presentes");
    } else {
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
            salvarNaNuvem();
        }
    }
    
    salvarNoLocalStorage();
}

function salvarNoLocalStorage() {
    localStorage.setItem('presentes_casamento', JSON.stringify(presentes));
}

window.salvarDadosGlobal = async function() {
    salvarNoLocalStorage();
    const sucesso = await salvarNaNuvem();
    renderCarrossel();
    
    if (typeof window.atualizarAdmin === 'function') {
        window.atualizarAdmin();
    }
    
    if (sucesso) {
        console.log("✅ Sincronização completa!");
    }
};

// ============================================
// MARCAR COMO COMPRADO
// ============================================

window.marcarComoComprado = async function(id) {
    const presente = presentes.find(p => String(p.id) === String(id));
    if (!presente || presente.comprado) return;
    
    const compradorNome = prompt('🎉 Parabéns pela compra!\n\nPor favor, digite seu nome para registrarmos sua gentileza:', 'Convidado');
    
    if (compradorNome && compradorNome.trim()) {
        presente.comprado = true;
        presente.comprador = compradorNome.trim();
        presente.dataCompra = new Date().toISOString();
        
        const atualizado = await atualizarPresenteNaNuvem(presente);
        if (!atualizado) await salvarNaNuvem();
        
        salvarNoLocalStorage();
        renderCarrossel();
        
        if (typeof window.atualizarAdmin === 'function') {
            window.atualizarAdmin();
        }
        
        alert(`✅ Obrigado ${compradorNome}!\n\n🎁 Presente: ${presente.nome}\n💰 Valor: R$ ${presente.preco.toFixed(2)}`);
        
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
// FUNÇÕES DO CARROSSEL
// ============================================

function getItemsPorSlide() {
    const width = window.innerWidth;
    if (width <= 480) return 1;
    if (width <= 768) return 2;
    if (width <= 1024) return 3;
    return 4;
}

function renderCarrossel() {
    const container = document.getElementById('carouselTrack');
    const dotsContainer = document.getElementById('carouselDots');
    
    if (!container) return;
    
    let filteredPresentes = [...presentes];
    
    if (currentFilter === 'available') {
        filteredPresentes = filteredPresentes.filter(p => !p.comprado);
    } else if (currentFilter === 'purchased') {
        filteredPresentes = filteredPresentes.filter(p => p.comprado);
    }
    
    if (filteredPresentes.length === 0) {
        container.innerHTML = '<div class="loading">Nenhum presente encontrado nesta categoria.</div>';
        if (dotsContainer) dotsContainer.innerHTML = '';
        return;
    }
    
    const itemsPorSlide = getItemsPorSlide();
    slides = [];
    
    for (let i = 0; i < filteredPresentes.length; i += itemsPorSlide) {
        const slideItems = filteredPresentes.slice(i, i + itemsPorSlide);
        slides.push(slideItems);
    }
    
    totalSlides = slides.length;
    currentSlide = Math.min(currentSlide, totalSlides - 1);
    if (currentSlide < 0) currentSlide = 0;
    
    container.innerHTML = slides.map((slide, index) => `
        <div class="carousel-slide" data-slide="${index}">
            ${slide.map(presente => `
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
            `).join('')}
        </div>
    `).join('');
    
    // Atualizar dots
    if (dotsContainer) {
        dotsContainer.innerHTML = slides.map((_, index) => `
            <div class="dot ${index === currentSlide ? 'active' : ''}" data-slide="${index}"></div>
        `).join('');
        
        document.querySelectorAll('.dot').forEach(dot => {
            dot.addEventListener('click', () => {
                currentSlide = parseInt(dot.dataset.slide);
                updateCarouselPosition();
                updateDots();
            });
        });
    }
    
    updateCarouselPosition();
    updateButtonsState();
}

function updateCarouselPosition() {
    const track = document.getElementById('carouselTrack');
    if (track) {
        track.style.transform = `translateX(-${currentSlide * 100}%)`;
    }
}

function updateDots() {
    document.querySelectorAll('.dot').forEach((dot, index) => {
        if (index === currentSlide) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

function updateButtonsState() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (prevBtn) prevBtn.disabled = currentSlide === 0;
    if (nextBtn) nextBtn.disabled = currentSlide >= totalSlides - 1;
}

function nextSlide() {
    if (currentSlide < totalSlides - 1) {
        currentSlide++;
        updateCarouselPosition();
        updateDots();
        updateButtonsState();
    }
}

function prevSlide() {
    if (currentSlide > 0) {
        currentSlide--;
        updateCarouselPosition();
        updateDots();
        updateButtonsState();
    }
}

// ============================================
// FILTROS
// ============================================

function setupFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            currentSlide = 0;
            renderCarrossel();
        });
    });
}

// ============================================
// BOTÃO VOLTAR AO TOPO
// ============================================

function setupBackToTop() {
    const backToTopBtn = document.getElementById('backToTopBtn');
    
    if (!backToTopBtn) return;
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    });
    
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Exportar para admin.js
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
    carregarDaNuvem();
    setupFilters();
    setupBackToTop();
    
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
    
    window.addEventListener('resize', () => {
        currentSlide = 0;
        renderCarrossel();
    });
});
