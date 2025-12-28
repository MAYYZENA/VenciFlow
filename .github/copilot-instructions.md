# VenciFlow - Instruções para Agentes de Codificação IA

## Visão Geral do Projeto
VenciFlow é um sistema profissional de gestão de estoque que implementa a metodologia FEFO (First Expired, First Out) para produtos perecíveis. Construído como um Progressive Web App (PWA) do lado cliente usando JavaScript vanilla, HTML5 e CSS3 com backend Firebase.

## Arquitetura
- **Frontend**: Aplicação de página única em `index.html` com arquivos JavaScript modulares
- **Backend**: Firebase (Autenticação + Firestore) - sem código do lado servidor
- **Fluxo de Dados**: Gerenciamento de estado do lado cliente com arrays globais (`produtos`, `movimentacoes`)
- **Componentes Principais**:
  - `app.js`: Lógica central da aplicação, integração Firebase, operações de dados
  - `dashboard.js`: Dashboard executivo com métricas e análises
  - `multi-gateway-payment.js`: Integrações de gateways de pagamento (PagSeguro, MercadoPago, Stripe)
  - `webhooks.js`: Tratamento de webhooks de pagamento

## Padrões e Convenções Críticas

### Integração Firebase
- Inicializar Firebase em `app.js` com `window.firebaseConfig`
- Usar coleções Firestore: `produtos`, `movimentacoes`, `clientes`
- Estrutura de dados: Produtos têm `validade` (data de expiração), `quantidade`, `categoria`
- Autenticação: Firebase Auth com email/senha

### Gerenciamento de Estado
- Variáveis globais: `produtos[]`, `movimentacoes[]`, `categorias Set`
- Sistema de cache: Classe `DataCache` com expiração de 5 minutos
- Busca debounced: Função `debounce()` para tratamento de entrada

### Componentes UI
- Telas gerenciadas por classes CSS: `.screen.active`
- Loader: `#global-loader` com classe `.active`
- Notificações toast: `#toast` com auto-hide
- Design responsivo com propriedades CSS customizadas

### Integração de Pagamento
- Classes de gateway estendem interface comum
- Modo sandbox para desenvolvimento (PagSeguro, MercadoPago)
- Endpoints de webhook em `webhooks.js` para confirmações de pagamento

## Fluxos de Trabalho do Desenvolvedor

### Desenvolvimento Local
```bash
npm start  # Executa http-server na porta 8000
```
- Acessar em `http://localhost:8000`
- Hot reload não disponível - refresh manual necessário

### Implantação
- Usar scripts PowerShell no diretório raiz
- Upload FTP para hospedagem Hostinger
- Scripts lidam com múltiplos endpoints FTP automaticamente
- Exemplo: `.\deploy-inteligente.ps1`

### Testes
- Sem testes automatizados - testes manuais necessários
- Validar em múltiplos navegadores (Chrome, Firefox, Safari)
- Testar recursos PWA: modo offline, instalabilidade

## Padrões de Código

### Estrutura de Classe
```javascript
class FeatureManager {
  constructor() {
    // Inicializar propriedades
  }
  
  async methodName() {
    // Operações assíncronas com try/catch
  }
}
```

### Tratamento de Erros
```javascript
try {
  // Operação
} catch (error) {
  console.error('Contexto:', error.message);
  mostrarToast('Mensagem amigável ao usuário');
}
```

### Validação de Dados
- Usar classe `FormValidator` para CPF, email, datas
- Validação do lado cliente antes de operações Firebase
- Sanitizar entradas com `escapeHTML()`

### Operações Firebase
```javascript
const docRef = await db.collection('produtos').add(productData);
const snapshot = await db.collection('produtos').get();
const produtos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
```

## Organização de Arquivos
- Nível raiz: Arquivos principais HTML, JS, CSS
- `assets/`: Assets estáticos (imagens, ícones)
- `css/`, `js/`: Subdiretórios organizados (embora não muito utilizados)
- Scripts de implantação: Múltiplos arquivos PowerShell para diferentes cenários

## Dependências Externas
- Firebase JS SDK v9.23.0 (modo compat)
- Chart.js v4.4.0 para gráficos do dashboard
- XLSX para exportação Excel
- jsPDF para geração PDF
- QRCode.js para códigos QR

## Considerações de Segurança
- Configuração Firebase em `window.firebaseConfig` (deve ser protegida em produção)
- Tokens de pagamento tratados do lado cliente (usar variáveis de ambiente em produção)
- Isolamento de dados por ID de usuário Firebase

## Tarefas Comuns
- Adicionando recursos: Estender classes existentes ou criar novas em arquivos separados
- Mudanças UI: Modificar HTML em `index.html`, estilo em `style.css`
- Mudanças de dados: Atualizar operações Firestore em `app.js`
- Recursos de pagamento: Modificar classes de gateway em `multi-gateway-payment.js`

## Otimizações de Performance
- Sistema de cache previne chamadas excessivas ao Firebase
- Busca debounced reduz carga da API
- Lazy loading para imagens
- Rate limiting em operações sensíveis

## Dicas de Depuração
- Usar DevTools do navegador para depuração Firebase
- Verificar console para erros de Firebase Auth
- Validar dados com emulador Firestore localmente
- Testar fluxos de pagamento em modo sandbox primeiro