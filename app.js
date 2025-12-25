if (typeof process === 'undefined') window.process = { env: {} };

firebase.initializeApp(window.firebaseConfig || {
  apiKey: "AIzaSyA3YHP6mxbtHjdfzhfEiIoEONnGyXnEvAg",
  authDomain: "gestao-fefo.firebaseapp.com",
  projectId: "gestao-fefo",
  storageBucket: "gestao-fefo.firebasestorage.app",
  messagingSenderId: "471711723896",
  appId: "1:471711723896:web:beeabebbe8058ff732588d"
});
const auth = firebase.auth();
const db = firebase.firestore();

let currentUser = null;
let produtos = [];
let movimentacoes = [];
let categorias = new Set();

function mostrarLoader() {
  const loader = document.getElementById('global-loader');
  if (loader) loader.classList.add('active');
}

function esconderLoader() {
  const loader = document.getElementById('global-loader');
  if (loader) loader.classList.remove('active');
}

function mostrarToast(msg, duration = 3000) {
  const toast = document.getElementById('toast');
  if (toast) {
    toast.textContent = msg;
    toast.classList.add('active');
    setTimeout(() => {
      toast.classList.remove('active');
    }, duration);
  }
}

function parseData(dataStr) {
  if (!dataStr) return null;
  try {
    const data = new Date(dataStr);
    if (isNaN(data.getTime())) return null;
    return data;
  } catch (e) {
    return null;
  }
}

function formatarData(data) {
  if (!data) return '-';
  try {
    if (data.toDate) return data.toDate().toLocaleDateString('pt-BR');
    return new Date(data).toLocaleDateString('pt-BR');
  } catch (e) {
    return '-';
  }
}

function validarCampo(valor, tipo = 'texto', maxLen = 255) {
  if (!valor) return false;
  
  valor = valor.toString().trim();
  
  if (valor.length > maxLen) return false;
  
  if (tipo === 'email') {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);
  } else if (tipo === 'numero') {
    return /^\d+(\.\d{1,2})?$/.test(valor);
  } else if (tipo === 'data') {
    return /^\d{4}-\d{2}-\d{2}$/.test(valor);
  }
  
  return true;
}

function storageTest() {
  try {
    const testKey = '__fefo_test__';
    localStorage.setItem(testKey, '1');
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
}

function mudarTela(telaId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const tela = document.getElementById(telaId);
  if (tela) tela.classList.add('active');
  
  const storageWarning = document.getElementById('storage-warning');
  
  if (telaId === 'login-screen' || telaId === 'register-screen' || telaId === 'reset-password-screen') {
    if (storageWarning) storageWarning.style.display = 'none';
  } else {
    if (!storageTest() && storageWarning) storageWarning.style.display = 'block';
  }
}

function mudarPagina(paginaId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  if (paginaId === 'clientes' && !window.isAdmin) {
    mostrarToast('Acesso restrito ao administrador.');
    return;
  }
  document.getElementById('page-' + paginaId).classList.add('active');
  
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`[data-page="${paginaId}"]`)?.classList.add('active');
}

window.authInitialized = false;

auth.onAuthStateChanged(async (user) => {
  if (user) {
    currentUser = user;
    try {
      await carregarDadosUsuario();
      mudarTela('dashboard-screen');
      carregarDashboard();
    } catch (err) {
      console.error('Erro ao carregar dados do usuário:', err);
      esconderLoader();
      mostrarToast('Erro ao carregar seus dados');
    }
  } else {
    currentUser = null;
    mudarTela('login-screen');
    esconderLoader();
  }
  window.authInitialized = true;
});

document.getElementById('form-login')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('login-email').value.trim();
  const senha = document.getElementById('login-senha').value;
  
  if (!email || !senha) {
    mostrarToast('Preencha e-mail e senha!');
    return;
  }
  
  mostrarLoader();
  
  try {
    await auth.signInWithEmailAndPassword(email, senha);
    mostrarToast('Login realizado com sucesso!');
  } catch (err) {
    esconderLoader();
    const erro = traduzirErroFirebase(err.code);
    mostrarToast('Erro: ' + erro);
    console.error('Erro de login:', err.code);
  }
});

document.getElementById('btn-criar-conta')?.addEventListener('click', () => {
  mudarTela('register-screen');
});

document.getElementById('link-voltar-login')?.addEventListener('click', (e) => {
  e.preventDefault();
  mudarTela('login-screen');
});

document.getElementById('link-voltar-login2')?.addEventListener('click', (e) => {
  e.preventDefault();
  mudarTela('login-screen');
});

document.getElementById('link-recuperar-senha')?.addEventListener('click', (e) => {
  e.preventDefault();
  mudarTela('reset-password-screen');
});

document.getElementById('form-registro')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  mostrarLoader();
  
  const nome = document.getElementById('reg-nome').value.trim();
  const empresa = document.getElementById('reg-empresa').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const senha = document.getElementById('reg-senha').value;
  const confirmar = document.getElementById('reg-confirmar').value;
  
  if (senha !== confirmar) {
    mostrarToast('As senhas não coincidem!');
    esconderLoader();
    return;
  }
  
  try {
    const result = await auth.createUserWithEmailAndPassword(email, senha);
    await db.collection('usuarios').doc(result.user.uid).set({
      nome: nome,
      empresa: empresa,
      email: email,
      role: 'user', // Default role for new users
      plano: 'gratuito',
      criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
      configuracoes: {
        diasAviso: 7,
        emailAlertas: true
      }
    });
    mostrarToast('Conta criada com sucesso!');
    document.getElementById('form-registro').reset();
  } catch (err) {
    mostrarToast('Erro: ' + traduzirErroFirebase(err.code));
  }
  esconderLoader();
});

document.getElementById('form-recuperar')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  mostrarLoader();
  
  const email = document.getElementById('reset-email').value.trim();
  
  if (!email) {
    mostrarToast('Informe um e-mail válido');
    esconderLoader();
    return;
  }
  
  try {
    await auth.sendPasswordResetEmail(email);
    mostrarToast('Link de recuperação enviado para seu e-mail!');
    document.getElementById('reset-email').value = '';
    mudarTela('login-screen');
  } catch (err) {
    mostrarToast('Erro: ' + traduzirErroFirebase(err.code));
  }
  esconderLoader();
});

document.getElementById('btn-logout')?.addEventListener('click', async () => {
  if (confirm('Deseja realmente sair?')) {
    await auth.signOut();
    mostrarToast('Logout realizado!');
  }
});

async function carregarDadosUsuario() {
  try {
    const doc = await db.collection('usuarios').doc(currentUser.uid).get();
    if (doc.exists) {
      const dados = doc.data();
      document.getElementById('user-name').textContent = dados.nome || 'Usuário';
      document.getElementById('config-nome').value = dados.nome || '';
      document.getElementById('config-email').value = currentUser.email;
      document.getElementById('config-empresa').value = dados.empresa || '';
      document.getElementById('config-dias-aviso').value = dados.configuracoes?.diasAviso || 7;
      document.getElementById('config-email-alertas').checked = dados.configuracoes?.emailAlertas || false;

      window.userRole = dados.role || (dados.admin ? 'admin' : 'user'); // Backward compatibility with old 'admin' field
      window.isAdmin = window.userRole === 'admin';
      window.userPlan = dados.plano || 'gratuito';

      // Hide clients page for non-admins
      const btnClientes = document.querySelector('button.nav-btn[data-page="clientes"]');
      if (btnClientes) btnClientes.style.display = window.isAdmin ? '' : 'none';
      const pageClientes = document.getElementById('page-clientes');
      if (pageClientes) pageClientes.style.display = window.isAdmin ? '' : 'none';

      // Hide plans page for non-admins
      const btnPlanos = document.querySelector('button.nav-btn[data-page="planos"]');
      if (btnPlanos) btnPlanos.style.display = window.isAdmin ? '' : 'none';
      const pagePlanos = document.getElementById('page-planos');
      if (pagePlanos) pagePlanos.style.display = window.isAdmin ? '' : 'none';

      // Show role in UI
      const userInfo = document.getElementById('user-name');
      if (userInfo) userInfo.textContent += ` (${window.userRole})`;

      // Load plan options for client forms
      await atualizarOpcoesPlano();
    }
  } catch (err) {
    console.error('Erro ao carregar dados do usuário:', err);
    throw err;
  }
}

document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const page = btn.getAttribute('data-page');
    mudarPagina(page);
    
    if (page === 'dashboard') {
      carregarDashboard();
      verificarNotificacoesProdutos();
    }
    if (page === 'produtos') carregarProdutos();
    if (page === 'movimentacoes') carregarMovimentacoes();
    if (page === 'clientes') carregarClientes();
    if (page === 'planos') carregarPlanos();
    if (page === 'backup') carregarBackup();
    if (page === 'configuracoes') {
      carregarConfiguracoesRelatorios();
      agendarRelatorios();
    }
    if (page === 'api') carregarAPI();
  });
});

let clientes = [];
let clientesFiltrados = [];

let planos = [];

async function carregarClientes() {
  mostrarLoader();
  try {
    const pageClientes = document.getElementById('page-clientes');
    if (pageClientes) pageClientes.style.display = '';
    const snapshot = await db.collection('clientes').orderBy('nome').get();
    clientes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    clientesFiltrados = [...clientes];
    atualizarTabelaClientes();
    atualizarEstatisticasClientes();
  } catch (err) {
    console.error('Erro ao carregar clientes:', err);
    mostrarToast('Erro ao carregar clientes');
    const tbody = document.querySelector('#table-clientes tbody');
    if (tbody) tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#d32f2f;">Erro ao carregar clientes</td></tr>';
  }
  esconderLoader();
}

