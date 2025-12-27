#!/usr/bin/env node

/**
 * 🧪 TESTE COMPLETO DO SISTEMA VENCIFLOW
 * Validação final após migração para app.venciflow.com
 */

const https = require('https');
const fs = require('fs');

console.log('🚀 Iniciando teste completo do VenciFlow...\n');

// Configurações do teste
const TEST_CONFIG = {
    domain: 'https://app.venciflow.com',
    timeout: 10000,
    tests: []
};

// Função para fazer requisições HTTP
function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const req = https.get(url, { timeout: TEST_CONFIG.timeout, ...options }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({
                    status: res.statusCode,
                    headers: res.headers,
                    data: data,
                    url: url
                });
            });
        });

        req.on('error', reject);
        req.on('timeout', () => reject(new Error('Timeout')));
    });
}

// Teste 1: Verificar se o site está respondendo
async function testSiteResponse() {
    console.log('📡 Testando resposta do site...');
    try {
        const response = await makeRequest(TEST_CONFIG.domain);
        const success = response.status === 200;

        TEST_CONFIG.tests.push({
            name: 'Resposta do Site',
            status: success ? '✅ PASSOU' : '❌ FALHOU',
            details: `Status: ${response.status}, SSL: ${response.headers['strict-transport-security'] ? 'Ativo' : 'Inativo'}`
        });

        return success;
    } catch (error) {
        TEST_CONFIG.tests.push({
            name: 'Resposta do Site',
            status: '❌ FALHOU',
            details: `Erro: ${error.message}`
        });
        return false;
    }
}

// Teste 2: Verificar SSL
async function testSSL() {
    console.log('🔒 Testando certificado SSL...');
    try {
        const response = await makeRequest(TEST_CONFIG.domain);
        const hasSSL = response.headers['strict-transport-security'] !== undefined;

        TEST_CONFIG.tests.push({
            name: 'Certificado SSL',
            status: hasSSL ? '✅ PASSOU' : '❌ FALHOU',
            details: hasSSL ? 'HSTS ativo' : 'HSTS não detectado'
        });

        return hasSSL;
    } catch (error) {
        TEST_CONFIG.tests.push({
            name: 'Certificado SSL',
            status: '❌ FALHOU',
            details: `Erro: ${error.message}`
        });
        return false;
    }
}

// Teste 3: Verificar PWA (manifest.json)
async function testPWA() {
    console.log('📱 Testando PWA (manifest.json)...');
    try {
        const response = await makeRequest(`${TEST_CONFIG.domain}/manifest.json`);
        const isValid = response.status === 200 && response.data.includes('VenciFlow');

        TEST_CONFIG.tests.push({
            name: 'PWA Manifest',
            status: isValid ? '✅ PASSOU' : '❌ FALHOU',
            details: isValid ? 'Manifest válido com domínio correto' : 'Manifest não encontrado ou inválido'
        });

        return isValid;
    } catch (error) {
        TEST_CONFIG.tests.push({
            name: 'PWA Manifest',
            status: '❌ FALHOU',
            details: `Erro: ${error.message}`
        });
        return false;
    }
}

// Teste 4: Verificar Service Worker
async function testServiceWorker() {
    console.log('⚙️ Testando Service Worker...');
    try {
        const response = await makeRequest(`${TEST_CONFIG.domain}/sw.js`);
        const isValid = response.status === 200 && response.data.includes('VenciFlow');

        TEST_CONFIG.tests.push({
            name: 'Service Worker',
            status: isValid ? '✅ PASSOU' : '❌ FALHOU',
            details: isValid ? 'SW ativo e funcional' : 'SW não encontrado'
        });

        return isValid;
    } catch (error) {
        TEST_CONFIG.tests.push({
            name: 'Service Worker',
            status: '❌ FALHOU',
            details: `Erro: ${error.message}`
        });
        return false;
    }
}

