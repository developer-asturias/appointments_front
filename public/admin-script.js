// Global variables
let currentUser = null;
let appointments = [];
let mentors = [];
let currentAppointmentId = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', async function() {
    await checkAuthStatus();
    setupTabs();
    setupFilters();
    await loadData();
});

// API Functions
async function apiCall(method, endpoint, data = null) {
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include'
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(endpoint, options);
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || `HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API call failed:', error);
        throw error;
    }
}

// Authentication
async function checkAuthStatus() {
    try {
        const response = await apiCall('GET', '/api/auth/me');
        currentUser = response.user;
        
        if (!currentUser || currentUser.role !== 'admin') {
            window.location.href = 'index.html';
            return;
        }
        
        document.getElementById('userName').textContent = currentUser.name;
    } catch (error) {
        window.location.href = 'index.html';
    }
}

async function logout() {
    try {
        await apiCall('POST', '/api/auth/logout');
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Logout failed:', error);
        window.location.href = 'index.html';
    }
}

// Tab Management
function setupTabs() {
    const tabButtons = document.querySelectorAll('.nav-tab');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');
            switchTab(tabName);
        });
    });
}

function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.nav-tab').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    // Load specific data if needed
    if (tabName === 'mentors') {
        loadMentors();
    }
}

// Data Loading
async function loadData() {
    showLoading();
    try {
        await Promise.all([
            loadAppointments(),
            loadMentors()
        ]);
    } finally {
        hideLoading();
    }
}

async function loadAppointments() {
    try {
        appointments = await apiCall('GET', '/api/admin/appointments');
        renderAppointments();
    } catch (error) {
        showError('Error al cargar las citas: ' + error.message);
    }
}

async function loadMentors() {
    try {
        mentors = await apiCall('GET', '/api/admin/mentors');
        renderMentors();
        populateMentorSelect();
    } catch (error) {
        showError('Error al cargar los mentores: ' + error.message);
    }
}

// Render Functions
function renderAppointments() {
    const tbody = document.getElementById('appointmentsTableBody');
    const noDataDiv = document.getElementById('noAppointments');
    
    if (appointments.length === 0) {
        tbody.innerHTML = '';
        noDataDiv.classList.remove('hidden');
        return;
    }
    
    noDataDiv.classList.add('hidden');
    
    tbody.innerHTML = appointments.map(appointment => `
        <tr>
            <td>
                <div class="client-info">
                    <div class="client-name">${escapeHtml(appointment.userName)}</div>
                    <div class="client-email">${escapeHtml(appointment.userEmail)}</div>
                </div>
            </td>
            <td>${escapeHtml(appointment.program || 'N/A')}</td>
            <td>${escapeHtml(appointment.type || 'N/A')}</td>
            <td>${formatDateTime(appointment.date)}</td>
            <td>
                <span class="status-badge status-${appointment.status}">
                    ${getStatusText(appointment.status)}
                </span>
            </td>
            <td>
                ${appointment.mentor ? `
                    <div class="mentor-info">
                        <div class="mentor-avatar">${appointment.mentor.charAt(0).toUpperCase()}</div>
                        <span class="mentor-name">${escapeHtml(appointment.mentor)}</span>
                    </div>
                ` : `
                    <button onclick="showAssignModal(${appointment.id})" class="mentor-select">
                        Asignar mentor...
                    </button>
                `}
            </td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn" title="Ver detalles">👁️</button>
                    <button class="action-btn" title="Editar">✏️</button>
                    <button class="action-btn delete" onclick="deleteAppointment(${appointment.id})" title="Eliminar">🗑️</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function renderMentors() {
    const grid = document.getElementById('mentorsGrid');
    
    if (mentors.length === 0) {
        grid.innerHTML = '<div class="no-data"><p>No hay mentores registrados</p></div>';
        return;
    }
    
    grid.innerHTML = mentors.map(mentor => `
        <div class="mentor-card">
            <div class="mentor-header">
                <div class="mentor-large-avatar">
                    ${mentor.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                </div>
                <div class="mentor-details">
                    <h3>${escapeHtml(mentor.name)}</h3>
                    <div class="mentor-role">${escapeHtml(mentor.role)}</div>
                </div>
            </div>
            <div class="mentor-stats">
                <div class="stat-row">
                    <span class="stat-label">Citas asignadas:</span>
                    <span class="stat-value">${mentor.appointmentsCount || 0}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Disponibilidad:</span>
                    <span class="availability-badge">${mentor.availability || 'Disponible'}</span>
                </div>
            </div>
            <div class="mentor-actions">
                <button class="mentor-action-btn">Ver Agenda</button>
                <button class="mentor-action-btn">Editar</button>
            </div>
        </div>
    `).join('');
}

function populateMentorSelect() {
    const select = document.getElementById('mentorSelect');
    select.innerHTML = '<option value="">Selecciona un mentor...</option>';
    
    mentors.forEach(mentor => {
        const option = document.createElement('option');
        option.value = mentor.id;
        option.textContent = mentor.name;
        select.appendChild(option);
    });
}

// Filter Functions
function setupFilters() {
    const statusFilter = document.getElementById('statusFilter');
    statusFilter.addEventListener('change', filterAppointments);
}

function filterAppointments() {
    const statusFilter = document.getElementById('statusFilter').value;
    
    let filteredAppointments = appointments;
    
    if (statusFilter !== 'all') {
        filteredAppointments = appointments.filter(appointment => 
            appointment.status === statusFilter
        );
    }
    
    // Temporarily replace appointments array for rendering
    const originalAppointments = appointments;
    appointments = filteredAppointments;
    renderAppointments();
    appointments = originalAppointments;
}

// Assign Mentor Modal
function showAssignModal(appointmentId) {
    currentAppointmentId = appointmentId;
    document.getElementById('assignMentorModal').classList.remove('hidden');
}

function closeAssignModal() {
    currentAppointmentId = null;
    document.getElementById('assignMentorModal').classList.add('hidden');
    document.getElementById('assignMentorForm').reset();
}

// Setup assign mentor form
document.getElementById('assignMentorForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const mentorId = parseInt(formData.get('mentorId'));
    
    if (!mentorId || !currentAppointmentId) {
        return;
    }
    
    showLoading();
    try {
        await apiCall('PATCH', `/api/admin/appointments/${currentAppointmentId}/assign`, {
            mentorId: mentorId
        });
        
        showSuccess('Mentor asignado exitosamente');
        closeAssignModal();
        await loadAppointments();
    } catch (error) {
        showError('Error al asignar mentor: ' + error.message);
    } finally {
        hideLoading();
    }
});

