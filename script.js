// Exportação de produtos para CSV (Relatórios)
document.addEventListener('DOMContentLoaded', function() {
  const exportarBtn = document.getElementById('exportar-csv-btn');
  const relatorioStatus = document.getElementById('relatorio-status');
  if (exportarBtn) {
    exportarBtn.onclick = async function() {
      relatorioStatus.textContent = 'Gerando CSV...';
      try {
        const snapshot = await db.collection('produtos').get();
        const produtos = snapshot.docs.map(doc => doc.data());
        if (!produtos.length) {
          relatorioStatus.textContent = 'Nenhum produto encontrado.';
          return;
        }
        const header = ['Nome','Marca','Validade','Quantidade','Curva'];
        const rows = produtos.map(p => [p.nome, p.marca, p.validade, p.quantidade, p.curva]);
        let csv = header.join(',') + '\n';
        rows.forEach(r => { csv += r.join(',') + '\n'; });
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'produtos.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        relatorioStatus.textContent = 'Relatório exportado com sucesso!';
      } catch (e) {
        relatorioStatus.textContent = 'Erro ao gerar relatório.';
      }
    };
  }
});
// CRUD de Usuários com Firestore
document.addEventListener('DOMContentLoaded', function() {
  let usuarios = [];
  let usuarioEditIndex = null;
  const usuariosTbody = document.getElementById('usuarios-tbody');
  const usuarioModal = document.getElementById('usuario-modal');
  const usuarioModalOverlay = document.getElementById('usuario-modal-overlay');
  const usuarioForm = document.getElementById('usuario-form');
  const btnAddUsuario = document.getElementById('add-usuario-btn');
  const btnCancelarUsuario = document.getElementById('usuario-cancelar');

  // Sincronizar usuários com Firestore
  function syncUsuarios() {
    db.collection('usuarios').orderBy('nome').onSnapshot(snapshot => {
      usuarios = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      renderUsuarios();
    });
  }
  syncUsuarios();

  function renderUsuarios() {
    usuariosTbody.innerHTML = '';
    usuarios.forEach((u, i) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${u.nome}</td>
        <td>${u.email}</td>
        <td>${u.perfil === 'admin' ? 'Administrador' : 'Comum'}</td>
        <td>
          <button onclick="editarUsuario('${u.id}')">Editar</button>
          <button onclick="removerUsuario('${u.id}')">Excluir</button>
        </td>
      `;
      usuariosTbody.appendChild(tr);
    });
  }

  function showUsuarioModal(edit = false, usuario = null, idx = null) {
    usuarioModal.style.display = usuarioModalOverlay.style.display = 'block';
    document.getElementById('usuario-modal-title').textContent = edit ? 'Editar Usuário' : 'Novo Usuário';
    usuarioForm.reset();
    usuarioEditIndex = idx;
    if (edit && usuario) {
      document.getElementById('usuario-nome').value = usuario.nome;
      document.getElementById('usuario-email').value = usuario.email;
      document.getElementById('usuario-perfil').value = usuario.perfil;
    }
  }
  function hideUsuarioModal() {
    usuarioModal.style.display = usuarioModalOverlay.style.display = 'none';
    usuarioEditIndex = null;
  }
  if (btnAddUsuario) btnAddUsuario.onclick = () => showUsuarioModal();
  if (btnCancelarUsuario) btnCancelarUsuario.onclick = hideUsuarioModal;
  if (usuarioModalOverlay) usuarioModalOverlay.onclick = hideUsuarioModal;
  usuarioForm.onsubmit = function(e) {
    e.preventDefault();
    const nome = document.getElementById('usuario-nome').value.trim();
    const email = document.getElementById('usuario-email').value.trim();
    const perfil = document.getElementById('usuario-perfil').value;
    if (!nome || !email || !perfil) {
      showToast('Preencha todos os campos!', 'error');
      return;
    }
    // Verifica duplicidade de email
    const emailDuplicado = usuarios.some((u, i) => u.email === email && (usuarioEditIndex === null || usuarios[usuarioEditIndex].id !== u.id));
    if (emailDuplicado) {
      showToast('E-mail já cadastrado!', 'error');
      return;
    }
    if (usuarioEditIndex !== null && usuarios[usuarioEditIndex]) {
      // Atualizar usuário existente
      db.collection('usuarios').doc(usuarios[usuarioEditIndex].id).set({ nome, email, perfil })
        .then(() => showToast('Usuário atualizado!', 'success'));
    } else {
      // Adicionar novo usuário
      db.collection('usuarios').add({ nome, email, perfil })
        .then(() => showToast('Usuário cadastrado!', 'success'));
    }
    hideUsuarioModal();
  };
  window.editarUsuario = function(id) {
    const idx = usuarios.findIndex(u => u.id === id);
    if (idx !== -1) showUsuarioModal(true, usuarios[idx], idx);
  };
  window.removerUsuario = function(id) {
    db.collection('usuarios').doc(id).delete()
      .then(() => showToast('Usuário removido!', 'success'));
  };
});

// Utilitários globais
function showToast(msg, type = 'info') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.className = 'show ' + type;
  toast.style.display = 'block';
  setTimeout(() => { toast.style.display = 'none'; toast.className = ''; }, 2500);
}

// Configuração do Firebase (substitua pelos seus dados do projeto)
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_AUTH_DOMAIN",
  projectId: "SEU_PROJECT_ID",
  storageBucket: "SEU_STORAGE_BUCKET",
  messagingSenderId: "SEU_MESSAGING_SENDER_ID",
  appId: "SEU_APP_ID"
};
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

// Login obrigatório antes de acessar o sistema
document.addEventListener('DOMContentLoaded', function() {
  const loginModal = document.getElementById('login-modal');
  const loginForm = document.getElementById('login-form');
  if (loginModal && loginForm) {
    document.querySelector('.layout').style.display = 'none';
    loginForm.onsubmit = function(e) {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const senha = document.getElementById('login-senha').value;
      auth.signInWithEmailAndPassword(email, senha)
        .then(() => {
          loginModal.style.display = 'none';
          document.querySelector('.layout').style.display = 'flex';
          showToast('Login realizado com sucesso!', 'success');
        })
        .catch((error) => {
          showToast('Usuário ou senha inválidos!', 'error');
        });
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
      if (sections[sec]) {
        sections[sec].style.display = 'block';
        // Seção Usuários ou Relatórios: mostrar placeholder funcional
        if (sec === 'usuarios') {
          sections[sec].innerHTML = '<h2>Usuários</h2><div style="padding:2em 0;text-align:center;color:#aaa;font-size:1.1em;">Gestão de usuários estará disponível em breve.</div>';
        }
        if (sec === 'relatorios') {
          sections[sec].innerHTML = '<h2>Relatórios</h2><div style="padding:2em 0;text-align:center;color:#aaa;font-size:1.1em;">Geração de relatórios estará disponível em breve.</div>';
        }
      }
      if (sec === 'dashboard') renderCurvaABC();
    });
  });


  // Produtos em estoque (persistência opcional via localStorage)
  let produtos = [];

  // Sincronizar produtos com Firestore
  function syncProdutos() {
    db.collection('produtos').orderBy('nome').onSnapshot(snapshot => {
      produtos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      renderEstoque();
    });
  }
  syncProdutos();

  function renderEstoque() {
    const tbody = document.getElementById('estoque-tbody');
    tbody.innerHTML = '';
    produtos.forEach((p, i) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${p.nome}</td>
        <td>${p.marca}</td>
        <td>${p.validade}</td>
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
          <button onclick="editarProduto('${p.id}')">Editar</button>
          <button onclick="removerProduto('${p.id}')">Excluir</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
    renderDashboardStats();
    renderCurvaABC();
  }
        <td>${p.quantidade}</td>
        <td>${p.curva}</td>
        <td>
          <button onclick="editarProduto(${i})">Editar</button>
          <button onclick="removerProduto(${i})">Excluir</button>
        </td>
  window.removerProduto = function(id) {
    db.collection('produtos').doc(id).delete()
      .then(() => showToast('Produto removido!', 'success'));
  };
      `;
      tbody.appendChild(tr);
    });
    localStorage.setItem('produtos', JSON.stringify(produtos));
    renderDashboardStats();
    renderCurvaABC();
  }
  window.removerProduto = function(idx) {
    produtos.splice(idx, 1);
    renderEstoque();
    showToast('Produto removido!', 'success');
  };
  // Render inicial
  renderEstoque();
});


