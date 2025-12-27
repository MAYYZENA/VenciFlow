// ===========================================
// MULTI-GATEWAY PAYMENT SYSTEM - VenciFlow
// ===========================================

// ===========================================
// PAGSEGURO INTEGRATION
// ===========================================

class PagSeguroIntegration {
    constructor() {
        this.config = {
            email: 'seu-email@exemplo.com', // 👈 PAGSEGURO: seu e-mail
            token: 'seu-token-aqui',       // 👈 PAGSEGURO: seu token
            sandbox: true,                 // false para produção
            currency: 'BRL'
        };

        this.checkoutUrl = this.config.sandbox ?
            'https://sandbox.pagseguro.uol.com.br' :
            'https://pagseguro.uol.com.br';
    }

    gerarUrlCheckoutPlano(dadosPlano) {
        if (this.config.email === 'seu-email@exemplo.com') {
            console.log('🔄 PagSeguro: Modo desenvolvimento');
            return `https://sandbox.pagseguro.uol.com.br/v2/pre-approvals/request.html?code=SIMULACAO_${Date.now()}`;
        }

        const params = new URLSearchParams({
            email: this.config.email,
            token: this.config.token,
            currency: this.config.currency,
            reference: dadosPlano.referencia,
            senderName: dadosPlano.nome,
            senderEmail: dadosPlano.email,
            preApprovalName: dadosPlano.nomePlano,
            preApprovalCharge: 'AUTO',
            preApprovalPeriod: 'MONTHLY',
            preApprovalAmountPerPayment: dadosPlano.valor.toFixed(2),
            preApprovalDetails: dadosPlano.descricao
        });

        return `${this.checkoutUrl}/v2/pre-approvals/request.html?${params.toString()}`;
    }

    async criarPlano() { return `PLANO_SIMULADO_${Date.now()}`; }
    async criarAssinatura() { return `ASSINATURA_SIMULADA_${Date.now()}`; }
    async cancelarAssinatura() { return true; }
}

// ===========================================
// MERCADO PAGO INTEGRATION
// ===========================================

class MercadoPagoIntegration {
    constructor() {
        // Carregar configuração do arquivo payment-config.js
        // Verificar se PaymentConfig já está disponível
        if (window.PaymentConfig && window.PaymentConfig.getGatewayConfig) {
            this.config = window.PaymentConfig.getGatewayConfig('mercadopago');
        } else {
            // Fallback para configuração hardcoded se PaymentConfig não estiver pronto
            console.warn('PaymentConfig não disponível, usando configuração padrão do Mercado Pago');
            this.config = {
                publicKey: 'APP_USR-964e6653-a7a1-4bff-952b-7073c48d6b9c',
                accessToken: 'APP_USR-8672900115240149-122622-738787248ad514db60ed0ad9327b6e1c-3095871576',
                sandbox: true,
                currency: 'BRL'
            };
        }
    }

    gerarUrlCheckoutPlano(dadosPlano) {
        // Verificar se está usando credenciais de teste
        const isTestMode = this.config.publicKey.includes('TEST-') ||
                          this.config.accessToken.includes('TEST-') ||
                          this.config.publicKey === 'TEST-1234567890123456';

        if (isTestMode) {
            console.log('🔄 Mercado Pago: Modo desenvolvimento (sandbox)');
            return `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=TEST_${Date.now()}`;
        }

        console.log('🔄 Mercado Pago: Modo produção');
        // Em produção, seria necessário criar uma preferência via API
        // Por enquanto, simulamos a URL
        const params = new URLSearchParams({
            'public_key': this.config.publicKey,
            'preference_id': `pref_${Date.now()}`,
            'external_reference': dadosPlano.referencia,
            'payer.email': dadosPlano.email,
            'items[0].title': dadosPlano.nomePlano,
            'items[0].description': dadosPlano.descricao,
            'items[0].quantity': '1',
            'items[0].unit_price': dadosPlano.valor.toString(),
            'back_urls.success': window.location.origin + '/success',
            'back_urls.failure': window.location.origin + '/failure',
            'auto_return': 'approved'
        });

        return `https://www.mercadopago.com.br/checkout/v1/redirect?${params.toString()}`;
    }

