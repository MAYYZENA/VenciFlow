// Variável global para produtos
let produtos = [];

// Estilo para feedback visual de erro
const style = document.createElement('style');
style.innerHTML = `.input-error { border: 2px solid #ff5e62 !important; background: #fff0f0 !important; }`;
document.head.appendChild(style);
// Exportação de produtos para CSV (Relatórios)
document.addEventListener('DOMContentLoaded', function() {
  // Exportação de produtos para CSV (Relatórios)
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
        // Validação dos dados antes de gerar o CSV
        const header = ['Nome', 'Marca', 'Validade', 'Quantidade', 'Curva'];
        const rows = produtos.map(p => {
          if (!p.nome || !p.marca || !p.validade || !p.quantidade || !p.curva) {
            throw new Error('Dados inválidos encontrados. Verifique os produtos cadastrados.');
          }
          return [p.nome, p.marca, p.validade, p.quantidade, p.curva];
        });
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
        relatorioStatus.textContent = `Erro ao gerar relatório: ${e.message}`;
      }
    };
  }

  // Navegação do menu lateral
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

  // Sincronizar produtos com Firestore
  function syncProdutos() {
    try {
      db.collection('produtos').orderBy('nome').onSnapshot(snapshot => {
        produtos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderEstoque();
      }, error => {
        console.error('Erro ao sincronizar produtos:', error);
        showToast('Erro ao sincronizar produtos. Verifique sua conexão.', 'error');
      });
    } catch (error) {
      console.error('Erro ao conectar ao Firebase:', error);
      showToast('Erro ao conectar ao Firebase. Verifique sua configuração.', 'error');
    }
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
  window.removerProduto = function(id) {
    db.collection('produtos').doc(id).delete()
      .then(() => showToast('Produto removido!', 'success'));
  };
  // Render inicial
  renderEstoque();
});

// Consolidar lógica de navegação entre seções
function navigateToSection(sectionId) {
  const navBtns = document.querySelectorAll('.nav-btn');
  const sections = {
    dashboard: document.getElementById('dashboard-section'),
    estoque: document.getElementById('estoque-section'),
    usuarios: document.getElementById('usuarios-section'),
    relatorios: document.getElementById('relatorios-section')
  };

  navBtns.forEach(btn => btn.classList.remove('active'));
  Object.values(sections).forEach(sec => sec.style.display = 'none');

  const activeBtn = document.querySelector(`.nav-btn[data-section="${sectionId}"]`);
  if (activeBtn) activeBtn.classList.add('active');

  if (sections[sectionId]) {
    sections[sectionId].style.display = 'block';
    if (sectionId === 'dashboard') renderCurvaABC();
    if (sectionId === 'usuarios') {
      sections[sectionId].innerHTML = '<h2>Usuários</h2><div style="padding:2em 0;text-align:center;color:#aaa;font-size:1.1em;">Gestão de usuários estará disponível em breve.</div>';
    }
    if (sectionId === 'relatorios') {
      sections[sectionId].innerHTML = '<h2>Relatórios</h2><div style="padding:2em 0;text-align:center;color:#aaa;font-size:1.1em;">Geração de relatórios estará disponível em breve.</div>';
    }
  }
}

// Atualizar evento de clique dos botões de navegação
document.addEventListener('DOMContentLoaded', function() {
  const navBtns = document.querySelectorAll('.nav-btn');
  navBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const sectionId = btn.getAttribute('data-section');
      navigateToSection(sectionId);
    });
  });
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
  apiKey: "AIzaSyDsYgVpcex_58xPmaCGEc5LGAMQicNKqD4",
  authDomain: "sistemammfefo.firebaseapp.com",
  projectId: "sistemammfefo",
  storageBucket: "sistemammfefo.appspot.com",
  messagingSenderId: "857273180356",
  appId: "1:857273180356:web:d5bd38fd955e1253762991",
  measurementId: "G-CTSDX9CQ8F"
};
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

