# ❓ Perguntas Frequentes (FAQ) - Sistema FEFO

## 📋 Geral

### O que é FEFO?
**FEFO** significa **First Expired, First Out** (Primeiro que Vence, Primeiro que Sai). É um método de gestão de estoque que prioriza a utilização de produtos com menor prazo de validade primeiro, reduzindo perdas e desperdícios.

### Quem pode usar o Sistema FEFO?
Qualquer negócio que lida com produtos perecíveis ou com validade:
- 💊 Farmácias e drogarias
- 🛒 Supermercados e mercearias
- 🍔 Restaurantes e lanchonetes
- 🏥 Clínicas e hospitais
- 🏭 Indústrias alimentícias
- 📦 Distribuidoras

### Preciso instalar alguma coisa?
Não! O sistema funciona 100% no navegador. Basta acessar a URL e começar a usar.

### Funciona offline?
Parcialmente. Com o PWA instalado, você pode acessar a interface, mas precisará de internet para sincronizar dados (Firebase).

---

## 🔐 Conta e Segurança

### Como criar uma conta?
1. Acesse o sistema
2. Clique em "Criar Nova Conta"
3. Preencha: Nome, Empresa, E-mail e Senha
4. Pronto! Sua conta está criada

### Esqueci minha senha. E agora?
1. Na tela de login, clique em "Esqueci minha senha"
2. Digite seu e-mail
3. Você receberá um link para redefinir a senha
4. Clique no link e crie uma nova senha

### Meus dados são seguros?
Sim! Usamos Firebase do Google, que oferece:
- ✅ Criptografia de dados
- ✅ Servidores seguros
- ✅ Isolamento por usuário
- ✅ Autenticação robusta

### Posso ter múltiplos usuários?
Atualmente cada conta é individual. Para múltiplos usuários, considere o plano Enterprise (em desenvolvimento).

---

## 📦 Produtos

### Como cadastrar um produto?
1. Vá em **"Produtos"**
2. Clique em **"Novo Produto"**
3. Preencha os dados obrigatórios (código, nome, lote, validade, quantidade)
4. Clique em **"Salvar Produto"**

### Posso editar um produto cadastrado?
Sim! Na lista de produtos, clique no ícone de lápis (✏️) ao lado do produto que deseja editar.

### Como excluir um produto?
Na lista de produtos, clique no ícone de lixeira (🗑️). Confirme a exclusão quando solicitado.

### Posso importar produtos de uma planilha?
Sim! Use o botão **"Importar Excel"** na tela de produtos. O sistema aceita arquivos .xlsx e .xls com formato específico (veja a documentação dentro do modal de importação).

### O que significa cada status?
- 🟢 **Normal**: Mais de 7 dias para vencer
- 🟡 **Vencendo**: Entre 1 e 7 dias para vencer
- 🔴 **Vencido**: Já passou da validade

### Como funciona o controle de lotes?
Cada produto pode ter múltiplos lotes (cadastrados separadamente). O sistema ordena automaticamente pelo FEFO, mostrando os lotes com menor validade primeiro.

---

## 📊 Dashboard

### O que as métricas significam?
- **Total de Produtos**: Quantidade total de itens cadastrados
- **Vencendo em 7 dias**: Produtos que vencem na próxima semana
- **Produtos Vencidos**: Itens já vencidos (ação urgente!)
- **Movimentações Hoje**: Entradas/saídas registradas hoje

### Como atualizar os dados?
Clique no botão **"Atualizar"** no canto superior direito do dashboard.

### Os gráficos atualizam automaticamente?
Não. Clique em "Atualizar" ou recarregue a página para ver dados mais recentes.

---

## 📝 Movimentações

### Quais tipos de movimentação existem?
- **Entrada**: Quando produtos chegam ao estoque
- **Saída**: Quando produtos saem do estoque
- **Ajuste**: Correção de quantidade (inventário)
- **Descarte**: Produtos descartados (vencidos, danificados, etc.)

### Como registrar uma entrada de produtos?
1. Vá em **"Movimentações"**
2. Clique em **"Nova Movimentação"**
3. Selecione tipo **"Entrada"**
4. Escolha o produto e quantidade
5. Clique em **"Registrar Movimentação"**

### Posso desfazer uma movimentação?
Não diretamente. Você pode fazer um **Ajuste** para corrigir o estoque ou registrar uma movimentação inversa.

### Onde vejo o histórico completo?
Na aba **"Movimentações"**, você vê todas as movimentações com filtros por data e tipo.

---

## 📄 Relatórios

### Quais relatórios posso gerar?
1. **Relatório de Estoque**: Lista completa de todos os produtos
2. **Produtos Próximos ao Vencimento**: Itens que vencem em 30 dias
3. **Histórico de Movimentações**: Todas as entradas/saídas do período

### Posso exportar em PDF?
Sim! Todos os relatórios têm opção de exportação em PDF e Excel.

### Como imprimir um relatório?
1. Gere o relatório em PDF
2. Abra o PDF no navegador
3. Use Ctrl+P ou o menu de impressão

---

## ⚙️ Configurações