// Atualiza estatísticas do dashboard
function renderDashboardStats() {
  const total = produtos.length;
  const hoje = new Date();
  let vencendo = 0, vencidos = 0;
  produtos.forEach(p => {
    const validade = new Date(p.validade);
    if (validade < hoje) vencidos++;
    else if ((validade - hoje) / (1000*60*60*24) < 30) vencendo++;
  });
  document.getElementById('produtos-count').textContent = total;
  document.getElementById('vencendo-count').textContent = vencendo;
  document.getElementById('vencidos-count').textContent = vencidos;
}

// Renderiza gráfico Curva ABC com dados reais
window.renderCurvaABC = function renderCurvaABC() {
  let curvaA = 0, curvaB = 0, curvaC = 0;
  produtos.forEach(p => {
    if (p.curva === 'A') curvaA += Number(p.quantidade);
    else if (p.curva === 'B') curvaB += Number(p.quantidade);
    else if (p.curva === 'C') curvaC += Number(p.quantidade);
  });
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

// Logout com Firebase
document.addEventListener('DOMContentLoaded', function() {
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.onclick = function() {
      auth.signOut().then(() => {
        document.getElementById('login-modal').style.display = 'block';
        document.querySelector('.layout').style.display = 'none';
        showToast('Logout realizado!', 'info');
      });
    };
  }
});
