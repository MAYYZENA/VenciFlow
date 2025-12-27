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
        this.config = null;
        this.loadConfig();
    }

    loadConfig() {
        // Aguardar PaymentConfig estar disponível
        const checkConfig = () => {
            if (window.PaymentConfig && window.PaymentConfig.getGatewayConfig) {
                this.config = window.PaymentConfig.getGatewayConfig('mercadopago');
                console.log('✅ Mercado Pago: Configuração carregada com sucesso');
                return true;
            }
            return false;
        };

        // Tentar imediatamente
        if (!checkConfig()) {
            // Se não estiver disponível, tentar novamente após um pequeno delay
            let attempts = 0;
            const maxAttempts = 10; // Máximo 10 tentativas (1 segundo)

            const retry = () => {
                attempts++;
                if (checkConfig()) {
                    return; // Sucesso
                }

                if (attempts < maxAttempts) {
                    setTimeout(retry, 100); // Tentar novamente em 100ms
                } else {
                    // Após todas as tentativas, usar configuração padrão
                    console.warn('⚠️ Mercado Pago: PaymentConfig não disponível após várias tentativas, usando configuração padrão');
                    this.config = {
                        publicKey: 'APP_USR-964e6653-a7a1-4bff-952b-7073c48d6b9c',
                        accessToken: 'APP_USR-8672900115240149-122622-738787248ad514db60ed0ad9327b6e1c-3095871576',
                        sandbox: true,
                        currency: 'BRL'
                    };
                }
            };

            setTimeout(retry, 50); // Primeira tentativa após 50ms
        }
    }

    gerarUrlCheckoutPlano(dadosPlano) {
        // Garantir que a configuração esteja carregada
        if (!this.config) {
            console.warn('⚠️ Mercado Pago: Configuração ainda não carregada, tentando carregar...');
            this.loadConfig();
            // Se ainda não estiver carregada, usar configuração padrão
            if (!this.config) {
                this.config = {
                    publicKey: 'APP_USR-964e6653-a7a1-4bff-952b-7073c48d6b9c',
                    accessToken: 'APP_USR-8672900115240149-122622-738787248ad514db60ed0ad9327b6e1c-3095871576',
                    sandbox: true,
                    currency: 'BRL'
                };
            }
        }

        // Verificar se está usando credenciais de teste
        // NOTA: Para demonstração, forçamos modo sandbox já que não temos backend
        const isTestMode = true; // this.config.publicKey.includes('TEST-') ||
                          // this.config.accessToken.includes('TEST-') ||
                          // this.config.publicKey === 'TEST-1234567890123456';

        if (isTestMode) {
            console.log('🔄 Mercado Pago: Modo desenvolvimento (sandbox) - Demonstração');
            const testPrefId = `TEST_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            console.log('📋 Dados do plano:', {
                nomePlano: dadosPlano.nomePlano,
                valor: dadosPlano.valor,
                email: dadosPlano.email,
                preferenceId: testPrefId
            });
            return `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=${testPrefId}`;
        }

        // MODO PRODUÇÃO - REMOVIDO TEMPORARIAMENTE PARA DEMONSTRAÇÃO
        // Para produção real, seria necessário:
        // 1. Backend para criar preferências via API do Mercado Pago
        // 2. Webhook para receber notificações
        // 3. Validação de pagamentos no servidor
        console.warn('⚠️ Mercado Pago: Modo produção não implementado - usando fallback');
        return `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=DEMO_${Date.now()}`;
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
const GATEWAY_ATUAL = 'mercadopago'; // 'pagseguro', 'mercadopago', 'stripe', 'paypal'

// Instâncias dos gateways (inicialização lazy)
let gateways = {};

// Função para obter instância do gateway
function getGatewayInstance(gatewayName) {
    if (!gateways[gatewayName]) {
        switch(gatewayName) {
            case 'pagseguro':
                gateways[gatewayName] = new PagSeguroIntegration();
                break;
            case 'mercadopago':
                gateways[gatewayName] = new MercadoPagoIntegration();
                break;
            case 'stripe':
                gateways[gatewayName] = new StripeIntegration();
                break;
            case 'paypal':
                gateways[gatewayName] = new PayPalIntegration();
                break;
            default:
                console.error(`❌ Gateway não encontrado: ${gatewayName}`);
                return null;
        }
    }
    return gateways[gatewayName];
}

// Instância global (alterar dinamicamente)
let gatewayAtual = getGatewayInstance(GATEWAY_ATUAL);

// Função para alterar gateway dinamicamente
function alterarGateway(novoGateway) {
    const novaInstancia = getGatewayInstance(novoGateway);
    if (novaInstancia) {
        gatewayAtual = novaInstancia;
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