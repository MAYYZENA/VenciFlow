# 🚀 DEPLOY AUTOMÁTICO - Instruções Rápidas

## ⚡ CONFIGURAÇÃO EM 3 PASSOS

### **PASSO 1: Executar Script de Setup**
```bash
# Na pasta do projeto, execute:
.\setup-deploy-automatico.ps1
```

### **PASSO 2: Configurar Secrets no GitHub**
1. Vá para: `https://github.com/SEU-USUARIO/VenciFlow/settings/secrets/actions`
2. Clique em **"New repository secret"**
3. Adicione os 3 secrets com estes nomes **EXATOS**:

```
FTP_SERVER = seu-dominio.com
FTP_USERNAME = seu-usuario-ftp
FTP_PASSWORD = sua-senha-ftp
```

**⚠️ IMPORTANTE - Regras para nomes:**
- ✅ Apenas letras, números e `_` (sublinhado)
- ✅ Não use espaços, hífens (-) ou caracteres especiais
- ✅ Deve começar com letra ou `_`
- ❌ **ERRADO:** `FTP SERVER`, `ftp-server`, `FTP@SERVER`
- ✅ **CORRETO:** `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`

### **PASSO 3: Fazer Deploy**
```bash
git add .
git commit -m "🚀 Add automated deploy"
git push origin main
```

---

## 📊 **VERIFICAR STATUS**

### **No GitHub:**
- Vá para aba **"Actions"**
- Veja o workflow **"🚀 Deploy to Hostinger"**
- Status: ✅ Success = Deploy OK
- Status: ❌ Failure = Verificar logs

### **No Hostinger:**
- Acesse seu domínio
- Site deve estar atualizado automaticamente

---

## 🔧 **SOLUÇÃO DE PROBLEMAS**

### **Deploy falhando:**
```bash
# Verificar:
# 1. Secrets estão corretos no GitHub
# 2. Credenciais FTP do Hostinger
# 3. Pasta public_html existe
```

### **Site não atualizando:**
```bash
# Limpar cache do navegador (Ctrl+F5)
# Verificar URL correta
# Aguardar 2-3 minutos após deploy
```

---

## 🎯 **FLUXO COMPLETO**

```
Código alterado → Git Push → GitHub Actions → FTP → Hostinger ✅
```

**Tempo total:** ~2 minutos após o push!

---

## 📞 **SUPORTE**

- 📚 **Documentação completa:** `DEPLOY-AUTOMATICO.md`
- 🔧 **Workflow file:** `.github/workflows/deploy.yml`
- ⚙️ **Script setup:** `setup-deploy-automatico.ps1`