# 🔐 CONFIGURAÇÃO DE SECRETS NO GITHUB

## 📋 REGRAS PARA NOMES DE SECRETS

**✅ CORRETO:**
- `FTP_SERVER`
- `FTP_USERNAME`
- `FTP_PASSWORD`
- `MY_API_KEY`
- `_PRIVATE_KEY`

**❌ INCORRETO:**
- `FTP SERVER` (espaço)
- `ftp-server` (hífen)
- `FTP@SERVER` (caractere especial)
- `123SERVER` (não começa com letra ou _)

## 🎯 NOMES RECOMENDADOS PARA O VENCIFLOW

### **Para Deploy no Hostinger:**
```
FTP_SERVER
FTP_USERNAME
FTP_PASSWORD
```

### **Para Firebase (se necessário):**
```
FIREBASE_API_KEY
FIREBASE_PROJECT_ID
FIREBASE_PRIVATE_KEY
```

### **Para PagSeguro (se necessário):**
```
PAGSEGURO_EMAIL
PAGSEGURO_TOKEN
```

## 🚀 COMO CONFIGURAR

### **Passo 1: Acesse o GitHub**
1. Vá para seu repositório
2. Clique em **"Settings"**
3. No menu lateral: **"Secrets and variables"**
4. Clique em **"Actions"**

### **Passo 2: Adicione os Secrets**
Para cada secret, clique em **"New repository secret"**:

| Name | Value | Exemplo |
|------|-------|---------|
| `FTP_SERVER` | seu-dominio.com | `meusite.com` |
| `FTP_USERNAME` | usuario-ftp | `u123456789` |
| `FTP_PASSWORD` | senha-ftp | `minha-senha-segura` |

### **Passo 3: Verifique**
- ✅ Nomes sem espaços
- ✅ Apenas letras, números e `_`
- ✅ Começam com letra ou `_`
- ✅ Valores corretos

## 🔍 COMO VERIFICAR SE DEU CERTO

### **Teste o Workflow:**
```bash
# Faça uma alteração qualquer
echo "teste" >> teste.txt
git add .
git commit -m "Teste de deploy"
git push origin main
```

### **Verifique no GitHub:**
1. Vá para aba **"Actions"**
2. Clique no workflow que iniciou
3. Veja se conectou ao FTP sem erros

## ⚠️ PROBLEMAS COMUNS

### **Erro: "Secret not found"**
- Verifique se o nome está **exatamente igual** no workflow
- Confirme se está no repositório certo

### **Erro: "Invalid secret name"**
- Use apenas letras maiúsculas/minúsculas, números e `_`
- Não use espaços, hífens ou caracteres especiais

### **Erro: "FTP connection failed"**
- Verifique se os valores dos secrets estão corretos
- Confirme credenciais do Hostinger

## 🎯 DICAS FINAIS

- **Use nomes descritivos** mas siga as regras
- **Mantenha segredo** - nunca commite valores reais
- **Teste sempre** após configurar
- **Documente** os secrets necessários

---

**✅ Com esses nomes, seu deploy automático funcionará perfeitamente!**