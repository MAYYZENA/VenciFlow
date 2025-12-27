
with open('landing.html', 'w', encoding='utf-8') as f:
    f.write(r'''<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>VenciFlow - Gestão Inteligente de Validade e Estoque FEFO</title>
    <meta name="description" content="Reduza perdas em até 40% com o controle de validade profissional do VenciFlow. Sistema FEFO inteligente para farmácias, restaurantes e distribuidoras.">
    
    <!-- Open Graph / Social -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://app.venciflow.com/landing.html">
    <meta property="og:title" content="VenciFlow - Controle de Validade Profissional">
    <meta property="og:description" content="Sistema inteligente FEFO para gestão de estoque. Evite perdas e maximize seus lucros.">
    <meta property="og:image" content="https://app.venciflow.com/assets/og-image.png">

    <!-- Styles -->
    <link rel="stylesheet" href="style.css?v=1.1.2">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    
    <!-- Firebase SDK -->
    <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js"></script>

    <style>
        :root {
            --primary: #0f172a;
            --primary-light: #1e293b;
            --accent: #3b82f6;
            --accent-hover: #2563eb;
            --success: #059669;
            --bg-light: #f8fafc;
            --text-main: #0f172a;
            --text-muted: #64748b;
        }

        body {
            font-family: 'Inter', -apple-system, sans-serif;
            color: var(--text-main);
            background: #ffffff;
            scroll-behavior: smooth;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 24px;
        }

        /* Navbar */
        .navbar {
            padding: 20px 0;
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(10px);
            border-bottom: 1px solid #e2e8f0;
            position: sticky;
            top: 0;
            z-index: 1000;
        }

        .nav-flex {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .logo {
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 24px;
            font-weight: 800;
            color: var(--primary);
            text-decoration: none;
        }

        .logo-icon {
            width: 36px;
            height: 36px;
            background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .nav-links {
            display: flex;
            gap: 32px;
            align-items: center;
        }

        .nav-links a {
            text-decoration: none;
            color: var(--text-muted);
            font-weight: 500;
            transition: color 0.2s;
        }

        .nav-links a:hover {
            color: var(--accent);
        }

        /* Hero */
        .hero {
            padding: 120px 0 80px;
            background: radial-gradient(circle at top right, #f1f5f9 0%, #ffffff 100%);
            text-align: center;
        }

        .badge {
            background: #dbeafe;
            color: var(--accent);
            padding: 8px 16px;
            border-radius: 100px;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 24px;
            display: inline-block;
        }

        .hero h1 {
            font-size: 64px;
            font-weight: 800;
            line-height: 1.1;
            margin-bottom: 24px;
            letter-spacing: -1px;
        }

        .hero h1 span {
            color: var(--accent);
        }

        .hero p {
            font-size: 20px;
            color: var(--text-muted);
            max-width: 600px;
            margin: 0 auto 40px;
            line-height: 1.6;
        }

        .cta-group {
            display: flex;
            gap: 16px;
            justify-content: center;
            margin-bottom: 60px;
        }

        .btn {
            padding: 16px 32px;
            border-radius: 12px;
            font-weight: 700;
            text-decoration: none;
            transition: all 0.2s;
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }

        .btn-primary {
            background: var(--primary);
            color: white;
            box-shadow: 0 10px 15px -3px rgba(15, 23, 42, 0.2);
        }

        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.3);
        }

        .btn-secondary {
            background: #ffffff;
            color: var(--primary);
            border: 1px solid #e2e8f0;
        }

        .btn-secondary:hover {
            background: #f8fafc;
        }

        /* Dashboard Preview */
        .dashboard-preview {
            max-width: 1000px;
            margin: 0 auto;
            background: var(--primary);
            padding: 20px;
            border-radius: 24px;
            box-shadow: 0 40px 60px -15px rgba(15, 23, 42, 0.5);
            border: 8px solid #1e293b;
        }

        .preview-img {
            width: 100%;
            border-radius: 12px;
            display: block;
        }

        /* Stats */
        .stats-section {
            padding: 100px 0;
            background: var(--bg-light);
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 40px;
            text-align: center;
        }

        .stat-card h3 {
            font-size: 48px;
            font-weight: 800;
            color: var(--accent);
            margin-bottom: 8px;
        }

        .stat-card p {
            font-weight: 600;
            color: var(--text-muted);
        }

        /* Features */
        .features-section {
            padding: 120px 0;
        }

        .section-header {
            text-align: center;
            max-width: 700px;
            margin: 0 auto 80px;
        }

        .section-header h2 {
            font-size: 40px;
            font-weight: 800;
            margin-bottom: 20px;
        }

        .features-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 32px;
        }

        .feature-card {
            padding: 40px;
            border-radius: 24px;
            border: 1px solid #e2e8f0;
            transition: all 0.3s;
        }

        .feature-card:hover {
            border-color: var(--accent);
            transform: translateY(-10px);
            box-shadow: 0 20px 40px -10px rgba(59, 130, 246, 0.1);
        }

        .feature-icon {
            width: 60px;
            height: 60px;
            background: #eff6ff;
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--accent);
            margin-bottom: 24px;
            font-size: 24px;
        }

        /* Lead Capture */
        .lead-section {
            padding: 120px 0;
            background: linear-gradient(135deg, var(--primary) 0%, #1e293b 100%);
            color: white;
            border-radius: 40px;
            margin: 40px 24px;
        }

        .lead-flex {
            display: flex;
            gap: 80px;
            align-items: center;
        }

        .lead-content {
            flex: 1;
        }

        .lead-content h2 {
            font-size: 48px;
            font-weight: 800;
            margin-bottom: 24px;
        }

        .lead-form {
            flex: 1;
            background: white;
            padding: 40px;
            border-radius: 24px;
            color: var(--primary);
        }

        .form-group {
            margin-bottom: 20px;
        }

        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            font-size: 14px;
        }

        .form-control {
            width: 100%;
            padding: 14px;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            font-size: 16px;
        }

        .form-control:focus {
            outline: 2px solid var(--accent);
            border-color: transparent;
        }

        /* Pricing */
        .pricing-section {
            padding: 120px 0;
            background: #ffffff;
        }

        .pricing-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 32px;
        }

        .pricing-card {
            padding: 48px 32px;
            border-radius: 32px;
            border: 1px solid #e2e8f0;
            position: relative;
        }

        .pricing-card.featured {
            background: var(--primary);
            color: white;
            transform: scale(1.05);
            border: none;
        }

        .price {
            font-size: 48px;
            font-weight: 800;
            margin: 24px 0;
        }

        .price span {
            font-size: 16px;
            font-weight: 400;
            opacity: 0.7;
        }

        /* Toast */
        #toast {
            position: fixed;
            bottom: 32px;
            right: 32px;
            padding: 16px 32px;
            background: var(--primary);
            color: white;
            border-radius: 12px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.2);
            display: none;
            z-index: 2000;
            animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
            from { transform: translateY(100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }

        @media (max-width: 968px) {
            .hero h1 { font-size: 40px; }
            .features-grid, .stats-grid, .pricing-grid { grid-template-columns: 1fr; }
            .lead-flex { flex-direction: column; gap: 40px; }
            .nav-links { display: none; }
        }
    </style>
</head>
<body>

    <nav class="navbar">
        <div class="container nav-flex">
            <a href="#" class="logo">
                <div class="logo-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3">
                        <path d="M12 2L2 7L12 12L22 7L12 2Z" />
                        <path d="M2 17L12 22L22 17" />
                        <path d="M2 12L12 17L22 12" />
                    </svg>
                </div>
                VenciFlow
            </a>
            <div class="nav-links">
                <a href="#features">Recursos</a>
                <a href="#segments">Segmentos</a>
                <a href="#pricing">Preços</a>
                <a href="index.html" class="btn btn-secondary" style="padding: 10px 24px;">Entrar</a>
                <a href="#capture" class="btn btn-primary" style="padding: 10px 24px;">Teste Grátis</a>
            </div>
        </div>
    </nav>

    <header class="hero">
        <div class="container">
            <span class="badge">🚀 Nova versão 2.0 liberada</span>
            <h1>Controle de Validade <span>Profissional</span> e Inteligente</h1>
            <p>Reduza desperdícios, economize tempo e garanta a conformidade do seu estoque com o sistema FEFO mais moderno do mercado.</p>
            <div class="cta-group">
                <a href="#capture" class="btn btn-primary">Começar agora gratuitamente</a>
                <a href="#features" class="btn btn-secondary">Ver recursos</a>
            </div>
            
            <div class="dashboard-preview">
                <div style="background: #020617; border-radius: 12px; height: 500px; display: flex; align-items: center; justify-content: center; color: #94a3b8; font-size: 20px;">
                    <!-- Placeholder para Mockup de Dashboard -->
                    <div style="text-align: center;">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 20px;">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <line x1="3" y1="9" x2="21" y2="9" />
                            <line x1="9" y1="21" x2="9" y2="9" />
                        </svg>
                        <p>Dashboard Executivo VenciFlow</p>
                    </div>
                </div>
            </div>
        </div>
    </header>

    <section class="stats-section">
        <div class="container">
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>99%</h3>
                    <p>De precisão no inventário</p>
                </div>
                <div class="stat-card">
                    <h3>40%</h3>
                    <p>Redução média em perdas</p>
                </div>
                <div class="stat-card">
                    <h3>5h+</h3>
                    <p>Economizados por semana</p>
                </div>
            </div>
        </div>
    </section>

    <section id="features" class="features-section">
        <div class="container">
            <div class="section-header">
                <h2>Tudo o que você precisa para uma gestão impecável</h2>
                <p>O VenciFlow foi desenhado para eliminar a complexidade do controle de produtos perecíveis.</p>
            </div>
            
            <div class="features-grid">
                <div class="feature-card">
                    <div class="feature-icon">🔔</div>
                    <h3>Alertas Inteligentes</h3>
                    <p>Receba notificações antes dos produtos vencerem. Configure prazos personalizados por categoria.</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">📈</div>
                    <h3>Dashboard em Tempo Real</h3>
                    <p>Visualize o valor em risco, produtos vencendo hoje e estatísticas de perdas evitadas.</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">🔄</div>
                    <h3>Metodologia FEFO</h3>
                    <p>Sistema focado em First Expired, First Out. Garanta que o produto mais próximo do vencimento saia primeiro.</p>
                </div>
            </div>
        </div>
    </section>

    <section id="capture" class="lead-section">
        <div class="container">
            <div class="lead-flex">
                <div class="lead-content">
                    <h2>Pronto para transformar seu estoque?</h2>
                    <p>Baixe nosso <strong>Guia Estratégico de Gestão FEFO</strong> e ganhe 14 dias de acesso Premium gratuito.</p>
                    <ul style="margin-top: 32px; list-style: none;">
                        <li style="margin-bottom: 16px; display: flex; align-items: center; gap: 12px;">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                            Implementação em menos de 5 minutos
                        </li>
                        <li style="margin-bottom: 16px; display: flex; align-items: center; gap: 12px;">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                            Sem necessidade de cartão de crédito
                        </li>
                        <li style="margin-bottom: 16px; display: flex; align-items: center; gap: 12px;">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                            Suporte especializado via WhatsApp
                        </li>
                    </ul>
                </div>
                
                <form class="lead-form" id="leadForm" onsubmit="handleLeadCapture(event)">
                    <div class="form-group">
                        <label>Nome Completo</label>
                        <input type="text" id="leadName" class="form-control" placeholder="Ex: João Silva" required>
                    </div>
                    <div class="form-group">
                        <label>E-mail Corporativo</label>
                        <input type="email" id="leadEmail" class="form-control" placeholder="joao@empresa.com" required>
                    </div>
                    <div class="form-group">
                        <label>Segmento do Negócio</label>
                        <select id="leadSegment" class="form-control" required>
                            <option value="">Selecione...</option>
                            <option value="Farmácia">Farmácia</option>
                            <option value="Restaurante">Restaurante / Alimentação</option>
                            <option value="Distribuidora">Distribuidora / Logística</option>
                            <option value="Outro">Outro</option>
                        </select>
                    </div>
                    <button type="submit" class="btn btn-primary" style="width: 100%; justify-content: center; margin-top: 10px;">
                        Quero meu Acesso Grátis
                    </button>
                    <p style="font-size: 12px; color: var(--text-muted); margin-top: 16px; text-align: center;">
                        Prometemos não enviar spam. Seus dados estão seguros.
                    </p>
                </form>
            </div>
        </div>
    </section>

    <section id="pricing" class="pricing-section">
        <div class="container">
            <div class="section-header">
                <h2>Planos simples para todos os tamanhos</h2>
                <p>Comece grátis e escale conforme seu negócio cresce.</p>
            </div>
            
            <div class="pricing-grid">
                <div class="pricing-card">
                    <h3>Iniciante</h3>
                    <div class="price">R$ 0<span>/mês</span></div>
                    <ul style="list-style: none; margin-bottom: 32px; color: var(--text-muted);">
                        <li style="margin-bottom: 12px;">✓ Até 50 produtos</li>
                        <li style="margin-bottom: 12px;">✓ 1 Usuário</li>
                        <li style="margin-bottom: 12px;">✓ Alertas básicos</li>
                    </ul>
                    <a href="index.html" class="btn btn-secondary" style="width: 100%; justify-content: center;">Começar Grátis</a>
                </div>
                
                <div class="pricing-card featured">
                    <span style="background: var(--accent); color: white; padding: 4px 12px; border-radius: 100px; font-size: 12px; position: absolute; top: 24px; right: 24px;">POPULAR</span>
                    <h3>Profissional</h3>
                    <div class="price">R$ 49<span>/mês</span></div>
                    <ul style="list-style: none; margin-bottom: 32px;">
                        <li style="margin-bottom: 12px;">✓ Produtos ilimitados</li>
                        <li style="margin-bottom: 12px;">✓ 5 Usuários</li>
                        <li style="margin-bottom: 12px;">✓ Dashboard Avançado</li>
                        <li style="margin-bottom: 12px;">✓ Exportação PDF/Excel</li>
                    </ul>
                    <a href="index.html" class="btn btn-primary" style="width: 100%; justify-content: center; background: var(--accent);">Assinar Agora</a>
                </div>
                
                <div class="pricing-card">
                    <h3>Enterprise</h3>
                    <div class="price">Consultar</div>
                    <ul style="list-style: none; margin-bottom: 32px; color: var(--text-muted);">
                        <li style="margin-bottom: 12px;">✓ Múltiplas Unidades</li>
                        <li style="margin-bottom: 12px;">✓ Integração API</li>
                        <li style="margin-bottom: 12px;">✓ Suporte 24/7</li>
                        <li style="margin-bottom: 12px;">✓ Treinamento VIP</li>
                    </ul>
                    <a href="#capture" class="btn btn-secondary" style="width: 100%; justify-content: center;">Falar com Vendas</a>
                </div>
            </div>
        </div>
    </section>

    <footer style="padding: 80px 0; background: #020617; color: #94a3b8;">
        <div class="container">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1e293b; padding-bottom: 40px; margin-bottom: 40px;">
                <a href="#" class="logo" style="color: white;">VenciFlow</a>
                <div style="display: flex; gap: 24px;">
                    <a href="#" style="color: inherit; text-decoration: none;">Termos</a>
                    <a href="#" style="color: inherit; text-decoration: none;">Privacidade</a>
                    <a href="mailto:contato@venciflow.com" style="color: inherit; text-decoration: none;">Contato</a>
                </div>
            </div>
            <p style="text-align: center; font-size: 14px;">&copy; 2025 VenciFlow. Todos os direitos reservados. Made with ❤️ for smart inventory.</p>
        </div>
    </footer>

    <div id="toast"></div>

    <script>
        // Firebase Configuration
        const firebaseConfig = {
            apiKey: "AIzaSyA3YHP6mxbtHjdfzhfEiIoEONnGyXnEvAg",
            authDomain: "gestao-fefo.firebaseapp.com",
            projectId: "gestao-fefo",
            storageBucket: "gestao-fefo.firebasestorage.app",
            messagingSenderId: "471711723896",
            appId: "1:471711723896:web:beeabebbe8058ff732588d"
        };

        firebase.initializeApp(firebaseConfig);
        const db = firebase.firestore();

        function mostrarToast(msg, isError = false) {
            const toast = document.getElementById('toast');
            toast.textContent = msg;
            toast.style.background = isError ? '#dc2626' : '#0f172a';
            toast.style.display = 'block';
            setTimeout(() => { toast.style.display = 'none'; }, 4000);
        }

        async function handleLeadCapture(event) {
            event.preventDefault();
            const btn = event.target.querySelector('button');
            const originalText = btn.textContent;
            
            btn.textContent = 'Enviando...';
            btn.disabled = true;

            const lead = {
                nome: document.getElementById('leadName').value,
                email: document.getElementById('leadEmail').value,
                segmento: document.getElementById('leadSegment').value,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                origem: 'landing_page_principal',
                status: 'novo'
            };

            try {
                await db.collection('leads').add(lead);
                mostrarToast('✅ Sucesso! Entraremos em contato em breve.');
                event.target.reset();
            } catch (error) {
                console.error("Erro ao salvar lead:", error);
                mostrarToast('❌ Ocorreu um erro. Tente novamente.', true);
            } finally {
                btn.textContent = originalText;
                btn.disabled = false;
            }
        }
    </script>
</body>
</html>''')
