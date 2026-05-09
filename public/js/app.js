let userData = null;

function getToken() {
    return sessionStorage.getItem('token');
}

function getUsername() {
    return sessionStorage.getItem('username');
}

async function apiCall(method, path, body) {
    const opts = {
        method,
        headers: { 'Content-Type': 'application/json' }
    };
    const token = getToken();
    if (token) opts.headers['Authorization'] = token;
    if (body) opts.body = JSON.stringify(body);

    const res = await fetch(API + path, opts);
    const data = await res.json();

    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
}

/* ───── Dashboard ───── */

async function enterDashboard(username) {
    document.getElementById('welcomeUser').textContent = username;
    showDashboard();

    try {
        const result = await apiCall('GET', '/api/data');
        userData = result.data || {};
        updateSaveIndicator();
        renderCategories();
    } catch (err) {
        showDashStatus('Failed to load data: ' + err.message, 'error');
    }
}

async function saveToServer() {
    try {
        await apiCall('PUT', '/api/data', { data: userData });
        return true;
    } catch (_) {
        return false;
    }
}

function getUserCategories() {
    return userData || {};
}

function renderCategories() {
    const container = document.getElementById('categoryList');
    const data = getUserCategories();
    const query = (document.getElementById('searchInput').value || '').toLowerCase().trim();
    const entries = Object.entries(data);

    if (entries.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-icon">📋</div><p>No categories yet. Click "+ Add Category" to get started.</p></div>';
        return;
    }

    let html = '';
    let hasAny = false;

    for (const [catName, items] of entries) {
        if (query && !catName.toLowerCase().includes(query)) continue;
        hasAny = true;

        const itemEntries = Object.entries(items);

        html += `
            <div class="category-card">
                <div class="category-header">
                    <span class="cat-name">${escHtml(catName)}</span>
                    <div class="cat-actions">
                        <button class="btn btn-sm btn-primary add-content-btn" data-category="${escHtml(catName)}">+ Content</button>
                        <button class="btn btn-sm btn-danger del-cat-btn" data-category="${escHtml(catName)}">&times;</button>
                    </div>
                </div>
                <div class="category-body">`;

        if (itemEntries.length === 0) {
            html += '<div style="padding: 20px; text-align: center; color: #a0aec0; font-size: 13px;">No content yet.</div>';
        } else {
            for (const [contentName, checked] of itemEntries) {
                html += `
                    <div class="test-item">
                        <input type="checkbox" class="test-checkbox" data-category="${escHtml(catName)}" data-content="${escHtml(contentName)}" id="cb_${escHtml(catName)}_${escHtml(contentName)}" ${checked ? 'checked' : ''}>
                        <label for="cb_${escHtml(catName)}_${escHtml(contentName)}">${escHtml(contentName)}</label>
                        <button class="btn btn-danger del-content-btn" data-category="${escHtml(catName)}" data-content="${escHtml(contentName)}">&times;</button>
                    </div>`;
            }
        }

        html += `</div></div>`;
    }

    if (!hasAny) {
        container.innerHTML = '<div class="empty-state"><div class="empty-icon">🔍</div><p>No categories match your search.</p></div>';
        return;
    }

    container.innerHTML = html;

    document.querySelectorAll('.test-checkbox').forEach(cb => {
        cb.addEventListener('change', async function () {
            const cat = this.dataset.category;
            const content = this.dataset.content;
            if (userData[cat] && userData[cat][content] !== undefined) {
                userData[cat][content] = this.checked;
                const saved = await saveToServer();
                showDashStatus(saved ? 'Saved.' : 'Failed to save.', saved ? 'success' : 'error');
            }
        });
    });

    document.querySelectorAll('.add-content-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            addContent(this.dataset.category);
        });
    });

    document.querySelectorAll('.del-cat-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            deleteCategory(this.dataset.category);
        });
    });

    document.querySelectorAll('.del-content-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            deleteContent(this.dataset.category, this.dataset.content);
        });
    });
}

/* ───── CRUD ───── */

async function addCategory() {
    const name = prompt('Enter category name:');
    if (!name || !name.trim()) return;
    const n = name.trim();
    if (userData[n]) {
        showDashStatus('Category already exists.', 'error');
        return;
    }
    userData[n] = {};
    await saveToServer();
    renderCategories();
    showDashStatus('Category added.', 'success');
}

