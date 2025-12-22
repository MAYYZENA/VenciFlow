// Atualiza cabeçalho e linhas da tabela de estoque para incluir campos extras dinâmicos
window.atualizarTabelaEstoqueComCamposExtras = function() {
  const produtos = window.dadosEstoque || [];
  // Coleta todos os campos extras existentes
  const camposExtrasSet = new Set();
  produtos.forEach(p => {
    if (p.camposExtras) {
      Object.keys(p.camposExtras).forEach(k => camposExtrasSet.add(k));
    }
  });
  // Atualiza cabeçalho
  const tabela = document.getElementById('tabelaEstoque');
  const thead = tabela?.parentElement?.querySelector('thead tr');
  if (thead) {
    // Remove ths extras antigos
    while (thead.querySelector('.campo-extra-th')) {
      thead.removeChild(thead.querySelector('.campo-extra-th'));
    }
    // Adiciona novos ths
    let refTd = thead.querySelector('th:last-child');
    camposExtrasSet.forEach(campo => {
      const th = document.createElement('th');
      th.textContent = campo;
      th.className = 'campo-extra-th';
      thead.insertBefore(th, refTd);
    });
  }
  // Atualiza linhas
  const linhas = tabela?.querySelectorAll('tbody tr');
  if (linhas) {
    linhas.forEach((tr, idx) => {
      // Remove tds extras antigos
      while (tr.querySelector('.campo-extra-td')) {
        tr.removeChild(tr.querySelector('.campo-extra-td'));
      }
      // Adiciona novos tds
      const p = produtos[idx];
      if (!p) return;
      let refTd = tr.querySelector('td:last-child');
      camposExtrasSet.forEach(campo => {
        const td = document.createElement('td');
        td.textContent = (p.camposExtras && p.camposExtras[campo]) || '';
        td.className = 'campo-extra-td';
        tr.insertBefore(td, refTd);
      });
    });
  }
}

// Hook para atualizar tabela após renderização
const _renderTabelaOriginal = window.renderTabela;
window.renderTabela = function(lista) {
  _renderTabelaOriginal(lista);
  window.atualizarTabelaEstoqueComCamposExtras();
}

// Preencher campos extras ao editar produto
window.preencherCamposExtrasEdicao = function(camposExtras) {
  const container = document.getElementById('camposExtrasContainer');
  if (!container) return;
  container.innerHTML = '';
  if (!camposExtras) return;
  Object.entries(camposExtras).forEach(([nome, valor], idx) => {
    const div = document.createElement('div');
    div.className = 'input-group mb-2';
    div.innerHTML = `
      <input type="text" class="form-control" placeholder="Nome do campo" style="max-width:140px;" id="campoExtraNome${idx}" value="${nome}">
      <input type="text" class="form-control" placeholder="Valor" id="campoExtraValor${idx}" value="${valor}">
      <button type="button" class="btn btn-outline-danger" onclick="this.parentNode.remove()">Remover</button>
    `;
    container.appendChild(div);
  });
}
// Exportação customizada de relatório
window.exportarCustomizado = function() {
  // Coleta todos os campos possíveis dos produtos
  const produtos = window.dadosEstoque || [];
  if (!produtos.length) {
    alert('Nenhum produto para exportar!');
    return;
  }
  // Coleta todos os campos extras existentes
  const camposExtrasSet = new Set();
  produtos.forEach(p => {
    if (p.camposExtras) {
      Object.keys(p.camposExtras).forEach(k => camposExtrasSet.add(k));
    }
  });
  // Campos padrão
  const camposPadrao = ['codigo','nome','marca','lote','fornecedor','local','quantidade','estoqueMinimo','validade'];
  // Prompt simples para seleção de campos
  const todosCampos = [...camposPadrao, ...camposExtrasSet];
  const selecionados = prompt('Quais campos exportar? Separe por vírgula.\nOpções:\n' + todosCampos.join(', '), todosCampos.join(', '));
  if (!selecionados) return;
  const camposSelecionados = selecionados.split(',').map(s => s.trim()).filter(Boolean);
  // Monta dados para exportação
  const dados = produtos.map(p => {
    const obj = {};
    camposSelecionados.forEach(c => {
      if (camposPadrao.includes(c)) {
        obj[c] = p[c] || '';
      } else if (p.camposExtras && p.camposExtras[c]) {
        obj[c] = p.camposExtras[c];
      } else {
        obj[c] = '';
      }
    });
    return obj;
  });
  // Exporta para Excel
  if (window.XLSX) {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(dados);
    XLSX.utils.book_append_sheet(wb, ws, 'Customizado');
    XLSX.writeFile(wb, 'relatorio_customizado.xlsx', { compression: true });
    alert('Relatório customizado exportado!');
  } else {
    alert('Biblioteca XLSX não carregada!');
  }
}
// Campos extras dinâmicos para produtos
window.adicionarCampoExtra = function() {
  const container = document.getElementById('camposExtrasContainer');
  const idx = container.children.length;
  const div = document.createElement('div');
  div.className = 'input-group mb-2';
  div.innerHTML = `
    <input type="text" class="form-control" placeholder="Nome do campo" style="max-width:140px;" id="campoExtraNome${idx}">
    <input type="text" class="form-control" placeholder="Valor" id="campoExtraValor${idx}">
    <button type="button" class="btn btn-outline-danger" onclick="this.parentNode.remove()">Remover</button>
  `;
  container.appendChild(div);
}

// Coleta campos extras ao salvar produto
window.coletarCamposExtras = function() {
  const container = document.getElementById('camposExtrasContainer');
  const extras = {};
  Array.from(container.children).forEach((div, idx) => {
    const nome = div.querySelector(`#campoExtraNome${idx}`)?.value?.trim();
    const valor = div.querySelector(`#campoExtraValor${idx}`)?.value?.trim();
    if (nome) extras[nome] = valor;
  });
  return extras;
}
// ================= FIREBASE =================
const firebaseConfig = {
  apiKey: "AIzaSyA3YHP6mxbtHjdfzhfEiIoEONnGyXnEvAg",
  authDomain: "gestao-fefo.firebaseapp.com",
  projectId: "gestao-fefo",
  storageBucket: "gestao-fefo.firebasestorage.app",
  messagingSenderId: "471711723896",
  appId: "1:471711723896:web:44efa771271068d532588d"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

// ...restante do app.js do sistema antigo...
