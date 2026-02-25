// Public tracking logic with backend integration

document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const trackingNumber = urlParams.get('number');
    
    if (trackingNumber) {
        loadTrackingInfo(trackingNumber);
        // Update page title
        document.title = `Tracking ${trackingNumber} - EukExpress`;
    }
    
    // Setup tracking form
    const trackForm = document.getElementById('tracking-form');
    if (trackForm) {
        trackForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const input = document.getElementById('tracking-input');
            const tracking = input.value.trim().toUpperCase();
            
            if (tracking) {
                // Show loading state
                const btn = trackForm.querySelector('button[type="submit"]');
                const originalText = btn.innerHTML;
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Tracking...';
                btn.disabled = true;
                
                // Redirect to tracking page
                window.location.href = `track.html?number=${tracking}`;
            }
        });
    }
});

async function loadTrackingInfo(tracking) {
    const resultDiv = document.getElementById('tracking-result');
    if (!resultDiv) return;
    
    resultDiv.innerHTML = '<div class="loading-container"><div class="loading-spinner"></div><p>Loading tracking information...</p></div>';
    
    try {
        // Call your backend API through the worker
        const response = await fetch(`/api/v1/public/track/${tracking}`);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Tracking number not found');
            }
            throw new Error('Failed to load tracking information');
        }
        
        const data = await response.json();
        
        // Format timeline
        const timeline = data.timeline || [];
        
        // Determine status color
        const statusColor = getStatusColor(data.status.current);
        
        let html = `
            <div class="tracking-header">
                <div class="tracking-number-container">
                    <h2>Shipment ${data.tracking}</h2>
                    <span class="status-badge ${statusColor}">${data.status.display}</span>
                </div>
                <div class="tracking-actions">
                    <button onclick="window.print()" class="btn btn-outline btn-sm">
                        <i class="fas fa-print"></i> Print
                    </button>
                    <button onclick="shareTracking('${data.tracking}')" class="btn btn-outline btn-sm">
                        <i class="fas fa-share-alt"></i> Share
                    </button>
                </div>
            </div>
            
            <div class="tracking-progress">
                <div class="progress-steps">
                    <div class="step ${data.status.current !== 'BOOKED' ? 'completed' : ''}">
                        <div class="step-icon"><i class="fas fa-check"></i></div>
                        <div class="step-label">Booked</div>
                    </div>
                    <div class="step ${data.status.current === 'IN_TRANSIT' || data.status.current === 'DELIVERED' ? 'completed' : ''}">
                        <div class="step-icon"><i class="fas fa-truck"></i></div>
                        <div class="step-label">In Transit</div>
                    </div>
                    <div class="step ${data.status.current === 'DELIVERED' ? 'completed' : ''}">
                        <div class="step-icon"><i class="fas fa-home"></i></div>
                        <div class="step-label">Delivered</div>
                    </div>
                </div>
            </div>
            
            <div class="tracking-grid">
                <div class="tracking-card">
                    <h3><i class="fas fa-route"></i> Route</h3>
                    <div class="route-info">
                        <div class="route-point">
                            <div class="point-label">From</div>
                            <div class="point-value">${data.route.origin}</div>
                        </div>
                        <div class="route-arrow"><i class="fas fa-arrow-right"></i></div>
                        <div class="route-point">
                            <div class="point-label">To</div>
                            <div class="point-value">${data.route.destination}</div>
                        </div>
                    </div>
                </div>
                
                <div class="tracking-card">
                    <h3><i class="fas fa-calendar-alt"></i> Dates</h3>
                    <div class="dates-grid">
                        <div class="date-item">
                            <span class="date-label">Shipped:</span>
                            <span class="date-value">${formatDate(data.dates.sending)}</span>
                        </div>
                        <div class="date-item">
                            <span class="date-label">Est. Delivery:</span>
                            <span class="date-value">${formatDate(data.dates.estimated)}</span>
                        </div>
                        ${data.dates.actual ? `
                        <div class="date-item">
                            <span class="date-label">Delivered:</span>
                            <span class="date-value">${formatDate(data.dates.actual)}</span>
                        </div>
                        ` : ''}
                    </div>
                </div>
            </div>
            
            <div class="tracking-details">
                <h3><i class="fas fa-info-circle"></i> Shipment Details</h3>
                <div class="details-grid">
                    <div class="detail-item">
                        <span class="detail-label">Sender:</span>
                        <span class="detail-value">${data.sender?.name || 'N/A'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Recipient:</span>
                        <span class="detail-value">${data.recipient?.name || 'N/A'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Weight:</span>
                        <span class="detail-value">${data.commodity?.weight ? data.commodity.weight + ' kg' : 'N/A'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Description:</span>
                        <span class="detail-value">${data.commodity?.description || 'N/A'}</span>
                    </div>
                </div>
            </div>
        `;
        
        // Add timeline if available
        if (timeline.length > 0) {
            html += `
                <div class="timeline-section">
                    <h3><i class="fas fa-history"></i> Tracking History</h3>
                    <div class="timeline">
            `;
            
            timeline.forEach(event => {
                html += `
                    <div class="timeline-event">
                        <div class="event-dot"></div>
                        <div class="event-content">
                            <div class="event-time">${new Date(event.timestamp).toLocaleString()}</div>
                            <div class="event-status">${event.display}</div>
                            ${event.location ? `<div class="event-location"><i class="fas fa-map-marker-alt"></i> ${event.location}</div>` : ''}
                        </div>
                    </div>
                `;
            });
            
            html += `
                    </div>
                </div>
            `;
        }
        
        // Add images if available
        if (data.images && (data.images.front || data.images.rear)) {
            html += `
                <div class="images-section">
                    <h3><i class="fas fa-images"></i> Shipment Images</h3>
                    <div class="image-gallery">
            `;
            
            if (data.images.front) {
                html += `<img src="${data.images.front}" alt="Front view" class="gallery-image" onclick="openImageModal(this.src)">`;
            }
            if (data.images.rear) {
                html += `<img src="${data.images.rear}" alt="Rear view" class="gallery-image" onclick="openImageModal(this.src)">`;
            }
            
            html += `
                    </div>
                </div>
            `;
        }
        
        // Add interventions if active
        if (data.interventions && Object.values(data.interventions).some(v => v)) {
            html += `
                <div class="interventions-section">
                    <h3><i class="fas fa-exclamation-triangle"></i> Active Interventions</h3>
                    <div class="interventions-list">
            `;
            
            if (data.interventions.customs_active) {
                html += `<div class="intervention-item"><i class="fas fa-customs"></i> Customs Hold</div>`;
            }
            if (data.interventions.security_active) {
                html += `<div class="intervention-item"><i class="fas fa-shield-alt"></i> Security Hold</div>`;
            }
            if (data.interventions.damage_reported) {
                html += `<div class="intervention-item"><i class="fas fa-exclamation-circle"></i> Damage Reported</div>`;
            }
            if (data.interventions.delay_active) {
                html += `<div class="intervention-item"><i class="fas fa-clock"></i> Delay</div>`;
            }
            
            html += `
                    </div>
                </div>
            `;
        }
        
        resultDiv.innerHTML = html;
        
    } catch (error) {
        resultDiv.innerHTML = `
            <div class="error-container">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Tracking Not Found</h3>
                <p>We couldn't find any shipment with tracking number <strong>${tracking}</strong>.</p>
                <p>Please check the number and try again.</p>
                <a href="/" class="btn btn-primary">Return to Home</a>
            </div>
        `;
    }
}

