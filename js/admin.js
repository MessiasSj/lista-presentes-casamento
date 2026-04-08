// ============================================
// ADMIN.JS - Área Administrativa Melhorada
// ============================================

const ADMIN_PASSWORD = 'admin123';
let isAdminLoggedIn = false;

// Elementos do DOM
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
        alert('✅ Login realizado com sucesso!');
    } else {
        alert('❌ Senha incorreta! Tente novamente.');
        adminPassword.value = '';
    }
}

// ============================================
// GERENCIAMENTO DE PRESENTES (CRUD)
// ============================================

// Função para fazer upload de imagem
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

// Renderizar lista de presentes no admin (layout em cards)
function renderAdminPresentesList() {
    const container = document.getElementById('adminPresentesList');
    const presentes = JSON.parse(localStorage.getItem('presentes_casamento') || '[]');
    
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
                <div style="background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); transition: transform 0.2s;">
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
                        <p style="margin: 5px 0; font-size: 0.75rem; color: var(--text-light); word-break: break-all;">
                            🔗 ${presente.url.substring(0, 40)}...
                        </p>
                        <button onclick="deletePresente(${presente.id})" 
                                style="margin-top: 10px; width: 100%; padding: 8px; background: linear-gradient(135deg, #D67A5A, #B55B3E); color: white; border: none; border-radius: 8px; cursor: pointer;">
                            <i class="fas fa-trash"></i> Excluir Presente
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// Adicionar novo presente com suporte a imagem
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
    
    // Se tiver upload de arquivo, converte para base64
    if (imagemFile) {
        try {
            imagemFinal = await uploadImagem(imagemFile);
        } catch(error) {
            console.error('Erro ao carregar imagem:', error);
        }
    }
    
    // Se não tiver imagem, usa placeholder
    if (!imagemFinal) {
        imagemFinal = null;
    }
    
    // Carregar presentes atuais
    const presentes = JSON.parse(localStorage.getItem('presentes_casamento') || '[]');
    
    // Criar novo presente
    const newPresente = {
        id: Date.now(),
        nome: nome,
        url: url,
        preco: preco,
        imagem: imagemFinal,
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
        location.reload();
    }
    
    alert('✅ Presente adicionado com sucesso!');
}

// Excluir presente
window.deletePresente = function(id) {
    if (!isAdminLoggedIn) {
        alert('Você precisa estar logado para excluir presentes!');
        return;
    }
    
    if (confirm('⚠️ Tem certeza que deseja excluir este presente permanentemente?')) {
        let presentes = JSON.parse(localStorage.getItem('presentes_casamento') || '[]');
        presentes = presentes.filter(p => p.id !== id);
        localStorage.setItem('presentes_casamento', JSON.stringify(presentes));
        
        renderAdminPresentesList();
        
        if (typeof window.loadPresentes === 'function') {
            window.loadPresentes();
        } else {
            location.reload();
        }
        
        alert('✅ Presente excluído com sucesso!');
    }
};

// ============================================
// FUNÇÃO PARA ENVIAR EMAIL (via EmailJS)
// ============================================

// Função para enviar notificação por email
function enviarNotificacaoEmail(presente, comprador) {
    // Usando EmailJS (gratuito)
    // Você precisa se cadastrar em https://www.emailjs.com/ e configurar
    
    const serviceID = 'service_casamento'; // Você vai criar no EmailJS
    const templateID = 'template_presente'; // Você vai criar no EmailJS
    const userID = 'SEU_USER_ID'; // Seu User ID do EmailJS
    
    const templateParams = {
        to_email: 'aysnarapachecoleite@gmail.com',
        from_name: comprador,
        presente_nome: presente.nome,
        presente_preco: `R$ ${presente.preco.toFixed(2)}`,
        data_compra: new Date().toLocaleString('pt-BR'),
        message: `${comprador} acabou de comprar o presente "${presente.nome}" no valor de R$ ${presente.preco.toFixed(2)}!`
    };
    
    // Verificar se EmailJS está disponível
    if (typeof emailjs !== 'undefined') {
        emailjs.send(serviceID, templateID, templateParams, userID)
            .then(function(response) {
                console.log('Email enviado com sucesso!', response);
            })
            .catch(function(error) {
                console.error('Erro ao enviar email:', error);
            });
    } else {
        console.log('EmailJS não configurado. Enviando alerta local.');
        // Fallback: salvar no localStorage para visualização
        const notificacoes = JSON.parse(localStorage.getItem('notificacoes_email') || '[]');
        notificacoes.push({
            presente: presente.nome,
            comprador: comprador,
            data: new Date().toISOString(),
            enviado: false
        });
        localStorage.setItem('notificacoes_email', JSON.stringify(notificacoes));
    }
}

// ============================================
// EVENT LISTENERS
// ============================================
adminToggleBtn.addEventListener('click', openModal);
closeModalBtn.addEventListener('click', closeModal);
loginBtn.addEventListener('click', handleLogin);
addPresenteForm.addEventListener('submit', addPresente);

window.addEventListener('click', (event) => {
    if (event.target === adminModal) {
        closeModal();
    }
});

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        if (btn.dataset.tab === 'manage' && !isAdminLoggedIn) {
            alert('Você precisa fazer login primeiro para gerenciar os presentes!');
            return;
        }
        switchTab(btn.dataset.tab);
    });
});

adminPassword.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleLogin();
    }
});

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