function atualizarTabelaClientes() {
  const tbody = document.querySelector('#table-clientes tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  const lista = clientesFiltrados.length > 0 ? clientesFiltrados : clientes;
  if (!lista || lista.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#5f6368;">Nenhum cliente encontrado</td></tr>';
    return;
  }

  document.querySelectorAll('#table-clientes .cliente-btn').forEach(btn => {
    btn.removeEventListener('click', handleClienteAction);
  });

  lista.forEach(cliente => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${cliente.nome || '-'}</td>
      <td>${cliente.email || '-'}</td>
      <td><span class="badge badge-${cliente.status === 'ativo' ? 'success' : (cliente.status === 'suspenso' ? 'danger' : 'warning')}">${cliente.status ? cliente.status.charAt(0).toUpperCase() + cliente.status.slice(1) : '-'}</span></td>
      <td>${formatarData(cliente.dataCadastro)}</td>
      <td>
        <button class="btn btn-sm btn-secondary cliente-btn" data-id="${cliente.id}" data-action="edit">Editar</button>
        <button class="btn btn-sm btn-danger cliente-btn" data-id="${cliente.id}" data-action="delete">Excluir</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  document.querySelectorAll('#table-clientes .cliente-btn').forEach(btn => {
    btn.addEventListener('click', handleClienteAction);
  });
}

function atualizarEstatisticasClientes() {
  const statsContainer = document.getElementById('clientes-stats');
  if (!statsContainer) return;
  
  const totalClientes = clientes.length;
  const clientesAtivos = clientes.filter(c => c.status === 'ativo').length;
  const clientesInativos = clientes.filter(c => c.status === 'suspenso').length;
  
  // Estatísticas por plano
  const statsPorPlano = {};
  clientes.forEach(cliente => {
    const plano = cliente.plano || 'Sem plano';
    if (!statsPorPlano[plano]) {
      statsPorPlano[plano] = 0;
    }
    statsPorPlano[plano]++;
  });
  
  let statsHTML = `
    <div class="stat-card">
      <div class="stat-number">${totalClientes}</div>
      <div class="stat-label">Total de Clientes</div>
    </div>
    <div class="stat-card">
      <div class="stat-number">${clientesAtivos}</div>
      <div class="stat-label">Clientes Ativos</div>
    </div>
    <div class="stat-card">
      <div class="stat-number">${clientesInativos}</div>
      <div class="stat-label">Clientes Suspensos</div>
    </div>
  `;
  
  // Adicionar estatísticas por plano
  Object.keys(statsPorPlano).forEach(plano => {
    statsHTML += `
      <div class="stat-card">
        <div class="stat-number">${statsPorPlano[plano]}</div>
        <div class="stat-label">${plano}</div>
      </div>
    `;
  });
  
  statsContainer.innerHTML = statsHTML;
}

function filtrarClientes() {
  const termo = document.getElementById('search-clientes').value.toLowerCase().trim();
  if (!termo) {
    clientesFiltrados = [...clientes];
  } else {
    clientesFiltrados = clientes.filter(cliente =>
      (cliente.nome || '').toLowerCase().includes(termo) ||
      (cliente.email || '').toLowerCase().includes(termo) ||
      (cliente.status || '').toLowerCase().includes(termo)
    );
  }
  atualizarTabelaClientes();
  atualizarEstatisticasClientes();
}

async function carregarPlanos() {
  const pagePlanos = document.getElementById('page-planos');
  if (pagePlanos) pagePlanos.style.display = '';
  mostrarLoader();
  try {
    const snapshot = await db.collection('planos').orderBy('nome').get();
    planos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    atualizarTabelaPlanos();
  } catch (err) {
    console.error('Erro ao carregar planos:', err);
    mostrarToast('Erro ao carregar planos');
    const tbody = document.querySelector('#table-planos tbody');
    if (tbody) tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#d32f2f;">Erro ao carregar planos</td></tr>';
  }
  esconderLoader();
}

function atualizarTabelaPlanos() {
  const tbody = document.querySelector('#table-planos tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  if (!planos || planos.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#5f6368;">Nenhum plano cadastrado</td></tr>';
    return;
  }

  document.querySelectorAll('#table-planos .plano-btn').forEach(btn => {
    btn.removeEventListener('click', handlePlanoAction);
  });

  planos.forEach(plano => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${plano.nome || '-'}</td>
      <td>${plano.descricao || '-'}</td>
      <td><span class="badge badge-${plano.status === 'ativo' ? 'success' : 'danger'}">${plano.status ? plano.status.charAt(0).toUpperCase() + plano.status.slice(1) : '-'}</span></td>
      <td>
        <button class="btn btn-sm btn-secondary plano-btn" data-id="${plano.id}" data-action="edit">Editar</button>
        <button class="btn btn-sm btn-danger plano-btn" data-id="${plano.id}" data-action="delete">Excluir</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  document.querySelectorAll('#table-planos .plano-btn').forEach(btn => {
    btn.addEventListener('click', handlePlanoAction);
  });
}

function handlePlanoAction(e) {
  e.preventDefault();
  const action = this.getAttribute('data-action');
  const id = this.getAttribute('data-id');
  
  if (action === 'edit') {
    window.editarPlano(id);
  } else if (action === 'delete') {
    window.excluirPlano(id);
  }
}

window.editarPlano = function(id) {
  const plano = planos.find(p => p.id === id);
  if (!plano) return;
  document.getElementById('plano-id').value = plano.id;
  document.getElementById('plano-nome').value = plano.nome;
  document.getElementById('plano-descricao').value = plano.descricao || '';
  document.getElementById('plano-status').value = plano.status || 'ativo';
  document.getElementById('modal-plano-titulo').textContent = 'Editar Plano';
  document.getElementById('modal-plano').classList.add('active');
}

window.excluirPlano = async function(id) {
  if (!confirm('Deseja realmente excluir este plano?')) return;
  mostrarLoader();
  try {
    await db.collection('planos').doc(id).delete();
    mostrarToast('Plano excluído!');
    await carregarPlanos();
  } catch (err) {
    mostrarToast('Erro ao excluir plano');
  }
  esconderLoader();
}

function handleClienteAction(e) {
  e.preventDefault();
  const action = this.getAttribute('data-action');
  const id = this.getAttribute('data-id');
  
  if (action === 'edit') {
    window.editarCliente(id);
  } else if (action === 'delete') {
    window.excluirCliente(id);
  }
}

window.editarCliente = function(id) {
  const cliente = clientes.find(c => c.id === id);
  if (!cliente) return;
  document.getElementById('cliente-id').value = cliente.id;
  document.getElementById('cliente-nome').value = cliente.nome;
  document.getElementById('cliente-email').value = cliente.email;
  document.getElementById('cliente-status').value = cliente.status;
  document.getElementById('cliente-telefone').value = cliente.telefone || '';
  document.getElementById('cliente-plano').value = cliente.plano || '';
  document.getElementById('cliente-observacoes').value = cliente.observacoes || '';
  document.getElementById('modal-cliente-titulo').textContent = 'Editar Cliente';
  document.getElementById('modal-cliente').classList.add('active');
}

window.excluirCliente = async function(id) {
  if (!confirm('Deseja realmente excluir este cliente?')) return;
  mostrarLoader();
  try {
    await db.collection('clientes').doc(id).delete();
    mostrarToast('Cliente excluído!');
    await carregarClientes();
  } catch (err) {
    mostrarToast('Erro ao excluir cliente');
  }
  esconderLoader();
}

document.getElementById('btn-novo-cliente')?.addEventListener('click', () => {
  document.getElementById('cliente-id').value = '';
  document.getElementById('form-cliente').reset();
  document.getElementById('modal-cliente-titulo').textContent = 'Novo Cliente';
  document.getElementById('modal-cliente').classList.add('active');
});

document.getElementById('close-modal-cliente')?.addEventListener('click', () => {
  document.getElementById('modal-cliente').classList.remove('active');
});

document.getElementById('form-cliente')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  mostrarLoader();
  const id = document.getElementById('cliente-id').value;
  const nome = document.getElementById('cliente-nome').value.trim();
  const email = document.getElementById('cliente-email').value.trim();
  const status = document.getElementById('cliente-status').value;
  const telefone = document.getElementById('cliente-telefone').value.trim();
  const plano = document.getElementById('cliente-plano').value.trim();
  const observacoes = document.getElementById('cliente-observacoes').value.trim();
  
  if (!validarCampo(nome, 'texto', 100)) {
    mostrarToast('Nome inválido');
    esconderLoader();
    return;
  }
  if (!validarCampo(email, 'email')) {
    mostrarToast('E-mail inválido');
    esconderLoader();
    return;
  }
  
  const dataCadastro = firebase.firestore.FieldValue.serverTimestamp();
  try {
    if (id) {
      await db.collection('clientes').doc(id).update({ nome, email, status, telefone, plano, observacoes });
      mostrarToast('Cliente atualizado!');
    } else {
      await db.collection('clientes').add({ nome, email, status, telefone, plano, observacoes, dataCadastro });
      mostrarToast('Cliente cadastrado!');
    }
    document.getElementById('modal-cliente').classList.remove('active');
    await carregarClientes();
  } catch (err) {
    mostrarToast('Erro ao salvar cliente');
  }
  esconderLoader();
});

document.getElementById('search-clientes')?.addEventListener('input', filtrarClientes);

document.getElementById('btn-exportar-clientes')?.addEventListener('click', () => {
  window.exportarClientesExcel();
});

window.exportarClientesExcel = function() {
  if (clientes.length === 0) {
    mostrarToast('Nenhum cliente para exportar');
    return;
  }
  
  const dados = clientes.map(c => ({
    'Nome': c.nome,
    'E-mail': c.email,
    'Status': c.status,
    'Telefone': c.telefone || '-',
    'Plano': c.plano || '-',
    'Observações': c.observacoes || '-',
    'Data Cadastro': formatarData(c.dataCadastro)
  }));
  
  const ws = XLSX.utils.json_to_sheet(dados);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Clientes');
  XLSX.writeFile(wb, `clientes_${new Date().toISOString().split('T')[0]}.xlsx`);
  
  mostrarToast('Clientes exportados com sucesso!');
}

document.getElementById('btn-novo-plano')?.addEventListener('click', () => {
  document.getElementById('plano-id').value = '';
  document.getElementById('form-plano').reset();
  document.getElementById('modal-plano-titulo').textContent = 'Novo Plano';
  document.getElementById('modal-plano').classList.add('active');
});

document.getElementById('close-modal-plano')?.addEventListener('click', () => {
  document.getElementById('modal-plano').classList.remove('active');
});

document.getElementById('form-plano')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  mostrarLoader();
  const id = document.getElementById('plano-id').value;
  const nome = document.getElementById('plano-nome').value.trim();
  const descricao = document.getElementById('plano-descricao').value.trim();
  const status = document.getElementById('plano-status').value;
  
  if (!validarCampo(nome, 'texto', 100)) {
    mostrarToast('Nome inválido');
    esconderLoader();
    return;
  }
  
  // Verificar se já existe um plano com o mesmo nome
  const planoExistente = planos.find(p => p.nome.toLowerCase() === nome.toLowerCase() && p.id !== id);
  if (planoExistente) {
    mostrarToast('Já existe um plano com este nome');
    esconderLoader();
    return;
  }
  
  try {
    if (id) {
      await db.collection('planos').doc(id).update({ nome, descricao, status });
      mostrarToast('Plano atualizado!');
    } else {
      await db.collection('planos').add({ nome, descricao, status });
      mostrarToast('Plano cadastrado!');
    }
    document.getElementById('modal-plano').classList.remove('active');
    await carregarPlanos();
    // Atualizar opções de plano nos clientes
    await atualizarOpcoesPlano();
  } catch (err) {
    mostrarToast('Erro ao salvar plano');
  }
  esconderLoader();
});

async function atualizarOpcoesPlano() {
  try {
    const select = document.getElementById('cliente-plano');
    if (!select) return;

    const snapshot = await db.collection('planos').get();
    let planosAtivos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Filtrar apenas planos ativos e ordenar por nome no JavaScript
    planosAtivos = planosAtivos
      .filter(plano => plano.status === 'ativo')
      .sort((a, b) => (a.nome || '').localeCompare(b.nome || ''));
    
    // Manter as opções padrão e adicionar as dinâmicas
    const currentValue = select.value;
    select.innerHTML = '<option value="">Selecione um plano</option>';
    planosAtivos.forEach(plano => {
      const option = document.createElement('option');
      option.value = plano.nome;
      option.textContent = plano.nome;
      select.appendChild(option);
    });
    
    // Restaurar valor se possível
    if (currentValue) select.value = currentValue;

  } catch (err) {
    console.warn('Não foi possível carregar opções de plano (provavelmente sem permissão ou coleção vazia):', err);
    // Se falhar, manter as opções que já estão no HTML se for o caso, 
    // ou apenas garantir que não quebre a execução
  }
}

// Sistema de Notificações Push
async function solicitarPermissaoNotificacoes() {
  if ('Notification' in window && 'serviceWorker' in navigator) {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      mostrarToast('Notificações ativadas! Você será avisado sobre produtos próximos do vencimento.');
      return true;
    } else {
      mostrarToast('Permissão de notificação negada.');
      return false;
    }
  } else {
    mostrarToast('Seu navegador não suporta notificações push.');
    return false;
  }
}

async function verificarNotificacoesProdutos() {
  if (!currentUser || Notification.permission !== 'granted') return;
  
  try {
    const snapshot = await db.collection('produtos')
      .where('userId', '==', currentUser.uid)
      .get();
    
    const produtos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const hoje = new Date();
    const diasAviso = parseInt(localStorage.getItem('diasAviso') || '7');
    
    let produtosVencendo = [];
    let produtosVencidos = [];
    
    produtos.forEach(produto => {
      if (produto.validade) {
        const dataValidade = parseData(produto.validade);
        if (dataValidade) {
          const diasRestantes = Math.ceil((dataValidade - hoje) / (1000 * 60 * 60 * 24));
          
          if (diasRestantes < 0) {
            produtosVencidos.push(produto);
          } else if (diasRestantes <= diasAviso) {
            produtosVencendo.push({ ...produto, diasRestantes });
          }
        }
      }
    });
    
    // Enviar notificações
    if (produtosVencidos.length > 0) {
      await enviarNotificacaoPush(
        `🚨 ${produtosVencidos.length} produto(s) vencido(s)!`,
        `Produtos vencidos precisam ser removidos do estoque.`
      );
    }
    
    if (produtosVencendo.length > 0) {
      const listaProdutos = produtosVencendo.slice(0, 3).map(p => `${p.nome} (${p.diasRestantes} dias)`).join(', ');
      await enviarNotificacaoPush(
        `⚠️ ${produtosVencendo.length} produto(s) vencendo em breve`,
        `Produtos: ${listaProdutos}${produtosVencendo.length > 3 ? '...' : ''}`
      );
    }
    
  } catch (err) {
    console.error('Erro ao verificar notificações:', err);
  }
}

async function enviarNotificacaoPush(titulo, corpo) {
  if ('serviceWorker' in navigator && 'Notification' in window) {
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(titulo, {
      body: corpo,
      icon: 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'%3E%3Crect width=\'100\' height=\'100\' rx=\'20\' fill=\'%23ff4444\'/%3E%3Ctext x=\'50\' y=\'55\' font-size=\'40\' fill=\'white\' text-anchor=\'middle\'%3E!%3C/text%3E%3C/svg%3E',
      badge: 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'%3E%3Crect width=\'100\' height=\'100\' rx=\'20\' fill=\'%23ff4444\'/%3E%3C/svg%3E',
      vibrate: [200, 100, 200, 100, 200],
      tag: 'fefo-alert',
      requireInteraction: true,
      actions: [
        { action: 'view', title: 'Ver Produtos' }
      ]
    });
  }
}

// Adicionar botão de notificações no dashboard
function adicionarBotaoNotificacoes() {
  const headerActions = document.querySelector('#page-dashboard .page-header .header-actions');
  if (!headerActions) return;
  
  // Verificar se o botão já existe
  if (document.getElementById('btn-notificacoes')) return;
  
  const btnNotificacoes = document.createElement('button');
  btnNotificacoes.id = 'btn-notificacoes';
  btnNotificacoes.className = 'btn btn-secondary';
  btnNotificacoes.innerHTML = '🔔 Ativar Notificações';
  btnNotificacoes.style.marginRight = '10px';
  
  btnNotificacoes.addEventListener('click', async () => {
    const granted = await solicitarPermissaoNotificacoes();
    if (granted) {
      btnNotificacoes.innerHTML = '✅ Notificações Ativas';
      btnNotificacoes.disabled = true;
    }
  });
  
  headerActions.insertBefore(btnNotificacoes, headerActions.firstChild);
}

