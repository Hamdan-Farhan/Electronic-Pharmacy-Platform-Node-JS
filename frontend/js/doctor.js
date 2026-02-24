const API_URL = 'http://localhost:5000/api/v1';
const token = localStorage.getItem('token');

if (!token || localStorage.getItem('userRole') !== 'doctor') window.location.href = 'login.html';

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('doctor-name-display').textContent = `مرحباً، د. ${localStorage.getItem('userName')}`;
    loadPrescriptions();
    loadOrders();
});

function showSection(sectionId) {
    document.querySelectorAll('main section').forEach(s => s.style.display = 'none');
    document.getElementById(sectionId).style.display = 'block';
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    event.target.classList.add('active');
}

async function loadPrescriptions() {
    const list = document.getElementById('doctor-prescriptions-list');
    try {
        const res = await fetch(`${API_URL}/prescriptions`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
            const pending = data.data.filter(p => p.status === 'pending');
            list.innerHTML = pending.length > 0 ? pending.map(p => `
                <div class="col-md-4">
                    <div class="card">
                        <img src="${API_URL.replace('/api/v1', '')}/${p.imageUrl}" class="card-img-top" style="height: 200px; object-fit: cover;">
                        <div class="card-body">
                            <h5>مريض: ${p.user.name}</h5>
                            <p class="small text-muted">تاريخ الرفع: ${new Date(p.createdAt).toLocaleString()}</p>
                            <button class="btn btn-primary w-100" onclick="openReviewModal('${p._id}', '${API_URL.replace('/api/v1', '')}/${p.imageUrl}')">مراجعة الآن</button>
                        </div>
                    </div>
                </div>
            `).join('') : '<div class="col-12 text-center"><p>لا توجد وصفات معلقة حالياً.</p></div>';
        }
    } catch (err) { console.error(err); }
}

function openReviewModal(id, imgUrl) {
    document.getElementById('review-id').value = id;
    document.getElementById('review-img').src = imgUrl;
    new bootstrap.Modal(document.getElementById('reviewModal')).show();
}

document.getElementById('review-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('review-id').value;
    const status = document.getElementById('review-status').value;
    const notes = document.getElementById('review-notes').value;

    try {
        const res = await fetch(`${API_URL}/prescriptions/${id}/review`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status, reviewNotes: notes })
        });
        const data = await res.json();
        if (data.success) {
            alert('تم حفظ المراجعة بنجاح');
            location.reload();
        }
    } catch (err) { alert('خطأ في الاتصال'); }
});

async function loadOrders() {
    const list = document.getElementById('doctor-orders-list');
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
                    <td>${order.items.map(i => i.medicine.name).join(', ')}</td>
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
        const res = await fetch(`${API_URL}/orders/${id}/status`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status })
        });
        const data = await res.json();
        if (data.success) alert('تم تحديث حالة الطلب');
    } catch (err) { alert('خطأ في الاتصال'); }
}

function logout() {
    localStorage.clear();
    window.location.href = 'login.html';
}
