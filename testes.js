// Testes unitários para funções utilitárias do sistema FEFO
// Basta abrir este arquivo em um navegador para ver os resultados no console

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function test_isValidEmail() {
  assert(isValidEmail('teste@email.com'), 'Email válido simples');
  assert(isValidEmail('nome.sobrenome@dominio.com.br'), 'Email válido com subdomínio');
  assert(!isValidEmail('invalido@'), 'Email inválido sem domínio');
  assert(!isValidEmail(''), 'Email vazio é inválido');
}

function test_isStrongPassword() {
  assert(isStrongPassword('Abcdef12').valid, 'Senha forte mínima');
  assert(!isStrongPassword('abc').valid, 'Senha muito curta');
  assert(!isStrongPassword('abcdefgh').valid, 'Sem número e maiúscula');
  assert(!isStrongPassword('ABCDEFGH1').valid, 'Sem minúscula');
}

function test_sanitizeInput() {
  assert(sanitizeInput('<script>') === '&lt;script&gt;', 'Sanitiza tags');
  assert(sanitizeInput('normal') === 'normal', 'Texto normal não muda');
}

function test_formatNumber() {
  assert(formatNumber(1000) === '1.000', 'Formata milhar');
}

function test_formatCurrency() {
  assert(formatCurrency(1234.56).includes('1.234'), 'Formata moeda');
}

function runAllTests() {
  try {
    test_isValidEmail();
    test_isStrongPassword();
    test_sanitizeInput();
    test_formatNumber();
    test_formatCurrency();
    console.log('%cTodos os testes passaram!','color:green;font-weight:bold');
  } catch (e) {
    console.error('Teste falhou:', e.message);
  }
}

// Aguarda carregar dependências do app.js
window.addEventListener('DOMContentLoaded', runAllTests);