document.getElementById('btn-atualizar')?.addEventListener('click', () => {
  carregarDashboard();
  mostrarToast('Dados atualizados!');
});

async function carregarDashboard() {
  if (!currentUser) return;
  mostrarLoader();
  
  try {
    const snapshot = await db.collection('produtos')
      .where('userId', '==', currentUser.uid)
      .get();
    
    produtos = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    const vencendo7Dias = produtos.filter(p => {
      const validade = new Date(p.validade);
      const diff = Math.ceil((validade - hoje) / (1000 * 60 * 60 * 24));
      return diff > 0 && diff <= 7;
    }).length;
    
    const vencidos = produtos.filter(p => {
      const validade = new Date(p.validade);
      return validade < hoje;
    }).length;
    
    const movSnapshot = await db.collection('movimentacoes')
      .where('userId', '==', currentUser.uid)
      .get();
    
    const movHoje = movSnapshot.docs.filter(doc => {
      const data = doc.data().data?.toDate();
      return data && data >= hoje;
    });
    
    document.getElementById('total-produtos').textContent = produtos.length;
    document.getElementById('vencendo-7dias').textContent = vencendo7Dias;
    document.getElementById('vencidos').textContent = vencidos;
    document.getElementById('movimentacoes-hoje').textContent = movHoje.length;
    
    // Calcular KPIs Executivos
    await calcularKPIs(produtos, movSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    
    atualizarGraficos(movSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    atualizarTabelaAlertas();
    
  } catch (err) {
    mostrarToast('Erro ao carregar dados');
    console.error('Erro ao carregar dashboard:', err);
  }
  
  adicionarBotaoNotificacoes();
  esconderLoader();
}

// Função para calcular KPIs Executivos
async function calcularKPIs(produtos, movimentacoes) {
  try {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    // 1. Total de Itens (substituindo Valor do Estoque)
    const totalItens = produtos.reduce((total, produto) => {
      return total + (parseFloat(produto.quantidade) || 0);
    }, 0);
    
    // 2. Produtos Críticos (vencem em até 7 dias)
    const produtosCriticos = produtos.filter(p => {
      const validade = new Date(p.validade);
      const diff = Math.ceil((validade - hoje) / (1000 * 60 * 60 * 24));
      return diff > 0 && diff <= 7;
    }).length;
    
    // 3. Produtos Vencidos
    const produtosVencidos = produtos.filter(p => {
      const validade = new Date(p.validade);
      return validade < hoje;
    }).length;
    
    // 4. Giro de Estoque (simplificado)
    const trintaDiasAtras = new Date();
    trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);
    
    const movUltimos30Dias = movimentacoes.filter(m => {
      const dataDoc = m.data;
      const data = (dataDoc && typeof dataDoc.toDate === 'function') ? dataDoc.toDate() : new Date(dataDoc);
      return data && data >= trintaDiasAtras;
    });
    
    const totalSaidas = movUltimos30Dias.filter(m => m.tipo === 'saida').reduce((total, m) => {
      return total + (parseFloat(m.quantidade) || 0);
    }, 0);
    
    const giroEstoque = totalItens > 0 ? (totalSaidas / totalItens).toFixed(2) : '0.00';
    
    // 5. Performance Score
    const produtosAtivos = produtos.filter(p => {
      const validade = new Date(p.validade);
      return validade >= hoje;
    }).length;
    
    const taxaAtivos = produtos.length > 0 ? (produtosAtivos / produtos.length) * 100 : 100;
    const performanceScore = Math.min(100, Math.max(0, taxaAtivos - (produtosCriticos * 2))).toFixed(0);
    
    // 6. Relatórios Gerados
    const relatoriosGerados = localStorage.getItem('relatorios_gerados_mes') || '0';
    
    // Atualizar interface
    document.getElementById('performance-score').textContent = `${performanceScore}%`;
    document.getElementById('relatorios-gerados').textContent = relatoriosGerados;
    
    if (document.getElementById('valor-estoque')) {
      document.getElementById('valor-estoque').textContent = totalItens.toLocaleString('pt-BR');
    }
    
    if (document.getElementById('giro-estoque')) {
      document.getElementById('giro-estoque').textContent = `${giroEstoque}x`;
    }
    
    atualizarTrendsKPIs();
    
  } catch (err) {
    console.error('Erro ao calcular KPIs:', err);
  }
}

// Função para atualizar trends dos KPIs
function atualizarTrendsKPIs() {
  // Simulação de trends - em produção, isso viria de dados históricos
  const trends = ['valor-estoque-trend', 'giro-estoque-trend'];
  
  trends.forEach(trendId => {
    const element = document.getElementById(trendId);
    if (element) {
      const randomChange = (Math.random() * 20 - 10).toFixed(1); // -10% a +10%
      const isPositive = randomChange > 0;
      element.textContent = `${isPositive ? '+' : ''}${randomChange}%`;
      element.className = `kpi-trend ${isPositive ? 'positive' : randomChange < 0 ? 'negative' : 'neutral'}`;
    }
  });
}

function atualizarGraficos(movimentacoesData) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  
  const ultimos7Dias = [];
  for (let i = 6; i >= 0; i--) {
    const data = new Date();
    data.setDate(data.getDate() - i);
    data.setHours(0, 0, 0, 0);
    ultimos7Dias.push(data);
  }
  
  const movPorDia = ultimos7Dias.map(dia => {
    return movimentacoesData.filter(m => {
      const dataMov = m.data?.toDate ? m.data.toDate() : new Date(m.data);
      if (!dataMov) return false;
      const d = new Date(dataMov);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === dia.getTime();
    }).length;
  });
  
  const ctxMov = document.getElementById('chart-movimentacoes');
  if (ctxMov) {
    if (window.chartMovimentacoes) window.chartMovimentacoes.destroy();
    
    window.chartMovimentacoes = new Chart(ctxMov, {
      type: 'line',
      data: {
        labels: ultimos7Dias.map(d => d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })),
        datasets: [{
          label: 'Movimentações',
          data: movPorDia,
          borderColor: '#1a73e8',
          backgroundColor: 'rgba(26, 115, 232, 0.1)',
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { display: false },
          title: { display: true, text: 'Movimentações (Últimos 7 dias)' }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1 }
          }
        }
      }
    });
  }
  
  // Atualizar apenas o gráfico de validade como segundo gráfico
  atualizarGraficoValidade();
}

function atualizarGraficoValidade() {
  const ctx = document.getElementById('chart-validade');
  if (!ctx) return;
  
  // Destruir gráfico existente se houver
  if (window.chartValidade && typeof window.chartValidade.destroy === 'function') {
    window.chartValidade.destroy();
  }
  
  const hoje = new Date();
  const statusValidade = {
    'Vencidos': 0,
    'Vencem hoje': 0,
    'Vencem em 7 dias': 0,
    'Vencem em 30 dias': 0,
    'Vencem depois': 0
  };
  
  produtos.forEach(p => {
    if (p.validade) {
      const dataValidade = parseData(p.validade);
      if (dataValidade) {
        const diasRestantes = Math.ceil((dataValidade - hoje) / (1000 * 60 * 60 * 24));
        
        if (diasRestantes < 0) {
          statusValidade['Vencidos']++;
        } else if (diasRestantes === 0) {
          statusValidade['Vencem hoje']++;
        } else if (diasRestantes <= 7) {
          statusValidade['Vencem em 7 dias']++;
        } else if (diasRestantes <= 30) {
          statusValidade['Vencem em 30 dias']++;
        } else {
          statusValidade['Vencem depois']++;
        }
      }
    }
  });
  
  const chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(statusValidade),
      datasets: [{
        label: 'Quantidade',
        data: Object.values(statusValidade),
        backgroundColor: [
          '#ea4335', // Vencidos - vermelho
          '#ff6d01', // Hoje - laranja escuro
          '#fbbc04', // 7 dias - amarelo
          '#34a853', // 30 dias - verde
          '#1a73e8'  // Depois - azul
        ]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false
        },
        title: {
          display: true,
          text: 'Status de Validade'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      }
    }
  });
  
  // Armazenar referência do gráfico para limpeza futura
  window.chartValidade = chart;
}

function atualizarTabelaAlertas() {
  const tbody = document.querySelector('#table-alertas tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  
  const alertas = produtos
    .map(p => {
      const validade = new Date(p.validade);
      const diff = Math.ceil((validade - hoje) / (1000 * 60 * 60 * 24));
      return { ...p, diasRestantes: diff };
    })
    .filter(p => p.diasRestantes <= 30)
    .sort((a, b) => a.diasRestantes - b.diasRestantes);
  
  alertas.forEach(p => {
    const tr = document.createElement('tr');
    
    let status, badgeClass;
    if (p.diasRestantes < 0) {
      status = 'Vencido';
      badgeClass = 'badge-danger';
    } else if (p.diasRestantes <= 7) {
      status = 'Vencendo';
      badgeClass = 'badge-warning';
    } else {
      status = 'Atenção';
      badgeClass = 'badge-warning';
    }
    
    tr.innerHTML = `
      <td>${p.nome}</td>
      <td>${p.lote}</td>
      <td>${formatarData(p.validade)}</td>
      <td>${p.quantidade} ${p.unidade}</td>
      <td><span class="badge ${badgeClass}">${status}</span></td>
    `;
    
    tbody.appendChild(tr);
  });
  
  if (alertas.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#5f6368;">Nenhum alerta de validade</td></tr>';
  }
}

async function carregarProdutos() {
  if (!currentUser) return;
  mostrarLoader();
  
  try {
    const snapshot = await db.collection('produtos')
      .where('userId', '==', currentUser.uid)
      .get();
    
    produtos = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    produtos.forEach(p => {
      if (p.categoria) categorias.add(p.categoria);
    });
    
    atualizarTabelaProdutos();
    atualizarFiltroCategorias();
    
  } catch (err) {
    mostrarToast('Erro ao carregar produtos');
  }
  
  esconderLoader();
}

function atualizarTabelaProdutos(filtrados = null) {
  const tbody = document.querySelector('#table-produtos tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  
  const lista = filtrados || produtos;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  
  document.querySelectorAll('#table-produtos .action-btn').forEach(btn => {
    btn.removeEventListener('click', handleProdutoAction);
  });
  
  lista.forEach(p => {
    const tr = document.createElement('tr');
    const validade = new Date(p.validade);
    const diff = Math.ceil((validade - hoje) / (1000 * 60 * 60 * 24));
    
    let status, badgeClass;
    if (diff < 0) {
      status = 'Vencido';
      badgeClass = 'badge-danger';
    } else if (diff <= 7) {
      status = 'Vencendo';
      badgeClass = 'badge-warning';
    } else {
      status = 'Normal';
      badgeClass = 'badge-success';
    }
    
    tr.innerHTML = `
      <td>${p.codigo}</td>
      <td>${p.nome}</td>
      <td>${p.categoria}</td>
      <td>${p.lote}</td>
      <td>${formatarData(p.validade)}</td>
      <td>${p.quantidade} ${p.unidade}</td>
      <td><span class="badge ${badgeClass}">${status}</span></td>
      <td>
        <button class="action-btn edit" data-id="${p.id}" data-action="edit" title="Editar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        </button>
        <button class="action-btn delete" data-id="${p.id}" data-action="delete" title="Excluir">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </td>
    `;
    
    tbody.appendChild(tr);
  });
  
  if (lista.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:#5f6368;">Nenhum produto encontrado</td></tr>';
  }

  document.querySelectorAll('#table-produtos .action-btn').forEach(btn => {
    btn.addEventListener('click', handleProdutoAction);
  });
}

function handleProdutoAction(e) {
  e.preventDefault();
  const action = this.getAttribute('data-action');
  const id = this.getAttribute('data-id');
  
  if (action === 'edit') {
    window.editarProduto(id);
  } else if (action === 'delete') {
    window.excluirProduto(id);
  }
}

function atualizarFiltroCategorias() {
  const select = document.getElementById('filtro-categoria');
  const datalist = document.getElementById('categorias-list');
  
  if (!select || !datalist) return;
  
  const opcoes = Array.from(categorias).sort();
  
  select.innerHTML = '<option value="">Todas as categorias</option>';
  datalist.innerHTML = '';
  
  opcoes.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    select.appendChild(option);
    
    const dataOption = document.createElement('option');
    dataOption.value = cat;
    datalist.appendChild(dataOption);
  });
}

document.getElementById('filtro-produtos')?.addEventListener('input', aplicarFiltrosProdutos);
document.getElementById('filtro-categoria')?.addEventListener('change', aplicarFiltrosProdutos);
document.getElementById('filtro-status')?.addEventListener('change', aplicarFiltrosProdutos);

