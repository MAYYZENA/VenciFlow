# 🚀 DEPLOY AUTOMÁTICO - GitHub Pages → Hostinger

## 🎯 **OBJETIVO**
Sistema de deploy automático que atualiza o Hostinger sempre que há mudanças no GitHub.

---

## ⚙️ **CONFIGURAÇÃO DO GITHUB ACTIONS**

### **Passo 1: Criar Workflow no GitHub**

Crie o arquivo `.github/workflows/deploy.yml`:

```yaml
name: 🚀 Deploy to Hostinger

on:
  push:
    branches: [ main, gh-pages ]
  pull_request:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
    - name: 📥 Checkout code
      uses: actions/checkout@v4

    - name: 🔧 Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'

    - name: 📦 Install dependencies
      run: npm install

    - name: 🏗️ Build project
      run: npm run build

    - name: 🚀 Deploy to Hostinger
      uses: SamKirkland/FTP-Deploy-Action@v4.3.4
      with:
        server: ${{ secrets.FTP_SERVER }}
        username: ${{ secrets.FTP_USERNAME }}
        password: ${{ secrets.FTP_PASSWORD }}
        local-dir: ./dist/
        server-dir: ./public_html/
        exclude: |
          **/.git*
          **/.github*
          **/node_modules/**
          **/.DS_Store
          **/README.md
          **/DEPLOY.md
```

### **Passo 2: Configurar Secrets no GitHub**

1. Vá para seu repositório no GitHub
2. **Settings** → **Secrets and variables** → **Actions**
3. Adicione os seguintes secrets:

```
FTP_SERVER = seu-dominio.com
FTP_USERNAME = seu-usuario-ftp
FTP_PASSWORD = sua-senha-ftp
```

---

## 🔄 **FLUXO DE DEPLOY AUTOMÁTICO**

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Git Push  │ -> │ GitHub      │ -> │ Hostinger   │
│             │    │ Actions     │    │ (FTP)      │
└─────────────┘    └─────────────┘    └─────────────┘
       ↑                  ↑                  ↑
   Código fonte    Build + Test     Deploy automático
```

### **Como funciona:**
1. **Push no GitHub** → Gatilho automático
2. **GitHub Actions** → Executa build e testes
3. **FTP Deploy** → Envia arquivos para Hostinger
4. **Site atualizado** → Em segundos

---

## 📁 **ESTRUTURA DE ARQUIVOS**

```
sistema-fefo/
├── .github/
│   └── workflows/
│       └── deploy.yml          # Workflow do GitHub Actions
├── dist/                       # Pasta de build (gerada)
├── src/                        # Código fonte
├── package.json
├── .gitignore
└── README.md
```

---

## 🛠️ **CONFIGURAÇÃO DO PACKAGE.JSON**

Adicione os scripts necessários:

```json
{
  "name": "venciflow",
  "version": "1.2.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "deploy": "npm run build && gh-pages -d dist"
  },
  "devDependencies": {
    "gh-pages": "^6.0.0",
    "vite": "^5.0.0"
  }
}
```

---

## 🔐 **SEGURANÇA DAS CREDENCIAIS**

### **Método 1: GitHub Secrets (Recomendado)**
- Credenciais armazenadas de forma segura
- Acesso restrito ao repositório
- Não visíveis no código

### **Método 2: Arquivo .env (Não recomendado)**
```bash
# .env (NÃO commite este arquivo)
FTP_SERVER=seu-dominio.com
FTP_USERNAME=usuario
FTP_PASSWORD=senha
```

---

## 📊 **MONITORAMENTO DO DEPLOY**

### **Status do Workflow**
- Vá para **Actions** no seu repositório GitHub
- Veja o status de cada deploy
- Logs detalhados de erro/sucesso

### **Notificações**
Configure notificações por email/Slack quando:
- ✅ Deploy bem-sucedido
- ❌ Deploy falhou
- ⚠️ Build quebrou

---

## 🚨 **SOLUÇÃO DE PROBLEMAS**

### **Deploy falhando:**
```bash
# Verificar logs do GitHub Actions
# Verificar credenciais FTP
# Verificar permissões na pasta do Hostinger
```

### **Site não atualizando:**
```bash
# Limpar cache do navegador (Ctrl+F5)
# Verificar se arquivos foram enviados
# Verificar URL correta
```

---

## 💡 **DICAS AVANÇADAS**

### **Deploy Condicional**
```yaml
# Só faz deploy em push para main
on:
  push:
    branches: [ main ]
```

### **Deploy com Testes**
```yaml
- name: 🧪 Run tests
  run: npm test

- name: 🚀 Deploy only if tests pass
  if: success()
  uses: SamKirkland/FTP-Deploy-Action@v4.3.4
```

### **Deploy para Ambiente de Staging**
```yaml
- name: 🚀 Deploy to Staging
  if: github.ref == 'refs/heads/develop'
  uses: SamKirkland/FTP-Deploy-Action@v4.3.4
  with:
    server-dir: ./staging/
```

---

## 🎯 **IMPLEMENTAÇÃO RÁPIDA**

### **Passo 1: Criar estrutura**
```bash
mkdir -p .github/workflows
```

### **Passo 2: Criar workflow**
```bash
# Criar arquivo .github/workflows/deploy.yml
# Copiar conteúdo do workflow acima
```

### **Passo 3: Configurar secrets**
```bash
# No GitHub: Settings → Secrets → Actions
# Adicionar FTP_SERVER, FTP_USERNAME, FTP_PASSWORD
```

### **Passo 4: Primeiro deploy**
```bash
git add .
git commit -m "Add automated deploy"
git push origin main
```

---

## 📈 **MÉTRICAS DE SUCESSO**

- ✅ **Deploy automático** funcionando
- ✅ **Tempo de deploy** < 2 minutos
- ✅ **Uptime** > 99.9%
- ✅ **Zero downtime** durante deploy
- ✅ **Rollback** fácil se necessário

---

**🎉 Resultado:** Deploy profissional com atualização automática sempre que você faz push no GitHub!