// Login obrigatório antes de acessar o sistema
document.addEventListener('DOMContentLoaded', function() {
  const loginModal = document.getElementById('login-modal');
  const loginForm = document.getElementById('login-form');
  const layout = document.querySelector('.layout');

  function showLogin() {
    loginModal.style.display = 'block';
    layout.style.display = 'none';
    loginForm.reset();
  }
  function showApp() {
    loginModal.style.display = 'none';
    layout.style.display = 'flex';
  }

  // Verifica se usuário já está autenticado
  auth.onAuthStateChanged(function(user) {
    if (user) {
      showApp();
    } else {
      showLogin();
    }
  });

  if (loginForm) {
    loginForm.onsubmit = function(e) {
      e.preventDefault();
      const emailInput = document.getElementById('login-email');
      const senhaInput = document.getElementById('login-senha');
      const email = emailInput.value.trim();
      const senha = senhaInput.value;
      let valid = true;
      // Reset visual
      emailInput.classList.remove('input-error');
      senhaInput.classList.remove('input-error');
      if (!email) {
        emailInput.classList.add('input-error');
        valid = false;
      }
      if (!senha) {
        senhaInput.classList.add('input-error');
        valid = false;
      }
      if (!valid) {
        showToast('Preencha todos os campos!', 'error');
        return;
      }
      auth.signInWithEmailAndPassword(email, senha)
        .then(() => {
          showApp();
          showToast('Login realizado com sucesso!', 'success');
        })
        .catch((error) => {
          emailInput.classList.add('input-error');
          senhaInput.classList.add('input-error');
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
    const nomeInput = document.getElementById('modal-nome');
    const marcaInput = document.getElementById('modal-marca');
    const validadeInput = document.getElementById('modal-validade');
    const quantidadeInput = document.getElementById('modal-quantidade');
    const curvaInput = document.getElementById('modal-curva');

    const nome = sanitizeInput(nomeInput.value.trim());
    const marca = sanitizeInput(marcaInput.value.trim());
    const validade = sanitizeInput(validadeInput.value);
    const quantidade = parseInt(sanitizeInput(quantidadeInput.value));
    const curva = sanitizeInput(curvaInput.value);

    let valid = true;
    // Reset visual
    [nomeInput, marcaInput, validadeInput, quantidadeInput, curvaInput].forEach(i => i.classList.remove('input-error'));
    if (!nome) { nomeInput.classList.add('input-error'); valid = false; }
    if (!marca) { marcaInput.classList.add('input-error'); valid = false; }
    if (!validade) { validadeInput.classList.add('input-error'); valid = false; }
    if (!quantidade || quantidade < 1) { quantidadeInput.classList.add('input-error'); valid = false; }
    if (!curva) { curvaInput.classList.add('input-error'); valid = false; }
    if (!valid) {
      showToast('Preencha todos os campos corretamente!', 'error');
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
    try {
      db.collection('produtos').orderBy('nome').onSnapshot(snapshot => {
        produtos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderEstoque();
      }, error => {
        console.error('Erro ao sincronizar produtos:', error);
        showToast('Erro ao sincronizar produtos. Verifique sua conexão.', 'error');
      });
    } catch (error) {
      console.error('Erro ao conectar ao Firebase:', error);
      showToast('Erro ao conectar ao Firebase. Verifique sua configuração.', 'error');
    }
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
        // ...existing code...
        // Corrigido: Removido bloco duplicado e template literal não finalizado
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

// Proteção contra XSS
function sanitizeInput(input) {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

// Exemplo de uso na validação de formulários
form.onsubmit = function(e) {
  e.preventDefault();
  const nomeInput = document.getElementById('modal-nome');
  const marcaInput = document.getElementById('modal-marca');
  const validadeInput = document.getElementById('modal-validade');
  const quantidadeInput = document.getElementById('modal-quantidade');
  const curvaInput = document.getElementById('modal-curva');

  const nome = sanitizeInput(nomeInput.value.trim());
  const marca = sanitizeInput(marcaInput.value.trim());
  const validade = sanitizeInput(validadeInput.value);
  const quantidade = parseInt(sanitizeInput(quantidadeInput.value));
  const curva = sanitizeInput(curvaInput.value);

  let valid = true;
  // Reset visual
  [nomeInput, marcaInput, validadeInput, quantidadeInput, curvaInput].forEach(i => i.classList.remove('input-error'));
  if (!nome) { nomeInput.classList.add('input-error'); valid = false; }
  if (!marca) { marcaInput.classList.add('input-error'); valid = false; }
  if (!validade) { validadeInput.classList.add('input-error'); valid = false; }
  if (!quantidade || quantidade < 1) { quantidadeInput.classList.add('input-error'); valid = false; }
  if (!curva) { curvaInput.classList.add('input-error'); valid = false; }
  if (!valid) {
    showToast('Preencha todos os campos corretamente!', 'error');
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

// Proteção contra CSRF
function getCSRFToken() {
  return document.cookie.split('; ').find(row => row.startsWith('csrfToken='))?.split('=')[1];
}

// Exemplo de uso em requisições
async function secureRequest(url, options = {}) {
  const csrfToken = getCSRFToken();
  if (!csrfToken) {
    throw new Error('CSRF token não encontrado.');
  }
  options.headers = {
    ...options.headers,
    'X-CSRF-Token': csrfToken
  };
  return fetch(url, options);
}

// Geração de relatórios em PDF
async function gerarRelatorioPDF(produtos) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.text('Relatório de Produtos', 10, 10);
  doc.autoTable({
    head: [['Nome', 'Marca', 'Validade', 'Quantidade', 'Curva']],
    body: produtos.map(p => [p.nome, p.marca, p.validade, p.quantidade, p.curva]),
  });

  doc.save('relatorio_produtos.pdf');
}

// Geração de relatórios em Excel
async function gerarRelatorioExcel(produtos) {
  const header = ['Nome', 'Marca', 'Validade', 'Quantidade', 'Curva'];
  const rows = produtos.map(p => [p.nome, p.marca, p.validade, p.quantidade, p.curva]);

  let csv = header.join(',') + '\n';
  rows.forEach(r => { csv += r.join(',') + '\n'; });

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'relatorio_produtos.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Botões para gerar relatórios
const exportarPDFBtn = document.getElementById('exportar-pdf-btn');
const exportarExcelBtn = document.getElementById('exportar-excel-btn');

if (exportarPDFBtn) {
  exportarPDFBtn.onclick = async function() {
    const snapshot = await db.collection('produtos').get();
    const produtos = snapshot.docs.map(doc => doc.data());
    gerarRelatorioPDF(produtos);
  };
}

if (exportarExcelBtn) {
  exportarExcelBtn.onclick = async function() {
    const snapshot = await db.collection('produtos').get();
    const produtos = snapshot.docs.map(doc => doc.data());
    gerarRelatorioExcel(produtos);
  };
}

// Sistema de permissões
function verificarPermissao(usuario) {
  if (!usuario || !usuario.perfil) {
    throw new Error('Usuário não autenticado ou perfil não definido.');
  }

  const permissoes = {
    admin: ['dashboard', 'estoque', 'usuarios', 'relatorios'],
    operador: ['dashboard', 'estoque'],
  };

  return permissoes[usuario.perfil] || [];
}

// Exemplo de uso
auth.onAuthStateChanged(function(user) {
  if (user) {
    db.collection('usuarios').doc(user.uid).get().then(doc => {
      const usuario = doc.data();
      const permissoes = verificarPermissao(usuario);

      // Ocultar seções não permitidas
      const navBtns = document.querySelectorAll('.nav-btn');
      navBtns.forEach(btn => {
        const section = btn.getAttribute('data-section');
        if (!permissoes.includes(section)) {
          btn.style.display = 'none';
        }
      });

      showApp();
    });
  } else {
    showLogin();
  }
});

// Notificações automáticas para produtos próximos da validade
document.addEventListener('DOMContentLoaded', function() {
  function verificarValidade() {
    const hoje = new Date();
    produtos.forEach(produto => {
      const validade = new Date(produto.validade);
      const diasRestantes = (validade - hoje) / (1000 * 60 * 60 * 24);

      if (diasRestantes > 0 && diasRestantes <= 7) {
        showToast(`Produto "${produto.nome}" está próximo da validade!`, 'warning');
      } else if (diasRestantes <= 0) {
        showToast(`Produto "${produto.nome}" está vencido!`, 'error');
      }
    });
  }

  // Verificar validade ao carregar produtos
  db.collection('produtos').onSnapshot(snapshot => {
    produtos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    verificarValidade();
  });
});