function aplicarFiltrosProdutos() {
  const busca = (document.getElementById('filtro-produtos')?.value || '').toLowerCase();
  const categoria = document.getElementById('filtro-categoria')?.value || '';
  const status = document.getElementById('filtro-status')?.value || '';
  
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  
  let filtrados = produtos.filter(p => {
    const matchBusca = !busca || 
      p.nome.toLowerCase().includes(busca) ||
      p.codigo.toLowerCase().includes(busca) ||
      p.lote.toLowerCase().includes(busca);
    
    const matchCategoria = !categoria || p.categoria === categoria;
    
    let matchStatus = true;
    if (status) {
      const validade = new Date(p.validade);
      const diff = Math.ceil((validade - hoje) / (1000 * 60 * 60 * 24));
      
      if (status === 'vencido') matchStatus = diff < 0;
      else if (status === 'vencendo') matchStatus = diff >= 0 && diff <= 7;
      else if (status === 'normal') matchStatus = diff > 7;
    }
    
    return matchBusca && matchCategoria && matchStatus;
  });
  
  atualizarTabelaProdutos(filtrados);
}

document.getElementById('btn-novo-produto')?.addEventListener('click', () => {
  abrirModal('modal-produto');
  const titleEl = document.getElementById('modal-produto-title');
  const formEl = document.getElementById('form-produto');
  const idEl = document.getElementById('produto-id');
  
  if (titleEl) titleEl.textContent = 'Novo Produto';
  if (formEl) formEl.reset();
  if (idEl) idEl.value = '';
});

document.getElementById('form-produto')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  // Verificar se o modal está ativo
  const modal = document.getElementById('modal-produto');
  if (!modal || !modal.classList.contains('active')) {
    console.warn('Tentativa de submissão com modal fechado');
    return;
  }
  
  // Verificar se todos os elementos necessários existem
  const requiredElements = ['produto-codigo', 'produto-nome', 'produto-categoria', 'produto-unidade', 'produto-validade', 'produto-quantidade'];
  for (const elementId of requiredElements) {
    if (!document.getElementById(elementId)) {
      console.error(`Elemento obrigatório não encontrado: ${elementId}`);
      mostrarToast('Erro interno: formulário incompleto');
      return;
    }
  }
  
  mostrarLoader();
  
  // Usar função helper para obter valores de forma segura
  const getValue = (id) => {
    const element = document.getElementById(id);
    return element ? element.value : '';
  };
  
  const getTrimmedValue = (id) => {
    const element = document.getElementById(id);
    return element ? element.value?.trim() || '' : '';
  };
  
  const id = getValue('produto-id') || '';
  const codigo = getTrimmedValue('produto-codigo') || '';
  const nome = getTrimmedValue('produto-nome') || '';
  const categoria = getTrimmedValue('produto-categoria') || '';
  const unidade = getValue('produto-unidade') || '';
  const lote = getTrimmedValue('produto-lote') || '';
  const validade = getValue('produto-validade') || '';
  const quantidade = getValue('produto-quantidade') || '';
  const estoqueMin = getValue('produto-estoque-min') || '0';
  
  if (!validarCampo(codigo, 'texto', 50)) {
    mostrarToast('Código inválido');
    esconderLoader();
    return;
  }
  if (!validarCampo(nome, 'texto', 100)) {
    mostrarToast('Nome inválido');
    esconderLoader();
    return;
  }
  if (!validarCampo(lote, 'texto', 50)) {
    mostrarToast('Lote inválido');
    esconderLoader();
    return;
  }
  if (!validarCampo(validade, 'data')) {
    mostrarToast('Data de validade inválida');
    esconderLoader();
    return;
  }
  if (!validarCampo(quantidade, 'numero')) {
    mostrarToast('Quantidade inválida');
    esconderLoader();
    return;
  }
  
  const dados = {
    codigo: codigo,
    nome: nome,
    categoria: categoria,
    unidade: unidade,
    lote: lote,
    validade: validade,
    quantidade: parseFloat(quantidade),
    estoqueMin: parseFloat(estoqueMin) || 0,
    localizacao: getTrimmedValue('produto-localizacao'),
    observacoes: getTrimmedValue('produto-observacoes'),
    userId: currentUser.uid,
    atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
  };
  
  try {
    if (id) {
      await db.collection('produtos').doc(id).update(dados);
      mostrarToast('Produto atualizado com sucesso!');
    } else {
      // Verificar limite de produtos por plano
      const limites = {
        'gratuito': 100,
        'profissional': 5000,
        'enterprise': 999999
      };
      
      const limiteAtual = limites[window.userPlan] || 100;
      
      if (produtos.length >= limiteAtual) {
        mostrarToast(`Limite de ${limiteAtual} produtos atingido para o seu plano.`);
        esconderLoader();
        return;
      }

      dados.criadoEm = firebase.firestore.FieldValue.serverTimestamp();
      await db.collection('produtos').add(dados);
      mostrarToast('Produto cadastrado com sucesso!');
      
      await registrarMovimentacao({
        tipo: 'entrada',
        produtoId: dados.codigo,
        produtoNome: dados.nome,
        lote: dados.lote,
        quantidade: dados.quantidade,
        observacao: 'Cadastro inicial'
      });
    }
    
    fecharModal('modal-produto');
    carregarProdutos();
    
  } catch (err) {
    mostrarToast('Erro ao salvar produto');
  }
  
  esconderLoader();
});

window.editarProduto = async function(id) {
  const produto = produtos.find(p => p.id === id);
  if (!produto) return;
  
  abrirModal('modal-produto');
  const titleEl = document.getElementById('modal-produto-title');
  if (titleEl) titleEl.textContent = 'Editar Produto';
  
  const idEl = document.getElementById('produto-id');
  const codigoEl = document.getElementById('produto-codigo');
  const nomeEl = document.getElementById('produto-nome');
  const categoriaEl = document.getElementById('produto-categoria');
  const unidadeEl = document.getElementById('produto-unidade');
  const loteEl = document.getElementById('produto-lote');
  const validadeEl = document.getElementById('produto-validade');
  const quantidadeEl = document.getElementById('produto-quantidade');
  const estoqueMinEl = document.getElementById('produto-estoque-min');
  const localizacaoEl = document.getElementById('produto-localizacao');
  const observacoesEl = document.getElementById('produto-observacoes');
  
  if (idEl) idEl.value = id;
  if (codigoEl) codigoEl.value = produto.codigo;
  if (nomeEl) nomeEl.value = produto.nome;
  if (categoriaEl) categoriaEl.value = produto.categoria;
  if (unidadeEl) unidadeEl.value = produto.unidade;
  if (loteEl) loteEl.value = produto.lote;
  if (validadeEl) validadeEl.value = produto.validade;
  if (quantidadeEl) quantidadeEl.value = produto.quantidade;
  if (estoqueMinEl) estoqueMinEl.value = produto.estoqueMin || 0;
  if (localizacaoEl) localizacaoEl.value = produto.localizacao || '';
  if (observacoesEl) observacoesEl.value = produto.observacoes || '';
}

window.excluirProduto = async function(id) {
  if (!confirm('Deseja realmente excluir este produto?')) return;
  
  mostrarLoader();
  try {
    await db.collection('produtos').doc(id).delete();
    mostrarToast('Produto excluído com sucesso!');
    carregarProdutos();
  } catch (err) {
    mostrarToast('Erro ao excluir produto');
  }
  esconderLoader();
}

document.getElementById('btn-nova-movimentacao')?.addEventListener('click', () => {
  abrirModal('modal-movimentacao');
  document.getElementById('form-movimentacao').reset();
  atualizarSelectProdutos();
});

function atualizarSelectProdutos() {
  const select = document.getElementById('mov-produto');
  if (!select) return;
  select.innerHTML = '<option value="">Selecione um produto...</option>';
  
  produtos.forEach(p => {
    const option = document.createElement('option');
    option.value = p.id;
    option.textContent = `${p.nome} - Lote: ${p.lote} (${p.quantidade} ${p.unidade})`;
    select.appendChild(option);
  });
}

document.getElementById('form-movimentacao')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  mostrarLoader();
  
  const tipo = document.getElementById('mov-tipo').value;
  const produtoId = document.getElementById('mov-produto').value;
  const quantidade = parseFloat(document.getElementById('mov-quantidade').value);
  const observacao = document.getElementById('mov-observacao').value.trim();
  
  const produto = produtos.find(p => p.id === produtoId);
  if (!produto) {
    mostrarToast('Produto não encontrado');
    esconderLoader();
    return;
  }
  
  try {
    let novaQuantidade = produto.quantidade;
    
    if (tipo === 'entrada') {
      novaQuantidade += quantidade;
    } else if (tipo === 'saida' || tipo === 'descarte') {
      novaQuantidade -= quantidade;
      if (novaQuantidade < 0) {
        mostrarToast('Quantidade insuficiente em estoque!');
        esconderLoader();
        return;
      }
    } else if (tipo === 'ajuste') {
      novaQuantidade = quantidade;
    }
    
    await db.collection('produtos').doc(produtoId).update({
      quantidade: novaQuantidade,
      atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    await registrarMovimentacao({
      tipo: tipo,
      produtoId: produto.codigo,
      produtoNome: produto.nome,
      lote: produto.lote,
      quantidade: quantidade,
      observacao: observacao
    });
    
    mostrarToast('Movimentação registrada com sucesso!');
    fecharModal('modal-movimentacao');
    carregarProdutos();
    
  } catch (err) {
    mostrarToast('Erro ao registrar movimentação');
  }
  
  esconderLoader();
});

async function registrarMovimentacao(dados) {
  await db.collection('movimentacoes').add({
    ...dados,
    userId: currentUser.uid,
    usuario: currentUser.email,
    data: firebase.firestore.FieldValue.serverTimestamp()
  });
}

async function carregarMovimentacoes() {
  if (!currentUser) return;
  mostrarLoader();
  
  try {
    const snapshot = await db.collection('movimentacoes')
      .where('userId', '==', currentUser.uid)
      .get();
    
    movimentacoes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    movimentacoes.sort((a, b) => {
      const dataA = a.data?.toDate ? a.data.toDate() : new Date(0);
      const dataB = b.data?.toDate ? b.data.toDate() : new Date(0);
      return dataB - dataA;
    });
    
    movimentacoes = movimentacoes.slice(0, 100);
    
    atualizarTabelaMovimentacoes();
    
  } catch (err) {
    mostrarToast('Erro ao carregar movimentações');
  }
  
  esconderLoader();
}

function atualizarTabelaMovimentacoes(filtradas = null) {
  const tbody = document.querySelector('#table-movimentacoes tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  
  const lista = filtradas || movimentacoes;
  
  lista.forEach(m => {
    const tr = document.createElement('tr');
    
    const data = m.data?.toDate ? m.data.toDate() : new Date();
    const tipoMap = {
      'entrada': 'Entrada',
      'saida': 'Saída',
      'ajuste': 'Ajuste',
      'descarte': 'Descarte'
    };
    
    tr.innerHTML = `
      <td>${data ? data.toLocaleString('pt-BR') : '-'}</td>
      <td>${tipoMap[m.tipo] || m.tipo}</td>
      <td>${m.produtoNome}</td>
      <td>${m.lote}</td>
      <td>${m.quantidade}</td>
      <td>${m.usuario}</td>
      <td>${m.observacao || '-'}</td>
    `;
    
    tbody.appendChild(tr);
  });
  
  if (lista.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#5f6368;">Nenhuma movimentação encontrada</td></tr>';
  }
}

document.getElementById('btn-filtrar-mov')?.addEventListener('click', () => {
  const dataInicio = document.getElementById('filtro-data-inicio').value;
  const dataFim = document.getElementById('filtro-data-fim').value;
  const tipo = document.getElementById('filtro-tipo-mov').value;
  
  let filtradas = movimentacoes.filter(m => {
    const data = m.data?.toDate ? m.data.toDate() : new Date();
    const dataStr = data.toISOString().split('T')[0];
    
    const matchInicio = !dataInicio || dataStr >= dataInicio;
    const matchFim = !dataFim || dataStr <= dataFim;
    const matchTipo = !tipo || m.tipo === tipo;
    
    return matchInicio && matchFim && matchTipo;
  });
  
  atualizarTabelaMovimentacoes(filtradas);
});

document.getElementById('form-perfil')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  mostrarLoader();
  
  const nome = document.getElementById('config-nome').value.trim();
  const empresa = document.getElementById('config-empresa').value.trim();
  
  try {
    await db.collection('usuarios').doc(currentUser.uid).update({
      nome: nome,
      empresa: empresa
    });
    
    document.getElementById('user-name').textContent = nome;
    mostrarToast('Perfil atualizado com sucesso!');
  } catch (err) {
    mostrarToast('Erro ao atualizar perfil');
  }
  
  esconderLoader();
});