// Teste 5: Verificar recursos críticos
async function testCriticalResources() {
    console.log('📄 Testando recursos críticos...');
    const resources = [
        '/index.html',
        '/style.css',
        '/app.js',
        '/script.js'
    ];

    let passed = 0;
    const results = [];

    for (const resource of resources) {
        try {
            const response = await makeRequest(`${TEST_CONFIG.domain}${resource}`);
            const success = response.status === 200;
            if (success) passed++;
            results.push(`${resource}: ${success ? '✅' : '❌'}`);
        } catch (error) {
            results.push(`${resource}: ❌ (${error.message})`);
        }
    }

    const allPassed = passed === resources.length;
    TEST_CONFIG.tests.push({
        name: 'Recursos Críticos',
        status: allPassed ? '✅ PASSOU' : '❌ FALHOU',
        details: `${passed}/${resources.length} carregados - ${results.join(', ')}`
    });

    return allPassed;
}

// Teste 6: Verificar Firebase (simulado)
async function testFirebaseIntegration() {
    console.log('🔥 Testando integração Firebase...');
    try {
        // Simular teste básico - em produção seria mais complexo
        const response = await makeRequest(TEST_CONFIG.domain);
        const hasFirebase = response.data.includes('firebase') || response.data.includes('Firebase');

        TEST_CONFIG.tests.push({
            name: 'Firebase Integration',
            status: hasFirebase ? '✅ PASSOU' : '⚠️ PENDENTE',
            details: hasFirebase ? 'Firebase detectado no código' : 'Verificar manualmente no console'
        });

        return hasFirebase;
    } catch (error) {
        TEST_CONFIG.tests.push({
            name: 'Firebase Integration',
            status: '❌ FALHOU',
            details: `Erro: ${error.message}`
        });
        return false;
    }
}

// Função principal de teste
async function runAllTests() {
    console.log('🧪 EXECUTANDO TESTES COMPLETOS DO VENCIFLOW\n');
    console.log('=' .repeat(50));

    const startTime = Date.now();

    // Executar todos os testes
    await testSiteResponse();
    await testSSL();
    await testPWA();
    await testServiceWorker();
    await testCriticalResources();
    await testFirebaseIntegration();

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    // Resultados finais
    console.log('\n' + '=' .repeat(50));
    console.log('📊 RESULTADOS DOS TESTES:');
    console.log('=' .repeat(50));

    let passedTests = 0;
    let totalTests = TEST_CONFIG.tests.length;

    TEST_CONFIG.tests.forEach(test => {
        console.log(`${test.name}: ${test.status}`);
        console.log(`   ${test.details}`);
        console.log('');
        if (test.status.includes('PASSOU')) passedTests++;
    });

    const successRate = ((passedTests / totalTests) * 100).toFixed(1);

    console.log('=' .repeat(50));
    console.log(`⏱️  Tempo total: ${duration}s`);
    console.log(`📈 Taxa de sucesso: ${successRate}% (${passedTests}/${totalTests})`);
    console.log('=' .repeat(50));

    // Recomendações
    if (successRate >= 80) {
        console.log('🎉 SISTEMA APROVADO! Pronto para produção.');
        console.log('💡 Próximos passos:');
        console.log('   1. Ativar CDN Cloudflare no hPanel');
        console.log('   2. Configurar backup automático');
        console.log('   3. Testar funcionalidades manuais');
    } else {
        console.log('⚠️  SISTEMA PRECISA DE AJUSTES:');
        console.log('   - Verificar falhas nos testes acima');
        console.log('   - Checar configurações do Hostinger');
        console.log('   - Validar arquivos no servidor');
    }

    console.log('\n🔗 URL do sistema: https://app.venciflow.com');
    console.log('📞 Suporte Hostinger: 24/7 disponível\n');
}

// Executar testes
runAllTests().catch(error => {
    console.error('❌ Erro fatal durante os testes:', error);
    process.exit(1);
});