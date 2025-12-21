# Sistema FEFO Profissional

Este é um sistema completo de gestão de estoque com controle de validade (FEFO), login seguro, dashboard, cadastro de produtos, relatórios e responsividade.

## Funcionalidades
- Login seguro
- Dashboard com indicadores
- Cadastro e consulta de produtos
- Controle de validade (FEFO)
- Relatórios (PDF/Excel)
- Cadastro de usuários
- Visual moderno e responsivo

## Configuração

### Firebase
1. Crie um projeto no [Firebase Console](https://console.firebase.google.com/).
2. Ative os serviços necessários:
   - **Authentication**: Configure o método de login por email e senha.
   - **Firestore Database**: Crie uma coleção chamada `produtos`.
3. Substitua as credenciais no arquivo `script.js`:
   ```javascript
   const firebaseConfig = {
     apiKey: "SUA_API_KEY",
     authDomain: "SEU_AUTH_DOMAIN",
     projectId: "SEU_PROJECT_ID",
     storageBucket: "SEU_STORAGE_BUCKET",
     messagingSenderId: "SEU_MESSAGING_SENDER_ID",
     appId: "SEU_APP_ID",
     measurementId: "SEU_MEASUREMENT_ID"
   };
   firebase.initializeApp(firebaseConfig);
   ```

### Uso
1. Abra o arquivo `index.html` em um navegador.
2. Faça login com as credenciais configuradas no Firebase.
3. Utilize o sistema para cadastrar produtos, visualizar o dashboard e exportar relatórios.

### Desenvolvimento
- Para modificar o sistema, edite os arquivos HTML, CSS e JavaScript conforme necessário.
- Utilize um servidor local (como o VS Code Live Server) para testar as alterações.

### Melhorias Futuras
- Implementar funcionalidades de cadastro de usuários.
- Adicionar geração de relatórios em PDF.
- Suporte para temas claros/escuros.