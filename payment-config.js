// ===========================================
// CONFIGURAÇÃO DE PAGAMENTO - VenciFlow
// ===========================================

// 🎯 CONFIGURAÇÕES POR GATEWAY
// Descomente o gateway que deseja usar e configure suas credenciais

// ========== PAGSEGURO ==========
const PAGSEGURO_CONFIG = {
    email: 'seu-email@exemplo.com', // 👈 SEU E-MAIL DO PAGSEGURO
    token: 'seu-token-aqui',       // 👈 SEU TOKEN DE PRODUÇÃO
    sandbox: true,                 // false para produção
    currency: 'BRL'
};

// ========== MERCADO PAGO ==========
const MERCADO_PAGO_CONFIG = {
    publicKey: 'APP_USR-964e6653-a7a1-4bff-952b-7073c48d6b9c',  // ✅ SUA PUBLIC KEY REAL
    accessToken: 'APP_USR-8672900115240149-122622-738787248ad514db60ed0ad9327b6e1c-3095871576', // ✅ SEU ACCESS TOKEN REAL
    sandbox: true, // ✅ MANTÉM true PARA TESTES (mude para false em produção)
    currency: 'BRL'
};

// ========== STRIPE ==========
const STRIPE_CONFIG = {
    publishableKey: 'pk_test_1234567890', // 👈 SUA PUBLISHABLE KEY
    secretKey: 'sk_test_1234567890',     // 👈 SUA SECRET KEY (NUNCA NO FRONTEND!)
    sandbox: true,
    currency: 'brl'
};

// ========== PAYPAL ==========
const PAYPAL_CONFIG = {
    clientId: 'AZ1234567890', // 👈 SEU CLIENT ID
    sandbox: true,
    currency: 'BRL'
};

// 🎯 ESCOLHA O GATEWAY ATUAL
// Altere esta linha para escolher qual gateway usar
const GATEWAY_SELECIONADO = 'mercadopago'; // 'pagseguro', 'mercadopago', 'stripe', 'paypal'

// Função para obter configuração do gateway atual
function getGatewayConfig(gateway = GATEWAY_SELECIONADO) {
    const configs = {
        pagseguro: PAGSEGURO_CONFIG,
        mercadopago: MERCADO_PAGO_CONFIG,
        stripe: STRIPE_CONFIG,
        paypal: PAYPAL_CONFIG
    };

    return configs[gateway] || configs.pagseguro;
}

// Função para validar configuração
function validarConfiguracaoGateway(gateway = GATEWAY_SELECIONADO) {
    const config = getGatewayConfig(gateway);

    switch(gateway) {
        case 'pagseguro':
            return config.email !== 'seu-email@exemplo.com' && config.token !== 'seu-token-aqui';

        case 'mercadopago':
            return !config.publicKey.startsWith('TEST-') && !config.accessToken.startsWith('TEST-');

        case 'stripe':
            return !config.publishableKey.includes('test') && !config.secretKey.includes('test');

        case 'paypal':
            return !config.clientId.startsWith('AZ123');

        default:
            return false;
    }
}

// Planos de cobrança (compatibilidade)
const PAYMENT_CONFIG = {
    planos: {
        gratuito: {
            id: 'gratuito',
            nome: 'Gratuito',
            valor: 0,
            periodo: 'mensal',
            limiteProdutos: 10
        },
        profissional: {
            id: 'profissional',
            nome: 'Profissional',
            valor: 49,
            periodo: 'mensal',
            limiteProdutos: 1000
        }
    },

    // Taxas por gateway
    taxas: {
        pagseguro: {
            credito: 0.0399,   // 3.99% para crédito à vista
            parcela: 0.0269,   // 2.69% para parcelas
            fixa: 0.49         // R$ 0,49 por transação
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