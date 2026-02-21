// Layer 3: Shipment Operations logic

let currentShipment = null;
let currentTracking = null;

document.addEventListener('DOMContentLoaded', async function() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
    
    // Get tracking number from URL
    const urlParams = new URLSearchParams(window.location.search);
    currentTracking = urlParams.get('tracking');
    
    if (!currentTracking) {
        window.location.href = 'history.html';
        return;
    }
    
    await loadShipmentDetails();
    setupEventListeners();
});

async function loadShipmentDetails() {
    try {
        const token = localStorage.getItem('token');
        const response = await api.getShipment(token, currentTracking);
        
        if (!response.ok) {
            throw new Error('Failed to load shipment');
        }
        
        currentShipment = await response.json();
        displayShipmentDetails();
        document.getElementById('operations-container').style.display = 'grid';
        
    } catch (error) {
        console.error('Error loading shipment:', error);
        showError('Failed to load shipment details');
    }
}

function displayShipmentDetails() {
    const s = currentShipment;
    
    // Header
    document.getElementById('shipment-tracking').textContent = s.tracking;
    document.getElementById('shipment-invoice').textContent = `Invoice: ${s.invoice_number}`;
    
    const statusBadge = document.getElementById('shipment-status-badge');
    statusBadge.textContent = s.status.display;
    statusBadge.className = `status-badge status-${s.status.color}`;
    
    // Basic info
    document.getElementById('shipment-origin').textContent = s.route.origin;
    document.getElementById('shipment-destination').textContent = s.route.destination;
    document.getElementById('shipment-sender').textContent = s.sender.name;
    document.getElementById('shipment-recipient').textContent = s.recipient.name;
    document.getElementById('shipment-weight').textContent = s.commodity.weight ? `${s.commodity.weight} kg` : 'N/A';
    document.getElementById('shipment-value').textContent = s.commodity.declared_value ? 
        `${s.commodity.currency} ${s.commodity.declared_value.toLocaleString()}` : 'N/A';
    document.getElementById('shipment-payment').textContent = 
        `${s.payment.currency} ${s.payment.amount.toLocaleString()} (${s.payment.status})`;
    document.getElementById('shipment-estimated').textContent = new Date(s.status.estimated_delivery).toLocaleDateString();
    
    // Status buttons
    loadAvailableStatuses();
    
    // Interventions
    updateInterventionToggles();
    
    // Timeline
    displayTimeline();
    
    // Email history
    displayEmailHistory();
    
    // Images
    displayImages();
}