async function deleteCategory(cat) {
    if (!confirm(`Delete category "${cat}" and all its content?`)) return;
    delete userData[cat];
    await saveToServer();
    renderCategories();
    showDashStatus('Category deleted.', 'success');
}

async function addContent(cat) {
    const name = prompt('Enter test name:');
    if (!name || !name.trim()) return;
    const n = name.trim();
    if (!userData[cat]) userData[cat] = {};
    if (userData[cat][n] !== undefined) {
        showDashStatus('Content already exists.', 'error');
        return;
    }
    userData[cat][n] = false;
    await saveToServer();
    renderCategories();
    showDashStatus('Content added.', 'success');
}

async function deleteContent(cat, content) {
    if (!confirm(`Delete "${content}"?`)) return;
    if (userData[cat]) {
        delete userData[cat][content];
        await saveToServer();
    }
    renderCategories();
    showDashStatus('Content deleted.', 'success');
}

async function resetAll() {
    if (!confirm('Reset all checkboxes for this user?')) return;
    for (const cat of Object.keys(userData)) {
        for (const content of Object.keys(userData[cat])) {
            userData[cat][content] = false;
        }
    }
    await saveToServer();
    renderCategories();
    showDashStatus('All checkboxes reset.', 'success');
}

/* ───── Export / Import ───── */

async function exportMyData() {
    try {
        const result = await apiCall('GET', '/api/export');
        const blob = new Blob([JSON.stringify(result, null, 4)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = getUsername() + '_tests.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showDashStatus('Exported successfully.', 'success');
    } catch (err) {
        showDashStatus('Export failed: ' + err.message, 'error');
    }
}

async function importMyData(file) {
    const reader = new FileReader();
    reader.onload = async function (e) {
        try {
            const parsed = JSON.parse(e.target.result);
            const importData = parsed.data || parsed;
            if (typeof importData !== 'object' || Array.isArray(importData)) {
                throw new Error('Invalid data format.');
            }
            await apiCall('POST', '/api/import', { data: importData });
            userData = importData;
            renderCategories();
            showDashStatus('Imported successfully.', 'success');
        } catch (err) {
            showDashStatus('Import failed: ' + err.message, 'error');
        }
    };
    reader.readAsText(file);
}

/* ───── Helpers ───── */

function escHtml(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
}

function updateSaveIndicator() {
    const el = document.getElementById('saveIndicator');
    if (el) {
        el.textContent = '✓ Synced';
        el.style.color = '#48bb78';
    }
}

function showDashStatus(msg, type) {
    const el = document.getElementById('dashStatus');
    el.textContent = msg;
    el.className = 'status show ' + type;
    clearTimeout(el._timer);
    el._timer = setTimeout(() => { el.className = 'status'; }, 2500);
}

/* ───── Init ───── */

document.addEventListener('DOMContentLoaded', function () {
    const token = getToken();
    const username = getUsername();

    if (token && username) {
        enterDashboard(username);
    }

    document.querySelectorAll('.auth-tab').forEach(el => {
        el.addEventListener('click', function () {
            switchTab(this.dataset.tab);
        });
    });

    document.getElementById('authSubmit').addEventListener('click', handleAuth);
    document.getElementById('usernameInput').addEventListener('keydown', function (e) {
        if (e.key === 'Enter') handleAuth();
    });

    document.getElementById('logoutBtn').addEventListener('click', function () {
        sessionStorage.clear();
        userData = null;
        showAuth();
        document.getElementById('usernameInput').value = '';
        document.getElementById('authError').textContent = '';
        switchTab('login');
    });

    document.getElementById('searchInput').addEventListener('input', renderCategories);
    document.getElementById('addCategoryBtn').addEventListener('click', addCategory);
    document.getElementById('resetBtn').addEventListener('click', resetAll);
    document.getElementById('exportBtn').addEventListener('click', exportMyData);
    document.getElementById('importBtn').addEventListener('click', function () {
        document.getElementById('importFile').click();
    });
    document.getElementById('importFile').addEventListener('change', function () {
        if (this.files && this.files[0]) importMyData(this.files[0]);
        this.value = '';
    });
});
