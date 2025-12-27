// ===== DASHBOARD EXECUTIVO =====
// Sistema de métricas e análises avançadas para VenciFlow

class DashboardExecutivo {
  constructor() {
    this.metricas = {};
    this.graficos = {};
    this.intervaloAtualizacao = 5 * 60 * 1000; // 5 minutos
  }

  async inicializar() {
    console.log('Inicializando Dashboard Executivo...');

    // Carregar métricas iniciais
    await this.calcularMetricas();

    // Atualizar dashboard
    this.atualizarDashboard();

    // Configurar atualização automática
    setInterval(() => {
      this.calcularMetricas().then(() => {
        this.atualizarDashboard();
      });
    }, this.intervaloAtualizacao);

    // Tracking de visualização
    analyticsTracker.trackEvento('dashboard', 'visualizar');
  }

  async calcularMetricas() {
    try {
      mostrarLoader();

      // Métricas de produtos
      const produtosAtivos = produtos.filter(p => p.quantidade > 0).length;
      const produtosVencendo = produtos.filter(p => {
        if (!p.validade) return false;
        const diasParaVencer = Math.ceil((new Date(p.validade) - new Date()) / (1000 * 60 * 60 * 24));
        return diasParaVencer <= 30 && diasParaVencer > 0;
      }).length;

      const produtosVencidos = produtos.filter(p => {
        if (!p.validade) return false;
        return new Date(p.validade) < new Date();
      }).length;

      // Métricas de movimentações (últimos 30 dias)
      const trintaDiasAtras = new Date();
      trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);

      const movimentacoesRecentes = movimentacoes.filter(m => {
        const dataMov = m.data?.toDate ? m.data.toDate() : new Date(m.data);
        return dataMov >= trintaDiasAtras;
      });

      const entradas = movimentacoesRecentes.filter(m => m.tipo === 'entrada').length;
      const saidas = movimentacoesRecentes.filter(m => m.tipo === 'saida').length;

      // Cálculo de eficiência (produtos que saíram antes de vencer)
      const saidasAntesVencimento = movimentacoesRecentes.filter(m => {
        const produto = produtos.find(p => p.id === m.produtoId) || produtos.find(p => p.nome === m.produto);
        if (!produto || !produto.validade) return false;

        const dataMov = m.data?.toDate ? m.data.toDate() : new Date(m.data);
        const dataVenc = produto.validade?.toDate ? produto.validade.toDate() : new Date(produto.validade);

        return m.tipo === 'saida' && dataMov < dataVenc;
      }).length;

      const eficienciaEstoque = saidas > 0 ? Math.round((saidasAntesVencimento / saidas) * 100) : 0;

      // Valorização do estoque
      const valorTotalEstoque = produtos.reduce((total, p) => {
        return total + (p.quantidade * (p.precoVenda || p.precoCompra || 0));
      }, 0);

      // Receita estimada (baseada em vendas dos últimos 30 dias)
      const receitaMensal = movimentacoesRecentes
        .filter(m => m.tipo === 'saida')
        .reduce((total, m) => {
          const produto = produtos.find(p => p.id === m.produtoId) || produtos.find(p => p.nome === m.produto);
          const preco = produto?.precoVenda || 0;
          return total + (m.quantidade * preco);
        }, 0);

      // Perdas evitadas (valor dos produtos que seriam perdidos)
      const valorProdutosRisco = produtos
        .filter(p => {
          if (!p.validade) return false;
          const diasParaVencer = Math.ceil((new Date(p.validade) - new Date()) / (1000 * 60 * 60 * 24));
          return diasParaVencer <= 7;
        })
        .reduce((total, p) => total + (p.quantidade * (p.precoCompra || 0)), 0);

      // Top categorias
      const categoriasCount = {};
      produtos.forEach(p => {
        if (p.categoria) {
          categoriasCount[p.categoria] = (categoriasCount[p.categoria] || 0) + 1;
        }
      });

      const topCategorias = Object.entries(categoriasCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5);

      // Alertas críticos
      const alertas = [];
      if (produtosVencendo > 0) {
        alertas.push({
          tipo: 'warning',
          mensagem: `${produtosVencendo} produtos vencem nos próximos 30 dias`,
          icone: '⚠️'
        });
      }

      if (produtosVencidos > 0) {
        alertas.push({
          tipo: 'danger',
          mensagem: `${produtosVencidos} produtos já venceram`,
          icone: '🚨'
        });
      }

      if (eficienciaEstoque < 70) {
        alertas.push({
          tipo: 'info',
          mensagem: `Eficiência do estoque: ${eficienciaEstoque}% - pode ser melhorado`,
          icone: '📊'
        });
      }

      this.metricas = {
        produtosAtivos,
        produtosVencendo,
        produtosVencidos,
        entradas,
        saidas,
        eficienciaEstoque,
        valorTotalEstoque,
        receitaMensal,
        valorProdutosRisco,
        topCategorias,
        alertas,
        ultimaAtualizacao: new Date()
      };

      esconderLoader();

    } catch (error) {
      console.error('Erro ao calcular métricas:', error);
      esconderLoader();
      mostrarToast('Erro ao calcular métricas do dashboard', 5000);
    }
  }

  atualizarDashboard() {
    // KPI Cards principais
    this.atualizarKPICard('produtos-ativos', this.metricas.produtosAtivos, 'Produtos Ativos');
    this.atualizarKPICard('produtos-vencendo', this.metricas.produtosVencendo, 'Vencendo (30 dias)', 'warning');
    this.atualizarKPICard('produtos-vencidos', this.metricas.produtosVencidos, 'Vencidos', 'danger');
    this.atualizarKPICard('eficiencia-estoque', `${this.metricas.eficienciaEstoque}%`, 'Eficiência FEFO');

    // Cards de valor
    this.atualizarKPICard('valor-estoque', `R$ ${this.metricas.valorTotalEstoque.toFixed(2)}`, 'Valor do Estoque');
    this.atualizarKPICard('receita-mensal', `R$ ${this.metricas.receitaMensal.toFixed(2)}`, 'Receita (30 dias)');
    this.atualizarKPICard('perdas-evitadas', `R$ ${this.metricas.valorProdutosRisco.toFixed(2)}`, 'Perdas Evitadas');

    // Movimentações
    this.atualizarKPICard('entradas-recentes', this.metricas.entradas, 'Entradas (30 dias)', 'success');
    this.atualizarKPICard('saidas-recentes', this.metricas.saidas, 'Saídas (30 dias)', 'info');

    // Top categorias
    this.atualizarTopCategorias();

    // Alertas
    this.atualizarAlertas();

    // Última atualização
    const ultimaAtualizacaoEl = document.getElementById('ultima-atualizacao');
    if (ultimaAtualizacaoEl) {
      ultimaAtualizacaoEl.textContent = `Última atualização: ${this.metricas.ultimaAtualizacao.toLocaleString('pt-BR')}`;
    }
  }

  atualizarKPICard(id, valor, label, tipo = 'primary') {
    const card = document.getElementById(id);
    if (!card) return;

    const valorEl = card.querySelector('.kpi-valor');
    const labelEl = card.querySelector('.kpi-label');

    if (valorEl) valorEl.textContent = valor;
    if (labelEl) labelEl.textContent = label;

    // Aplicar classe de cor
    card.className = `kpi-card kpi-${tipo}`;
  }

  atualizarTopCategorias() {
    const container = document.getElementById('top-categorias');
    if (!container) return;

    const html = this.metricas.topCategorias.map(([categoria, quantidade], index) => `
      <div class="categoria-item">
        <span class="categoria-rank">#${index + 1}</span>
        <span class="categoria-nome">${escapeHTML(categoria)}</span>
        <span class="categoria-quantidade">${quantidade} produtos</span>
      </div>
    `).join('');

    container.innerHTML = html;
  }

  atualizarAlertas() {
    const container = document.getElementById('alertas-dashboard');
    if (!container) return;

    if (this.metricas.alertas.length === 0) {
      container.innerHTML = '<p class="no-alerts">🎉 Nenhum alerta crítico no momento!</p>';
      return;
    }

    const html = this.metricas.alertas.map(alerta => `
      <div class="alerta alerta-${alerta.tipo}">
        <span class="alerta-icone">${alerta.icone}</span>
        <span class="alerta-mensagem">${escapeHTML(alerta.mensagem)}</span>
      </div>
    `).join('');

    container.innerHTML = html;
  }

  // Relatórios detalhados
  async gerarRelatorioMensal() {
    const mesAtual = new Date().toLocaleString('pt-BR', { month: 'long', year: 'numeric' });

    const relatorio = {
      titulo: `Relatório Executivo - ${mesAtual}`,
      metricas: this.metricas,
      recomendacoes: this.gerarRecomendacoes(),
      dadosBrutos: {
        produtos: produtos,
        movimentacoes: movimentacoes
      }
    };

    // Exportar como JSON
    const json = JSON.stringify(relatorio, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio-executivo-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    mostrarToast('Relatório executivo gerado com sucesso!', 3000);
    analyticsTracker.trackEvento('dashboard', 'gerar_relatorio');
  }

  gerarRecomendacoes() {
    const recomendacoes = [];

    if (this.metricas.eficienciaEstoque < 70) {
      recomendacoes.push({
        tipo: 'warning',
        titulo: 'Melhorar Eficiência FEFO',
        descricao: 'Considere reordenar produtos por data de vencimento para reduzir perdas.',
        acao: 'Implementar sistema de picking por validade'
      });
    }

    if (this.metricas.produtosVencendo > 10) {
      recomendacoes.push({
        tipo: 'danger',
        titulo: 'Produtos em Risco',
        descricao: `${this.metricas.produtosVencendo} produtos vencem em breve. Considere promoções ou doações.`,
        acao: 'Criar plano de ação para produtos próximos ao vencimento'
      });
    }

    if (this.metricas.entradas > this.metricas.saidas * 2) {
      recomendacoes.push({
        tipo: 'info',
        titulo: 'Estoque Acumulando',
        descricao: 'Entradas muito superiores às saídas. Revise estratégia de compras.',
        acao: 'Otimizar frequência de compras baseada na demanda'
      });
    }

    return recomendacoes;
  }

  // Gráficos (implementação básica - pode ser expandida com Chart.js)
  renderizarGraficoVendas(dados) {
    // Implementação simplificada - em produção usaria Chart.js ou similar
    console.log('Renderizando gráfico de vendas:', dados);
  }

  renderizarGraficoProdutos(dados) {
    console.log('Renderizando gráfico de produtos:', dados);
  }

  renderizarGraficoPerdas(dados) {
    console.log('Renderizando gráfico de perdas:', dados);
  }
}

// Instância global do dashboard
const dashboardExecutivo = new DashboardExecutivo();

// Função para inicializar dashboard quando a página for carregada
function inicializarDashboard() {
  // Verificar se estamos na página do dashboard
  const dashboardContainer = document.getElementById('dashboard-container');
  if (dashboardContainer) {
    dashboardExecutivo.inicializar();
  }
}

// Adicionar ao DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
  // Inicializar quando os dados estiverem prontos
  window.addEventListener('venciflow:data-ready', function() {
    inicializarDashboard();
  });

  // Se os dados já estiverem carregados (ex: navegação entre abas), inicializa direto
  if (typeof produtos !== 'undefined' && produtos.length > 0) {
    inicializarDashboard();
  }
});