// Handle registration
async function handleRegister(e) {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Validate passwords match
    if (password !== confirmPassword) {
        showAlert('Passwords do not match');
        return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="loading"></span> Creating account...';

    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        password: password
    };

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok) {
            // Save token and user data
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            showAlert('Account created successfully!', 'success');
            setTimeout(() => window.location.href = 'index.html', 1500);
        } else {
            throw new Error(data.message || 'Registration failed');
        }
    } catch (error) {
        showAlert(error.message);
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create Account';
    }
}

// Handle login
async function handleLogin(e) {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="loading"></span> Signing in...';

    const formData = {
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
    };

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            showAlert('Login successful!', 'success');
            setTimeout(() => window.location.href = 'index.html', 1500);
        } else {
            throw new Error(data.message || 'Invalid credentials');
        }
    } catch (error) {
        showAlert(error.message);
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign In';
    }
}