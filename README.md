## Exportação Customizada de Relatórios

O sistema permite exportar relatórios customizados do estoque em formato Excel (XLSX). Basta clicar no botão "Exportar Customizado" e selecionar os campos desejados (incluindo campos extras personalizados dos produtos). O arquivo será gerado com apenas as colunas escolhidas.

## Integração Futura com ERPs e Aplicativo Mobile

- **Integração com ERPs:** O sistema foi projetado para fácil integração futura com sistemas fiscais/ERPs. Recomenda-se expor endpoints RESTful ou exportar dados em formatos padrão (CSV, JSON, XML) para facilitar a comunicação.
- **Aplicativo Mobile:** A estrutura do Firestore e a lógica modular permitem criar um app mobile (Flutter, React Native, etc.) que consome os mesmos dados, mantendo sincronização em tempo real.

Sugestões de integração e exemplos de endpoints podem ser fornecidos conforme necessidade.
# Sistema FEFO – Gestão Profissional de Estoque

## Visão Geral
O Sistema FEFO é uma solução web moderna para controle de estoque com foco em validade (First Expired, First Out), ideal para farmácias, mercados, laboratórios e empresas que precisam de rastreabilidade e controle rigoroso de produtos.

## Funcionalidades Principais
- Login e registro de usuários com autenticação Firebase
- Cadastro, edição e exclusão de produtos com controle de validade
- Curva ABC automática para priorização de estoque
- Histórico detalhado de movimentações (entradas/saídas)
- Gerenciamento de marcas, fornecedores, locais e usuários
- Exportação/importação de dados (Excel, PDF)
- Gráficos avançados (Chart.js)
- Notificações de produtos próximos ao vencimento
- Backup e restauração de dados
- Suporte a múltiplos usuários e perfis de acesso
- Dark mode e interface responsiva
- Paginação/lazy loading para estoques e históricos grandes

## Instalação e Uso
1. **Pré-requisitos:**
   - Navegador moderno (Chrome, Edge, Firefox)
   - Conexão com internet para uso do Firebase
2. **Rodando localmente:**
   - Baixe/clique duas vezes no `index.html` para abrir no navegador
   - Para usar scanner de código de barras, rode em servidor local (ex: `npx serve .` ou `python -m http.server`)
3. **Firebase:**
   - O sistema já está configurado para um projeto Firebase. Para usar seu próprio, edite as chaves em `app.js`.
4. **Hospedagem:**
   - Pode ser hospedado no GitHub Pages, Vercel, Netlify ou qualquer serviço de hospedagem estática.

## Estrutura dos Arquivos
- `index.html` – Interface principal
- `app.js` – Lógica do sistema, integração com Firebase
- `script.js` – Scripts auxiliares
- `style.css` – Estilos visuais

## Personalização
- Cores e temas podem ser alterados em `style.css`
- Para customizar o tema, edite as variáveis CSS em `:root` (exemplo abaixo):

```
:root {
   --primary: #1a73e8; /* Cor principal */
   --background: #f8f9fa; /* Fundo */
   --success: #10b981; /* Sucesso */
   /* ...demais variáveis... */
}
```
- Para criar um tema escuro personalizado, edite o bloco `body.dark { ... }`.
- Para campos customizados, edite o formulário de cadastro de produtos em `index.html` e ajuste o salvamento em `app.js`

## Segurança
- Inputs são sanitizados contra XSS
- Sessão expira após 30 minutos de inatividade

### Regras recomendadas para Firestore
No console do Firebase, acesse Firestore > Regras e utilize algo semelhante:

```
rules_version = '2';
service cloud.firestore {
   match /databases/{database}/documents {
      // Usuário só pode acessar seus próprios dados
      match /usuarios/{userId}/{collection=**}/{docId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      // Usuário só pode ler seu próprio perfil
      match /usuarios/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      // Catálogo público (apenas leitura)
      match /catalogo-produtos/{docId} {
         allow read: if true;
         allow write: if false;
      }
   }
}
```

**Importante:**
- Ajuste as regras conforme sua necessidade de negócio.
- Nunca deixe regras abertas em produção (ex: allow read, write: if true;)
- Sempre teste as regras no simulador do Firebase antes de publicar.

## Testes
- Recomenda-se adicionar testes unitários para funções críticas em `app.js`

## Futuro e Sugestões
- Integração com sistemas fiscais/ERPs
- App mobile (PWA ou nativo)
- Relatórios automáticos por e-mail/WhatsApp
- Campos e relatórios customizáveis

## Suporte
Dúvidas ou sugestões? Abra uma issue ou entre em contato com o desenvolvedor.
