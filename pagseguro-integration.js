// ===========================================
// PAGSEGURO INTEGRATION - VenciFlow
// ===========================================

class PagSeguroIntegration {
    constructor() {
        this.config = {
            email: 'seu-email@exemplo.com', // 👈 ALTERE AQUI: seu e-mail do PagSeguro
            token: 'seu-token-aqui', // 👈 ALTERE AQUI: seu token de produção
            sandbox: true, // 👈 ALTERE AQUI: false para produção
            currency: 'BRL'
        };

        this.baseUrl = this.config.sandbox ?
            'https://ws.sandbox.pagseguro.uol.com.br' :
            'https://ws.pagseguro.uol.com.br';

        this.checkoutUrl = this.config.sandbox ?
            'https://sandbox.pagseguro.uol.com.br' :
            'https://pagseguro.uol.com.br';
    }

    // Gerar URL de checkout para plano (evita CORS)
    gerarUrlCheckoutPlano(dadosPlano) {
        // Para desenvolvimento: simular checkout
        if (this.config.email === 'seu-email@exemplo.com') {
            console.log('Modo desenvolvimento: Simulando checkout do PagSeguro');
            return `https://sandbox.pagseguro.uol.com.br/v2/pre-approvals/request.html?code=SIMULACAO_${Date.now()}`;
        }

        // Em produção: construir URL real do PagSeguro
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

    // Simulação de criação de plano (para compatibilidade)
    async criarPlano(dadosPlano) {
        console.log('Simulando criação de plano no PagSeguro:', dadosPlano);

        // Em desenvolvimento, retorna um código simulado
        if (this.config.email === 'seu-email@exemplo.com') {
            return `PLANO_SIMULADO_${Date.now()}`;
        }

        // Em produção, isso seria feito via backend
        throw new Error('Integração completa requer backend. Use gerarUrlCheckoutPlano() para redirecionamento.');
    }

    // Simulação de criação de assinatura
    async criarAssinatura(dadosAssinatura) {
        console.log('Simulando criação de assinatura no PagSeguro:', dadosAssinatura);

        // Em desenvolvimento, retorna um código simulado
        if (this.config.email === 'seu-email@exemplo.com') {
            return `ASSINATURA_SIMULADA_${Date.now()}`;
        }

        throw new Error('Integração completa requer backend. Use gerarUrlCheckoutPlano() para redirecionamento.');
    }

    // Simulação de cancelamento
    async cancelarAssinatura(codigoAssinatura) {
        console.log('Simulando cancelamento de assinatura:', codigoAssinatura);
        return true;
    }

    // Simulação de criação de assinatura
    async criarAssinatura(dadosAssinatura) {
        console.log('Simulando criação de assinatura no PagSeguro:', dadosAssinatura);

        // Em desenvolvimento, retorna um código simulado
        if (this.config.email === 'seu-email@exemplo.com') {
            return `ASSINATURA_SIMULADA_${Date.now()}`;
        }

        throw new Error('Integração completa requer backend. Use gerarUrlCheckoutPlano() para redirecionamento.');
    }

    // Simulação de cancelamento
    async cancelarAssinatura(codigoAssinatura) {
        console.log('Simulando cancelamento de assinatura:', codigoAssinatura);
        return true;
    }

    // Gerar URL de checkout de pagamento único
    gerarUrlCheckoutPagamento(dadosPagamento) {
        if (this.config.email === 'seu-email@exemplo.com') {
            console.log('Modo desenvolvimento: Simulando checkout de pagamento');
            return `https://sandbox.pagseguro.uol.com.br/v2/checkout/payment.html?code=SIMULACAO_${Date.now()}`;
        }

        // Em produção: construir URL real do PagSeguro para pagamento único
        const params = new URLSearchParams({
            email: this.config.email,
            token: this.config.token,
            currency: this.config.currency,
            reference: dadosPagamento.referencia,
            senderName: dadosPagamento.nome,
            senderEmail: dadosPagamento.email,
            itemId1: dadosPagamento.itemId,
            itemDescription1: dadosPagamento.descricao,
            itemAmount1: dadosPagamento.valor.toFixed(2),
            itemQuantity1: '1'
        });

        return `${this.checkoutUrl}/v2/checkout/payment.html?${params.toString()}`;
    }
}

// Instância global
const pagSeguro = new PagSeguroIntegration();