    async criarPlano() { return `PLANO_SIMULADO_${Date.now()}`; }
    async criarAssinatura() { return `ASSINATURA_SIMULADA_${Date.now()}`; }
    async cancelarAssinatura() { return true; }
}

// ===========================================
// STRIPE INTEGRATION
// ===========================================

class StripeIntegration {
    constructor() {
        this.config = {
            publishableKey: 'pk_test_1234567890', // 👈 STRIPE: sua publishable key
            secretKey: 'sk_test_1234567890',     // 👈 STRIPE: sua secret key (nunca no frontend!)
            sandbox: true,
            currency: 'brl'
        };
    }

    gerarUrlCheckoutPlano(dadosPlano) {
        if (this.config.publishableKey.includes('test')) {
            console.log('🔄 Stripe: Modo desenvolvimento');
            return `https://checkout.stripe.com/pay/cs_test_${Date.now()}`;
        }

        // Simulação de URL real (em produção precisaria de backend)
        return `https://checkout.stripe.com/pay/cs_live_${Date.now()}`;
    }

    async criarPlano() { return `PLANO_SIMULADO_${Date.now()}`; }
    async criarAssinatura() { return `ASSINATURA_SIMULADA_${Date.now()}`; }
    async cancelarAssinatura() { return true; }
}

// ===========================================
// PAYPAL INTEGRATION
// ===========================================

class PayPalIntegration {
    constructor() {
        this.config = {
            clientId: 'AZ1234567890', // 👈 PAYPAL: seu client ID
            sandbox: true,
            currency: 'BRL'
        };

        this.checkoutUrl = this.config.sandbox ?
            'https://www.sandbox.paypal.com' :
            'https://www.paypal.com';
    }

    gerarUrlCheckoutPlano(dadosPlano) {
        if (this.config.clientId.startsWith('AZ123')) {
            console.log('🔄 PayPal: Modo desenvolvimento');
            return `https://www.sandbox.paypal.com/checkoutnow?token=SIMULACAO_${Date.now()}`;
        }

        // Simulação de URL real
        return `${this.checkoutUrl}/cgi-bin/webscr?cmd=_xclick&business=${dadosPlano.email}&amount=${dadosPlano.valor}`;
    }

    async criarPlano() { return `PLANO_SIMULADO_${Date.now()}`; }
    async criarAssinatura() { return `ASSINATURA_SIMULADA_${Date.now()}`; }
    async cancelarAssinatura() { return true; }
}

// ===========================================
// SISTEMA DE PAGAMENTO - CONFIGURÁVEL
// ===========================================

// 🎯 ALTERE ESTA LINHA para escolher o gateway desejado:
const GATEWAY_ATUAL = 'pagseguro'; // 'pagseguro', 'mercadopago', 'stripe', 'paypal'

// Instâncias dos gateways
const gateways = {
    pagseguro: new PagSeguroIntegration(),
    mercadopago: new MercadoPagoIntegration(),
    stripe: new StripeIntegration(),
    paypal: new PayPalIntegration()
};

// Instância global (alterar dinamicamente)
let gatewayAtual = gateways[GATEWAY_ATUAL];

// Função para alterar gateway dinamicamente
function alterarGateway(novoGateway) {
    if (gateways[novoGateway]) {
        gatewayAtual = gateways[novoGateway];
        console.log(`🔄 Gateway alterado para: ${novoGateway.toUpperCase()}`);
        return true;
    }
    console.error(`❌ Gateway não encontrado: ${novoGateway}`);
    return false;
}

// Exportar para compatibilidade
const pagSeguro = gatewayAtual;

// Exportar instância global
window.PaymentGateway = gatewayAtual;