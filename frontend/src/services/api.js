/**
 * API Service for Restaurant Backend
 * Handles all HTTP requests to the Flask server
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Generic fetch wrapper with error handling
 */
async function fetchApi(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    const response = await fetch(url, { ...defaultOptions, ...options });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
}

/**
 * Order API functions
 */
export const orderApi = {
    /**
     * Get all orders
     */
    getAll: () => fetchApi('/orders'),

    /**
     * Create a new order
     */
    create: (orderData) => fetchApi('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
    }),

    /**
     * Update order status
     */
    updateStatus: (orderId, status) => fetchApi(`/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
    }),

    /**
     * Delete an order
     */
    delete: (orderId) => fetchApi(`/orders/${orderId}`, {
        method: 'DELETE',
    }),
};

/**
 * Menu API functions
 */
export const menuApi = {
    /**
     * Get all menu items
     */
    getAll: () => fetchApi('/menu'),
};

/**
 * Stats API functions
 */
export const statsApi = {
    /**
     * Get dashboard statistics
     */
    getStats: () => fetchApi('/stats'),
};

/**
 * Health check
 */
export const healthCheck = () => fetchApi('/health');

export default {
    orders: orderApi,
    menu: menuApi,
    stats: statsApi,
    healthCheck,
};
