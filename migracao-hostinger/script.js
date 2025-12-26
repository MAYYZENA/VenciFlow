function formatarData(data) {
  if (!data) return '-';
  try {
    if (data.toDate) return data.toDate().toLocaleDateString('pt-BR');
    return new Date(data).toLocaleDateString('pt-BR');
  } catch (e) {
    return '-';
  }
}

function formatarDataHora(data) {
  if (!data) return '-';
  try {
    if (data.toDate) return data.toDate().toLocaleString('pt-BR');
    return new Date(data).toLocaleString('pt-BR');
  } catch (e) {
    return '-';
  }
}

function calcularDiasRestantes(dataValidade) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const validade = new Date(dataValidade);
  validade.setHours(0, 0, 0, 0);
  const diff = Math.ceil((validade - hoje) / (1000 * 60 * 60 * 24));
  return diff;
}

function getStatusProduto(dataValidade) {
  const dias = calcularDiasRestantes(dataValidade);
  
  if (dias < 0) {
    return { status: 'vencido', classe: 'badge-danger', texto: 'Vencido' };
  } else if (dias <= 7) {
    return { status: 'vencendo', classe: 'badge-warning', texto: 'Vencendo' };
  } else if (dias <= 30) {
    return { status: 'atencao', classe: 'badge-warning', texto: 'Atenção' };
  } else {
    return { status: 'normal', classe: 'badge-success', texto: 'Normal' };
  }
}

function validarEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validarCPF(cpf) {
  cpf = cpf.replace(/[^\d]/g, '');
  
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;
  
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let resto = 11 - (soma % 11);
  let digito1 = resto === 10 || resto === 11 ? 0 : resto;
  
  if (digito1 !== parseInt(cpf.charAt(9))) return false;
  
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf.charAt(i)) * (11 - i);
  }
  resto = 11 - (soma % 11);
  let digito2 = resto === 10 || resto === 11 ? 0 : resto;
  
  return digito2 === parseInt(cpf.charAt(10));
}

function gerarCodigoBarras(codigo) {
  return codigo.padStart(13, '0');
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

const pesquisaProdutosDebounced = debounce((termo) => {
  aplicarFiltrosProdutos();
}, 300);

document.getElementById('filtro-produtos')?.addEventListener('input', pesquisaProdutosDebounced);

function ordenarProdutosPorFEFO(produtosArray) {
  return produtosArray.sort((a, b) => {
    const dataA = new Date(a.validade);
    const dataB = new Date(b.validade);
    return dataA - dataB;
  });
}

function verificarEstoqueMinimo(produto) {
  if (produto.estoqueMin && produto.quantidade <= produto.estoqueMin) {
    return {
      alerta: true,
      mensagem: `Estoque abaixo do mínimo (${produto.estoqueMin})`
    };
  }
  return { alerta: false };
}

function gerarRelatorioSimples() {
  const hoje = new Date();
  const dados = {
    data: hoje.toLocaleDateString('pt-BR'),
    totalProdutos: produtos.length,
    produtosVencidos: 0,
    produtosVencendo: 0
  };
  
  produtos.forEach(p => {
    const status = getStatusProduto(p.validade);
    if (status.status === 'vencido') dados.produtosVencidos++;
    if (status.status === 'vencendo') dados.produtosVencendo++;
  });
  
  return dados;
}

function initTooltips() {
  document.querySelectorAll('[title]').forEach(el => {
    el.addEventListener('mouseenter', function() {
      const tooltip = document.createElement('div');
      tooltip.className = 'tooltip';
      tooltip.textContent = this.getAttribute('title');
      document.body.appendChild(tooltip);
      
      const rect = this.getBoundingClientRect();
      tooltip.style.top = (rect.top - tooltip.offsetHeight - 5) + 'px';
      tooltip.style.left = (rect.left + rect.width / 2 - tooltip.offsetWidth / 2) + 'px';
      
      this._tooltip = tooltip;
    });
    
    el.addEventListener('mouseleave', function() {
      if (this._tooltip) {
        this._tooltip.remove();
        this._tooltip = null;
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initTooltips();
  
  // Inicializar toggle de tema
  initThemeToggle();
  
  // Event listener para botão de selecionar backup
  document.getElementById('btn-selecionar-backup')?.addEventListener('click', function() {
    document.getElementById('file-backup').click();
  });
  
  const dataHoje = new Date().toISOString().split('T')[0];
  document.getElementById('filtro-data-fim')?.setAttribute('value', dataHoje);
  document.getElementById('rel-data-fim')?.setAttribute('value', dataHoje);
  
  const data30DiasAtras = new Date();
  data30DiasAtras.setDate(data30DiasAtras.getDate() - 30);
  const data30 = data30DiasAtras.toISOString().split('T')[0];
  document.getElementById('filtro-data-inicio')?.setAttribute('value', data30);
  document.getElementById('rel-data-inicio')?.setAttribute('value', data30);
});

function confirmarAcao(mensagem) {
  return confirm(mensagem);
}

function mostrarErro(mensagem) {
  mostrarToast('❌ ' + mensagem);
}

function mostrarSucesso(mensagem) {
  mostrarToast('✅ ' + mensagem);
}

function mostrarAviso(mensagem) {
  mostrarToast('⚠️ ' + mensagem);
}

window.imprimirRelatorio = function() {
  window.print();
}

function sanitizarTexto(texto) {
  const div = document.createElement('div');
  div.textContent = texto;
  return div.innerHTML;
}

function validarQuantidade(quantidade) {
  return !isNaN(quantidade) && quantidade > 0;
}

function validarData(data) {
  const d = new Date(data);
  return d instanceof Date && !isNaN(d);
}

window.addEventListener('online', () => {
  mostrarToast('Conexão restaurada');
});

window.addEventListener('offline', () => {
  mostrarToast('Você está offline');
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const overlay = document.getElementById('modal-overlay');
    if (overlay && overlay.classList.contains('active')) {
      overlay.classList.remove('active');
      document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
    }
  }
});

function copiarParaClipboard(texto) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(texto).then(() => {
      mostrarToast('Copiado para área de transferência!');
    });
  } else {
    const input = document.createElement('input');
    input.value = texto;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
    mostrarToast('Copiado!');
  }
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(registration => {
        mostrarToast('Service Worker ativado');
      })
      .catch(error => {
        mostrarToast('Erro ao ativar Service Worker');
      });
  });
}

