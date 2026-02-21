// Layer 1: Dashboard logic

document.addEventListener('DOMContentLoaded', async function() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
    
    await loadDashboardStats();
    await loadRecentActivity();
});

async function loadDashboardStats() {
    try {
        const token = localStorage.getItem('token');
        const response = await api.getDashboard(token);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.detail || 'Failed to load dashboard');
        }
        
        const stats = data.stats;
        
        // Update stats cards
        document.getElementById('active-shipments').textContent = stats.active_shipments || 0;
        document.getElementById('today-shipments').textContent = stats.today_shipments || 0;
        document.getElementById('delayed-count').textContent = stats.delayed_count || 0;
        document.getElementById('customs-bond-count').textContent = stats.customs_bond_count || 0;
        document.getElementById('damage-reported-count').textContent = stats.damage_reported_count || 0;
        document.getElementById('security-hold-count').textContent = stats.security_hold_count || 0;
        document.getElementById('attention-required').textContent = stats.attention_required || 0;
        
        // Format revenue
        const revenueEl = document.getElementById('revenue-month');
        if (revenueEl) {
            revenueEl.textContent = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(stats.revenue_month || 0);
        }
    } catch (error) {
        console.error('Failed to load dashboard stats:', error);
        showError('Failed to load dashboard statistics');
    }
}

async function loadRecentActivity() {
    try {
        const token = localStorage.getItem('token');
        const response = await api.getDashboard(token);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.detail || 'Failed to load activity');
        }
        
        const activity = data.recent_activity || [];
        
        const tbody = document.getElementById('recent-activity-body');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        activity.forEach(item => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td><a href="operations.html?tracking=${item.tracking}">${item.tracking}</a></td>
                <td>${item.event_display || item.event}</td>
                <td>${new Date(item.timestamp).toLocaleString()}</td>
                <td>${item.location || 'N/A'}</td>
                <td><button class="btn-view" onclick="viewShipment('${item.tracking}')">View</button></td>
            `;
        });
    } catch (error) {
        console.error('Failed to load recent activity:', error);
    }
}

function viewShipment(tracking) {
    window.location.href = `operations.html?tracking=${tracking}`;
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