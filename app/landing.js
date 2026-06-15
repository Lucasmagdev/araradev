(async function () {
  const API_BASE = (typeof Capacitor !== 'undefined' && Capacitor.isNativePlatform())
    ? 'http://80.241.218.217:3008'
    : '';

  // If already logged in, go straight to the app
  try {
    const token = localStorage.getItem('auth_token');
    const headers = token ? { 'Authorization': 'Bearer ' + token } : {};
    const r = await fetch(API_BASE + '/api/me', { credentials: 'include', headers });
    if (r.ok) { window.location.href = '/trilha.html'; return; }
  } catch (_) {}

  let authMode = 'login';

  function openAuth(mode) {
    authMode = mode;
    setMode(mode);
    document.getElementById('auth-overlay').classList.remove('hidden');
    document.getElementById(mode === 'login' ? 'auth-email' : 'auth-name').focus();
  }

  function closeAuth() {
    document.getElementById('auth-overlay').classList.add('hidden');
    document.getElementById('auth-error').style.display = 'none';
    document.getElementById('auth-form').reset();
  }

  function setMode(mode) {
    authMode = mode;
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === mode));
    document.getElementById('auth-name-wrap').style.display = mode === 'register' ? 'flex' : 'none';
    document.getElementById('auth-submit').textContent = mode === 'login' ? 'ENTRAR' : 'CRIAR CONTA';
    document.getElementById('auth-error').style.display = 'none';
  }

  // Header buttons
  document.getElementById('btn-login').addEventListener('click', () => openAuth('login'));
  document.getElementById('btn-register').addEventListener('click', () => openAuth('register'));
  document.getElementById('btn-start').addEventListener('click', () => openAuth('register'));
  document.getElementById('btn-start2').addEventListener('click', () => openAuth('register'));
  document.getElementById('auth-close').addEventListener('click', closeAuth);

  // Close on backdrop click
  document.getElementById('auth-overlay').addEventListener('click', (e) => {
    if (e.target === document.getElementById('auth-overlay')) closeAuth();
  });

  // Tab switch
  document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => setMode(tab.dataset.tab));
  });

  // Form submit
  document.getElementById('auth-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errEl = document.getElementById('auth-error');
    const btn = document.getElementById('auth-submit');
    errEl.style.display = 'none';
    btn.disabled = true;

    const email    = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value;
    const name     = document.getElementById('auth-name').value.trim();

    try {
      const url  = authMode === 'login' ? API_BASE + '/auth/login' : API_BASE + '/auth/register';
      const body = authMode === 'login' ? { email, password } : { email, password, name };
      const res  = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include',
      });
      const data = await res.json();

      if (!res.ok) {
        errEl.textContent = data.error || 'Erro desconhecido';
        errEl.style.display = 'block';
        btn.disabled = false;
        return;
      }

      if (data.token) localStorage.setItem('auth_token', data.token);
      window.location.href = '/trilha.html';
    } catch (_) {
      errEl.textContent = 'Erro de conexão. Tente novamente.';
      errEl.style.display = 'block';
      btn.disabled = false;
    }
  });
})();