let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  
  const installPrompt = document.createElement('div');
  installPrompt.className = 'install-prompt active';
  installPrompt.innerHTML = `
    <h4>📱 Instalar App</h4>
    <p>Instale o VenciFlow no seu dispositivo para acesso rápido!</p>
    <div class="install-prompt-actions">
      <button class="btn btn-primary btn-sm" id="btn-instalar">Instalar</button>
      <button class="btn btn-secondary btn-sm" id="btn-cancelar-install">Agora não</button>
    </div>
  `;
  document.body.appendChild(installPrompt);
  
  document.getElementById('btn-instalar')?.addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        mostrarToast('App instalado com sucesso!');
      }
      deferredPrompt = null;
      installPrompt.remove();
    }
  });
  
  document.getElementById('btn-cancelar-install')?.addEventListener('click', () => {
    installPrompt.remove();
  });
});

window.addEventListener('appinstalled', () => {
  mostrarToast('App instalado com sucesso!');
  deferredPrompt = null;
});

document.getElementById('btn-notificar')?.addEventListener('click', async () => {
  if (!('Notification' in window)) {
    mostrarToast('Seu navegador não suporta notificações');
    return;
  }
  
  if (Notification.permission === 'granted') {
    mostrarToast('Notificações já estão ativadas!');
    mostrarNotificacao('Teste', 'As notificações estão funcionando!');
    return;
  }
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      mostrarToast('Notificações ativadas com sucesso!');
      mostrarNotificacao('Bem-vindo!', 'Você receberá alertas sobre produtos vencendo.');
    } else {
      mostrarToast('Permissão de notificação negada');
    }
  }
});

function mostrarNotificacao(titulo, corpo) {
  if (Notification.permission === 'granted') {
    const notification = new Notification(titulo, {
      body: corpo,
      icon: 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'%3E%3Crect width=\'100\' height=\'100\' rx=\'20\' fill=\'%231a73e8\'/%3E%3C/svg%3E',
      badge: 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'%3E%3Crect width=\'100\' height=\'100\' rx=\'20\' fill=\'%231a73e8\'/%3E%3C/svg%3E',
      vibrate: [200, 100, 200],
      tag: 'fefo-alert',
      requireInteraction: false
    });
    
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  }
}

window.gerarEtiquetaQR = function(produtoId) {
  const produto = produtos.find(p => p.id === produtoId);
  if (!produto) return;
  
  abrirModal('modal-etiqueta');
  
  document.getElementById('produto-info-etiqueta').innerHTML = `
    <h3>${produto.nome}</h3>
    <p><strong>Código:</strong> ${produto.codigo}</p>
    <p><strong>Lote:</strong> ${produto.lote}</p>
    <p><strong>Validade:</strong> ${new Date(produto.validade).toLocaleDateString('pt-BR')}</p>
    <p><strong>Quantidade:</strong> ${produto.quantidade} ${produto.unidade}</p>
  `;
  
  const qrcodeContainer = document.getElementById('qrcode-container');
  qrcodeContainer.innerHTML = '';
  
  const qrData = JSON.stringify({
    codigo: produto.codigo,
    nome: produto.nome,
    lote: produto.lote,
    validade: produto.validade,
    quantidade: produto.quantidade
  });
  
  new QRCode(qrcodeContainer, {
    text: qrData,
    width: 200,
    height: 200,
    colorDark: '#000000',
    colorLight: '#ffffff',
    correctLevel: QRCode.CorrectLevel.H
  });
}

