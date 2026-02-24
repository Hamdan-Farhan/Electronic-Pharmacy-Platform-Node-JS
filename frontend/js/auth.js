const API_URL = 'http://localhost:5000/api/v1';

// Helper to show alerts
function showAlert(message, type = 'danger') {
    const alertContainer = document.getElementById('alert-container');
    if (alertContainer) {
        alertContainer.innerHTML = `
            <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
    }
}

// Register User
const registerForm = document.getElementById('register-form');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        const role = document.getElementById('role').value;

        if (password !== confirmPassword) {
            return showAlert('كلمات المرور غير متطابقة');
        }

        const btn = document.getElementById('register-btn');
        const spinner = document.getElementById('register-spinner');
        btn.disabled = true;
        spinner.classList.remove('d-none');

        try {
            const res = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, role })
            });
            const data = await res.json();

            if (data.success) {
                localStorage.setItem('token', data.accessToken);
                localStorage.setItem('userRole', role);
                showAlert('تم إنشاء الحساب بنجاح! جاري التحويل...', 'success');
                setTimeout(() => redirectBasedOnRole(role), 1500);
            } else {
                showAlert(data.error || 'حدث خطأ أثناء التسجيل');
            }
        } catch (err) {
            showAlert('تعذر الاتصال بالخادم');
        } finally {
            btn.disabled = false;
            spinner.classList.add('d-none');
        }
    });
}

// Login User
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        const btn = document.getElementById('login-btn');
        const spinner = document.getElementById('login-spinner');
        btn.disabled = true;
        spinner.classList.remove('d-none');

        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();

            if (data.success) {
                localStorage.setItem('token', data.accessToken);
                
                // Get user info to know the role
                const userRes = await fetch(`${API_URL}/auth/me`, {
                    headers: { 'Authorization': `Bearer ${data.accessToken}` }
                });
                const userData = await userRes.json();
                
                if (userData.success) {
                    const role = userData.data.role;
                    localStorage.setItem('userRole', role);
                    localStorage.setItem('userName', userData.data.name);
                    showAlert('تم تسجيل الدخول بنجاح!', 'success');
                    setTimeout(() => redirectBasedOnRole(role), 1000);
                }
            } else {
                showAlert(data.error || 'البريد الإلكتروني أو كلمة المرور غير صحيحة');
            }
        } catch (err) {
            showAlert('تعذر الاتصال بالخادم');
        } finally {
            btn.disabled = false;
            spinner.classList.add('d-none');
        }
    });
}

function redirectBasedOnRole(role) {
    if (role === 'admin') window.location.href = 'admin-dashboard.html';
    else if (role === 'doctor') window.location.href = 'doctor-dashboard.html';
    else window.location.href = 'user-dashboard.html';
}

// Logout
function logout() {
    localStorage.clear();
    window.location.href = 'login.html';
}
