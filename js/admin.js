// ============================================
// ADMIN.JS - Área Administrativa
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
const purchasedTab = document.getElementById('purchasedTab');
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
    
    loginTab.classList.remove('active');
    manageTab
