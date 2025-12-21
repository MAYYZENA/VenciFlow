
// Utilitários globais
function showToast(msg, type = 'info') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.className = 'show ' + type;
  toast.style.display = 'block';
  setTimeout(() => { toast.style.display = 'none'; toast.className = ''; }, 2500);
}

// Login obrigatório antes de acessar o sistema
document.addEventListener('DOMContentLoaded', function() {
  const loginModal = document.getElementById('login-modal');
  const loginForm = document.getElementById('login-form');
  if (loginModal && loginForm) {
    document.querySelector('.layout').style.display = 'none';
    loginForm.onsubmit = function(e) {
      e.preventDefault();
      // Simulação de login (pode adicionar validação real depois)
      loginModal.style.display = 'none';
      document.querySelector('.layout').style.display = 'flex';
      showToast('Login realizado com sucesso!', 'success');
    };
  }

  // Modal de Produto
  const modal = document.getElementById('produto-modal');
  const overlay = document.getElementById('modal-overlay');
  const form = document.getElementById('produto-form');
  const btnAdd = document.getElementById('add-produto-btn');
  const btnCancelar = document.getElementById('modal-cancelar');
  let editIndex = null;

  function showModal(edit = false, produto = null, idx = null) {
    modal.style.display = overlay.style.display = 'block';
    document.getElementById('modal-title').textContent = edit ? 'Editar Produto' : 'Novo Produto';
    form.reset();
    editIndex = idx;
    if (edit && produto) {
      document.getElementById('modal-nome').value = produto.nome;
      document.getElementById('modal-marca').value = produto.marca;
      document.getElementById('modal-validade').value = produto.validade;
      document.getElementById('modal-quantidade').value = produto.quantidade;
      document.getElementById('modal-curva').value = produto.curva;
    }
  }
  function hideModal() {
    modal.style.display = overlay.style.display = 'none';
    editIndex = null;
  }
  if (btnAdd) btnAdd.onclick = () => showModal();
  if (btnCancelar) btnCancelar.onclick = hideModal;
  if (overlay) overlay.onclick = hideModal;
  form.onsubmit = function(e) {
    e.preventDefault();
    const nome = document.getElementById('modal-nome').value.trim();
    const marca = document.getElementById('modal-marca').value.trim();
    const validade = document.getElementById('modal-validade').value;
    const quantidade = parseInt(document.getElementById('modal-quantidade').value);
    const curva = document.getElementById('modal-curva').value;
    if (!nome || !marca || !validade || !quantidade || !curva) {
      showToast('Preencha todos os campos!', 'error');
      return;
    }
    if (editIndex !== null) {
      produtos[editIndex] = { nome, marca, validade, quantidade, curva };
      showToast('Produto atualizado!', 'success');
    } else {
      produtos.push({ nome, marca, validade, quantidade, curva });
      showToast('Produto cadastrado!', 'success');
    }
    hideModal();
    renderEstoque();
  };
  window.editarProduto = function(idx) {
    showModal(true, produtos[idx], idx);
  };
});
// script.js - Sistema FEFO Profissional
// Navegação do menu lateral
document.addEventListener('DOMContentLoaded', function() {
  const navBtns = document.querySelectorAll('.nav-btn');
  const sections = {
    dashboard: document.getElementById('dashboard-section'),
    estoque: document.getElementById('estoque-section'),
    usuarios: document.getElementById('usuarios-section'),
    relatorios: document.getElementById('relatorios-section')
  };
  navBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      navBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      Object.values(sections).forEach(sec => sec.style.display = 'none');
      const sec = btn.getAttribute('data-section');
      if (sections[sec]) sections[sec].style.display = 'block';
      if (sec === 'dashboard') renderCurvaABC();
    });
  });

  // Mock: Produtos em estoque
  let produtos = [
    { nome: 'Dipirona', marca: 'Genérico', validade: '2026-01-10', quantidade: 50, curva: 'A' },
    { nome: 'Paracetamol', marca: 'Medley', validade: '2025-08-15', quantidade: 30, curva: 'B' },
    { nome: 'Ibuprofeno', marca: 'Bayer', validade: '2025-03-20', quantidade: 10, curva: 'C' }
  ];

  function renderEstoque() {
    const tbody = document.getElementById('estoque-tbody');
    tbody.innerHTML = '';
    produtos.forEach((p, i) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${p.nome}</td>
        <td>${p.marca}</td>
        <td>${p.validade}</td>
        <td>${p.quantidade}</td>
        <td>${p.curva}</td>
        <td>
          <button onclick="editarProduto(${i})">Editar</button>
          <button onclick="removerProduto(${i})">Excluir</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }
  window.removerProduto = function(idx) {
    produtos.splice(idx, 1);
    renderEstoque();
  };
  document.getElementById('add-produto-btn').onclick = function() {
    const nome = prompt('Nome do produto:');
    if (!nome) return;
    const marca = prompt('Marca:');
    const validade = prompt('Validade (YYYY-MM-DD):');
    const quantidade = prompt('Quantidade:');
    const curva = prompt('Curva (A/B/C):').toUpperCase();
    produtos.push({ nome, marca, validade, quantidade, curva });
    renderEstoque();
  };
  // Render inicial
  renderEstoque();
});

// Troca de telas (login/dashboard)
document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('login-form');
  const loginSection = document.getElementById('login-section');
  const dashboardSection = document.getElementById('dashboard-section');
  const logoutBtn = document.getElementById('logout-btn');

  if (loginForm && loginSection && dashboardSection && logoutBtn) {
    loginForm.onsubmit = function(e) {
      e.preventDefault();
      loginSection.style.display = 'none';
      dashboardSection.style.display = 'flex';
      renderCurvaABC();
    };
    logoutBtn.onclick = function() {
      dashboardSection.style.display = 'none';
      loginSection.style.display = 'flex';
    };
  }

  // Renderiza gráfico Curva ABC
  function renderCurvaABC() {
    // Mock: valores de exemplo
    const curvaA = 12;
    const curvaB = 8;
    const curvaC = 20;
    document.getElementById('curvaA-count').textContent = curvaA;
    document.getElementById('curvaB-count').textContent = curvaB;
    document.getElementById('curvaC-count').textContent = curvaC;

    const ctx = document.getElementById('curvaChart').getContext('2d');
    if (window.curvaChartInstance) window.curvaChartInstance.destroy();
    window.curvaChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Curva A', 'Curva B', 'Curva C'],
        datasets: [{
          data: [curvaA, curvaB, curvaC],
          backgroundColor: ['#ff5e62', '#ffb92a', '#36d399'],
          borderWidth: 2,
        }]
      },
      options: {
        plugins: {
          legend: {
            display: true,
            labels: { color: '#fff', font: { size: 14 } }
          }
        }
      }
    });
  }
});