### Como alterar meu nome ou empresa?
1. Vá em **"Configurações"**
2. Seção **"Perfil do Usuário"**
3. Edite os campos
4. Clique em **"Salvar Alterações"**

### Posso mudar os dias de alerta?
Sim! Em **"Configurações" → "Alertas de Validade"**, ajuste o número de dias de antecedência para avisos.

### Como fazer backup dos meus dados?
1. Vá em **"Configurações"**
2. Seção **"Dados e Backup"**
3. Clique em **"Exportar Backup Completo"**
4. Salve o arquivo JSON em local seguro

### O backup funciona como restauração?
Não automaticamente. O backup é um arquivo JSON com todos os seus dados. Para restaurar, você precisaria importar manualmente ou entrar em contato com o suporte.

---

## 🎨 Interface

### Como ativar o modo escuro?
Clique no botão flutuante no canto inferior direito (ícone de sol/lua). O tema será salvo automaticamente.

### O sistema funciona no celular?
Sim! O sistema é totalmente responsivo e funciona perfeitamente em smartphones e tablets.

### Posso instalar como aplicativo?
Sim! O sistema é um PWA (Progressive Web App). Ao acessar, você pode ver um aviso para instalar. Ou:
- **Android**: Menu → "Adicionar à tela inicial"
- **iOS**: Compartilhar → "Adicionar à Tela de Início"
- **Desktop**: Ícone de instalação na barra de endereço

---

## 🔔 Notificações

### Como ativar as notificações?
1. No Dashboard, clique em **"Ativar Alertas"**
2. Permita notificações quando o navegador solicitar
3. Pronto! Você receberá avisos sobre vencimentos

### Recebo notificações de quê?
- Produtos vencendo no dia
- Produtos vencendo em breve (conforme configuração)
- Estoque abaixo do mínimo (futuro)

### Posso desativar as notificações?
Sim! Nas configurações do navegador, bloqueie as notificações do site.

---

## 🏷️ Etiquetas e QR Code

### Como gerar etiqueta com QR Code?
1. Na lista de produtos, clique no botão de etiqueta
2. O QR Code será gerado automaticamente
3. Clique em **"Imprimir"** para imprimir a etiqueta

### O que o QR Code contém?
O QR Code armazena:
- Código do produto
- Nome
- Lote
- Validade
- Quantidade atual

### Posso ler o QR Code?
Sim! Use qualquer leitor de QR Code. Os dados serão exibidos em formato JSON.

---

## 🚀 Performance

### O sistema é rápido?
Sim! Otimizado para carregar rapidamente mesmo com muitos produtos.

### Quantos produtos posso cadastrar?
Tecnicamente ilimitado. O Firebase Firestore suporta milhões de registros.

### Tenho muitos produtos. Vai ficar lento?
Não! Usamos paginação e carregamento otimizado. Mesmo com milhares de produtos, a performance se mantém.

---

## 💰 Planos e Preços

### O sistema é gratuito?
Sim! A versão atual é totalmente gratuita.

### Haverá planos pagos no futuro?
Possivelmente, com recursos extras como:
- Multi-empresas
- Usuários ilimitados
- Relatórios avançados
- API personalizada

### Vou perder meus dados se mudar de plano?
Não! Seus dados sempre estarão seguros, independente do plano.

---

## 🐛 Problemas Comuns

### Erro: "Firebase not defined"
**Solução**: 
1. Verifique sua conexão com internet
2. Recarregue a página (F5)
3. Limpe o cache do navegador

### Login não funciona
**Soluções**:
1. Verifique se e-mail e senha estão corretos
2. Tente recuperar a senha
3. Limpe cookies e cache
4. Tente outro navegador

### Gráficos não aparecem
**Soluções**:
1. Aguarde o carregamento completo
2. Recarregue a página
3. Verifique se há produtos cadastrados
4. Tente outro navegador

### Exportação não funciona
**Soluções**:
1. Verifique se há dados para exportar
2. Permita downloads no navegador
3. Desative bloqueadores de pop-up
4. Tente outro formato (PDF ou Excel)

### Site não carrega
**Soluções**:
1. Verifique conexão com internet
2. Limpe cache e cookies
3. Tente modo anônimo
4. Verifique se o site está no ar

---

## 📞 Suporte

### Ainda tenho dúvidas. Como obter ajuda?
1. Leia a documentação completa (README.md)
2. Consulte o Guia Rápido (GUIA-RAPIDO.md)
3. Entre em contato com o suporte técnico

### Encontrei um bug. O que faço?
Relate no suporte incluindo:
- Descrição do problema
- O que você estava fazendo
- Screenshot (se possível)
- Navegador e sistema operacional

### Posso sugerir melhorias?
Sim! Adoramos feedback. Entre em contato e compartilhe suas ideias.

---

## 🎓 Treinamento

### Há vídeos tutoriais?
Em breve! Estamos preparando uma série de vídeos curtos explicando cada funcionalidade.

### Vocês oferecem treinamento?
Sim! Para empresas, oferecemos treinamento personalizado. Entre em contato.

---

**Sistema FEFO** - Gestão Profissional de Estoque por Validade  
*Documentação atualizada em Dezembro 2025* 📦✨

