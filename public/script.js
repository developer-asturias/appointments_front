// Global variables
let programs = [];
let appointmentTypes = [];
let currentUser = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', async function() {
    await loadPrograms();
    await loadAppointmentTypes();
    setupFormValidation();
    setupCharacterCounter();
    setMinDateTime();
    checkAuthStatus();
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

// Load programs from API
async function loadPrograms() {
    try {
        programs = await apiCall('GET', '/api/programs');
        populateSelect('programId', programs, 'name');
    } catch (error) {
        console.error('Failed to load programs:', error);
        showError('Failed to load programs. Please refresh the page.');
    }
}

// Load appointment types from API
async function loadAppointmentTypes() {
    try {
        appointmentTypes = await apiCall('GET', '/api/appointment-types');
        populateSelect('typeOfAppointmentId', appointmentTypes, 'name', (type) => 
            `${type.name} (${type.duration} min)`
        );
    } catch (error) {
        console.error('Failed to load appointment types:', error);
        showError('Failed to load appointment types. Please refresh the page.');
    }
}

// Populate select dropdown
function populateSelect(selectId, items, textProperty, customFormatter = null) {
    const select = document.getElementById(selectId);
    
    // Clear existing options (except the first placeholder)
    while (select.children.length > 1) {
        select.removeChild(select.lastChild);
    }
    
    items.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = customFormatter ? customFormatter(item) : item[textProperty];
        select.appendChild(option);
    });
}

// Set minimum date/time to current date/time
function setMinDateTime() {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    const localDate = new Date(now.getTime() - offset);
    const minDateTime = localDate.toISOString().slice(0, 16);
    document.getElementById('date').min = minDateTime;
}

// Setup character counter for details textarea
function setupCharacterCounter() {
    const detailsTextarea = document.getElementById('details');
    const charCount = document.getElementById('charCount');
    
    detailsTextarea.addEventListener('input', function() {
        const count = this.value.length;
        charCount.textContent = count;
        
        if (count > 200) {
            charCount.style.color = '#ef4444';
        } else {
            charCount.style.color = '#64748b';
        }
    });
}

// Form validation
function setupFormValidation() {
    const form = document.getElementById('appointmentForm');
    form.addEventListener('submit', handleFormSubmit);
    
    // Real-time validation
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => clearError(input.name));
    });
}

function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name;
    let isValid = true;
    let errorMessage = '';

    // Clear previous errors
    clearError(fieldName);

    switch (fieldName) {
        case 'userName':
            if (!value) {
                errorMessage = 'El nombre del usuario no puede estar vacío.';
                isValid = false;
            } else if (value.length > 50) {
                errorMessage = 'El nombre del usuario no puede superar los 50 caracteres.';
                isValid = false;
            }
            break;

        case 'userEmail':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!value) {
                errorMessage = 'El correo electrónico del usuario no puede estar vacío.';
                isValid = false;
            } else if (!emailRegex.test(value)) {
                errorMessage = 'El correo electrónico debe tener un formato válido.';
                isValid = false;
            }
            break;

        case 'phone':
            if (!value) {
                errorMessage = 'El número de teléfono del usuario no puede estar vacío.';
                isValid = false;
            } else if (value.length < 10 || value.length > 15) {
                errorMessage = 'El teléfono debe tener entre 10 y 15 caracteres.';
                isValid = false;
            }
            break;

        case 'numberDocument':
            if (!value) {
                errorMessage = 'El número de documento no puede estar vacío.';
                isValid = false;
            }
            break;

        case 'programId':
            if (!value) {
                errorMessage = 'Debe seleccionar un programa.';
                isValid = false;
            }
            break;

        case 'typeOfAppointmentId':
            if (!value) {
                errorMessage = 'Debe seleccionar un tipo de cita.';
                isValid = false;
            }
            break;

        case 'date':
            if (!value) {
                errorMessage = 'La fecha de la cita no puede ser nula.';
                isValid = false;
            } else {
                const selectedDate = new Date(value);
                const now = new Date();
                if (selectedDate <= now) {
                    errorMessage = 'La fecha debe ser futura.';
                    isValid = false;
                }
            }
            break;

        case 'details':
            if (value.length > 200) {
                errorMessage = 'Los detalles no pueden superar los 200 caracteres.';
                isValid = false;
            }
            break;
    }

    if (!isValid) {
        showFieldError(fieldName, errorMessage);
    }

    return isValid;
}

function showFieldError(fieldName, message) {
    const errorElement = document.getElementById(`${fieldName}-error`);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }
}

function clearError(fieldName) {
    const errorElement = document.getElementById(`${fieldName}-error`);
    if (errorElement) {
        errorElement.classList.remove('show');
    }
}

// Handle form submission
async function handleFormSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const submitBtn = document.getElementById('submitBtn');
    
    // Validate all fields
    let isFormValid = true;
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        if (!validateField(input)) {
            isFormValid = false;
        }
    });

    if (!isFormValid) {
        return;
    }

    // Prepare data for API
    const appointmentData = {
        userName: formData.get('userName'),
        userEmail: formData.get('userEmail'),
        phone: formData.get('phone'),
        numberDocument: formData.get('numberDocument'),
        programId: parseInt(formData.get('programId')),
        typeOfAppointmentId: parseInt(formData.get('typeOfAppointmentId')),
        date: new Date(formData.get('date')).toISOString(),
        details: formData.get('details') || null
    };

    // Show loading state
    submitBtn.disabled = true;
    submitBtn.classList.add('loading');
    submitBtn.textContent = 'Agendando...';

    try {
        await apiCall('POST', '/api/appointments', appointmentData);
        
        // Show success modal
        showSuccessModal();
        
        // Reset form
        form.reset();
        document.getElementById('charCount').textContent = '0';
        
    } catch (error) {
        showError(`Error al agendar la cita: ${error.message}`);
    } finally {
        // Reset button state
        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
        submitBtn.textContent = '📅 Agendar Cita';
    }
}

// Modal functions
function showSuccessModal() {
    document.getElementById('successModal').classList.remove('hidden');
}

function closeSuccessModal() {
    document.getElementById('successModal').classList.add('hidden');
}

function showLogin() {
    document.getElementById('loginModal').classList.remove('hidden');
}

function closeLogin() {
    document.getElementById('loginModal').classList.add('hidden');
}

// Login functionality
document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const loginData = {
        email: formData.get('email'),
        password: formData.get('password'),
        role: formData.get('role')
    };

    try {
        const response = await apiCall('POST', '/api/auth/login', loginData);
        currentUser = response.user;
        
        // Redirect based on role
        if (loginData.role === 'admin') {
            window.location.href = 'admin.html';
        } else if (loginData.role === 'mentor') {
            window.location.href = 'mentor.html';
        }
        
    } catch (error) {
        showError(`Error al iniciar sesión: ${error.message}`);
    }
});

// Check authentication status
async function checkAuthStatus() {
    try {
        const response = await apiCall('GET', '/api/auth/me');
        currentUser = response.user;
    } catch (error) {
        // User not logged in, which is fine for the public page
        currentUser = null;
    }
}

// Utility functions
function showError(message) {
    // Create a simple error toast
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
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 5000);
    
    // Click to remove
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