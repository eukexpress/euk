// Public tracking logic

document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on tracking page with a tracking number
    const urlParams = new URLSearchParams(window.location.search);
    const trackingNumber = urlParams.get('number');
    
    if (trackingNumber) {
        loadTrackingInfo(trackingNumber);
    }
    
    // Setup tracking form on index page
    const trackForm = document.querySelector('.tracking-section form');
    if (trackForm) {
        trackForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const input = this.querySelector('input[name="tracking"]');
            const tracking = input.value.trim().toUpperCase();
            
            if (tracking) {
                window.location.href = `track.html?number=${tracking}`;
            }
        });
    }
});

async function loadTrackingInfo(tracking) {
    const resultDiv = document.getElementById('tracking-result');
    if (!resultDiv) return;
    
    resultDiv.innerHTML = '<div class="loading">Loading tracking information...</div>';
    
    try {
        const response = await api.trackPublic(tracking);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Tracking number not found');
            }
            throw new Error('Failed to load tracking information');
        }
        
        const data = await response.json();
        
        let html = `
            <div class="tracking-card">
                <h2>Shipment ${data.tracking}</h2>
                <div class="status-badge status-${data.status.color}">
                    ${data.status.display}
                </div>
                
                <div class="route-info">
                    <div class="origin">
                        <strong>From:</strong> ${data.route.origin}
                    </div>
                    <div class="destination">
                        <strong>To:</strong> ${data.route.destination}
                    </div>
                </div>
                
                <div class="dates">
                    <div><strong>Shipped:</strong> ${formatDate(data.dates.sending)}</div>
                    <div><strong>Est. Delivery:</strong> ${formatDate(data.dates.estimated)}</div>
                    ${data.dates.actual ? `<div><strong>Delivered:</strong> ${formatDate(data.dates.actual)}</div>` : ''}
                </div>
        `;
        
        // Add timeline
        if (data.timeline && data.timeline.length > 0) {
            html += '<div class="timeline"><h3>Tracking History</h3>';
            data.timeline.forEach(event => {
                html += `
                    <div class="timeline-event">
                        <div class="event-time">${new Date(event.timestamp).toLocaleString()}</div>
                        <div class="event-status">${event.display}</div>
                        ${event.location ? `<div class="event-location">${event.location}</div>` : ''}
                    </div>
                `;
            });
            html += '</div>';
        }
        
        // Add interventions if active
        if (data.interventions) {
            const activeInterventions = [];
            if (data.interventions.customs_active) activeInterventions.push('Customs Hold');
            if (data.interventions.security_active) activeInterventions.push('Security Hold');
            if (data.interventions.damage_reported) activeInterventions.push('Damage Reported');
            if (data.interventions.delay_active) activeInterventions.push('Delay');
            
            if (activeInterventions.length > 0) {
                html += `
                    <div class="interventions">
                        <h3>Active Interventions</h3>
                        <ul>
                            ${activeInterventions.map(i => `<li>${i}</li>`).join('')}
                        </ul>
                    </div>
                `;
            }
        }
        
        // Add images if available
        if (data.images && (data.images.front || data.images.rear)) {
            html += '<div class="shipment-images"><h3>Shipment Images</h3>';
            if (data.images.front) {
                html += `<img src="${data.images.front}" alt="Front view" class="shipment-image" onclick="window.open(this.src)">`;
            }
            if (data.images.rear) {
                html += `<img src="${data.images.rear}" alt="Rear view" class="shipment-image" onclick="window.open(this.src)">`;
            }
            html += '</div>';
        }
        
        // QR code
        if (data.qr_code) {
            html += `
                <div class="qr-code">
                    <h3>QR Code</h3>
                    <img src="${data.qr_code}" alt="QR Code" class="qr-image">
                </div>
            `;
        }
        
        html += '</div>';
        resultDiv.innerHTML = html;
        
    } catch (error) {
        resultDiv.innerHTML = `
            <div class="error">
                <h3>Tracking Not Found</h3>
                <p>The tracking number ${tracking} could not be found.</p>
                <p>Please check the number and try again.</p>
                <p><a href="/">Return to Home</a></p>
            </div>
        `;
    }
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}