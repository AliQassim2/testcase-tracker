const API = window.location.origin;

let currentTab = 'login';

function showAuth() {
    document.getElementById('authScreen').style.display = '';
    document.getElementById('dashScreen').style.display = 'none';
}

function showDashboard() {
    document.getElementById('authScreen').style.display = 'none';
    document.getElementById('dashScreen').style.display = '';
}

function switchTab(tab) {
    currentTab = tab;
    document.querySelectorAll('.auth-tab').forEach(el => {
        el.classList.toggle('active', el.dataset.tab === tab);
    });
    document.getElementById('authSubmit').textContent = tab === 'login' ? 'Login' : 'Register';
    document.getElementById('authError').textContent = '';
    document.getElementById('usernameInput').focus();
}

async function handleAuth() {
    const username = document.getElementById('usernameInput').value.trim();
    const errorEl = document.getElementById('authError');

    if (!username) {
        errorEl.textContent = 'Please enter a username.';
        return;
    }

    errorEl.textContent = '';
    errorEl.style.color = '';

    const endpoint = currentTab === 'login' ? '/api/auth/login' : '/api/auth/register';

    try {
        const res = await fetch(API + endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username })
        });

        const data = await res.json();

        if (!res.ok) {
            errorEl.textContent = data.error || 'Something went wrong.';
            return;
        }

        sessionStorage.setItem('token', data.token);
        sessionStorage.setItem('username', data.username);
        enterDashboard(data.username);
    } catch (err) {
        errorEl.textContent = 'Connection error. Is the server running?';
        errorEl.style.color = '#e53e3e';
    }
}
