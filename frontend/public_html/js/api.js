// API client for all backend endpoints

const API_BASE = '/api/v1';

const api = {
    // Authentication
    login: (credentials) => fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
    }),

    logout: () => fetch(`${API_BASE}/auth/logout`, { method: 'POST' }),

    // Dashboard (Layer 1)
    getDashboard: (token) => fetch(`${API_BASE}/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
    }),

    // Shipment History (Layer 2)
    getShipments: (token, params) => {
        const queryString = new URLSearchParams(params).toString();
        return fetch(`${API_BASE}/shipments?${queryString}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
    },

    // Shipment Operations (Layer 3)
    getShipment: (token, tracking) => fetch(`${API_BASE}/shipments/${tracking}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    }),

    updateStatus: (token, tracking, data) => fetch(`${API_BASE}/shipments/${tracking}/status`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
    }),

    // Interventions
    toggleCustoms: (token, tracking, data) => fetch(`${API_BASE}/shipments/${tracking}/interventions/customs`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
    }),

    toggleSecurity: (token, tracking, data) => fetch(`${API_BASE}/shipments/${tracking}/interventions/security`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
    }),

    reportDamage: (token, tracking, data) => fetch(`${API_BASE}/shipments/${tracking}/interventions/damage`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
    }),

    initiateReturn: (token, tracking, data) => fetch(`${API_BASE}/shipments/${tracking}/interventions/return`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
    }),

    reportDelay: (token, tracking, data) => fetch(`${API_BASE}/shipments/${tracking}/interventions/delay`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
    }),

    // Communication
    sendMessage: (token, tracking, data) => fetch(`${API_BASE}/shipments/${tracking}/message`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
    }),

    // Create Shipment
    createShipment: (token, formData) => fetch(`${API_BASE}/shipments/create`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
    }),

    // Public Tracking
    trackPublic: (tracking) => fetch(`${API_BASE}/public/track/${tracking}`)
};