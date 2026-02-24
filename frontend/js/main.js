const API_URL = 'http://localhost:5000/api/v1';

document.addEventListener('DOMContentLoaded', () => {
    loadMedicinesPreview();
    updateNavbar();
});

async function loadMedicinesPreview() {
    const medicinesList = document.getElementById('medicines-list');
    if (!medicinesList) return;

    try {
        const res = await fetch(`${API_URL}/medicines?limit=4`);
        const data = await res.json();

        if (data.success && data.data.length > 0) {
            medicinesList.innerHTML = data.data.map(med => `
                <div class="col-md-3">
                    <div class="card h-100">
                        <img src="${med.image === 'no-photo.jpg' ? 'https://via.placeholder.com/300x200?text=No+Image' : API_URL.replace('/api/v1', '') + '/uploads/' + med.image}" class="card-img-top" alt="${med.name}" style="height: 200px; object-fit: cover;">
                        <div class="card-body">
                            <h5 class="card-title">${med.name}</h5>
                            <p class="card-text text-muted small">${med.description.substring(0, 60)}...</p>
                            <div class="d-flex justify-content-between align-items-center">
                                <span class="fw-bold text-primary">${med.price} ريال</span>
                                ${med.requiresPrescription ? '<span class="badge bg-warning text-dark">وصفة</span>' : ''}
                            </div>
                        </div>
                        <div class="card-footer bg-transparent border-0 pb-3">
                            <a href="login.html" class="btn btn-outline-primary btn-sm w-100">اطلب الآن</a>
                        </div>
                    </div>
                </div>
            `).join('');
        } else {
            medicinesList.innerHTML = '<div class="col-12 text-center"><p>لا توجد أدوية متوفرة حالياً.</p></div>';
        }
    } catch (err) {
        medicinesList.innerHTML = '<div class="col-12 text-center text-danger"><p>فشل تحميل الأدوية. يرجى التأكد من تشغيل الخادم.</p></div>';
    }
}

function updateNavbar() {
    const token = localStorage.getItem('token');
    const authButtons = document.getElementById('auth-buttons');
    const navLinks = document.getElementById('nav-links');

    if (token && authButtons) {
        const role = localStorage.getItem('userRole');
        const name = localStorage.getItem('userName') || 'المستخدم';
        
        let dashboardLink = 'user-dashboard.html';
        if (role === 'admin') dashboardLink = 'admin-dashboard.html';
        else if (role === 'doctor') dashboardLink = 'doctor-dashboard.html';

        authButtons.innerHTML = `
            <div class="dropdown">
                <button class="btn btn-outline-primary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                    <i class="fas fa-user-circle me-1"></i> ${name}
                </button>
                <ul class="dropdown-menu dropdown-menu-end">
                    <li><a class="dropdown-item" href="${dashboardLink}">لوحة التحكم</a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item text-danger" href="#" onclick="logout()">تسجيل الخروج</a></li>
                </ul>
            </div>
        `;
    }
}

function logout() {
    localStorage.clear();
    window.location.href = 'index.html';
}
