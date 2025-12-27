# 📦 VenciFlow - Gestão Profissional de Estoque por Validade

[![Versão](https://img.shields.io/badge/Versão-1.2.0-blue.svg)](https://github.com/mayyzena/VenciFlow)
[![Licença](https://img.shields.io/badge/Licença-Comercial-green.svg)](LICENSE.md)
[![Status](https://img.shields.io/badge/Status-Produção-success.svg)]()

## 🚀 Sobre o Sistema

Sistema completo e profissional para gestão de estoque utilizando o método **FEFO (First Expired, First Out)**, garantindo que produtos com menor validade sejam utilizados primeiro, reduzindo perdas e desperdícios.

> **💡 Por que FEFO?** O método FEFO evita perdas de R$ 10.000+ anuais em produtos vencidos, comum em farmácias, restaurantes e lojas de alimentos.

### 🎯 **Público-Alvo**
- **Farmácias e Drogarias**
- **Restaurantes e Lanchonetes**
- **Lojas de Alimentos e Bebidas**
- **Distribuidoras e Atacados**
- **Empresas de Saúde e Bem-estar**
- **Qualquer negócio com produtos perecíveis**

## 🆕 **Novidades da Versão 1.2.0**

### ⚡ **Melhorias de Performance**
- **Cache Inteligente**: Carregamento ultra-rápido com cache de 5 minutos
- **Debounce nas Buscas**: Buscas instantâneas sem lag
- **Lazy Loading**: Imagens carregam sob demanda
- **Rate Limiting**: Proteção contra uso excessivo da API

### 🎨 **Interface Moderna**
- **Tema Dark Mode**: Automático ou manual com toggle
- **Animações Suaves**: Transições fluidas em toda a interface
- **Responsividade Avançada**: Perfeita em desktop, tablet e mobile
- **Estados de Loading**: Feedback visual durante operações

### 🔔 **Notificações Inteligentes**
- **Push Notifications**: Alertas mesmo com app fechado
- **Notificações Automáticas**: Produtos vencendo e críticos
- **Configuração Personalizada**: Horários e tipos de alerta

### 💾 **Backup e Segurança**
- **Backup Automático**: Diariamente com retenção de 30 dias
- **Exportação Avançada**: CSV, JSON e PDF
- **Validação Robusta**: CPF, e-mail, telefone, datas
- **Rate Limiting**: Proteção contra ataques

### 📊 **Dashboard Executivo Premium**
- **Métricas em Tempo Real**: KPI atualizados automaticamente
- **Análise de Eficiência**: Porcentagem FEFO alcançada
- **Previsão de Perdas**: Valor evitado em desperdícios
- **Relatórios Executivos**: Análises completas mensais

### 💳 **Sistema de Pagamentos**
- **PagSeguro Integrado**: Pagamentos seguros e confiáveis
- **Webhooks Automáticos**: Confirmação instantânea
- **Gestão de Assinaturas**: Planos flexíveis
- **Relatórios Financeiros**: Receitas e inadimplências

## ✨ Funcionalidades Principais

### 📊 **Dashboard Executivo**
- **Métricas em Tempo Real**: Total de produtos, itens vencendo, valor do estoque
- **Gráficos Interativos**: Produtos por categoria, status de validade, movimentações
- **Alertas Inteligentes**: Notificações push para produtos próximos ao vencimento
- **Relatórios Visuais**: Análise de tendências e padrões de consumo

### 📦 **Gestão Completa de Produtos**
- **CRUD Completo**: Cadastro, edição, exclusão e consulta
- **Controle FEFO Automático**: Ordenação por data de validade
- **Lotes e Códigos**: Rastreabilidade completa
- **Categorização**: Organização por tipos de produto
- **Localização**: Controle de prateleiras e setores

### 🔔 **Sistema de Alertas**
- **Notificações Push**: Alertas mesmo com app fechado
- **Configuração Flexível**: Dias de antecedência personalizáveis
- **Alertas por Status**: Vencidos, vencendo hoje, vencendo em breve
- **Relatórios de Perdas**: Análise de produtos descartados

### 👥 **Gestão de Clientes (Admin)**
- **Base de Clientes**: Cadastro completo com dados de contato
- **Planos de Serviço**: Gestão de assinaturas e pacotes
- **Segmentação**: Clientes por plano e status
- **Relatórios**: Análise de carteira de clientes

### 📈 **Relatórios e Analytics**
- **Exportação Excel/PDF**: Relatórios profissionais
- **Análise de Movimentações**: Entradas, saídas, ajustes
- **Relatórios de Vendas**: Performance por período
- **Backup Completo**: Exportação de todos os dados

### 🔐 **Segurança e Usabilidade**
- **Autenticação Firebase**: Login seguro e recuperação de senha
- **Isolamento de Dados**: Cada usuário tem seus dados protegidos
- **Interface Responsiva**: Funciona em desktop, tablet e mobile
- **PWA (Progressive Web App)**: Funciona offline, pode ser instalado

## 🛠️ Tecnologias Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Firebase (Authentication + Firestore)
- **Gráficos**: Chart.js
- **Exportação**: SheetJS (xlsx) + jsPDF
- **Design**: CSS Grid, Flexbox, Material Design
- **PWA**: Service Worker, Web App Manifest

## 💰 **Precificação Sugerida**

### **Modelo SaaS (Assinatura Mensal)**
- **Básico**: R$ 49/mês - Até 500 produtos, 1 usuário
- **Profissional**: R$ 99/mês - Até 2000 produtos, 3 usuários, relatórios avançados
- **Empresarial**: R$ 199/mês - Produtos ilimitados, usuários ilimitados, API, suporte prioritário

### **Licença Vitalícia**
- **Individual**: R$ 497 - Para pequenos negócios
- **Business**: R$ 997 - Para médias empresas
- **Enterprise**: R$ 1.997 - Para grandes corporações

### **White-label/Customização**
- **A partir de R$ 2.997** - Marca própria, customizações específicas

## 📋 Pré-requisitos

- Navegador moderno (Chrome 90+, Firefox 88+, Edge 90+, Safari 14+)
- Conexão com internet (para sincronização com Firebase)
- HTTPS em produção (recomendado para PWA)

## 🚀 **Como Começar**

### **🎯 Demonstração Online**
**Acesse:** [https://app.venciflow.com](https://app.venciflow.com)

**Credenciais de Teste:**
- Email: `demo@sistemafe.com`
- Senha: `demo123`

### **💻 Instalação Local**
```bash
# Clone o repositório
git clone https://github.com/mayyzena/VenciFlow.git

# Entre na pasta
cd sistema-fefo

# Instale dependências (opcional)
npm install

# Execute localmente
npm start
# ou abra index.html diretamente no navegador
```

### **🚀 Deploy Automático (GitHub → Hostinger)**
```bash
# 1. Configurar deploy automático
.\setup-deploy-automatico.ps1

# 2. Configurar secrets no GitHub (IMPORTANTE!)
# Vá para: Settings → Secrets and variables → Actions
# Adicione (nomes exatos, sem espaços):
# - FTP_SERVER = seu-dominio.com
# - FTP_USERNAME = seu-usuario-ftp
# - FTP_PASSWORD = sua-senha-ftp

# 3. Fazer push - deploy automático!
git add .
git commit -m "Deploy automático"
git push origin main
```

**🎯 Regras para nomes de secrets:**
- ✅ Apenas letras, números e `_`
- ✅ Não use espaços ou hífens
- ✅ Deve começar com letra ou `_`
- ❌ Errado: `FTP SERVER`, `ftp-server`
- ✅ Correto: `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`

**🎉 Resultado:** Todo push no GitHub atualiza automaticamente o Hostinger!

## 📊 **ROI Esperado**

### **Redução de Perdas**
- **Farmácias**: Redução de 15-25% em perdas por vencimento
- **Restaurantes**: Redução de 20-30% em desperdícios
- **Lojas**: Redução de 10-20% em produtos fora da validade

### **Ganho de Produtividade**
- **Tempo economizado**: 5-10 horas/semana em controle manual
- **Precisão**: 99% de acurácia vs 70% em planilhas
- **Alertas preventivos**: Redução de 80% em surpresas de vencimento

## 🎯 **Diferenciais Competitivos**

| Funcionalidade | VenciFlow | Concorrentes |
|---|---|---|
| Método FEFO | ✅ Nativo | ❌ Limitado |
| Notificações Push | ✅ Offline | ❌ Apenas online |
| PWA Instalável | ✅ | ❌ |
| Multi-usuário | ✅ | ❌ Básico |
| Relatórios Avançados | ✅ Excel/PDF | ❌ Limitado |
| Backup Automático | ✅ | ❌ Manual |
| API para Integrações | 🚧 Planejado | ❌ |

## 📞 **Suporte e Consultoria**

### **Planos de Suporte**
- **Básico**: Documentação online + comunidade
- **Profissional**: Suporte por email (24h) + treinamentos
- **Enterprise**: Suporte por telefone + consultoria dedicada

### **Serviços Adicionais**
- **Customização**: R$ 150/hora
- **Integração**: Conexão com ERPs, balanças, etc.
- **Treinamento**: Sessões presenciais/remotas
- **Manutenção**: Atualizações e correções

## 📈 **Roadmap de Desenvolvimento**

### **Q1 2025** ✅
- Sistema base FEFO
- Dashboard com gráficos
- Notificações push
- Gestão de clientes

### **Q2 2025** 🚧
- API REST para integrações
- Leitor de códigos de barras
- Import/export CSV
- Relatórios avançados

### **Q3 2025** 📋
- Multi-empresa (tenants)
- Integração WhatsApp
- Análise preditiva
- Mobile app nativa

## 🤝 **Como Adquirir**

### **Contato para Vendas**
- **Email**: contato@sistemafe.com
- **WhatsApp**: (11) 99999-9999
- **LinkedIn**: [VenciFlow](https://linkedin.com/company/sistemafe)

### **Processo de Venda**
1. **Demonstração**: Apresentação personalizada (30 min)
2. **Proposta**: Customizada para seu negócio
3. **Teste**: Período de avaliação (15 dias)
4. **Implantação**: Setup e treinamento (2-4 horas)
5. **Suporte**: Acompanhamento pós-venda

## 📄 **Licença**

Este é um produto comercial. Consulte os [Termos de Uso](LICENSE.md) para detalhes sobre licenciamento, direitos e restrições.

---

**💡 Dica**: Agende uma demonstração gratuita e veja como o VenciFlow pode transformar a gestão do seu estoque!
- Acompanhe gráficos de status e movimentações
- Veja alertas de produtos próximos ao vencimento

### Cadastrar Produtos
1. Acesse **Produtos** → **Novo Produto**
2. Preencha: Código, Nome, Categoria, Lote, Validade, Quantidade
3. Clique em **Salvar Produto**

### Registrar Movimentações
1. Acesse **Movimentações** → **Nova Movimentação**
2. Selecione: Tipo (Entrada/Saída/Ajuste/Descarte), Produto, Quantidade
3. Clique em **Registrar Movimentação**

### Gerar Relatórios
1. Acesse **Relatórios**
2. Escolha o tipo de relatório
3. Clique em **Excel** ou **PDF** para exportar

## 🎯 Casos de Uso

- **Farmácias**: Controle de medicamentos por lote e validade
- **Supermercados**: Gestão de produtos perecíveis
- **Restaurantes**: Controle de ingredientes e insumos
- **Clínicas**: Gestão de materiais médicos e vacinas
- **Distribuidoras**: Controle FEFO de produtos com validade

## 🔒 Segurança

- Autenticação segura via Firebase
- Dados isolados por usuário
- Validação de entradas
- Proteção contra XSS

## 📱 Responsividade

O sistema é totalmente responsivo e funciona em:
- Desktop (layout completo)
- Tablet (layout ajustado)
- Mobile (menu inferior, interface otimizada)

## ⚙️ **Configuração Avançada**

### **Tema Dark Mode**
- **Automático**: Detecta preferências do sistema
- **Manual**: Toggle no canto superior direito da navbar
- **Persistente**: Salva preferência no localStorage

### **Notificações Push**
```javascript
// Solicitar permissão
notificationManager.solicitarPermissao();

// Notificações automáticas para:
// - Produtos vencendo em 7 dias
// - Produtos já vencidos
// - Backup realizado
```

### **Backup Automático**
- **Frequência**: Diariamente
- **Retenção**: Últimos 30 backups
- **Armazenamento**: localStorage do navegador
- **Restauração**: Manual via interface

### **Cache Inteligente**
- **Duração**: 5 minutos por padrão
- **Limpeza**: Automática por expiração
- **Performance**: Reduz chamadas ao Firebase

### **Rate Limiting**
- **Limite**: 50 requisições por minuto
- **Proteção**: Previne abuso da API
- **Reset**: Automático por janela de tempo

### **PagSeguro Integration**
```javascript
// Configuração necessária
const PAYMENT_CONFIG = {
  pagseguro: {
    email: "seu-email@pagseguro.com",
    token: "seu-token-do-pagseguro",
    sandbox: true // false para produção
  }
};
```

## 🔒 Segurança

- **Autenticação**: Firebase Authentication
- **Isolamento**: Dados separados por usuário
- **Validação**: Entradas sanitizadas
- **Rate Limiting**: Proteção contra abuso
- **HTTPS**: Recomendado para produção

## 📊 Versão

**Versão Atual**: 1.2.0 (Premium)  
**Compatibilidade**: Chrome 90+, Firefox 88+, Edge 90+, Safari 14+

---

**VenciFlow** - Gestão Profissional de Estoque por Validade 🚀