document.getElementById('form-alertas')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  mostrarLoader();
  
  const diasAviso = parseInt(document.getElementById('config-dias-aviso').value);
  const emailAlertas = document.getElementById('config-email-alertas').checked;
  
  try {
    await db.collection('usuarios').doc(currentUser.uid).update({
      'configuracoes.diasAviso': diasAviso,
      'configuracoes.emailAlertas': emailAlertas
    });
    
    mostrarToast('Configurações salvas com sucesso!');
  } catch (err) {
    mostrarToast('Erro ao salvar configurações');
  }
  
  esconderLoader();
});

document.getElementById('form-alterar-senha')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  mostrarLoader();
  
  const senhaAtual = document.getElementById('config-senha-atual').value;
  const senhaNova = document.getElementById('config-senha-nova').value;
  const senhaConfirmar = document.getElementById('config-senha-confirmar').value;
  
  if (senhaNova !== senhaConfirmar) {
    mostrarToast('As senhas não coincidem!');
    esconderLoader();
    return;
  }
  
  try {
    const credential = firebase.auth.EmailAuthProvider.credential(
      currentUser.email,
      senhaAtual
    );
    
    await currentUser.reauthenticateWithCredential(credential);
    await currentUser.updatePassword(senhaNova);
    
    mostrarToast('Senha alterada com sucesso!');
    document.getElementById('form-alterar-senha').reset();
  } catch (err) {
    mostrarToast('Erro: ' + traduzirErroFirebase(err.code));
  }
  
  esconderLoader();
});

document.getElementById('form-relatorios-auto')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  await salvarConfiguracoesRelatorios();
});

function abrirModal(modalId) {
  const overlay = document.getElementById('modal-overlay');
  const modal = document.getElementById(modalId);
  
  if (overlay) {
    overlay.classList.add('active');
  } else {
    console.warn('Modal overlay não encontrado');
  }
  
  if (modal) {
    modal.classList.add('active');
    console.log(`Modal ${modalId} aberto com sucesso`);
  } else {
    console.warn(`Modal com ID '${modalId}' não encontrado`);
  }
}

window.fecharModal = function(modalId) {
  const overlay = document.getElementById('modal-overlay');
  const modal = document.getElementById(modalId);
  
  if (overlay) overlay.classList.remove('active');
  if (modal) modal.classList.remove('active');
}

document.getElementById('modal-overlay')?.addEventListener('click', (e) => {
  if (e.target.id === 'modal-overlay') {
    document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
    e.target.classList.remove('active');
  }
});

window.exportarEstoqueExcel = function() {
  if (produtos.length === 0) {
    mostrarToast('Nenhum produto para exportar');
    return;
  }
  
  const dados = produtos.map(p => ({
    'Código': p.codigo,
    'Nome': p.nome,
    'Categoria': p.categoria,
    'Lote': p.lote,
    'Validade': formatarData(p.validade),
    'Quantidade': p.quantidade,
    'Unidade': p.unidade,
    'Localização': p.localizacao || '-',
    'Observações': p.observacoes || '-'
  }));
  
  const ws = XLSX.utils.json_to_sheet(dados);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Estoque');
  XLSX.writeFile(wb, `estoque_${new Date().toISOString().split('T')[0]}.xlsx`);
  
  mostrarToast('Exportado com sucesso!');
}

window.exportarEstoquePDF = function() {
  if (produtos.length === 0) {
    mostrarToast('Nenhum produto para exportar');
    return;
  }
  
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text('Relatório de Estoque', 14, 20);
  
  doc.setFontSize(11);
  doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 14, 28);
  
  const dados = produtos.map(p => [
    p.codigo,
    p.nome,
    p.lote,
    formatarData(p.validade),
    `${p.quantidade} ${p.unidade}`
  ]);
  
  doc.autoTable({
    head: [['Código', 'Nome', 'Lote', 'Validade', 'Quantidade']],
    body: dados,
    startY: 35,
    styles: { fontSize: 9 }
  });
  
  doc.save(`estoque_${new Date().toISOString().split('T')[0]}.pdf`);
  mostrarToast('Exportado com sucesso!');
}

window.exportarVencimentosExcel = function() {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  
  const vencimentos = produtos
    .filter(p => {
      const validade = new Date(p.validade);
      const diff = Math.ceil((validade - hoje) / (1000 * 60 * 60 * 24));
      return diff <= 30;
    })
    .map(p => ({
      'Código': p.codigo,
      'Nome': p.nome,
      'Lote': p.lote,
      'Validade': formatarData(p.validade),
      'Quantidade': p.quantidade,
      'Unidade': p.unidade
    }));
  
  if (vencimentos.length === 0) {
    mostrarToast('Nenhum produto vencendo em 30 dias');
    return;
  }
  
  const ws = XLSX.utils.json_to_sheet(vencimentos);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Vencimentos');
  XLSX.writeFile(wb, `vencimentos_${new Date().toISOString().split('T')[0]}.xlsx`);
  
  mostrarToast('Exportado com sucesso!');
}

window.exportarVencimentosPDF = function() {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  
  const vencimentos = produtos.filter(p => {
    const validade = new Date(p.validade);
    const diff = Math.ceil((validade - hoje) / (1000 * 60 * 60 * 24));
    return diff <= 30;
  });
  
  if (vencimentos.length === 0) {
    mostrarToast('Nenhum produto vencendo em 30 dias');
    return;
  }
  
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text('Produtos Próximos ao Vencimento', 14, 20);
  
  doc.setFontSize(11);
  doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 14, 28);
  
  const dados = vencimentos.map(p => [
    p.codigo,
    p.nome,
    p.lote,
    formatarData(p.validade),
    `${p.quantidade} ${p.unidade}`
  ]);
  
  doc.autoTable({
    head: [['Código', 'Nome', 'Lote', 'Validade', 'Quantidade']],
    body: dados,
    startY: 35,
    styles: { fontSize: 9 }
  });
  
  doc.save(`vencimentos_${new Date().toISOString().split('T')[0]}.pdf`);
  mostrarToast('Exportado com sucesso!');
}

window.exportarMovimentacoesExcel = function() {
  const dataInicio = document.getElementById('rel-data-inicio').value;
  const dataFim = document.getElementById('rel-data-fim').value;
  
  let dados = movimentacoes;
  
  if (dataInicio || dataFim) {
    dados = movimentacoes.filter(m => {
      const data = m.data?.toDate ? m.data.toDate() : new Date();
      const dataStr = data.toISOString().split('T')[0];
      
      const matchInicio = !dataInicio || dataStr >= dataInicio;
      const matchFim = !dataFim || dataStr <= dataFim;
      
      return matchInicio && matchFim;
    });
  }
  
  if (dados.length === 0) {
    mostrarToast('Nenhuma movimentação para exportar');
    return;
  }
  
  const exportar = dados.map(m => {
    const data = m.data?.toDate ? m.data.toDate() : new Date();
    return {
      'Data/Hora': data.toLocaleString('pt-BR'),
      'Tipo': m.tipo,
      'Produto': m.produtoNome,
      'Lote': m.lote,
      'Quantidade': m.quantidade,
      'Usuário': m.usuario,
      'Observação': m.observacao || '-'
    };
  });
  
  const ws = XLSX.utils.json_to_sheet(exportar);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Movimentações');
  XLSX.writeFile(wb, `movimentacoes_${new Date().toISOString().split('T')[0]}.xlsx`);
  
  mostrarToast('Exportado com sucesso!');
}

window.exportarMovimentacoesPDF = function() {
  const dataInicio = document.getElementById('rel-data-inicio').value;
  const dataFim = document.getElementById('rel-data-fim').value;
  
  let dados = movimentacoes;
  
  if (dataInicio || dataFim) {
    dados = movimentacoes.filter(m => {
      const data = m.data?.toDate ? m.data.toDate() : new Date();
      const dataStr = data.toISOString().split('T')[0];
      
      const matchInicio = !dataInicio || dataStr >= dataInicio;
      const matchFim = !dataFim || dataStr <= dataFim;
      
      return matchInicio && matchFim;
    });
  }
  
  if (dados.length === 0) {
    mostrarToast('Nenhuma movimentação para exportar');
    return;
  }
  
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text('Histórico de Movimentações', 14, 20);
  
  doc.setFontSize(11);
  doc.text(`Período: ${dataInicio || 'Todas'} até ${dataFim || 'Hoje'}`, 14, 28);
  
  const exportar = dados.map(m => {
    const data = m.data?.toDate ? m.data.toDate() : new Date();
    return [
      data.toLocaleDateString('pt-BR'),
      m.tipo,
      m.produtoNome,
      m.lote,
      m.quantidade
    ];
  });
  
  doc.autoTable({
    head: [['Data', 'Tipo', 'Produto', 'Lote', 'Qtd']],
    body: exportar,
    startY: 35,
    styles: { fontSize: 8 }
  });
  
  doc.save(`movimentacoes_${new Date().toISOString().split('T')[0]}.pdf`);
  mostrarToast('Exportado com sucesso!');
}

window.exportarBackup = async function() {
  if (!currentUser) return;
  
  mostrarLoader();
  
  try {
    const backup = {
      usuario: {
        email: currentUser.email,
        exportadoEm: new Date().toISOString()
      },
      produtos: produtos,
      movimentacoes: movimentacoes.map(m => ({
        ...m,
        data: m.data?.toDate ? m.data.toDate().toISOString() : new Date().toISOString()
      }))
    };
    
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_fefo_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    mostrarToast('Backup exportado com sucesso!');
  } catch (err) {
    mostrarToast('Erro ao exportar backup');
  }
  
  esconderLoader();
}

window.limparDadosAntigos = async function() {
  const confirmacao = prompt('Digite "CONFIRMAR" para limpar movimentações antigas (mais de 90 dias):');
  if (confirmacao !== 'CONFIRMAR') return;
  
  mostrarLoader();
  
  try {
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() - 90);
    
    const snapshot = await db.collection('movimentacoes')
      .where('userId', '==', currentUser.uid)
      .where('data', '<', dataLimite)
      .get();
    
    const batch = db.batch();
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    
    mostrarToast(`${snapshot.size} movimentações antigas removidas!`);
    carregarMovimentacoes();
  } catch (err) {
    mostrarToast('Erro ao limpar dados');
  }
  
  esconderLoader();
}

function traduzirErroFirebase(codigo) {
  const erros = {
    'auth/invalid-email': 'E-mail inválido',
    'auth/user-disabled': 'Usuário desabilitado',
    'auth/user-not-found': 'Usuário não encontrado. Crie uma conta primeiro.',
    'auth/wrong-password': 'Senha incorreta',
    'auth/email-already-in-use': 'E-mail já cadastrado',
    'auth/weak-password': 'Senha muito fraca (mínimo 6 caracteres)',
    'auth/network-request-failed': 'Erro de conexão com internet',
    'auth/too-many-requests': 'Muitas tentativas. Tente mais tarde',
    'auth/requires-recent-login': 'Faça login novamente para continuar',
    'auth/invalid-credential': 'E-mail ou senha incorretos',
    'auth/operation-not-allowed': 'Operação não permitida',
    'auth/account-exists-with-different-credential': 'Conta já existe com outro método',
    'auth/invalid-verification-code': 'Código de verificação inválido',
    'auth/invalid-verification-id': 'ID de verificação inválido',
    'auth/missing-verification-code': 'Código de verificação ausente',
    'auth/missing-verification-id': 'ID de verificação ausente',
    'auth/code-expired': 'Código expirado',
    'auth/expired-action-code': 'Código de ação expirado',
    'auth/invalid-action-code': 'Código de ação inválido'
  };
  
  return erros[codigo] || `Erro: ${codigo}`;
}

// === FUNÇÕES DE BACKUP E RESTAURAÇÃO ===

// Criar backup completo de todos os dados
async function criarBackupCompleto() {
  if (!currentUser) {
    mostrarToast('Faça login para criar backup');
    return;
  }

  mostrarLoader();
  
  try {
    const backup = {
      versao: '1.0',
      dataCriacao: new Date().toISOString(),
      userId: currentUser.uid,
      dados: {}
    };

    // Buscar produtos
    const produtosSnapshot = await db.collection('produtos').where('userId', '==', currentUser.uid).get();
    backup.dados.produtos = produtosSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Buscar movimentações
    const movSnapshot = await db.collection('movimentacoes').where('userId', '==', currentUser.uid).get();
    backup.dados.movimentacoes = movSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Buscar clientes
    const clientesSnapshot = await db.collection('clientes').where('userId', '==', currentUser.uid).get();
    backup.dados.clientes = clientesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Salvar arquivo
    const nomeArquivo = `backup-fefo-${new Date().toISOString().split('T')[0]}.json`;
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = nomeArquivo;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Salvar no histórico local
    salvarBackupHistorico(nomeArquivo, backup);
    
    mostrarToast('Backup criado com sucesso!', 'success');
    
  } catch (err) {
    console.error('Erro ao criar backup:', err);
    mostrarToast('Erro ao criar backup');
  }
  
  esconderLoader();
}

