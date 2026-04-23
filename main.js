// API Base URL
const API_URL = '/api';

// ─── Service Worker Registration ───────────────────────────────────────────
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').then((reg) => {
            console.log('Service Worker registered:', reg.scope);
        }).catch((err) => {
            console.warn('Service Worker registration failed:', err);
        });
    });
}

// ─── Offline / Online Banner ────────────────────────────────────────────────
function showConnectivityBanner(isOnline) {
    let banner = document.getElementById('connectivity-banner');
    if (!banner) {
        banner = document.createElement('div');
        banner.id = 'connectivity-banner';
        banner.style.cssText = `
            position: fixed; top: 0; left: 0; right: 0; z-index: 9999;
            text-align: center; padding: 8px 16px; font-size: 14px;
            font-weight: 600; transition: all 0.3s ease;
        `;
        document.body.prepend(banner);
    }
    if (isOnline) {
        banner.textContent = '✅ Back online! Syncing your data...';
        banner.style.background = '#27ae60';
        banner.style.color = '#fff';
        setTimeout(() => banner.remove(), 4000);
    } else {
        banner.textContent = '📶 You are offline. Using local data.';
        banner.style.background = '#e67e22';
        banner.style.color = '#fff';
    }
}

window.addEventListener('online', async () => {
    showConnectivityBanner(true);
    // Sync any offline orders placed while disconnected
    if (typeof syncOfflineOrders !== 'undefined') {
        await syncOfflineOrders();
    }
});

window.addEventListener('offline', () => {
    showConnectivityBanner(false);
});

// Show banner on page load if already offline
if (!navigator.onLine) {
    showConnectivityBanner(false);
}

// Mobile menu toggle
function toggleMenu() {
    const navLinks = document.getElementById('navLinks');
    navLinks.classList.toggle('active');
}

// Show alert message
function showAlert(message, type = 'error') {
    const container = document.getElementById('alertContainer');
    if (!container) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
        return;
    }

    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    container.innerHTML = '';
    container.appendChild(alert);
    
    setTimeout(() => alert.remove(), 5000);
}

// Update auth links in navbar
function updateAuthLinks() {
    const token = localStorage.getItem('token');
    const authLinks = document.getElementById('authLinks');
    
    if (token && authLinks) {
        authLinks.innerHTML = `
            <a href="#" onclick="logout(); return false;">Logout</a>
        `;
    }
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// Check if user is logged in
function isLoggedIn() {
    return !!localStorage.getItem('token');
}

// Get current user
function getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}