function getStatusColor(status) {
    const colors = {
        'BOOKED': 'status-info',
        'COLLECTED': 'status-info',
        'WAREHOUSE_PROCESSING': 'status-info',
        'TERMINAL_ARRIVAL': 'status-info',
        'EN_ROUTE': 'status-primary',
        'CUSTOMS_BOND': 'status-warning',
        'CUSTOMS_CLEARED': 'status-success',
        'SECURITY_HOLD': 'status-warning',
        'SECURITY_CLEARED': 'status-success',
        'DAMAGE_REPORTED': 'status-danger',
        'DAMAGE_RESOLVED': 'status-success',
        'RETURN_TO_SENDER': 'status-warning',
        'TRANSIT_EXCEPTION': 'status-warning',
        'DESTINATION_HUB': 'status-info',
        'WITH_COURIER': 'status-info',
        'DELIVERED': 'status-success'
    };
    return colors[status] || 'status-default';
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function shareTracking(tracking) {
    if (navigator.share) {
        navigator.share({
            title: 'EukExpress Tracking',
            text: `Track your shipment ${tracking}`,
            url: window.location.href
        }).catch(console.error);
    } else {
        // Fallback - copy to clipboard
        navigator.clipboard.writeText(window.location.href).then(() => {
            alert('Tracking link copied to clipboard!');
        });
    }
}

function openImageModal(src) {
    const modal = document.createElement('div');
    modal.className = 'image-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal" onclick="this.closest('.image-modal').remove()">&times;</span>
            <img src="${src}" alt="Shipment image">
        </div>
    `;
    document.body.appendChild(modal);
}

// Add modal styles
const modalStyle = document.createElement('style');
modalStyle.textContent = `
    .image-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.9);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .modal-content {
        position: relative;
        max-width: 90%;
        max-height: 90%;
    }
    
    .modal-content img {
        width: 100%;
        height: 100%;
        object-fit: contain;
    }
    
    .close-modal {
        position: absolute;
        top: -40px;
        right: 0;
        color: white;
        font-size: 30px;
        cursor: pointer;
    }
`;
document.head.appendChild(modalStyle);