// Criar backup apenas de produtos
async function criarBackupProdutos() {
  if (!currentUser) {
    mostrarToast('Faça login para criar backup');
    return;
  }

  mostrarLoader();
  
  try {
    const produtosSnapshot = await db.collection('produtos').where('userId', '==', currentUser.uid).get();
    const produtos = produtosSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    const backup = {
      versao: '1.0',
      dataCriacao: new Date().toISOString(),
      userId: currentUser.uid,
      tipo: 'produtos',
      dados: { produtos }
    };

    const nomeArquivo = `backup-produtos-fefo-${new Date().toISOString().split('T')[0]}.json`;
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = nomeArquivo;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    salvarBackupHistorico(nomeArquivo, backup);
    
    mostrarToast('Backup de produtos criado!', 'success');
    
  } catch (err) {
    console.error('Erro ao criar backup de produtos:', err);
    mostrarToast('Erro ao criar backup de produtos');
  }
  
  esconderLoader();
}

// Salvar backup no histórico local
function salvarBackupHistorico(nomeArquivo, backup) {
  const historico = JSON.parse(localStorage.getItem('backup_history') || '[]');
  historico.unshift({
    nome: nomeArquivo,
    data: backup.dataCriacao,
    tipo: backup.tipo || 'completo',
    tamanho: JSON.stringify(backup).length
  });
  
  // Manter apenas os últimos 10 backups
  if (historico.length > 10) {
    historico.splice(10);
  }
  
  localStorage.setItem('backup_history', JSON.stringify(historico));
  atualizarHistoricoBackup();
}

// Atualizar histórico de backups na interface
function atualizarHistoricoBackup() {
  const historico = JSON.parse(localStorage.getItem('backup_history') || '[]');
  const container = document.getElementById('backup-history');
  
  if (historico.length === 0) {
    container.innerHTML = '<p class="text-muted">Nenhum backup encontrado</p>';
    return;
  }
  
  const html = historico.map(backup => `
    <div class="backup-item">
      <div class="backup-info">
        <strong>${backup.nome}</strong>
        <small>${new Date(backup.data).toLocaleDateString('pt-BR')} - ${backup.tipo} (${(backup.tamanho / 1024).toFixed(1)} KB)</small>
      </div>
    </div>
  `).join('');
  
  container.innerHTML = html;
}

// Manipular seleção de arquivo de backup
document.getElementById('file-backup').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const backup = JSON.parse(e.target.result);
      document.getElementById('backup-filename').textContent = file.name;
      document.getElementById('backup-date').textContent = new Date(backup.dataCriacao).toLocaleString('pt-BR');
      document.getElementById('backup-file-info').style.display = 'block';
      document.getElementById('btn-restaurar').disabled = false;
      
      // Salvar backup carregado globalmente
      window.backupCarregado = backup;
      
    } catch (err) {
      mostrarToast('Arquivo de backup inválido');
      document.getElementById('btn-restaurar').disabled = true;
    }
  };
  reader.readAsText(file);
});

// Restaurar backup
async function restaurarBackup() {
  if (!window.backupCarregado) {
    mostrarToast('Selecione um arquivo de backup primeiro');
    return;
  }
  
  if (!currentUser) {
    mostrarToast('Faça login para restaurar backup');
    return;
  }
  
  const confirmar = confirm('ATENÇÃO: Esta ação irá sobrescrever todos os dados atuais. Deseja continuar?');
  if (!confirmar) return;
  
  mostrarLoader();
  
  try {
    const backup = window.backupCarregado;
    
    // Restaurar produtos
    if (backup.dados.produtos) {
      // Limpar produtos existentes
      const produtosExistentes = await db.collection('produtos').where('userId', '==', currentUser.uid).get();
      const batchProdutos = db.batch();
      produtosExistentes.docs.forEach(doc => {
        batchProdutos.delete(doc.ref);
      });
      
      // Adicionar produtos do backup
      backup.dados.produtos.forEach(produto => {
        const docRef = db.collection('produtos').doc();
        batchProdutos.set(docRef, { ...produto, userId: currentUser.uid });
      });
      
      await batchProdutos.commit();
    }
    
    // Restaurar movimentações
    if (backup.dados.movimentacoes) {
      const movExistentes = await db.collection('movimentacoes').where('userId', '==', currentUser.uid).get();
      const batchMov = db.batch();
      movExistentes.docs.forEach(doc => {
        batchMov.delete(doc.ref);
      });
      
      backup.dados.movimentacoes.forEach(mov => {
        const docRef = db.collection('movimentacoes').doc();
        batchMov.set(docRef, { ...mov, userId: currentUser.uid });
      });
      
      await batchMov.commit();
    }
    
    // Restaurar clientes
    if (backup.dados.clientes) {
      const clientesExistentes = await db.collection('clientes').where('userId', '==', currentUser.uid).get();
      const batchClientes = db.batch();
      clientesExistentes.docs.forEach(doc => {
        batchClientes.delete(doc.ref);
      });
      
      backup.dados.clientes.forEach(cliente => {
        const docRef = db.collection('clientes').doc();
        batchClientes.set(docRef, { ...cliente, userId: currentUser.uid });
      });
      
      await batchClientes.commit();
    }
    
    mostrarToast('Backup restaurado com sucesso!', 'success');
    
    // Recarregar dados
    await carregarDashboard();
    
  } catch (err) {
    console.error('Erro ao restaurar backup:', err);
    mostrarToast('Erro ao restaurar backup');
  }
  
  esconderLoader();
}

// Limpar produtos vencidos
async function limparProdutosVencidos() {
  if (!currentUser) {
    mostrarToast('Faça login para continuar');
    return;
  }
  
  const confirmar = confirm('Deseja remover todos os produtos vencidos? Esta ação não pode ser desfeita.');
  if (!confirmar) return;
  
  mostrarLoader();
  
  try {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    const snapshot = await db.collection('produtos')
      .where('userId', '==', currentUser.uid)
      .get();
    
    const batch = db.batch();
    let removidos = 0;
    
    snapshot.docs.forEach(doc => {
      const validade = new Date(doc.data().validade);
      if (validade < hoje) {
        batch.delete(doc.ref);
        removidos++;
      }
    });
    
    if (removidos > 0) {
      await batch.commit();
      mostrarToast(`${removidos} produto(s) vencido(s) removido(s)`, 'success');
      await carregarDashboard();
    } else {
      mostrarToast('Nenhum produto vencido encontrado');
    }
    
  } catch (err) {
    console.error('Erro ao limpar produtos vencidos:', err);
    mostrarToast('Erro ao limpar produtos vencidos');
  }
  
  esconderLoader();
}

// Limpar movimentações antigas (mais de 1 ano)
async function limparMovimentacoesAntigas() {
  if (!currentUser) {
    mostrarToast('Faça login para continuar');
    return;
  }
  
  const confirmar = confirm('Deseja remover movimentações com mais de 1 ano? Esta ação não pode ser desfeita.');
  if (!confirmar) return;
  
  mostrarLoader();
  
  try {
    const umAnoAtras = new Date();
    umAnoAtras.setFullYear(umAnoAtras.getFullYear() - 1);
    
    const snapshot = await db.collection('movimentacoes')
      .where('userId', '==', currentUser.uid)
      .get();
    
    const batch = db.batch();
    let removidos = 0;
    
    snapshot.docs.forEach(doc => {
      const data = doc.data().data?.toDate();
      if (data && data < umAnoAtras) {
        batch.delete(doc.ref);
        removidos++;
      }
    });
    
    if (removidos > 0) {
      await batch.commit();
      mostrarToast(`${removidos} movimentação(ões) antiga(s) removida(s)`, 'success');
      await carregarDashboard();
    } else {
      mostrarToast('Nenhuma movimentação antiga encontrada');
    }
    
  } catch (err) {
    console.error('Erro ao limpar movimentações antigas:', err);
    mostrarToast('Erro ao limpar movimentações antigas');
  }
  
  esconderLoader();
}

// Função auxiliar para exportar backup (compatibilidade com configurações)
function exportarBackup() {
  criarBackupCompleto();
}

// Função auxiliar para limpar dados antigos (compatibilidade com configurações)
function limparDadosAntigos() {
  if (confirm('Deseja limpar produtos vencidos e movimentações antigas?')) {
    limparProdutosVencidos();
    setTimeout(() => limparMovimentacoesAntigas(), 1000);
  }
}

// Carregar página de backup
function carregarBackup() {
  atualizarHistoricoBackup();
}

// === FUNÇÕES DE RELATÓRIOS AUTOMATIZADOS ===

// Carregar configurações de relatórios
function carregarConfiguracoesRelatorios() {
  const config = JSON.parse(localStorage.getItem('config_relatorios') || '{}');
  
  document.getElementById('relatorio-diario').checked = config.diario || false;
  document.getElementById('relatorio-semanal').checked = config.semanal || false;
  document.getElementById('relatorio-mensal').checked = config.mensal || false;
  document.getElementById('email-relatorios').value = config.email || '';
  document.getElementById('notificacao-browser').checked = config.notificacaoBrowser || false;
}

// Salvar configurações de relatórios
async function salvarConfiguracoesRelatorios() {
  const config = {
    diario: document.getElementById('relatorio-diario').checked,
    semanal: document.getElementById('relatorio-semanal').checked,
    mensal: document.getElementById('relatorio-mensal').checked,
    email: document.getElementById('email-relatorios').value.trim(),
    notificacaoBrowser: document.getElementById('notificacao-browser').checked,
    ultimaAtualizacao: new Date().toISOString()
  };
  
  localStorage.setItem('config_relatorios', JSON.stringify(config));
  
  // Solicitar permissão para notificações se ativado
  if (config.notificacaoBrowser && 'Notification' in window) {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      mostrarToast('Permissão para notificações negada');
    }
  }
  
  mostrarToast('Configurações de relatórios salvas!', 'success');
  
  // Agendar próximos relatórios
  agendarRelatorios();
}

// Agendar relatórios automáticos
function agendarRelatorios() {
  const config = JSON.parse(localStorage.getItem('config_relatorios') || '{}');
  
  if (!config.diario && !config.semanal && !config.mensal) return;
  
  // Limpar agendamentos anteriores
  if (window.relatorioInterval) {
    clearInterval(window.relatorioInterval);
  }
  
  // Verificar a cada hora se é hora de enviar relatório
  window.relatorioInterval = setInterval(() => {
    verificarEnvioRelatorios();
  }, 60 * 60 * 1000); // 1 hora
  
  // Verificar imediatamente na primeira vez
  setTimeout(() => verificarEnvioRelatorios(), 5000);
}

// Verificar se deve enviar relatórios
async function verificarEnvioRelatorios() {
  if (!currentUser) return;
  
  const config = JSON.parse(localStorage.getItem('config_relatorios') || '{}');
  const agora = new Date();
  const hoje = agora.toDateString();
  
  // Verificar relatório diário
  if (config.diario) {
    const ultimoDiario = localStorage.getItem('ultimo_relatorio_diario');
    if (ultimoDiario !== hoje) {
      await gerarRelatorioDiario();
      localStorage.setItem('ultimo_relatorio_diario', hoje);
    }
  }
  
  // Verificar relatório semanal (domingo)
  if (config.semanal && agora.getDay() === 0) {
    const semanaAtual = getSemanaAno(agora);
    const ultimoSemanal = localStorage.getItem('ultimo_relatorio_semanal');
    if (ultimoSemanal !== semanaAtual.toString()) {
      await gerarRelatorioSemanal();
      localStorage.setItem('ultimo_relatorio_semanal', semanaAtual.toString());
    }
  }
  
  // Verificar relatório mensal (primeiro dia do mês)
  if (config.mensal && agora.getDate() === 1) {
    const mesAtual = `${agora.getFullYear()}-${agora.getMonth()}`;
    const ultimoMensal = localStorage.getItem('ultimo_relatorio_mensal');
    if (ultimoMensal !== mesAtual) {
      await gerarRelatorioMensal();
      localStorage.setItem('ultimo_relatorio_mensal', mesAtual);
    }
  }
}

// Gerar relatório diário
async function gerarRelatorioDiario() {
  try {
    const produtosSnapshot = await db.collection('produtos')
      .where('userId', '==', currentUser.uid)
      .get();
    
    const produtos = produtosSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    const produtosCriticos = produtos.filter(p => {
      const validade = new Date(p.validade);
      const diff = Math.ceil((validade - hoje) / (1000 * 60 * 60 * 24));
      return diff > 0 && diff <= 7;
    });
    
    const produtosVencidos = produtos.filter(p => {
      const validade = new Date(p.validade);
      return validade < hoje;
    });
    
    const relatorio = {
      tipo: 'diario',
      data: new Date().toISOString(),
      titulo: 'Relatório Diário - Produtos Críticos',
      resumo: {
        totalProdutos: produtos.length,
        produtosCriticos: produtosCriticos.length,
        produtosVencidos: produtosVencidos.length
      },
      produtosCriticos: produtosCriticos.map(p => ({
        nome: p.nome,
        codigo: p.codigo,
        validade: p.validade,
        quantidade: p.quantidade,
        diasRestantes: Math.ceil((new Date(p.validade) - hoje) / (1000 * 60 * 60 * 24))
      })),
      produtosVencidos: produtosVencidos.map(p => ({
        nome: p.nome,
        codigo: p.codigo,
        validade: p.validade,
        quantidade: p.quantidade
      }))
    };
    
    await enviarRelatorio(relatorio);
    
    // Notificação no navegador
    enviarNotificacaoBrowser(`Relatório Diário: ${produtosCriticos.length} produtos críticos, ${produtosVencidos.length} vencidos`);
    
  } catch (err) {
    console.error('Erro ao gerar relatório diário:', err);
  }
}

