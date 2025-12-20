// script.js - Sistema FEFO Profissional

// Troca de telas (login/dashboard)
document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('login-form');
  const loginSection = document.getElementById('login-section');
  const dashboardSection = document.getElementById('dashboard-section');
  const logoutBtn = document.getElementById('logout-btn');

  if (loginForm && loginSection && dashboardSection && logoutBtn) {
    loginForm.onsubmit = function(e) {
      e.preventDefault();
      loginSection.style.display = 'none';
      dashboardSection.style.display = 'flex';
      renderCurvaABC();
    };
    logoutBtn.onclick = function() {
      dashboardSection.style.display = 'none';
      loginSection.style.display = 'flex';
    };
  }

  // Renderiza gráfico Curva ABC
  function renderCurvaABC() {
    // Mock: valores de exemplo
    const curvaA = 12;
    const curvaB = 8;
    const curvaC = 20;
    document.getElementById('curvaA-count').textContent = curvaA;
    document.getElementById('curvaB-count').textContent = curvaB;
    document.getElementById('curvaC-count').textContent = curvaC;

    const ctx = document.getElementById('curvaChart').getContext('2d');
    if (window.curvaChartInstance) window.curvaChartInstance.destroy();
    window.curvaChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Curva A', 'Curva B', 'Curva C'],
        datasets: [{
          data: [curvaA, curvaB, curvaC],
          backgroundColor: ['#ff5e62', '#ffb92a', '#36d399'],
          borderWidth: 2,
        }]
      },
      options: {
        plugins: {
          legend: {
            display: true,
            labels: { color: '#fff', font: { size: 14 } }
          }
        }
      }
    });
  }
});