// Delete Appointment
async function deleteAppointment(appointmentId) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta cita?')) {
        return;
    }
    
    showLoading();
    try {
        await apiCall('DELETE', `/api/admin/appointments/${appointmentId}`);
        showSuccess('Cita eliminada exitosamente');
        await loadAppointments();
    } catch (error) {
        showError('Error al eliminar la cita: ' + error.message);
    } finally {
        hideLoading();
    }
}

// Utility Functions
function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getStatusText(status) {
    const statusMap = {
        'pending': 'Pendiente',
        'assigned': 'Asignada',
        'completed': 'Completada',
        'cancelled': 'Cancelada'
    };
    return statusMap[status] || status;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showLoading() {
    document.getElementById('loadingOverlay').classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loadingOverlay').classList.add('hidden');
}

function showError(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ef4444;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 6px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        z-index: 10000;
        max-width: 400px;
    `;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 5000);
    
    toast.addEventListener('click', () => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    });
}

function showSuccess(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 6px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        z-index: 10000;
        max-width: 400px;
    `;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 3000);
    
    toast.addEventListener('click', () => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    });
}

// Close modals when clicking outside
document.addEventListener('click', function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.classList.add('hidden');
        }
    });
});

// Close modals with Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const visibleModals = document.querySelectorAll('.modal:not(.hidden)');
        visibleModals.forEach(modal => {
            modal.classList.add('hidden');
        });
    }
});