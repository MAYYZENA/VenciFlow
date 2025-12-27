// ===========================================
// WEBHOOKS PROCESSOR - VenciFlow
// ===========================================

class WebhookProcessor {
    constructor() {
        this.processedNotifications = new Set();
    }

    // Processar webhook do PagSeguro
    async processarPagSeguro(notificationCode, notificationType) {
        try {
            console.log('Processando webhook PagSeguro:', notificationCode, notificationType);

            // Evitar processamento duplicado
            if (this.processedNotifications.has(notificationCode)) {
                console.log('Notificação já processada:', notificationCode);
                return { success: true, message: 'Notificação já processada' };
            }

            // Buscar detalhes da notificação
            const detalhes = await this.buscarDetalhesNotificacao(notificationCode, notificationType);

            if (!detalhes) {
                throw new Error('Não foi possível obter detalhes da notificação');
            }

            // Processar baseado no tipo
            switch (notificationType) {
                case 'transaction':
                    await this.processarTransacao(detalhes);
                    break;
                case 'preApproval':
                    await this.processarAssinatura(detalhes);
                    break;
                default:
                    console.log('Tipo de notificação não suportado:', notificationType);
            }

            // Marcar como processada
            this.processedNotifications.add(notificationCode);

            return { success: true, message: 'Webhook processado com sucesso' };

        } catch (error) {
            console.error('Erro ao processar webhook:', error);
            return { success: false, message: error.message };
        }
    }

    // Buscar detalhes da notificação no PagSeguro
    async buscarDetalhesNotificacao(notificationCode, notificationType) {
        try {
            const config = pagSeguro.config;
            let url = '';

            if (notificationType === 'transaction') {
                url = `${pagSeguro.baseUrl}/v3/transactions/notifications/${notificationCode}?email=${config.email}&token=${config.token}`;
            } else if (notificationType === 'preApproval') {
                url = `${pagSeguro.baseUrl}/pre-approvals/notifications/${notificationCode}?email=${config.email}&token=${config.token}`;
            }

            const response = await fetch(url);
            const xmlText = await response.text();

            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

            return this.xmlToJson(xmlDoc);
        } catch (error) {
            console.error('Erro ao buscar detalhes:', error);
            return null;
        }
    }

    // Processar transação
    async processarTransacao(detalhes) {
        const transaction = detalhes.transaction;
        const status = transaction.status;
        const reference = transaction.reference;

        console.log('Processando transação:', reference, 'Status:', status);

        // Atualizar status no Firebase
        const db = firebase.firestore();

        try {
            // Buscar fatura pelo reference
            const faturasRef = db.collection('faturas');
            const query = faturasRef.where('referencia_pagamento', '==', reference);
            const snapshot = await query.get();

            if (!snapshot.empty) {
                const faturaDoc = snapshot.docs[0];
                const faturaId = faturaDoc.id;

                // Atualizar status
                const statusMap = {
                    '1': 'aguardando', // Aguardando pagamento
                    '2': 'analise',    // Em análise
                    '3': 'pago',       // Paga
                    '4': 'disponivel', // Disponível
                    '5': 'disputa',    // Em disputa
                    '6': 'devolvida',  // Devolvida
                    '7': 'cancelada'   // Cancelada
                };

                const novoStatus = statusMap[status] || 'desconhecido';

                await faturasRef.doc(faturaId).update({
                    status: novoStatus,
                    data_atualizacao: firebase.firestore.FieldValue.serverTimestamp(),
                    detalhes_pagamento: detalhes
                });

                console.log('Fatura atualizada:', faturaId, 'Status:', novoStatus);

                // Se pago, ativar assinatura
                if (novoStatus === 'pago') {
                    await this.ativarAssinaturaPorFatura(faturaId);
                }
            }
        } catch (error) {
            console.error('Erro ao atualizar fatura:', error);
        }
    }

