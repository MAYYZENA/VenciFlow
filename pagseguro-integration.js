// ===========================================
// PAGSEGURO INTEGRATION - VenciFlow
// ===========================================

class PagSeguroIntegration {
    constructor() {
        this.config = {
            email: 'seu-email@exemplo.com', // Substitua pelo seu e-mail do PagSeguro
            token: 'seu-token-aqui', // Substitua pelo seu token de produção
            sandbox: true, // Mude para false em produção
            currency: 'BRL'
        };

        this.baseUrl = this.config.sandbox ?
            'https://ws.sandbox.pagseguro.uol.com.br' :
            'https://ws.pagseguro.uol.com.br';

        this.checkoutUrl = this.config.sandbox ?
            'https://sandbox.pagseguro.uol.com.br' :
            'https://pagseguro.uol.com.br';
    }

    // Criar sessão do PagSeguro
    async criarSessao() {
        try {
            const response = await fetch(`${this.baseUrl}/v2/sessions?email=${this.config.email}&token=${this.config.token}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            const data = await response.text();
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(data, 'text/xml');
            const sessionId = xmlDoc.getElementsByTagName('id')[0]?.textContent;

            if (sessionId) {
                console.log('Sessão PagSeguro criada:', sessionId);
                return sessionId;
            } else {
                throw new Error('Erro ao criar sessão PagSeguro');
            }
        } catch (error) {
            console.error('Erro ao criar sessão:', error);
            throw error;
        }
    }

    // Criar plano de assinatura
    async criarPlano(dadosPlano) {
        const planoData = {
            reference: dadosPlano.referencia,
            preApproval: {
                name: dadosPlano.nome,
                charge: 'AUTO', // Cobrança automática
                period: 'MONTHLY', // Mensal
                amountPerPayment: dadosPlano.valor.toFixed(2),
                membershipFee: '0.00', // Taxa de adesão
                trialPeriodDuration: 0, // Sem período de teste
                details: dadosPlano.descricao,
                maxAmountPerPeriod: dadosPlano.valor.toFixed(2),
                maxPaymentsPerPeriod: 1,
                initialDate: new Date().toISOString(),
                finalDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 ano
            }
        };

        try {
            const response = await fetch(`${this.baseUrl}/pre-approvals/request?email=${this.config.email}&token=${this.config.token}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: this.objectToFormData(planoData)
            });

            const data = await response.text();
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(data, 'text/xml');

            const code = xmlDoc.getElementsByTagName('code')[0]?.textContent;
            if (code) {
                console.log('Plano criado:', code);
                return code;
            } else {
                const error = xmlDoc.getElementsByTagName('error')[0]?.textContent;
                throw new Error(error || 'Erro ao criar plano');
            }
        } catch (error) {
            console.error('Erro ao criar plano:', error);
            throw error;
        }
    }

    // Criar assinatura
    async criarAssinatura(dadosAssinatura) {
        const assinaturaData = {
            plan: dadosAssinatura.planoId,
            reference: dadosAssinatura.referencia,
            sender: {
                name: dadosAssinatura.nome,
                email: dadosAssinatura.email,
                phone: {
                    areaCode: dadosAssinatura.ddd,
                    number: dadosAssinatura.telefone
                },
                address: {
                    street: dadosAssinatura.endereco,
                    number: dadosAssinatura.numero,
                    complement: dadosAssinatura.complemento,
                    district: dadosAssinatura.bairro,
                    city: dadosAssinatura.cidade,
                    state: dadosAssinatura.estado,
                    country: 'BRA',
                    postalCode: dadosAssinatura.cep
                },
                documents: [{
                    type: 'CPF',
                    value: dadosAssinatura.cpf
                }]
            },
            paymentMethod: {
                type: 'CREDITCARD',
                creditCard: {
                    token: dadosAssinatura.cardToken,
                    holder: {
                        name: dadosAssinatura.nomeCartao,
                        birthDate: dadosAssinatura.dataNascimento,
                        documents: [{
                            type: 'CPF',
                            value: dadosAssinatura.cpf
                        }],
                        phone: {
                            areaCode: dadosAssinatura.ddd,
                            number: dadosAssinatura.telefone
                        }
                    }
                }
            }
        };

        try {
            const response = await fetch(`${this.baseUrl}/pre-approvals?email=${this.config.email}&token=${this.config.token}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: this.objectToFormData(assinaturaData)
            });

            const data = await response.text();
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(data, 'text/xml');

            const code = xmlDoc.getElementsByTagName('code')[0]?.textContent;
            if (code) {
                console.log('Assinatura criada:', code);
                return code;
            } else {
                const error = xmlDoc.getElementsByTagName('error')[0]?.textContent;
                throw new Error(error || 'Erro ao criar assinatura');
            }
        } catch (error) {
            console.error('Erro ao criar assinatura:', error);
            throw error;
        }
    }

    // Cancelar assinatura
    async cancelarAssinatura(codigoAssinatura) {
        try {
            const response = await fetch(`${this.baseUrl}/pre-approvals/${codigoAssinatura}/cancel?email=${this.config.email}&token=${this.config.token}`, {
                method: 'PUT'
            });

            if (response.ok) {
                console.log('Assinatura cancelada:', codigoAssinatura);
                return true;
            } else {
                throw new Error('Erro ao cancelar assinatura');
            }
        } catch (error) {
            console.error('Erro ao cancelar assinatura:', error);
            throw error;
        }
    }

    // Verificar status da assinatura
    async verificarStatus(codigoAssinatura) {
        try {
            const response = await fetch(`${this.baseUrl}/pre-approvals/${codigoAssinatura}?email=${this.config.email}&token=${this.config.token}`);
            const data = await response.text();

            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(data, 'text/xml');

            const status = xmlDoc.getElementsByTagName('status')[0]?.textContent;
            return status;
        } catch (error) {
            console.error('Erro ao verificar status:', error);
            return null;
        }
    }

    // Utilitário para converter objeto em form data
    objectToFormData(obj, prefix = '') {
        const formData = new URLSearchParams();

        for (const [key, value] of Object.entries(obj)) {
            const formKey = prefix ? `${prefix}[${key}]` : key;

            if (value && typeof value === 'object' && !Array.isArray(value)) {
                // Objeto aninhado
                const nestedData = this.objectToFormData(value, formKey);
                for (const [nestedKey, nestedValue] of nestedData) {
                    formData.append(nestedKey, nestedValue);
                }
            } else if (Array.isArray(value)) {
                // Array
                value.forEach((item, index) => {
                    if (typeof item === 'object') {
                        const arrayData = this.objectToFormData(item, `${formKey}[${index}]`);
                        for (const [arrayKey, arrayValue] of arrayData) {
                            formData.append(arrayKey, arrayValue);
                        }
                    } else {
                        formData.append(`${formKey}[${index}]`, item);
                    }
                });
            } else {
                // Valor simples
                formData.append(formKey, value || '');
            }
        }

        return formData;
    }

    // Gerar URL de checkout
    gerarUrlCheckout(codigo) {
        return `${this.checkoutUrl}/v2/pre-approvals/request.html?code=${codigo}`;
    }
}

// Instância global
const pagSeguro = new PagSeguroIntegration();