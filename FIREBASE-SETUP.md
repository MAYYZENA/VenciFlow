# 🔥 Configuração do Firebase - Instruções Importantes

## ⚠️ AÇÃO NECESSÁRIA: Criar Índices do Firestore

Se você estiver vendo erros de "The query requires an index", siga estas instruções:

### Método 1: Criar Índice Automaticamente (RECOMENDADO)

1. **Copie este link** e cole no navegador:
```
https://console.firebase.google.com/v1/r/project/gestao-fefo/firestore/indexes?create_composite=ClFwcm9qZWN0cy9nZXN0YW8tZmVmby9kYXRhYmFzZXMvKGRlZmF1bHQpL2NvbGxlY3Rpb25Hcm91cHMvbW92aW1lbnRhY29lcy9pbmRleGVzL18QARoKCgZ1c2VySWQQARoICgRkYXRhEAIaDAoIX19uYW1lX18QAg
```

2. Clique em **"Criar índice"**
3. Aguarde 2-5 minutos para o índice ser criado
4. Pronto! O erro vai desaparecer

### Método 2: Criar Manualmente

Se o link automático não funcionar:

1. **Acesse o Firebase Console:**
   https://console.firebase.google.com/project/gestao-fefo/firestore/indexes

2. **Clique em "Criar índice"**

3. **Configure o índice para movimentações:**
   - **Coleção**: `movimentacoes`
   - **Campo 1**: `userId` → Crescente
   - **Campo 2**: `data` → Decrescente
   - **Modo de consulta**: Coleção

4. **Clique em "Criar índice"**

5. **Aguarde** a criação (ícone fica verde quando pronto)

---

## 🔧 NOTA IMPORTANTE SOBRE A VERSÃO ATUAL

**As correções mais recentes já REMOVERAM a necessidade de índices!**

O código foi atualizado para funcionar SEM índices customizados. Porém, se você ainda ver o erro, é porque está usando uma versão antiga em cache.

### Solução Rápida - Limpar Cache:

1. **No navegador:** Pressione `Ctrl + Shift + Del`
2. Marque "Imagens e arquivos em cache"
3. Clique em "Limpar dados"
4. **Recarregue:** Pressione `Ctrl + F5` (hard refresh)

### Ou use modo anônimo:
- `Ctrl + Shift + N` (Chrome/Edge)
- `Ctrl + Shift + P` (Firefox)

---

## 📝 Regras de Segurança do Firestore (Opcional mas Recomendado)

Para melhor segurança, configure estas regras:

1. **Acesse:**
   https://console.firebase.google.com/project/gestao-fefo/firestore/rules

2. **Cole estas regras:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Usuários - só podem ler/escrever seus próprios dados
    match /usuarios/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Produtos - só podem ver/editar produtos do próprio userId
    match /produtos/{produtoId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    
    // Movimentações - só podem ver/editar movimentações do próprio userId
    match /movimentacoes/{movId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
  }
}
```

3. **Clique em "Publicar"**

Estas regras garantem que:
- ✅ Cada usuário só vê seus próprios dados
- ✅ Impossível acessar dados de outros usuários
- ✅ Proteção contra acesso não autorizado

---

## ✅ Checklist Final

- [ ] Limpar cache do navegador
- [ ] Recarregar com `Ctrl + F5`
- [ ] Criar conta nova se necessário
- [ ] Configurar regras de segurança (opcional)
- [ ] Testar todas as funcionalidades

---

## 🆘 Se o erro persistir

1. **Verifique o console do navegador** (F12)
2. **Copie a mensagem de erro completa**
3. **Aguarde 5 minutos** após cada push para o GitHub Pages atualizar
4. **Entre em contato** com o suporte técnico

---

**Sistema FEFO v1.1.1**  
*Última atualização: Dezembro 2025*