// Gerar relatório semanal
async function gerarRelatorioSemanal() {
  try {
    const [produtosSnapshot, movSnapshot] = await Promise.all([
      db.collection('produtos').where('userId', '==', currentUser.uid).get(),
      db.collection('movimentacoes').where('userId', '==', currentUser.uid).get()
    ]);
    
    const produtos = produtosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const movimentacoes = movSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Calcular métricas semanais
    const umaSemanaAtras = new Date();
    umaSemanaAtras.setDate(umaSemanaAtras.getDate() - 7);
    
    const movSemana = movimentacoes.filter(doc => {
      const dataDoc = doc.data;
      const data = (dataDoc && typeof dataDoc.toDate === 'function') ? dataDoc.toDate() : new Date(dataDoc);
      return data && data >= umaSemanaAtras;
    });
    
    const totalMovimentado = movSemana.reduce((total, doc) => total + (parseFloat(doc.quantidade) || 0), 0);
    const giroEstoque = produtos.length > 0 ? (totalMovimentado / produtos.length).toFixed(1) : '0.0';
    
    const relatorio = {
      tipo: 'semanal',
      data: new Date().toISOString(),
      titulo: 'Relatório Semanal - Performance e Giro',
      metricas: {
        totalProdutos: produtos.length,
        movimentacoesSemana: movSemana.length,
        totalMovimentado: totalMovimentado,
        giroEstoque: giroEstoque,
        produtosAtivos: produtos.filter(p => {
          const val = new Date(p.validade);
          return val >= new Date();
        }).length
      },
      tendencias: {
        movimentacaoMedia: (totalMovimentado / 7).toFixed(1),
        produtosPorMovimentacao: produtos.length > 0 ? (movSemana.length / produtos.length).toFixed(2) : '0.00'
      }
    };
    
    await enviarRelatorio(relatorio);
    enviarNotificacaoBrowser('Relatório semanal de performance gerado');
    
  } catch (err) {
    console.error('Erro ao gerar relatório semanal:', err);
  }
}

// Gerar relatório mensal
async function gerarRelatorioMensal() {
  try {
    const [produtosSnapshot, movSnapshot, clientesSnapshot] = await Promise.all([
      db.collection('produtos').where('userId', '==', currentUser.uid).get(),
      db.collection('movimentacoes').where('userId', '==', currentUser.uid).get(),
      db.collection('clientes').where('userId', '==', currentUser.uid).get()
    ]);
    
    const produtos = produtosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const movimentacoes = movSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const clientes = clientesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Calcular métricas mensais
    const umMesAtras = new Date();
    umMesAtras.setMonth(umMesAtras.getMonth() - 1);
    
    const movMes = movimentacoes.filter(doc => {
      const dataDoc = doc.data;
      const data = (dataDoc && typeof dataDoc.toDate === 'function') ? dataDoc.toDate() : new Date(dataDoc);
      return data && data >= umMesAtras;
    });
    
    const relatorio = {
      tipo: 'mensal',
      data: new Date().toISOString(),
      titulo: 'Relatório Mensal Completo',
      estatisticas: {
        totalProdutos: produtos.length,
        totalClientes: clientes.length,
        movimentacoesMes: movMes.length,
        valorEstoque: produtos.reduce((total, p) => total + (parseFloat(p.quantidade) || 0), 0),
        produtosVencidos: produtos.filter(p => new Date(p.validade) < new Date()).length,
        produtosCriticos: produtos.filter(p => {
          const validade = new Date(p.validade);
          const hoje = new Date();
          const diff = Math.ceil((validade - hoje) / (1000 * 60 * 60 * 24));
          return diff > 0 && diff <= 30;
        }).length
      },
      analises: {
        taxaAtivos: produtos.length > 0 ? ((produtos.filter(p => new Date(p.validade) >= new Date()).length / produtos.length) * 100).toFixed(1) : '0.0',
        movimentacaoMediaDiaria: (movMes.length / 30).toFixed(1),
        crescimentoEstoque: 'Dados insuficientes para análise'
      }
    };
    
    await enviarRelatorio(relatorio);
    enviarNotificacaoBrowser('Relatório mensal completo gerado');
    
  } catch (err) {
    console.error('Erro ao gerar relatório mensal:', err);
  }
}

// Enviar relatório (simulação de e-mail)
async function enviarRelatorio(relatorio) {
  const config = JSON.parse(localStorage.getItem('config_relatorios') || '{}');
  
  if (!config.email) {
    console.log('Relatório gerado (sem e-mail configurado):', relatorio);
    return;
  }
  
  // Simulação de envio de e-mail
  // Em produção, isso seria enviado para um backend
  console.log('Enviando relatório por e-mail:', {
    para: config.email,
    assunto: relatorio.titulo,
    conteudo: relatorio
  });
  
  // Salvar relatório localmente para histórico
  const relatorios = JSON.parse(localStorage.getItem('relatorios_gerados') || '[]');
  relatorios.unshift({
    id: Date.now(),
    ...relatorio,
    enviadoPara: config.email
  });
  
  // Manter apenas os últimos 50 relatórios
  if (relatorios.length > 50) {
    relatorios.splice(50);
  }
  
  localStorage.setItem('relatorios_gerados', JSON.stringify(relatorios));
  
  // Incrementar contador de relatórios no KPI
  const contadorAtual = parseInt(localStorage.getItem('relatorios_gerados_mes') || '0');
  localStorage.setItem('relatorios_gerados_mes', (contadorAtual + 1).toString());
}

// Enviar notificação no navegador
function enviarNotificacaoBrowser(mensagem) {
  const config = JSON.parse(localStorage.getItem('config_relatorios') || '{}');
  
  if (!config.notificacaoBrowser || Notification.permission !== 'granted') return;
  
  new Notification('Sistema FEFO - Relatório', {
    body: mensagem,
    icon: '/assets/icon-192.png',
    badge: '/assets/icon-192.png'
  });
}

// Função auxiliar para obter semana do ano
function getSemanaAno(date) {
  const primeiroDiaAno = new Date(date.getFullYear(), 0, 1);
  const diasPassados = Math.floor((date - primeiroDiaAno) / (24 * 60 * 60 * 1000));
  return Math.ceil((diasPassados + primeiroDiaAno.getDay() + 1) / 7);
}

// === FUNÇÕES DA API SIMULADA ===

// Classe para simular API REST
class FEFOAPI {
  constructor() {
    this.baseURL = '/api';
    this.endpoints = {
      produtos: '/api/produtos',
      movimentacoes: '/api/movimentacoes',
      clientes: '/api/clientes',
      relatorios: '/api/relatorios'
    };
  }

  // Método genérico para fazer requisições
  async request(method, url, data = null) {
    if (!currentUser) {
      throw new Error('Usuário não autenticado');
    }

    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      switch (method.toUpperCase()) {
        case 'GET':
          return await this.handleGET(url);
        case 'POST':
          return await this.handlePOST(url, data);
        case 'PUT':
          return await this.handlePUT(url, data);
        case 'DELETE':
          return await this.handleDELETE(url);
        default:
          throw new Error(`Método ${method} não suportado`);
      }
    } catch (err) {
      throw new Error(`Erro na API: ${err.message}`);
    }
  }

  // Handler para GET
  async handleGET(url) {
    if (url === '/api/produtos') {
      const snapshot = await db.collection('produtos').where('userId', '==', currentUser.uid).get();
      const produtos = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        userId: undefined // Remove userId da resposta
      }));
      return { success: true, data: produtos, count: produtos.length };
    }

    if (url === '/api/movimentacoes') {
      const snapshot = await db.collection('movimentacoes').where('userId', '==', currentUser.uid).get();
      const movimentacoes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        userId: undefined
      }));
      return { success: true, data: movimentacoes, count: movimentacoes.length };
    }

    if (url === '/api/clientes') {
      const snapshot = await db.collection('clientes').where('userId', '==', currentUser.uid).get();
      const clientes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        userId: undefined
      }));
      return { success: true, data: clientes, count: clientes.length };
    }

    if (url === '/api/relatorios/dashboard') {
      const snapshot = await db.collection('produtos').where('userId', '==', currentUser.uid).get();
      const produtos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      
      const produtosCriticos = produtos.filter(p => {
        const validade = new Date(p.validade);
        const diff = Math.ceil((validade - hoje) / (1000 * 60 * 60 * 24));
        return diff > 0 && diff <= 7;
      });
      
      const produtosVencidos = produtos.filter(p => {
        const validade = new Date(p.validade);
        return validade < hoje;
      });

      return {
        success: true,
        data: {
          totalProdutos: produtos.length,
          produtosCriticos: produtosCriticos.length,
          produtosVencidos: produtosVencidos.length,
          dataAtualizacao: new Date().toISOString()
        }
      };
    }

    if (url === '/api/relatorios/kpi') {
      const [produtosSnapshot, movSnapshot] = await Promise.all([
        db.collection('produtos').where('userId', '==', currentUser.uid).get(),
        db.collection('movimentacoes').where('userId', '==', currentUser.uid).get()
      ]);
      
      const produtos = produtosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const movimentacoes = movSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Calcular KPIs
      const totalItens = produtos.reduce((total, produto) => total + (parseFloat(produto.quantidade) || 0), 0);
      
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      const produtosCriticos = produtos.filter(p => {
        const validade = new Date(p.validade);
        const diff = Math.ceil((validade - hoje) / (1000 * 60 * 60 * 24));
        return diff > 0 && diff <= 7;
      }).length;
      
      const trintaDiasAtras = new Date();
      trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);
      const movUltimos30Dias = movimentacoes.filter(doc => {
        const data = doc.data().data?.toDate();
        return data && data >= trintaDiasAtras;
      });
      const giroEstoque = produtos.length > 0 ? (movUltimos30Dias.length / produtos.length).toFixed(1) : '0.0';
      
      return {
        success: true,
        data: {
          totalItens: totalItens,
          produtosCriticos: produtosCriticos,
          giroEstoque: giroEstoque,
          totalProdutos: produtos.length,
          dataCalculo: new Date().toISOString()
        }
      };
    }

    // Verificar se é busca por ID
    const produtoMatch = url.match(/^\/api\/produtos\/(.+)$/);
    if (produtoMatch) {
      const produtoId = produtoMatch[1];
      const doc = await db.collection('produtos').doc(produtoId).get();
      if (doc.exists && doc.data().userId === currentUser.uid) {
        return { success: true, data: { id: doc.id, ...doc.data(), userId: undefined } };
      } else {
        throw new Error('Produto não encontrado');
      }
    }

    throw new Error('Endpoint não encontrado');
  }

  // Handler para POST
  async handlePOST(url, data) {
    if (!data) throw new Error('Dados obrigatórios');

    if (url === '/api/produtos') {
      const produto = {
        ...data,
        userId: currentUser.uid,
        dataCriacao: new Date()
      };
      const docRef = await db.collection('produtos').add(produto);
      return { success: true, data: { id: docRef.id, ...produto, userId: undefined }, message: 'Produto criado com sucesso' };
    }

    if (url === '/api/movimentacoes') {
      const movimentacao = {
        ...data,
        userId: currentUser.uid,
        data: new Date()
      };
      const docRef = await db.collection('movimentacoes').add(movimentacao);
      return { success: true, data: { id: docRef.id, ...movimentacao, userId: undefined }, message: 'Movimentação registrada com sucesso' };
    }

    if (url === '/api/clientes') {
      const cliente = {
        ...data,
        userId: currentUser.uid,
        dataCriacao: new Date()
      };
      const docRef = await db.collection('clientes').add(cliente);
      return { success: true, data: { id: docRef.id, ...cliente, userId: undefined }, message: 'Cliente criado com sucesso' };
    }

    throw new Error('Endpoint não encontrado');
  }

  // Handler para PUT
  async handlePUT(url, data) {
    if (!data) throw new Error('Dados obrigatórios');

    const produtoMatch = url.match(/^\/api\/produtos\/(.+)$/);
    if (produtoMatch) {
      const produtoId = produtoMatch[1];
      const docRef = db.collection('produtos').doc(produtoId);
      const doc = await docRef.get();
      
      if (doc.exists && doc.data().userId === currentUser.uid) {
        await docRef.update({ ...data, dataAtualizacao: new Date() });
        return { success: true, message: 'Produto atualizado com sucesso' };
      } else {
        throw new Error('Produto não encontrado');
      }
    }

    throw new Error('Endpoint não encontrado');
  }

  // Handler para DELETE
  async handleDELETE(url) {
    const produtoMatch = url.match(/^\/api\/produtos\/(.+)$/);
    if (produtoMatch) {
      const produtoId = produtoMatch[1];
      const docRef = db.collection('produtos').doc(produtoId);
      const doc = await docRef.get();
      
      if (doc.exists && doc.data().userId === currentUser.uid) {
        await docRef.delete();
        return { success: true, message: 'Produto excluído com sucesso' };
      } else {
        throw new Error('Produto não encontrado');
      }
    }

    throw new Error('Endpoint não encontrado');
  }
}

