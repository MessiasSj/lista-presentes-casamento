// ============================================
// ADMIN.JS - Área Administrativa
// ============================================

const ADMIN_PASSWORD = 'nara1234';
let isAdminLoggedIn = false;

const adminToggleBtn = document.getElementById('adminToggleBtn');
const adminModal = document.getElementById('adminModal');
const closeModalBtn = document.querySelector('.close-btn');
const loginBtn = document.getElementById('loginBtn');
const adminPassword = document.getElementById('adminPassword');
const addPresenteForm = document.getElementById('addPresenteForm');

// ============================================
// MODAL
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
        if (isAdminLoggedIn) renderAdminPresentesList();
    } else if (tabId === 'purchased') {
        purchasedTab.classList.add('active');
        if (isAdminLoggedIn) renderPurchasedList();
    }
}

// ============================================
// LOGIN
// ============================================

function handleLogin() {
    const password = adminPassword.value;
    
    if (password === ADMIN_PASSWORD) {
        isAdminLoggedIn = true;
        switchTab('manage');
        renderAdminPresentesList();
        alert('✅ Login realizado com sucesso!');
    } else {
        alert('❌ Senha incorreta!');
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
// RENDERIZAÇÃO ADMIN
// ============================================

function renderAdminPresentesList() {
    const container = document.getElementById('adminPresentesList');
    let presentes = window.getPresentes ? window.getPresentes() : [];
    
    if (presentes.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <i class="fas fa-gift" style="font-size: 48px; margin-bottom: 15px;"></i>
                <p>Nenhum presente cadastrado ainda.</p>
            </div>
        `;
        return;
    }
    
    const disponiveis = presentes.filter(p => !p.comprado);
    const comprados = presentes.filter(p => p.comprado);
    
    // Agrupar por categoria
    const categoriasMap = new Map();
    disponiveis.forEach(p => {
        const cat = p.categoria || 'Outros';
        if (!categoriasMap.has(cat)) categoriasMap.set(cat, []);
        categoriasMap.get(cat).push(p);
    });
    
    let html = '';
    
    for (let [categoria, itens] of categoriasMap) {
        html += `
            <h4 style="margin: 20px 0 10px 0; color: var(--terra-cota-primary);">
                <i class="fas fa-folder"></i> ${escapeHtml(categoria)} (${itens.length})
            </h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; margin-bottom: 30px;">
        `;
        
        itens.forEach(presente => {
            html += `
                <div style="background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <img src="${presente.imagem || 'https://via.placeholder.com/280x160/D67A5A/FFFFFF?text=Sem+Imagem'}" 
                         style="width: 100%; height: 160px; object-fit: cover;"
                         onerror="this.src='https://via.placeholder.com/280x160/D67A5A/FFFFFF?text=Imagem+não+disponível'">
                    <div style="padding: 15px;">
                        <h4 style="margin: 0 0 8px 0;">${escapeHtml(presente.nome)}</h4>
                        <p style="margin: 5px 0; color: #8B6B5C; font-size: 0.85rem;">
                            <i class="fas fa-tag"></i> ${escapeHtml(presente.categoria || 'Sem categoria')}
                        </p>
                        <p style="margin: 5px 0; color: var(--terra-cota-primary); font-weight: bold;">R$ ${presente.preco.toFixed(2)}</p>
                        <button onclick="deletePresente('${presente.id}')" 
                                style="margin-top: 10px; width: 100%; padding: 8px; background: linear-gradient(135deg, #D67A5A, #B55B3E); color: white; border: none; border-radius: 8px; cursor: pointer;">
                            <i class="fas fa-trash"></i> Excluir
                        </button>
                    </div>
                </div>
            `;
        });
        
        html += `</div>`;
    }
    
    if (comprados.length > 0) {
        html += `
            <h4 style="margin: 20px 0 10px 0;">✅ Já Comprados (${comprados.length})</h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; opacity: 0.7;">
        `;
        
        comprados.forEach(presente => {
            html += `
                <div style="background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <img src="${presente.imagem || 'https://via.placeholder.com/280x160/D67A5A/FFFFFF?text=Sem+Imagem'}" 
                         style="width: 100%; height: 160px; object-fit: cover; filter: grayscale(0.3);"
                         onerror="this.src='https://via.placeholder.com/280x160/D67A5A/FFFFFF?text=Imagem+não+disponível'">
                    <div style="padding: 15px;">
                        <h4 style="margin: 0 0 8px 0;">${escapeHtml(presente.nome)}</h4>
                        <p style="margin: 5px 0; color: #8B6B5C; font-size: 0.85rem;">
                            <i class="fas fa-tag"></i> ${escapeHtml(presente.categoria || 'Sem categoria')}
                        </p>
                        <p style="margin: 5px 0; color: var(--terra-cota-primary); font-weight: bold;">R$ ${presente.preco.toFixed(2)}</p>
                        <p style="margin: 8px 0; font-size: 0.75rem; background: #FEF7F4; padding: 8px; border-radius: 8px;">
                            <i class="fas fa-user"></i> ${escapeHtml(presente.comprador || 'Anônimo')}<br>
                            <i class="fas fa-calendar"></i> ${presente.dataCompra ? new Date(presente.dataCompra).toLocaleDateString('pt-BR') : 'Data não registrada'}
                        </p>
                    </div>
                </div>
            `;
        });
        
        html += `</div>`;
    }
    
    container.innerHTML = html;
}

function renderPurchasedList() {
    const container = document.getElementById('purchasedList');
    let presentes = window.getPresentes ? window.getPresentes() : [];
    const purchased = presentes.filter(p => p.comprado === true);
    
    if (purchased.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <i class="fas fa-shopping-cart" style="font-size: 48px; margin-bottom: 15px;"></i>
                <p>Nenhum presente foi comprado ainda.</p>
            </div>
        `;
        return;
    }
    
    // Agrupar comprados por categoria
    const categoriasMap = new Map();
    purchased.forEach(p => {
        const cat = p.categoria || 'Outros';
        if (!categoriasMap.has(cat)) categoriasMap.set(cat, []);
        categoriasMap.get(cat).push(p);
    });
    
    let html = '';
    
    for (let [categoria, itens] of categoriasMap) {
        html += `
            <h4 style="margin: 20px 0 10px 0; color: var(--terra-cota-primary);">
                <i class="fas fa-folder"></i> ${escapeHtml(categoria)} (${itens.length})
            </h4>
            <div style="display: flex; flex-direction: column; gap: 15px; margin-bottom: 25px;">
        `;
        
        itens.forEach(presente => {
            html += `
                <div style="background: white; border-radius: 12px; padding: 15px; border-left: 4px solid #D67A5A;">
                    <div style="display: flex; gap: 15px; flex-wrap: wrap;">
                        <img src="${presente.imagem || 'https://via.placeholder.com/80x80/D67A5A/FFFFFF?text=Imagem'}" 
                             style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;"
                             onerror="this.src='https://via.placeholder.com/80x80/D67A5A/FFFFFF?text=Imagem'">
                        <div style="flex: 1;">
                            <h4 style="margin: 0 0 5px 0;">${escapeHtml(presente.nome)}</h4>
                            <p style="margin: 3px 0; color: #8B6B5C; font-size: 0.85rem;">
                                <i class="fas fa-tag"></i> ${escapeHtml(presente.categoria || 'Sem categoria')}
                            </p>
                            <p style="margin: 3px 0; color: var(--terra-cota-primary); font-weight: bold;">R$ ${presente.preco.toFixed(2)}</p>
                            <p style="margin: 3px 0; font-size: 0.85rem;">
                                <i class="fas fa-user"></i> <strong>${escapeHtml(presente.comprador || 'Anônimo')}</strong>
                            </p>
                            <p style="margin: 3px 0; font-size: 0.8rem;">
                                <i class="fas fa-calendar"></i> ${presente.dataCompra ? new Date(presente.dataCompra).toLocaleDateString('pt-BR') : 'Data não registrada'}
                            </p>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += `</div>`;
    }
    
    html += `
        <div style="margin-top: 20px; padding: 15px; background: #FEF7F4; border-radius: 12px; text-align: center;">
            <strong>📊 Total: ${purchased.length} presentes comprados</strong>
        </div>
    `;
    
    container.innerHTML = html;
}

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
        alert('Você precisa estar logado!');
        return;
    }
    
    const nome = document.getElementById('produtoNome').value;
    const categoria = document.getElementById('produtoCategoria').value;
    const url = document.getElementById('produtoUrl').value;
    const preco = parseFloat(document.getElementById('produtoPreco').value);
    const imagemUrl = document.getElementById('produtoImagem').value;
    const imagemFile = document.getElementById('produtoImagemFile').files[0];
    
    if (!nome || !categoria || !url || isNaN(preco)) {
        alert('Preencha todos os campos obrigatórios!');
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
        categoria: categoria,
        url: url,
        preco: preco,
        imagem: imagemFinal || '',
        comprado: false,
        comprador: null,
        dataCompra: null
    };
    
    presentes.push(newPresente);
    
    if (window.setPresentes) window.setPresentes(presentes);
    if (typeof window.salvarDadosGlobal === 'function') await window.salvarDadosGlobal();
    
    addPresenteForm.reset();
    document.getElementById('produtoImagemFile').value = '';
    document.getElementById('produtoImagem').value = '';
    document.getElementById('produtoCategoria').value = '';
    
    renderAdminPresentesList();
    renderPurchasedList();
    
    alert(`✅ "${nome}" adicionado com sucesso na categoria "${categoria}"!`);
}

// ============================================
// EXCLUIR PRESENTE
// ============================================

window.deletePresente = async function(id) {
    if (!isAdminLoggedIn) {
        alert('Faça login para excluir!');
        return;
    }
    
    let presentes = window.getPresentes ? window.getPresentes() : [];
    const presente = presentes.find(p => String(p.id) === String(id));
    
    if (!presente) return;
    
    if (confirm(`⚠️ Excluir "${presente.nome}" permanentemente?`)) {
        presentes = presentes.filter(p => String(p.id) !== String(id));
        
        if (window.setPresentes) window.setPresentes(presentes);
        if (typeof window.salvarDadosGlobal === 'function') await window.salvarDadosGlobal();
        
        renderAdminPresentesList();
        renderPurchasedList();
        
        alert(`✅ "${presente.nome}" excluído!`);
    }
};

// ============================================
// AUXILIARES
// ============================================

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================
// EVENTOS
// ============================================

if (adminToggleBtn) adminToggleBtn.addEventListener('click', openModal);
if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
if (loginBtn) loginBtn.addEventListener('click', handleLogin);
if (addPresenteForm) addPresenteForm.addEventListener('submit', addPresente);

window.addEventListener('click', (event) => {
    if (event.target === adminModal) closeModal();
});

document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        if (btn.dataset.tab !== 'login' && !isAdminLoggedIn) {
            alert('Faça login primeiro!');
            return;
        }
        switchTab(btn.dataset.tab);
    });
});

if (adminPassword) {
    adminPassword.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLogin();
    });
}