async function loadAvailableStatuses() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/v1/shipments/${currentTracking}/available-statuses`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        const container = document.getElementById('status-buttons');
        container.innerHTML = '';
        
        data.available.forEach(status => {
            const btn = document.createElement('button');
            btn.className = 'status-btn';
            btn.textContent = status.replace(/_/g, ' ');
            btn.onclick = () => updateStatus(status);
            container.appendChild(btn);
        });
        
    } catch (error) {
        console.error('Error loading statuses:', error);
    }
}

async function updateStatus(newStatus) {
    const location = prompt('Enter current location (optional):');
    const notes = prompt('Enter notes (optional):');
    
    try {
        const token = localStorage.getItem('token');
        const response = await api.updateStatus(token, currentTracking, {
            status: newStatus,
            location: location || undefined,
            notes: notes || undefined
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showSuccess(`Status updated to ${newStatus}`);
            await loadShipmentDetails(); // Reload
        } else {
            showError(result.detail || 'Failed to update status');
        }
        
    } catch (error) {
        console.error('Error updating status:', error);
        showError('Failed to update status');
    }
}

function updateInterventionToggles() {
    const s = currentShipment;
    
    // Customs
    document.getElementById('customs-toggle').checked = s.interventions.customs.active;
    if (s.interventions.customs.active) {
        document.getElementById('customs-details').classList.add('active');
        document.getElementById('customs-location').value = s.interventions.customs.location || '';
        document.getElementById('customs-reference').value = s.interventions.customs.reference || '';
        document.getElementById('customs-notes').value = s.interventions.customs.notes || '';
    }
    
    // Security
    document.getElementById('security-toggle').checked = s.interventions.security.active;
    if (s.interventions.security.active) {
        document.getElementById('security-details').classList.add('active');
        document.getElementById('security-location').value = s.interventions.security.location || '';
        document.getElementById('security-notes').value = s.interventions.security.notes || '';
    }
    
    // Damage
    document.getElementById('damage-toggle').checked = s.interventions.damage.reported;
    if (s.interventions.damage.reported) {
        document.getElementById('damage-details').classList.add('active');
        document.getElementById('damage-description').value = s.interventions.damage.description || '';
        document.getElementById('damage-resolution').value = s.interventions.damage.resolution || '';
    }
    
    // Return
    document.getElementById('return-toggle').checked = s.interventions.return.active;
    if (s.interventions.return.active) {
        document.getElementById('return-details').classList.add('active');
        document.getElementById('return-reason').value = s.interventions.return.reason || '';
    }
    
    // Delay
    document.getElementById('delay-toggle').checked = s.interventions.delay.active;
    if (s.interventions.delay.active) {
        document.getElementById('delay-details').classList.add('active');
        document.getElementById('delay-reason').value = s.interventions.delay.reason || '';
        document.getElementById('delay-revised-eta').value = s.interventions.delay.revised_eta || '';
        document.getElementById('delay-notes').value = s.interventions.delay.notes || '';
    }
}

function setupEventListeners() {
    // Toggle event listeners
    document.getElementById('customs-toggle').addEventListener('change', function(e) {
        document.getElementById('customs-details').classList.toggle('active', e.target.checked);
    });
    
    document.getElementById('security-toggle').addEventListener('change', function(e) {
        document.getElementById('security-details').classList.toggle('active', e.target.checked);
    });
    
    document.getElementById('damage-toggle').addEventListener('change', function(e) {
        document.getElementById('damage-details').classList.toggle('active', e.target.checked);
    });
    
    document.getElementById('return-toggle').addEventListener('change', function(e) {
        document.getElementById('return-details').classList.toggle('active', e.target.checked);
    });
    
    document.getElementById('delay-toggle').addEventListener('change', function(e) {
        document.getElementById('delay-details').classList.toggle('active', e.target.checked);
    });
}

async function updateCustoms() {
    const action = document.getElementById('customs-toggle').checked ? 'activate' : 'release';
    
    try {
        const token = localStorage.getItem('token');
        const response = await api.toggleCustoms(token, currentTracking, {
            action: action,
            location: document.getElementById('customs-location').value,
            reference: document.getElementById('customs-reference').value,
            notes: document.getElementById('customs-notes').value
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showSuccess(`Customs ${action}d successfully`);
            await loadShipmentDetails();
        } else {
            showError(result.detail || 'Failed to update customs');
        }
        
    } catch (error) {
        console.error('Error updating customs:', error);
        showError('Failed to update customs');
    }
}

async function updateSecurity() {
    const action = document.getElementById('security-toggle').checked ? 'activate' : 'clear';
    
    try {
        const token = localStorage.getItem('token');
        const response = await api.toggleSecurity(token, currentTracking, {
            action: action,
            location: document.getElementById('security-location').value,
            notes: document.getElementById('security-notes').value
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showSuccess(`Security ${action}d successfully`);
            await loadShipmentDetails();
        } else {
            showError(result.detail || 'Failed to update security');
        }
        
    } catch (error) {
        console.error('Error updating security:', error);
        showError('Failed to update security');
    }
}

async function updateDamage() {
    const action = document.getElementById('damage-toggle').checked ? 'report' : 'resolve';
    
    try {
        const token = localStorage.getItem('token');
        const response = await api.reportDamage(token, currentTracking, {
            action: action,
            description: document.getElementById('damage-description').value,
            resolution_notes: document.getElementById('damage-resolution').value
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showSuccess(`Damage ${action}ed successfully`);
            await loadShipmentDetails();
        } else {
            showError(result.detail || 'Failed to update damage');
        }
        
    } catch (error) {
        console.error('Error updating damage:', error);
        showError('Failed to update damage');
    }
}

async function updateReturn() {
    if (!document.getElementById('return-toggle').checked) return;
    
    try {
        const token = localStorage.getItem('token');
        const response = await api.initiateReturn(token, currentTracking, {
            action: 'initiate',
            reason: document.getElementById('return-reason').value
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showSuccess('Return initiated successfully');
            await loadShipmentDetails();
        } else {
            showError(result.detail || 'Failed to initiate return');
        }
        
    } catch (error) {
        console.error('Error initiating return:', error);
        showError('Failed to initiate return');
    }
}

async function updateDelay() {
    const action = document.getElementById('delay-toggle').checked ? 'report' : 'resolve';
    
    try {
        const token = localStorage.getItem('token');
        const response = await api.reportDelay(token, currentTracking, {
            action: action,
            reason: document.getElementById('delay-reason').value,
            revised_eta: document.getElementById('delay-revised-eta').value || undefined,
            notes: document.getElementById('delay-notes').value
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showSuccess(`Delay ${action}ed successfully`);
            await loadShipmentDetails();
        } else {
            showError(result.detail || 'Failed to update delay');
        }
        
    } catch (error) {
        console.error('Error updating delay:', error);
        showError('Failed to update delay');
    }
}

function displayTimeline() {
    const timeline = document.getElementById('status-timeline');
    timeline.innerHTML = '';
    
    if (!currentShipment.timeline || currentShipment.timeline.length === 0) {
        timeline.innerHTML = '<p>No timeline events available</p>';
        return;
    }
    
    currentShipment.timeline.forEach(event => {
        const div = document.createElement('div');
        div.className = 'timeline-event';
        div.innerHTML = `
            <div class="event-time">${new Date(event.timestamp).toLocaleString()}</div>
            <div class="event-status">${event.display}</div>
            ${event.location ? `<div class="event-location">${event.location}</div>` : ''}
            ${event.notes ? `<div class="event-notes">${event.notes}</div>` : ''}
        `;
        timeline.appendChild(div);
    });
}

function displayEmailHistory() {
    const history = document.getElementById('email-history');
    history.innerHTML = '';
    
    if (!currentShipment.communication || !currentShipment.communication.email_history || 
        currentShipment.communication.email_history.length === 0) {
        history.innerHTML = '<p>No email history available</p>';
        return;
    }
    
    currentShipment.communication.email_history.forEach(email => {
        const div = document.createElement('div');
        div.className = 'email-item';
        div.innerHTML = `
            <div class="email-type">${email.type}</div>
            <div class="email-recipient">To: ${email.recipient}</div>
            <div class="email-time">${new Date(email.timestamp).toLocaleString()}</div>
        `;
        history.appendChild(div);
    });
}

function displayImages() {
    const images = document.getElementById('shipment-images');
    images.innerHTML = '';
    
    if (currentShipment.images) {
        if (currentShipment.images.front) {
            const img = document.createElement('img');
            img.src = currentShipment.images.front;
            img.alt = 'Front view';
            img.onclick = () => window.open(currentShipment.images.front);
            images.appendChild(img);
        }
        
        if (currentShipment.images.rear) {
            const img = document.createElement('img');
            img.src = currentShipment.images.rear;
            img.alt = 'Rear view';
            img.onclick = () => window.open(currentShipment.images.rear);
            images.appendChild(img);
        }
    }
}

function showError(message) {
    const errorDiv = document.getElementById('error-message');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    }
}

function showSuccess(message) {
    const successDiv = document.getElementById('success-message');
    if (!successDiv) {
        const div = document.createElement('div');
        div.id = 'success-message';
        div.className = 'success-message';
        div.style.cssText = 'background:#d4edda; color:#155724; padding:1rem; margin:1rem 2rem; border-radius:8px; display:block;';
        div.textContent = message;
        document.querySelector('.operations-container').prepend(div);
        setTimeout(() => div.remove(), 5000);
    } else {
        successDiv.textContent = message;
        successDiv.style.display = 'block';
        setTimeout(() => {
            successDiv.style.display = 'none';
        }, 5000);
    }
}