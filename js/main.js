// API Base URL
const API_URL = '/api';

// Mobile menu toggle
function toggleMenu() {
    const navLinks = document.getElementById('navLinks');
    navLinks.classList.toggle('active');
}

// Show alert message
function showAlert(message, type = 'error') {
    const container = document.getElementById('alertContainer');
    if (!container) {
        // Create toast notification if no alert container
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