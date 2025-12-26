/**
 * VenciFlow - Utilitários Globais
 * Funções de formatação, validação e UI compartilhadas
 */

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

document.addEventListener('DOMContentLoaded', () => {
  // Inicialização básica de componentes UI
  const dataHoje = new Date().toISOString().split('T')[0];
  document.querySelectorAll('input[type="date"].set-today').forEach(input => {
    input.setAttribute('value', dataHoje);
  });

  // Listener para fechamento de modais com ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const overlay = document.getElementById('modal-overlay');
      if (overlay && overlay.classList.contains('active')) {
        overlay.classList.remove('active');
        document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
      }
    }
  });
});

// Service Worker Registration para PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('SW registrado'))
      .catch(err => console.log('Erro no SW', err));
  });
}

// Detecção de Status de Conexão
window.addEventListener('online', () => mostrarToast('Conexão restaurada'));
window.addEventListener('offline', () => mostrarToast('Você está offline'));
