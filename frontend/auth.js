// API Base URL
const API_URL = 'http://localhost:5000/api';

// Show toast notification
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// Register function
async function register(event) {
  event.preventDefault();
  
  const name = document.getElementById('name')?.value;
  const email = document.getElementById('email')?.value;
  const password = document.getElementById('password')?.value;
  const confirmPassword = document.getElementById('confirmPassword')?.value;
  
  // Validation
  if (password !== confirmPassword) {
    showToast('Passwords do not match!', 'error');
    return;
  }
  
  if (password.length < 6) {
    showToast('Password must be at least 6 characters!', 'error');
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      showToast('Registration successful! Redirecting...');
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1500);
    } else {
      showToast(data.message || 'Registration failed', 'error');
    }
  } catch (error) {
    console.error('Error:', error);
    showToast('Network error. Please try again.', 'error');
  }
}

// Login function
async function login(event) {
  event.preventDefault();
  
  const email = document.getElementById('email')?.value;
  const password = document.getElementById('password')?.value;
  
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      showToast('Login successful! Redirecting...');
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1500);
    } else {
      showToast(data.message || 'Login failed', 'error');
    }
  } catch (error) {
    console.error('Error:', error);
    showToast('Network error. Please try again.', 'error');
  }
}

// Logout function
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  showToast('Logged out successfully!');
  setTimeout(() => {
    window.location.href = 'index.html';
  }, 1000);
}

// Check if user is logged in
function checkAuth() {
  const token = localStorage.getItem('token');
  if (!token && window.location.pathname.includes('dashboard.html')) {
    window.location.href = 'login.html';
  }
}

// Get user info
function getUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

// Setup auth forms if they exist
if (document.getElementById('registerForm')) {
  document.getElementById('registerForm').addEventListener('submit', register);
}

if (document.getElementById('loginForm')) {
  document.getElementById('loginForm').addEventListener('submit', login);
}

if (document.getElementById('logoutBtn')) {
  document.getElementById('logoutBtn').addEventListener('click', logout);
}