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
    };
    logoutBtn.onclick = function() {
      dashboardSection.style.display = 'none';
      loginSection.style.display = 'flex';
    };
  }
});
