// ============================================
// ADMIN.JS - Área Administrativa
// Sincronização com Sheet.best
// ============================================

const ADMIN_PASSWORD = 'admin123';
let isAdminLoggedIn = false;

// Elementos do DOM
const adminToggleBtn = document.getElementById('adminToggleBtn');
const adminModal = document.getElementById('adminModal');
const closeModalBtn = document.querySelector('.close-btn');
const loginBtn = document.getElementById('loginBtn');
const adminPassword = document.getElementById('adminPassword');
const addPresenteForm = document.getElementById('addPresenteForm');

// ============================================
// FUNÇÕES DO MODAL
// ============================================
function openModal() {
    adminModal.style.display = 'block';
    if (!isAdminLoggedIn) {
        switchTab('login');
        adminPassword.value = '';
    } else {
        switchTab('manage');
        renderAdminPresentesList();
    }
}

function closeModal() {
    adminModal.style.display = 'none';
}

function switchTab(tabId) {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const loginTab = document.getElementById('loginTab');
    const manageTab = document.getElementById('manageTab');
    const purchasedTab = document.getElementById('purchasedTab');
    
    tabBtns.forEach(btn => {
        if (btn.dataset.tab === tabId) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    loginTab.classList.remove('active');
    manageTab.classList.remove('active');
    purchasedTab.classList.remove('active');
    
    if (tabId === 'login') {
        loginTab.classList.add('active');
    } else if (tabId === 'manage') {
        manageTab.classList.add('active');
        if (isAdminLoggedIn) {
            renderAdminPresentesList();
        }
    } else if (tabId === 'purchased') {
        purchasedTab.classList.add('active');
        if (isAdminLoggedIn) {
            renderPurchasedList();
        }
    }
}

// ============================================
// LOGIN ADMIN
// ============================================
function handleLogin() {
    const password = adminPassword.value;
    
    if (password === ADMIN_PASSWORD) {
        isAdminLoggedIn = true;
        switchTab('manage');
        renderAdminPresentesList();
        alert('✅ Login realizado com sucesso!');
    } else {
        alert('❌ Senha incorreta! Tente novamente.');
        adminPassword.value = '';
    }
}

// ============================================
// UPLOAD DE IMAGEM
// ============================================
function uploadImagem(file) {
    return new Promise((resolve, reject) => {
        if (!file) {
            resolve(null);
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            resolve(e.target.result);
        };
        reader.onerror = function(e) {
            reject(e);
        };
        reader.readAsDataURL(file);
    });
}

// ============================================
// GERENCIAMENTO DE PRESENTES
// ============================================

function renderAdminPresentesList() {
    const container = document.getElementById('adminPresentesList');
    let presentes = window.getPresentes ? window.getPresentes() : [];
    
    if (presentes.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--text-light);">
                <i class="fas fa-gift" style="font-size: 48px; margin-bottom: 15px;"></i>
                <p>Nenhum presente cadastrado ainda.</p>
                <p>Adicione o primeiro presente usando o formulário acima!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; margin-top: 20px;">
            ${presentes.map(presente => `
                <div style="background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <img src="${presente.imagem || 'https://via.placeholder.com/280x160/D67A5A/FFFFFF?text=Sem+Imagem'}" 
                         style="width: 100%; height: 160px; object-fit: cover;"
                         onerror="this.src='https://via.placeholder.com/280x160/D67A5A/FFFFFF?text=Imagem+não+disponível'">
                    <div style="padding: 15px;">
                        <h4 style="margin: 0 0 8px 0; color: var(--text-dark);">${escapeHtml(presente.nome)}</h4>
                        <p style="margin: 5px 0; color: var(--terra-cota-primary); font-weight: bold;">R$ ${presente.preco.toFixed(2)}</p>
                        <p style="margin: 5px 0; font-size: 0.85rem;">
                            <span style="display: inline-block; padding: 3px 10px; border-radius: 12px; background: ${presente.comprado ? '#D67A5A' : '#7A9E7E'}; color: white;">
                                ${presente.comprado ? 'COMPRADO' : 'DISPONÍVEL'}
                            </span>
                        </p>
                        ${presente.comprado ? `
                            <p style="margin: 8px 0; font-size: 0.75rem; background: #FEF7F4; padding: 8px; border-radius: 8px;">
                                <i class="fas fa-user"></i> <strong>Comprado por:</strong> ${escapeHtml(presente.comprador || 'Anônimo')}<br>
                                <i class="fas fa-calendar"></i> <strong>Data:</strong> ${presente.dataCompra ? new Date(presente.dataCompra).toLocaleDateString('pt-BR') : 'Não registrada'}
                            </p>
                        ` : ''}
                        <button onclick="deletePresente('${presente.id}')" 
                                style="margin-top: 10px; width: 100%; padding: 8px; background: linear-gradient(135deg, #D67A5A, #B55B3E); color: white; border: none; border-radius: 8px; cursor: pointer;">
                            <i class="fas fa-trash"></i> Excluir Presente
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function renderPurchasedList() {
    const container = document.getElementById('purchasedList');
    let presentes = window.getPresentes ? window.getPresentes() : [];
    const purchased = presentes.filter(p => p.comprado === true);
    
    if (purchased.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--text-light);">
                <i class="fas fa-shopping-cart" style="font-size: 48px; margin-bottom: 15px;"></i>
                <p>Nenhum presente foi comprado ainda.</p>
                <p>Os presentes comprados aparecerão aqui.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 15px;">
            ${purchased.map((presente, index) => `
                <div style="background: white; border-radius: 12px; padding: 15px; border-left: 4px solid #D67A5A; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                    <div style="display: flex; gap: 15px; flex-wrap: wrap;">
                        <img src="${presente.imagem || 'https://via.placeholder.com/80x80/D67A5A/FFFFFF?text=Imagem'}" 
                             style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;"
                             onerror="this.src='https://via.placeholder.com/80x80/D67A5A/FFFFFF?text=Imagem'">
                        <div style="flex: 1;">
                            <h4 style="margin: 0 0 5px 0; color: var(--text-dark);">${escapeHtml(presente.nome)}</h4>
                            <p style="margin: 3px 0; color: var(--terra-cota-primary); font-weight: bold;">R$ ${presente.preco.toFixed(2)}</p>
                            <p style="margin: 3px 0; font-size: 0.85rem;">
                                <i class="fas fa-user"></i> Comprado por: <strong>${escapeHtml(presente.comprador || 'Anônimo')}</strong>
                            </p>
                            <p style="margin: 3px 0; font-size: 0.8rem; color: var(--text-light);">
                                <i class="fas fa-calendar"></i> Data: ${presente.dataCompra ? new Date(presente.dataCompra).toLocaleDateString('pt-BR') : 'Não registrada'}
                            </p>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
        <div style="margin-top: 20px; padding: 15px; background: linear-gradient(135deg, #D67A5A10, #B55B3E10); border-radius: 12px; text-align: center;">
            <strong>📊 Total de presentes comprados: ${purchased.length}</strong>
        </div>
    `;
}

// Função para atualizar o admin (chamada pelo app.js)
window.atualizarAdmin = function() {
    if (isAdminLoggedIn) {
        renderAdminPresentesList();
        renderPurchasedList();
    }
};

// ============================================
// ADICIONAR PRESENTE
// ============================================

async function addPresente(event) {
    event.preventDefault();
    
    if (!isAdminLoggedIn) {
        alert('Você precisa estar logado para adicionar presentes!');
        return;
    }
    
    const nome = document.getElementById('produtoNome').value;
    const url = document.getElementById('produtoUrl').value;
    const preco = parseFloat(document.getElementById('produtoPreco').value);
    const imagemUrl = document.getElementById('produtoImagem').value;
    const imagemFile = document.getElementById('produtoImagemFile').files[0];
    
    if (!nome || !url || isNaN(preco)) {
        alert('Por favor, preencha todos os campos obrigatórios!');
        return;
    }
    
    let imagemFinal = imagemUrl;
    
    if (imagemFile) {
        try {
            imagemFinal = await uploadImagem(imagemFile);
        } catch(error) {
            console.error('Erro ao carregar imagem:', error);
        }
    }
    
    let presentes = window.getPresentes ? window.getPresentes() : [];
    
    const newPresente = {
        id: Date.now().toString(),
        nome: nome,
        url: url,
        preco: preco,
        imagem: imagemFinal || '',
        comprado: false,
        comprador: null,
        dataCompra: null
    };
    
    presentes.push(newPresente);
    
    if (window.setPresentes) {
        window.setPresentes(presentes);
    }
    
    // Salvar na nuvem
    if (typeof window.salvarDadosGlobal === 'function') {
        await window.salvarDadosGlobal();
    }
    
    // Limpar formulário
    addPresenteForm.reset();
    document.getElementById('produtoImagemFile').value = '';
    document.getElementById('produtoImagem').value = '';
    
    // Atualizar listas
    renderAdminPresentesList();
    renderPurchasedList();
    
    alert('✅ Presente adicionado com sucesso!');
}

// ============================================
// EXCLUIR PRESENTE
// ============================================

window.deletePresente = async function(id) {
    if (!isAdminLoggedIn) {
        alert('Você precisa estar logado para excluir presentes!');
        return;
    }
    
    if (confirm('⚠️ Tem certeza que deseja excluir este presente permanentemente?')) {
        let presentes = window.getPresentes ? window.getPresentes() : [];
        presentes = presentes.filter(p => String(p.id) !== String(id));
        
        if (window.setPresentes) {
            window.setPresentes(presentes);
        }
        
        // Salvar na nuvem
        if (typeof window.salvarDadosGlobal === 'function') {
            await window.salvarDadosGlobal();
        }
        
        renderAdminPresentesList();
        renderPurchasedList();
        
        alert('✅ Presente excluído com sucesso!');
    }
};

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================
// EVENT LISTENERS
// ============================================
if (adminToggleBtn) adminToggleBtn.addEventListener('click', openModal);
if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
if (loginBtn) loginBtn.addEventListener('click', handleLogin);
if (addPresenteForm) addPresenteForm.addEventListener('submit', addPresente);

window.addEventListener('click', (event) => {
    if (event.target === adminModal) {
        closeModal();
    }
});

const tabBtns = document.querySelectorAll('.tab-btn');
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        if (btn.dataset.tab !== 'login' && !isAdminLoggedIn) {
            alert('Você precisa fazer login primeiro para acessar esta área!');
            return;
        }
        switchTab(btn.dataset.tab);
    });
});

if (adminPassword) {
    adminPassword.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    });
}
