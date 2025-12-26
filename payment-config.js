// ===========================================
// CONFIGURAÇÃO DE PAGAMENTOS - VenciFlow
// ===========================================

const PAYMENT_CONFIG = {
    // Configurações do PagSeguro
    pagseguro: {
        email: 'seu-email@exemplo.com', // ALTERE para seu e-mail do PagSeguro
        token_sandbox: 'seu-token-sandbox', // ALTERE para seu token de sandbox
        token_producao: 'seu-token-producao', // ALTERE para seu token de produção
        sandbox: true, // Mude para false quando estiver em produção
        notification_url: 'https://seudominio.com/webhook/pagseguro' // ALTERE para sua URL
    },

    // Configurações dos planos
    planos: {
        basico: {
            id: 'BASICO',
            nome: 'Plano Básico',
            valor: 29.00,
            descricao: 'Até 100 produtos, 50 clientes, relatórios básicos',
            max_produtos: 100,
            max_clientes: 50,
            recursos: ['produtos', 'clientes', 'relatorios_basicos']
        },
        profissional: {
            id: 'PROFISSIONAL',
            nome: 'Plano Profissional',
            valor: 59.00,
            descricao: 'Até 1.000 produtos, 500 clientes, relatórios avançados, API',
            max_produtos: 1000,
            max_clientes: 500,
            recursos: ['produtos', 'clientes', 'relatorios_avancados', 'api', 'backup']
        },
        premium: {
            id: 'PREMIUM',
            nome: 'Plano Premium',
            valor: 99.00,
            descricao: 'Produtos e clientes ilimitados, todos os recursos, consultoria',
            max_produtos: -1, // -1 = ilimitado
            max_clientes: -1, // -1 = ilimitado
            recursos: ['ilimitado', 'relatorios_premium', 'api', 'backup', 'consultoria', 'suporte_24h']
        }
    },

    // Taxas e custos
    taxas: {
        pagseguro: {
            credito: 0.0399, // 3.99%
            debito: 0.0199,  // 1.99%
            parcela: 0.0269, // 2.69% para parcelas
            fixa: 0.49       // R$ 0,49 por transação
        }
    },

    // URLs importantes
    urls: {
        pagseguro: {
            sandbox: 'https://sandbox.pagseguro.uol.com.br',
            producao: 'https://pagseguro.uol.com.br',
            api_sandbox: 'https://ws.sandbox.pagseguro.uol.com.br',
            api_producao: 'https://ws.pagseguro.uol.com.br'
        }
    }
};

// Função para obter configuração do plano
function getPlanoConfig(planoId) {
    return PAYMENT_CONFIG.planos[planoId] || PAYMENT_CONFIG.planos.basico;
}

// Função para calcular valor com taxas
function calcularValorComTaxas(valor, metodo = 'credito') {
    const taxa = PAYMENT_CONFIG.taxas.pagseguro[metodo] || PAYMENT_CONFIG.taxas.pagseguro.credito;
    const fixa = PAYMENT_CONFIG.taxas.pagseguro.fixa;

    const valorTaxa = valor * taxa;
    const valorTotal = valor + valorTaxa + fixa;

    return {
        valor_original: valor,
        taxa_percentual: taxa * 100,
        valor_taxa: valorTaxa,
        taxa_fixa: fixa,
        valor_total: valorTotal
    };
}

// Função para validar configuração
function validarConfiguracaoPagamento() {
    const config = PAYMENT_CONFIG.pagseguro;

    if (config.email === 'seu-email@exemplo.com') {
        console.warn('⚠️ PAGAMENTO: Configure seu e-mail do PagSeguro em PAYMENT_CONFIG');
        return false;
    }

    if (config.token_sandbox === 'seu-token-sandbox') {
        console.warn('⚠️ PAGAMENTO: Configure seu token do PagSeguro em PAYMENT_CONFIG');
        return false;
    }

    if (config.notification_url.includes('seudominio.com')) {
        console.warn('⚠️ PAGAMENTO: Configure a URL de notificação em PAYMENT_CONFIG');
        return false;
    }

    console.log('✅ Configuração de pagamento válida');
    return true;
}

// Exportar configurações
window.PAYMENT_CONFIG = PAYMENT_CONFIG;
window.getPlanoConfig = getPlanoConfig;
window.calcularValorComTaxas = calcularValorComTaxas;
window.validarConfiguracaoPagamento = validarConfiguracaoPagamento;