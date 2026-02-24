const API_URL = 'http://localhost:5000/api/v1';
const token = localStorage.getItem('token');

if (!token) window.location.href = 'login.html';

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('user-name-display').textContent = `مرحباً، ${localStorage.getItem('userName')}`;
    loadMedicines();
    loadOrders();
    loadPrescriptions();
    loadProfile();
});

function showSection(sectionId) {
    document.querySelectorAll('main section').forEach(s => s.style.display = 'none');
    document.getElementById(sectionId).style.display = 'block';
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    event.target.classList.add('active');
}

async function loadMedicines() {
    const list = document.getElementById('user-medicines-list');
    try {
        const res = await fetch(`${API_URL}/medicines`);
        const data = await res.json();
        if (data.success) {
            list.innerHTML = data.data.map(med => `
                <div class="col-md-4">
                    <div class="card h-100">
                        <img src="${med.image === 'no-photo.jpg' ? 'https://via.placeholder.com/300x200?text=No+Image' : API_URL.replace('/api/v1', '') + '/uploads/' + med.image}" class="card-img-top" style="height: 180px; object-fit: cover;">
                        <div class="card-body">
                            <h5>${med.name}</h5>
                            <p class="text-muted small">${med.description}</p>
                            <div class="d-flex justify-content-between">
                                <span class="fw-bold text-primary">${med.price} ريال</span>
                                <span class="badge bg-info">${med.category}</span>
                            </div>
                        </div>
                        <div class="card-footer bg-transparent border-0">
                            <button class="btn btn-primary btn-sm w-100" onclick="openOrderModal('${med._id}', '${med.name}', ${med.requiresPrescription})">طلب الآن</button>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    } catch (err) { console.error(err); }
}

async function openOrderModal(id, name, requiresPrescription) {
    document.getElementById('order-medicine-id').value = id;
    document.getElementById('order-item-details').innerHTML = `طلب دواء: <strong>${name}</strong>`;
    
    const presDiv = document.getElementById('prescription-select-div');
    if (requiresPrescription) {
        presDiv.style.display = 'block';
        const res = await fetch(`${API_URL}/prescriptions`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        const approved = data.data.filter(p => p.status === 'approved');
        const select = document.getElementById('order-prescription-id');
        if (approved.length > 0) {
            select.innerHTML = approved.map(p => `<option value="${p._id}">وصفة بتاريخ ${new Date(p.createdAt).toLocaleDateString()}</option>`).join('');
            select.required = true;
        } else {
            select.innerHTML = '<option value="">لا توجد وصفات معتمدة</option>';
            select.required = true;
        }
    } else {
        presDiv.style.display = 'none';
    }
    
    new bootstrap.Modal(document.getElementById('orderModal')).show();
}

document.getElementById('place-order-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const medicineId = document.getElementById('order-medicine-id').value;
    const quantity = document.getElementById('order-quantity').value;
    const address = document.getElementById('order-address').value;
    const prescriptionId = document.getElementById('order-prescription-id').value;

    try {
        const res = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                items: [{ medicine: medicineId, quantity: parseInt(quantity) }],
                shippingAddress: address,
                paymentMethod: 'cash',
                prescriptionId: prescriptionId || undefined
            })
        });
        const data = await res.json();
        if (data.success) {
            alert('تم تقديم الطلب بنجاح!');
            location.reload();
        } else {
            alert(data.error || 'فشل تقديم الطلب');
        }
    } catch (err) { alert('خطأ في الاتصال'); }
});

async function loadOrders() {
    const list = document.getElementById('user-orders-list');
    try {
        const res = await fetch(`${API_URL}/orders`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
            list.innerHTML = data.data.map(order => `
                <tr>
                    <td>#${order._id.substring(18)}</td>
                    <td>${new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>${order.totalPrice} ريال</td>
                    <td><span class="badge badge-${order.status}">${order.status}</span></td>
                    <td><button class="btn btn-sm btn-outline-info">التفاصيل</button></td>
                </tr>
            `).join('');
        }
    } catch (err) { console.error(err); }
}

async function loadPrescriptions() {
    const list = document.getElementById('user-prescriptions-list');
    try {
        const res = await fetch(`${API_URL}/prescriptions`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
            list.innerHTML = data.data.map(p => `
                <div class="col-md-4">
                    <div class="card">
                        <img src="${API_URL.replace('/api/v1', '')}/${p.imageUrl}" class="card-img-top" style="height: 150px; object-fit: cover;">
                        <div class="card-body">
                            <p class="mb-1 small text-muted">تاريخ الرفع: ${new Date(p.createdAt).toLocaleDateString()}</p>
                            <span class="badge badge-${p.status}">${p.status}</span>
                            ${p.reviewNotes ? `<p class="mt-2 small"><strong>ملاحظة:</strong> ${p.reviewNotes}</p>` : ''}
                        </div>
                    </div>
                </div>
            `).join('');
        }
    } catch (err) { console.error(err); }
}

document.getElementById('upload-prescription-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fileInput = document.getElementById('prescription-file');
    const formData = new FormData();
    formData.append('prescription', fileInput.files[0]);

    try {
        const res = await fetch(`${API_URL}/prescriptions`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });
        const data = await res.json();
        if (data.success) {
            alert('تم رفع الوصفة بنجاح، بانتظار مراجعة الطبيب.');
            location.reload();
        } else {
            alert(data.error || 'فشل الرفع');
        }
    } catch (err) { alert('خطأ في الاتصال'); }
});

function loadProfile() {
    document.getElementById('profile-name').value = localStorage.getItem('userName');
    document.getElementById('profile-email').value = 'user@example.com'; // Should get from /me
    document.getElementById('profile-role').value = localStorage.getItem('userRole');
}

function logout() {
    localStorage.clear();
    window.location.href = 'login.html';
}