window.imprimirEtiqueta = function() {
  const conteudo = document.getElementById('modal-etiqueta').innerHTML;
  const janela = window.open('', '', 'width=600,height=600');

  // Criar documento HTML de forma segura
  const htmlContent = `
    <html>
      <head>
        <title>Etiqueta - Sistema FEFO</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; text-align: center; }
          h3 { margin: 0 0 10px 0; }
          p { margin: 5px 0; }
          #qrcode-container { margin: 20px 0; }
        </style>
      </head>
      <body>${conteudo}</body>
    </html>
  `;

  janela.document.open();
  janela.document.write(htmlContent);
  janela.document.close();

  janela.focus();
  setTimeout(() => {
    janela.print();
    janela.close();
  }, 250);
}

document.getElementById('btn-importar-excel')?.addEventListener('click', () => {
  abrirModal('modal-importar');
});

window.processarImportacao = async function() {
  const fileInput = document.getElementById('arquivo-import');
  const file = fileInput.files[0];
  
  if (!file) {
    mostrarToast('Selecione um arquivo primeiro');
    return;
  }
  
  mostrarLoader();
  
  try {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array', cellDates: true });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
      
      let importados = 0;
      let erros = 0;
      
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row[0] || !row[1]) continue;
        
        try {
          let dataValidade;
          const valorData = row[4];
          
          if (valorData instanceof Date) {
            dataValidade = valorData.toISOString().split('T')[0];
          } else if (typeof valorData === 'string' && valorData.includes('/')) {
            const [dia, mes, ano] = valorData.split('/');
            dataValidade = `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
          } else if (typeof valorData === 'number') {
            // Converter data serial do Excel
            const dataExcel = new Date((valorData - 25569) * 86400 * 1000);
            dataValidade = dataExcel.toISOString().split('T')[0];
          } else {
            throw new Error('Formato de data inválido');
          }
          
          await db.collection('produtos').add({
            codigo: row[0].toString(),
            nome: row[1].toString(),
            categoria: row[2]?.toString() || 'Geral',
            lote: row[3]?.toString() || '-',
            validade: dataValidade,
            quantidade: parseFloat(row[5]) || 0,
            unidade: row[6]?.toString() || 'UN',
            estoqueMin: 0,
            localizacao: '',
            observacoes: 'Importado via Excel',
            userId: currentUser.uid,
            criadoEm: firebase.firestore.FieldValue.serverTimestamp()
          });
          
          importados++;
        } catch (err) {
          console.error('Erro na linha', i, err);
          erros++;
        }
      }
      
      fecharModal('modal-importar');
      esconderLoader();
      mostrarToast(`Importação concluída! ${importados} produtos importados${erros > 0 ? `, ${erros} erros` : ''}`);
      carregarProdutos();
    };
    
    reader.readAsArrayBuffer(file);
  } catch (err) {
    mostrarToast('Erro ao importar arquivo');
    esconderLoader();
  }
}

function verificarProdutosVencendo() {
  if (!produtos || produtos.length === 0) return;
  
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  
  const vencendoHoje = produtos.filter(p => {
    const validade = new Date(p.validade);
    validade.setHours(0, 0, 0, 0);
    return validade.getTime() === hoje.getTime();
  });
  
  if (vencendoHoje.length > 0 && Notification.permission === 'granted') {
    vencendoHoje.forEach(p => {
      mostrarNotificacao(
        '⚠️ Produto Vencendo Hoje!',
        `${p.nome} (Lote: ${p.lote}) vence hoje!`
      );
    });
  }
}

// Função para inicializar o toggle de tema
function initThemeToggle() {
  const themeToggleBtn = document.getElementById('btn-theme-toggle');
  const themeIcon = document.getElementById('theme-icon');
  
  if (!themeToggleBtn || !themeIcon) return;
  
  // Verificar tema salvo no localStorage ou preferência do sistema
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const currentTheme = savedTheme || (prefersDark ? 'dark' : 'light');
  
  // Aplicar tema inicial
  setTheme(currentTheme);
  
  // Event listener para o botão de toggle
  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  });
  
  // Função para aplicar o tema
  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    // Atualizar ícone do botão
    if (theme === 'dark') {
      themeIcon.innerHTML = `
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
      `;
      themeToggleBtn.title = 'Alternar para tema claro';
    } else {
      themeIcon.innerHTML = `
        <circle cx="12" cy="12" r="5"></circle>
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path>
      `;
      themeToggleBtn.title = 'Alternar para tema escuro';
    }
  }
}

setInterval(verificarProdutosVencendo, 60000 * 60);
