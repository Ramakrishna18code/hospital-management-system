// Check if user is logged in
function checkAuth() {
    // In a real application, this would verify a JWT token or session cookie
    // For demo purposes, we're using localStorage
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    // If not logged in and not on login page, redirect to login
    if (!isLoggedIn && !window.location.pathname.includes('login.html')) {
        window.location.href = 'login.html';
    }
    
    // If logged in and on login page, redirect to dashboard
    if (isLoggedIn && window.location.pathname.includes('login.html')) {
        window.location.href = 'dashboard.html';
    }
}

// Handle logout
function logout() {
    localStorage.removeItem('isLoggedIn');
    window.location.href = 'login.html';
}

// Call checkAuth when page loads
document.addEventListener('DOMContentLoaded', checkAuth);

// Export functions for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        checkAuth,
        logout
    };
}