// Instância global da API
const fefoAPI = new FEFOAPI();

// Funções para interface da API
function carregarAPI() {
  // Inicializar interface da API
  document.getElementById('api-method').value = 'GET';
  document.getElementById('api-url').value = '/api/produtos';
  document.getElementById('api-body').value = '';
  document.getElementById('api-response-output').textContent = 'Clique em "Executar Teste" para ver a resposta';
}

async function testarEndpoint(method, url) {
  document.getElementById('api-method').value = method;
  document.getElementById('api-url').value = url;
  document.getElementById('api-body').value = '';
  await executarTesteAPI();
}

async function executarTesteAPI() {
  const method = document.getElementById('api-method').value;
  const url = document.getElementById('api-url').value;
  const bodyText = document.getElementById('api-body').value;
  const output = document.getElementById('api-response-output');

  output.textContent = 'Executando teste...';
  output.style.color = 'var(--text-secondary)';

  try {
    let data = null;
    if (bodyText.trim()) {
      data = JSON.parse(bodyText);
    }

    const response = await fefoAPI.request(method, url, data);
    
    output.textContent = JSON.stringify(response, null, 2);
    output.style.color = 'var(--success)';
    
  } catch (err) {
    output.textContent = `Erro: ${err.message}`;
    output.style.color = 'var(--danger)';
  }
}

function mostrarExemploCriacao(tipo) {
  const examples = {
    produto: {
      nome: "Produto Exemplo",
      codigo: "EX001",
      validade: "2024-12-31",
      quantidade: 100,
      unidade: "un",
      categoria: "Medicamento",
      descricao: "Descrição do produto"
    },
    movimentacao: {
      tipo: "saida",
      produtoId: "ID_DO_PRODUTO",
      quantidade: 10,
      motivo: "Venda",
      clienteId: "ID_DO_CLIENTE",
      observacoes: "Observações da movimentação"
    },
    cliente: {
      nome: "Cliente Exemplo",
      email: "cliente@exemplo.com",
      telefone: "(11) 99999-9999",
      status: "ativo",
      plano: "Básico",
      endereco: "Rua Exemplo, 123"
    }
  };

  const example = examples[tipo];
  if (example) {
    document.getElementById('api-method').value = 'POST';
    document.getElementById('api-url').value = `/api/${tipo}s`;
    document.getElementById('api-body').value = JSON.stringify(example, null, 2);
    
    const examplesDiv = document.getElementById('api-examples');
    examplesDiv.innerHTML = `
      <h4>Exemplo de criação de ${tipo}</h4>
      <pre><code>${JSON.stringify(example, null, 2)}</code></pre>
      <p>Este exemplo cria um novo ${tipo} com os campos obrigatórios preenchidos.</p>
    `;
  }
}

// === FUNÇÕES DO SISTEMA MULTI-USUÁRIO ===

// Verificar se usuário é administrador
async function verificarPermissaoAdmin() {
  if (!currentUser) return false;
  
  try {
    // Buscar perfil do usuário no Firestore
    const userDoc = await db.collection('usuarios').doc(currentUser.uid).get();
    
    if (userDoc.exists) {
      const userData = userDoc.data();
      window.isAdmin = userData.role === 'admin';
      return window.isAdmin;
    } else {
      // Se não existe perfil, criar como usuário comum
      await db.collection('usuarios').doc(currentUser.uid).set({
        uid: currentUser.uid,
        email: currentUser.email,
        nome: currentUser.displayName || currentUser.email.split('@')[0],
        role: 'user',
        status: 'active',
        dataCriacao: new Date(),
        ultimoAcesso: new Date()
      });
      window.isAdmin = false;
      return false;
    }
  } catch (err) {
    console.error('Erro ao verificar permissões:', err);
    window.isAdmin = false;
    return false;
  }
}

// Atualizar visibilidade dos elementos administrativos
function atualizarInterfaceAdmin() {
  const adminElements = document.querySelectorAll('.admin-only');
  adminElements.forEach(el => {
    el.style.display = window.isAdmin ? 'block' : 'none';
  });
}

// Carregar página de usuários
async function carregarUsuarios() {
  if (!window.isAdmin) {
    mostrarToast('Acesso negado. Apenas administradores podem acessar esta página.');
    mudarPagina('dashboard');
    return;
  }

  mostrarLoader();
  
  try {
    // Carregar estatísticas
    await carregarEstatisticasUsuarios();
    
    // Carregar lista de usuários
    await carregarListaUsuarios();
    
  } catch (err) {
    console.error('Erro ao carregar usuários:', err);
    mostrarToast('Erro ao carregar dados dos usuários');
  }
  
  esconderLoader();
}

// Carregar estatísticas de usuários
async function carregarEstatisticasUsuarios() {
  try {
    const usuariosSnapshot = await db.collection('usuarios').get();
    const usuarios = usuariosSnapshot.docs.map(doc => doc.data());
    
    const totalUsuarios = usuarios.length;
    const usuariosAdmin = usuarios.filter(u => u.role === 'admin').length;
    const usuariosAtivos = usuarios.filter(u => u.status === 'active').length;
    
    // Novos usuários este mês
    const inicioMes = new Date();
    inicioMes.setDate(1);
    inicioMes.setHours(0, 0, 0, 0);
    
    const novosUsuariosMes = usuarios.filter(u => {
      const dataCriacao = u.dataCriacao?.toDate();
      return dataCriacao && dataCriacao >= inicioMes;
    }).length;
    
    document.getElementById('total-usuarios').textContent = totalUsuarios;
    document.getElementById('usuarios-admin').textContent = usuariosAdmin;
    document.getElementById('usuarios-ativos').textContent = usuariosAtivos;
    document.getElementById('novos-usuarios-mes').textContent = novosUsuariosMes;
    
  } catch (err) {
    console.error('Erro ao carregar estatísticas:', err);
  }
}

// Carregar lista de usuários
async function carregarListaUsuarios() {
  try {
    const usuariosSnapshot = await db.collection('usuarios').orderBy('dataCriacao', 'desc').get();
    const tbody = document.getElementById('usuarios-tbody');
    
    if (usuariosSnapshot.empty) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center">Nenhum usuário encontrado</td></tr>';
      return;
    }
    
    const html = usuariosSnapshot.docs.map(doc => {
      const user = doc.data();
      const dataCriacao = user.dataCriacao?.toDate();
      const ultimoAcesso = user.ultimoAcesso?.toDate();
      
      return `
        <tr>
          <td>${user.nome || 'N/A'}</td>
          <td>${user.email}</td>
          <td><span class="role-badge ${user.role}">${user.role === 'admin' ? 'Administrador' : 'Usuário'}</span></td>
          <td><span class="status-badge ${user.status}">${traduzirStatus(user.status)}</span></td>
          <td>${dataCriacao ? dataCriacao.toLocaleDateString('pt-BR') : 'N/A'}</td>
          <td>${ultimoAcesso ? ultimoAcesso.toLocaleDateString('pt-BR') : 'Nunca'}</td>
          <td>
            <div class="action-buttons">
              <button class="btn-icon" onclick="editarUsuario('${doc.id}')" title="Editar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              <button class="btn-icon" onclick="alterarStatusUsuario('${doc.id}', '${user.status === 'active' ? 'inactive' : 'active'}')" title="Alterar Status">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 11l3 3L22 4"></path>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                </svg>
              </button>
              ${doc.id !== currentUser.uid ? `
                <button class="btn-icon danger" onclick="excluirUsuario('${doc.id}')" title="Excluir">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              ` : ''}
            </div>
          </td>
        </tr>
      `;
    }).join('');
    
    tbody.innerHTML = html;
    
  } catch (err) {
    console.error('Erro ao carregar lista de usuários:', err);
    document.getElementById('usuarios-tbody').innerHTML = '<tr><td colspan="7" class="text-center text-danger">Erro ao carregar usuários</td></tr>';
  }
}

// Traduzir status do usuário
function traduzirStatus(status) {
  const traducoes = {
    'active': 'Ativo',
    'inactive': 'Inativo',
    'suspended': 'Suspenso'
  };
  return traducoes[status] || status;
}

// Mostrar modal para novo usuário
function mostrarModalNovoUsuario() {
  // Implementar modal para criar novo usuário
  const email = prompt('Digite o e-mail do novo usuário:');
  if (!email) return;
  
  criarNovoUsuario(email);
}

// Criar novo usuário
async function criarNovoUsuario(email) {
  if (!window.isAdmin) {
    mostrarToast('Apenas administradores podem criar usuários');
    return;
  }

  mostrarLoader();
  
  try {
    // Para criar um novo usuário sem deslogar o admin atual, 
    // usamos uma instância secundária do Firebase
    const config = window.firebaseConfig || {
      apiKey: "AIzaSyA3YHP6mxbtHjdfzhfEiIoEONnGyXnEvAg",
      authDomain: "gestao-fefo.firebaseapp.com",
      projectId: "gestao-fefo",
      storageBucket: "gestao-fefo.firebasestorage.app",
      messagingSenderId: "471711723896",
      appId: "1:471711723896:web:beeabebbe8058ff732588d"
    };

    // Inicializa app secundário (nome aleatório para evitar colisões)
    const secondaryAppName = "Secondary_" + Math.random().toString(36).slice(2, 9);
    const secondaryApp = firebase.initializeApp(config, secondaryAppName);
    const secondaryAuth = secondaryApp.auth();
    
    // Criar usuário no Firebase Auth usando a instância secundária
    const tempPassword = Math.random().toString(36).slice(-8) + 'Temp123!';
    const userCredential = await secondaryAuth.createUserWithEmailAndPassword(email, tempPassword);
    
    // Criar perfil no Firestore (usando o app principal pois o admin tem permissão)
    await db.collection('usuarios').doc(userCredential.user.uid).set({
      uid: userCredential.user.uid,
      email: email,
      nome: email.split('@')[0],
      role: 'user',
      status: 'active',
      dataCriacao: firebase.firestore.FieldValue.serverTimestamp(),
      ultimoAcesso: firebase.firestore.FieldValue.serverTimestamp(),
      criadoPor: currentUser.uid
    });
    
    // Deslogar e deletar o app secundário
    await secondaryAuth.signOut();
    await secondaryApp.delete();
    
    mostrarToast(`Usuário criado com sucesso! Senha temporária: ${tempPassword}`, 10000);
    await carregarListaUsuarios();
    
  } catch (err) {
    console.error('Erro ao criar usuário:', err);
    mostrarToast('Erro ao criar usuário: ' + traduzirErroFirebase(err.code));
  }
  
  esconderLoader();
}

// Editar usuário
async function editarUsuario(userId) {
  // Implementar edição de usuário
  const novoRole = prompt('Digite a nova função (admin/user):');
  if (!novoRole || !['admin', 'user'].includes(novoRole)) return;
  
  try {
    await db.collection('usuarios').doc(userId).update({
      role: novoRole,
      dataAtualizacao: new Date()
    });
    
    mostrarToast('Usuário atualizado com sucesso!', 'success');
    await carregarListaUsuarios();
    
  } catch (err) {
    console.error('Erro ao editar usuário:', err);
    mostrarToast('Erro ao editar usuário');
  }
}

// Alterar status do usuário
async function alterarStatusUsuario(userId, novoStatus) {
  try {
    await db.collection('usuarios').doc(userId).update({
      status: novoStatus,
      dataAtualizacao: new Date()
    });
    
    mostrarToast('Status do usuário alterado!', 'success');
    await carregarListaUsuarios();
    
  } catch (err) {
    console.error('Erro ao alterar status:', err);
    mostrarToast('Erro ao alterar status do usuário');
  }
}

// Excluir usuário
async function excluirUsuario(userId) {
  if (!confirm('Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.')) return;
  
  try {
    // Excluir do Firestore
    await db.collection('usuarios').doc(userId).delete();
    
    // Excluir do Firebase Auth (se possível)
    // Nota: Exclusão do Auth requer implementação no backend
    
    mostrarToast('Usuário excluído com sucesso!', 'success');
    await carregarListaUsuarios();
    
  } catch (err) {
    console.error('Erro ao excluir usuário:', err);
    mostrarToast('Erro ao excluir usuário');
  }
}

// Atualizar último acesso do usuário
async function atualizarUltimoAcesso() {
  if (!currentUser) return;
  
  try {
    await db.collection('usuarios').doc(currentUser.uid).update({
      ultimoAcesso: new Date()
    });
  } catch (err) {
    console.error('Erro ao atualizar último acesso:', err);
  }
}