    // Processar assinatura
    async processarAssinatura(detalhes) {
        const preApproval = detalhes.preApproval;
        const status = preApproval.status;
        const reference = preApproval.reference;

        console.log('Processando assinatura:', reference, 'Status:', status);

        // Atualizar status da assinatura no Firebase
        const db = firebase.firestore();

        try {
            const assinaturasRef = db.collection('assinaturas');
            const query = assinaturasRef.where('referencia', '==', reference);
            const snapshot = await query.get();

            if (!snapshot.empty) {
                const assinaturaDoc = snapshot.docs[0];
                const assinaturaId = assinaturaDoc.id;

                // Mapear status do PagSeguro
                const statusMap = {
                    'INITIATED': 'iniciada',
                    'PENDING': 'pendente',
                    'ACTIVE': 'ativo',
                    'PAYMENT_METHOD_CHANGE': 'alteracao_pagamento',
                    'SUSPENDED': 'suspenso',
                    'CANCELLED': 'cancelado',
                    'EXPIRED': 'expirado'
                };

                const novoStatus = statusMap[status] || 'desconhecido';

                await assinaturasRef.doc(assinaturaId).update({
                    status: novoStatus,
                    data_atualizacao: firebase.firestore.FieldValue.serverTimestamp(),
                    codigo_pagseguro: preApproval.code,
                    detalhes_pagamento: detalhes
                });

                console.log('Assinatura atualizada:', assinaturaId, 'Status:', novoStatus);

                // Atualizar limites do usuário se ativa
                if (novoStatus === 'ativo') {
                    await this.atualizarLimitesUsuario(assinaturaDoc.data());
                }
            }
        } catch (error) {
            console.error('Erro ao atualizar assinatura:', error);
        }
    }

    // Ativar assinatura baseada na fatura paga
    async ativarAssinaturaPorFatura(faturaId) {
        try {
            const db = firebase.firestore();
            const faturaDoc = await db.collection('faturas').doc(faturaId).get();
            const fatura = faturaDoc.data();

            if (fatura && fatura.user_id) {
                // Criar ou atualizar assinatura
                const assinaturaData = {
                    user_id: fatura.user_id,
                    plano: fatura.plano,
                    status: 'ativo',
                    data_inicio: firebase.firestore.FieldValue.serverTimestamp(),
                    data_proximo_pagamento: this.calcularProximoPagamento(),
                    valor: fatura.valor,
                    referencia: `assinatura_${faturaId}`,
                    fatura_origem: faturaId
                };

                await db.collection('assinaturas').add(assinaturaData);
                console.log('Assinatura criada para fatura:', faturaId);

                // Atualizar limites do usuário
                await this.atualizarLimitesUsuario(assinaturaData);
            }
        } catch (error) {
            console.error('Erro ao ativar assinatura:', error);
        }
    }

    // Atualizar limites do usuário baseado no plano
    async atualizarLimitesUsuario(assinatura) {
        try {
            const db = firebase.firestore();
            const userDoc = await db.collection('usuarios').doc(assinatura.user_id).get();

            if (userDoc.exists) {
                const limites = this.getLimitesPorPlano(assinatura.plano);

                await db.collection('usuarios').doc(assinatura.user_id).update({
                    plano_atual: assinatura.plano,
                    limites: limites,
                    assinatura_ativa: true,
                    data_atualizacao_plano: firebase.firestore.FieldValue.serverTimestamp()
                });

                console.log('Limites atualizados para usuário:', assinatura.user_id);
            }
        } catch (error) {
            console.error('Erro ao atualizar limites:', error);
        }
    }

    // Calcular próximo pagamento (30 dias)
    calcularProximoPagamento() {
        const data = new Date();
        data.setMonth(data.getMonth() + 1);
        return firebase.firestore.Timestamp.fromDate(data);
    }

    // Obter limites por plano
    getLimitesPorPlano(plano) {
        const limites = {
            'basico': { produtos: 100, clientes: 50, relatorios: 'basico' },
            'profissional': { produtos: 1000, clientes: 500, relatorios: 'avancado' },
            'premium': { produtos: -1, clientes: -1, relatorios: 'premium' }, // -1 = ilimitado
            'gratuito': { produtos: 10, clientes: 5, relatorios: 'basico' }
        };

        return limites[plano] || limites['gratuito'];
    }

    // Converter XML para JSON
    xmlToJson(xml) {
        const obj = {};

        if (xml.nodeType === 1) { // Element
            if (xml.attributes.length > 0) {
                obj['@attributes'] = {};
                for (let j = 0; j < xml.attributes.length; j++) {
                    const attribute = xml.attributes.item(j);
                    obj['@attributes'][attribute.nodeName] = attribute.nodeValue;
                }
            }
        } else if (xml.nodeType === 3) { // Text
            return xml.nodeValue;
        }

        if (xml.hasChildNodes()) {
            for (let i = 0; i < xml.childNodes.length; i++) {
                const item = xml.childNodes.item(i);
                const nodeName = item.nodeName;

                if (typeof obj[nodeName] === 'undefined') {
                    obj[nodeName] = this.xmlToJson(item);
                } else {
                    if (typeof obj[nodeName].push === 'undefined') {
                        const old = obj[nodeName];
                        obj[nodeName] = [];
                        obj[nodeName].push(old);
                    }
                    obj[nodeName].push(this.xmlToJson(item));
                }
            }
        }

        return obj;
    }
}

// Instância global
const webhookProcessor = new WebhookProcessor();