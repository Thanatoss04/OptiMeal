/**
 * Socket.IO client service for real-time updates
 */
import { io } from 'socket.io-client';

// Socket instance (singleton)
let socket = null;

// Get socket URL from environment or use root path for proxy
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || '/';

/**
 * Initialize socket connection
 */
export function initSocket(onConnect, onDisconnect) {
    if (socket) {
        return socket;
    }

    // Connect to backend server
    socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
        console.log('Socket.IO connected');
        onConnect?.();
    });

    socket.on('disconnect', () => {
        console.log('Socket.IO disconnected');
        onDisconnect?.();
    });

    socket.on('connect_error', (error) => {
        console.error('Socket.IO connection error:', error);
    });

    return socket;
}

/**
 * Get the socket instance
 */
export function getSocket() {
    return socket;
}

/**
 * Subscribe to order events
 */
export function subscribeToOrders(callbacks) {
    if (!socket) {
        console.warn('Socket not initialized');
        return () => { };
    }

    const { onOrderCreated, onOrderUpdated, onOrderDeleted, onOrdersRefresh } = callbacks;

    if (onOrderCreated) {
        socket.on('order_created', onOrderCreated);
    }
    if (onOrderUpdated) {
        socket.on('order_updated', onOrderUpdated);
    }
    if (onOrderDeleted) {
        socket.on('order_deleted', onOrderDeleted);
    }
    if (onOrdersRefresh) {
        socket.on('orders_refresh', onOrdersRefresh);
    }

    // Return unsubscribe function
    return () => {
        if (onOrderCreated) socket.off('order_created', onOrderCreated);
        if (onOrderUpdated) socket.off('order_updated', onOrderUpdated);
        if (onOrderDeleted) socket.off('order_deleted', onOrderDeleted);
        if (onOrdersRefresh) socket.off('orders_refresh', onOrdersRefresh);
    };
}

/**
 * Request full orders refresh
 */
export function requestOrdersRefresh() {
    socket?.emit('request_refresh');
}

/**
 * Disconnect socket
 */
export function disconnectSocket() {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}

export default {
    initSocket,
    getSocket,
    subscribeToOrders,
    requestOrdersRefresh,
    disconnectSocket,
};
