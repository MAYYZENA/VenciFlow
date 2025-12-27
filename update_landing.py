
with open('landing.html', 'w', encoding='utf-8') as f:
    f.write(r'''<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VenciFlow - Controle de Validade Profissional</title>
  <link rel="stylesheet" href="style.css?v=1.1.2">
  <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js"></script>
  <style>
    :root { --primary: #0f172a; --accent: #3b82f6; --text: #1e293b; --text-light: #64748b; --bg-light: #f8fafc; --white: #ffffff; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', 'Segoe UI', sans-serif; line-height: 1.6; color: var(--text); background-color: var(--white); }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
    header { padding: 20px 0; background: var(--white); border-bottom: 1px solid #e2e8f0; position: sticky; top: 0; z-index: 100; }
    .nav-content { display: flex; justify-content: space-between; align-items: center; }
    .logo { font-size: 24px; font-weight: 800; color: var(--primary); text-decoration: none; display: flex; align-items: center; gap: 10px; }
    .logo-icon { width: 32px; height: 32px; background: var(--primary); border-radius: 8px; }
    .nav-links a { margin-left: 30px; text-decoration: none; color: var(--text); font-weight: 500; }
    .btn { padding: 10px 24px; border-radius: 8px; font-weight: 600; text-decoration: none; cursor: pointer; display: inline-block; }
    .btn-primary { background: var(--accent); color: white; border: none; }
    .hero { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: white; padding: 100px 0; text-align: center; }
    .hero h1 { font-size: 48px; font-weight: 800; margin-bottom: 24px; }
    .hero p { font-size: 20px; margin-bottom: 40px; color: #94a3b8; }
    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 40px; margin-top: 60px; }
    .features { padding: 100px 0; }
    .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 32px; }
    .feature-card { padding: 40px; border-radius: 16px; background: var(--bg-light); text-align: center; }
    .pricing { padding: 100px 0; background: var(--bg-light); }
    .pricing-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 32px; }
    .pricing-card { background: var(--white); padding: 48px 32px; border-radius: 24px; text-align: center; border: 1px solid #e2e8f0; }
    .pricing-card.featured { border: 2px solid var(--accent); }
    #toast { position: fixed; bottom: 24px; right: 24px; background: var(--primary); color: white; padding: 16px 24px; border-radius: 12px; display: none; }
  </style>
</head>
<body>
  <header><div class="container nav-content"><a href="#" class="logo"><div class="logo-icon"></div>VenciFlow</a><nav class="nav-links"><a href="#features">Recursos</a><a href="#pricing">Preços</a><a href="index.html" class="btn btn-primary" style="margin-left:20px;">Entrar</a></nav></div></header>
  <section class="hero"><div class="container"><h1>Gestão de Estoque <span style="color:#60a5fa">Profissional</span></h1><p>Reduza perdas e maximize lucros com controle FEFO inteligente.</p><a href="index.html" class="btn btn-primary">Começar Agora</a><div class="stats"><div class="stat-item"><h3>99%</h3><p>Precisão</p></div><div class="stat-item"><h3>R$ 10k</h3><p>Economia</p></div><div class="stat-item"><h3>5h</h3><p>Tempo Salvo</p></div></div></div></section>
  <section id="features" class="features"><div class="container"><div class="features-grid"><div class="feature-card"><h3>Dashboard</h3><p>Métricas em tempo real.</p></div><div class="feature-card"><h3>FEFO</h3><p>Saída inteligente.</p></div><div class="feature-card"><h3>Alertas</h3><p>Notificações proativas.</p></div></div></div></section>
  <section id="pricing" class="pricing"><div class="container"><div class="pricing-grid"><div class="pricing-card"><h3>Grátis</h3><div style="font-size:36px;margin:20px 0;">R$ 0</div><a href="index.html" class="btn" style="border:1px solid #ddd">Começar</a></div><div class="pricing-card featured"><h3>Profissional</h3><div style="font-size:36px;margin:20px 0;">R$ 49</div><a href="index.html" class="btn btn-primary">Testar Grátis</a></div></div></div></section>
  <section style="padding:80px 0;text-align:center;"><div class="container"><h2>Baixe nosso Guia Estratégico</h2><form onsubmit="handleLeadCapture(event)" style="max-width:400px;margin:40px auto;"><input type="text" id="leadName" placeholder="Nome" required style="width:100%;padding:10px;margin-bottom:10px;"><input type="email" id="leadEmail" placeholder="E-mail" required style="width:100%;padding:10px;margin-bottom:10px;"><button type="submit" class="btn btn-primary" style="width:100%;">Baixar Agora</button></form></div></section>
  <footer style="padding:40px 0;background:#0f172a;color:white;text-align:center;"><p>&copy; 2025 VenciFlow</p></footer>
  <div id="toast"></div>
  <script>
    const firebaseConfig = { apiKey: "AIzaSyA3YHP6mxbtHjdfzhfEiIoEONnGyXnEvAg", authDomain: "gestao-fefo.firebaseapp.com", projectId: "gestao-fefo", storageBucket: "gestao-fefo.firebasestorage.app", messagingSenderId: "471711723896", appId: "1:471711723896:web:beeabebbe8058ff732588d" };
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();
    function mostrarToast(msg) { const t = document.getElementById('toast'); t.textContent = msg; t.style.display = 'block'; setTimeout(() => t.style.display = 'none', 4000); }
    async function handleLeadCapture(event) {
      event.preventDefault();
      const lead = { nome: document.getElementById('leadName').value, email: document.getElementById('leadEmail').value, data: firebase.firestore.FieldValue.serverTimestamp() };
      try { await db.collection('leads').add(lead); mostrarToast('✅ Sucesso!'); event.target.reset(); } catch (e) { mostrarToast('❌ Erro.'); }
    }
  </script>
</body>
</html>''')
