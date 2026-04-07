// ============================================
// ADMIN.JS - Área Administrativa
// ============================================

// Constantes
const ADMIN_PASSWORD = 'Nara@@4598'; // Senha padrão - Mude após implantação!
let isAdminLoggedIn = false;

// ============================================
// ELEMENTOS DO DOM
// ============================================
const adminToggleBtn = document.getElementById('adminToggleBtn');
const adminModal = document.getElementById('adminModal');
const closeModalBtn = document.querySelector('.close-btn');
const loginBtn = document.getElementById('loginBtn');
const adminPassword = document.getElementById('adminPassword');
const loginTab = document.getElementById('loginTab');
const manageTab = document.getElementById('manageTab');
const tabBtns = document.querySelectorAll('.tab-btn');
const addPresenteForm = document.getElementById('addPresenteForm');

// ============================================
// FUNÇÕES DO MODAL
// ============================================
function openModal() {
    adminModal.style.display = 'block';
    // Resetar para aba de login
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

// Trocar entre abas
function switchTab(tabId) {
    tabBtns.forEach(btn => {
        if (btn.dataset.tab === tabId) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    if (tabId === 'login') {
        loginTab.classList.add('active');
        manageTab.classList.remove('active');
    } else {
        loginTab.classList.remove('active');
        manageTab.classList.add('active');
        if (isAdminLoggedIn) {
            renderAdminPresentesList();
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
        alert('Login realizado com sucesso!');
    } else {
        alert('Senha incorreta! Tente novamente.');
        adminPassword.value = '';
    }
}

// ============================================
// GERENCIAMENTO DE PRESENTES (CRUD)
// ============================================

// Renderizar lista de presentes no admin
function renderAdminPresentesList() {
    const container = document.getElementById('adminPresentesList');
    const presentes = JSON.parse(localStorage.getItem('presentes_casamento') || '[]');
    
    if (presentes.length === 0) {
        container.innerHTML = '<p>Nenhum presente cadastrado ainda.</p>';
        return;
    }
    
    container.innerHTML = presentes.map(presente => `
        <div class="admin-presente-item">
            <div class="admin-presente-info">
                <h4>${escapeHtml(presente.nome)}</h4>
                <p>R$ ${presente.preco.toFixed(2)} | ${presente.comprado ? 'COMPRADO' : 'DISPONÍVEL'}</p>
                <p style="font-size: 0.75rem;">${presente.url.substring(0, 50)}...</p>
            </div>
            <button onclick="deletePresente(${presente.id})" class="delete-presente-btn">
                <i class="fas fa-trash"></i> Excluir
            </button>
        </div>
    `).join('');
}

// Adicionar novo presente
function addPresente(event) {
    event.preventDefault();
    
    if (!isAdminLoggedIn) {
        alert('Você precisa estar logado para adicionar presentes!');
        return;
    }
    
    const nome = document.getElementById('produtoNome').value;
    const url = document.getElementById('produtoUrl').value;
    const preco = parseFloat(document.getElementById('produtoPreco').value);
    const imagem = document.getElementById('produtoImagem').value;
    
    if (!nome || !url || isNaN(preco)) {
        alert('Por favor, preencha todos os campos obrigatórios!');
        return;
    }
    
    // Carregar presentes atuais
    const presentes = JSON.parse(localStorage.getItem('presentes_casamento') || '[]');
    
    // Criar novo presente
    const newPresente = {
        id: Date.now(), // ID único baseado no timestamp
        nome: nome,
        url: url,
        preco: preco,
        imagem: imagem || null,
        comprado: false,
        comprador: null,
        dataCompra: null
    };
    
    presentes.push(newPresente);
    localStorage.setItem('presentes_casamento', JSON.stringify(presentes));
    
    // Limpar formulário
    addPresenteForm.reset();
    
    // Re-renderizar
    renderAdminPresentesList();
    
    // Atualizar lista pública
    if (typeof window.loadPresentes === 'function') {
        window.loadPresentes();
    } else {
        location.reload(); // Recarregar para garantir sincronia
    }
    
    alert('Presente adicionado com sucesso!');
}

// Excluir presente
window.deletePresente = function(id) {
    if (!isAdminLoggedIn) {
        alert('Você precisa estar logado para excluir presentes!');
        return;
    }
    
    if (confirm('Tem certeza que deseja excluir este presente permanentemente?')) {
        let presentes = JSON.parse(localStorage.getItem('presentes_casamento') || '[]');
        presentes = presentes.filter(p => p.id !== id);
        localStorage.setItem('presentes_casamento', JSON.stringify(presentes));
        
        renderAdminPresentesList();
        
        // Atualizar lista pública
        if (typeof window.loadPresentes === 'function') {
            window.loadPresentes();
        } else {
            location.reload();
        }
        
        alert('Presente excluído com sucesso!');
    }
};

// ============================================
// EVENT LISTENERS
// ============================================
adminToggleBtn.addEventListener('click', openModal);
closeModalBtn.addEventListener('click', closeModal);
loginBtn.addEventListener('click', handleLogin);
addPresenteForm.addEventListener('submit', addPresente);

// Fechar modal ao clicar fora
window.addEventListener('click', (event) => {
    if (event.target === adminModal) {
        closeModal();
    }
});

// Configurar tabs
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        if (btn.dataset.tab === 'manage' && !isAdminLoggedIn) {
            alert('Você precisa fazer login primeiro para gerenciar os presentes!');
            return;
        }
        switchTab(btn.dataset.tab);
    });
});

// Permitir login com Enter
adminPassword.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleLogin();
    }
});

// ============================================
// FUNÇÃO AUXILIAR
// ============================================
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
