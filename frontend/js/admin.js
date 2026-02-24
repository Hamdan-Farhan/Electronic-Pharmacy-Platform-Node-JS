const API_URL = 'http://localhost:5000/api/v1';
const token = localStorage.getItem('token');

if (!token || localStorage.getItem('userRole') !== 'admin') window.location.href = 'login.html';

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('admin-name-display').textContent = `مرحباً، ${localStorage.getItem('userName')}`;
    loadStats();
    loadMedicines();
    loadUsers();
    loadOrders();
});

function showSection(sectionId) {
    document.querySelectorAll('main section').forEach(s => s.style.display = 'none');
    document.getElementById(sectionId).style.display = 'block';
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    event.target.classList.add('active');
}

async function loadStats() {
    try {
        const res = await fetch(`${API_URL}/auth/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
            document.getElementById('stat-users').textContent = data.data.users;
            document.getElementById('stat-medicines').textContent = data.data.medicines;
            document.getElementById('stat-orders').textContent = data.data.orders;
        }
    } catch (err) { console.error(err); }
}

async function loadMedicines() {
    const list = document.getElementById('admin-medicines-list');
    try {
        const res = await fetch(`${API_URL}/medicines`);
        const data = await res.json();
        if (data.success) {
            list.innerHTML = data.data.map(med => `
                <tr>
                    <td><img src="${med.image === 'no-photo.jpg' ? 'https://via.placeholder.com/50' : API_URL.replace('/api/v1', '') + '/uploads/' + med.image}" width="50" class="rounded"></td>
                    <td>${med.name}</td>
                    <td>${med.price} ريال</td>
                    <td>${med.stock}</td>
                    <td>${med.category}</td>
                    <td>
                        <button class="btn btn-sm btn-info" onclick="openPhotoModal('${med._id}')"><i class="fas fa-image"></i></button>
                        <button class="btn btn-sm btn-warning" onclick="editMedicine('${med._id}')"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-sm btn-danger" onclick="deleteMedicine('${med._id}')"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `).join('');
        }
    } catch (err) { console.error(err); }
}

document.getElementById('medicine-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('medicine-id').value;
    const body = {
        name: document.getElementById('med-name').value,
        description: document.getElementById('med-description').value,
        price: parseFloat(document.getElementById('med-price').value),
        stock: parseInt(document.getElementById('med-stock').value),
        category: document.getElementById('med-category').value,
        manufacturer: document.getElementById('med-manufacturer').value,
        expiryDate: document.getElementById('med-expiry').value,
        requiresPrescription: document.getElementById('med-prescription').checked
    };

    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_URL}/medicines/${id}` : `${API_URL}/medicines`;

    try {
        const res = await fetch(url, {
            method,
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(body)
        });
        const data = await res.json();
        if (data.success) {
            alert('تم حفظ الدواء بنجاح');
            location.reload();
        }
    } catch (err) { alert('خطأ في الاتصال'); }
});

async function deleteMedicine(id) {
    if (confirm('هل أنت متأكد من حذف هذا الدواء؟')) {
        try {
            await fetch(`${API_URL}/medicines/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            location.reload();
        } catch (err) { alert('خطأ في الاتصال'); }
    }
}

function openPhotoModal(id) {
    document.getElementById('photo-med-id').value = id;
    new bootstrap.Modal(document.getElementById('uploadPhotoModal')).show();
}

document.getElementById('upload-photo-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('photo-med-id').value;
    const file = document.getElementById('med-photo-file').files[0];
    const formData = new FormData();
    formData.append('image', file);

    try {
        const res = await fetch(`${API_URL}/medicines/${id}/photo`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });
        const data = await res.json();
        if (data.success) {
            alert('تم تحديث الصورة بنجاح');
            location.reload();
        }
    } catch (err) { alert('خطأ في الاتصال'); }
});

async function loadUsers() {
    const list = document.getElementById('admin-users-list');
    try {
        const res = await fetch(`${API_URL}/auth/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
            list.innerHTML = data.data.map(user => `
                <tr>
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td><span class="badge bg-secondary">${user.role}</span></td>
                    <td>${new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                        <button class="btn btn-sm btn-danger" onclick="deleteUser('${user._id}')" ${user.role === 'admin' ? 'disabled' : ''}>حذف</button>
                    </td>
                </tr>
            `).join('');
        }
    } catch (err) { console.error(err); }
}

async function deleteUser(id) {
    if (confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
        try {
            await fetch(`${API_URL}/auth/users/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            location.reload();
        } catch (err) { alert('خطأ في الاتصال'); }
    }
}

async function loadOrders() {
    const list = document.getElementById('admin-orders-list');
    try {
        const res = await fetch(`${API_URL}/orders`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
            list.innerHTML = data.data.map(order => `
                <tr>
                    <td>#${order._id.substring(18)}</td>
                    <td>${order.user.name}</td>
                    <td>${order.totalPrice} ريال</td>
                    <td><span class="badge badge-${order.status}">${order.status}</span></td>
                    <td>
                        <select class="form-select form-select-sm" onchange="updateOrderStatus('${order._id}', this.value)">
                            <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>معلق</option>
                            <option value="confirmed" ${order.status === 'confirmed' ? 'selected' : ''}>تأكيد</option>
                            <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>شحن</option>
                            <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>تم التوصيل</option>
                            <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>إلغاء</option>
                        </select>
                    </td>
                </tr>
            `).join('');
        }
    } catch (err) { console.error(err); }
}

async function updateOrderStatus(id, status) {
    try {
        await fetch(`${API_URL}/orders/${id}/status`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status })
        });
        alert('تم تحديث حالة الطلب');
    } catch (err) { alert('خطأ في الاتصال'); }
}

function logout() {
    localStorage.clear();
    window.location.href = 'login.html';
}
