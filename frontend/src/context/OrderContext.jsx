import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { orderApi } from '../services/api';
import { initSocket, subscribeToOrders, requestOrdersRefresh } from '../services/socket';

// Create the context
const OrderContext = createContext();

// Menu items - shared across all pages (kept locally for fast rendering)
export const menuItems = [
    {
        id: 1, name: 'Classic Burger', category: 'Main', price: 12, calories: 650, protein: 35, carbs: 45, fat: 38, sugar: 8,
        health: { diabetes: false, cholesterol: false, bloodPressure: false, sugarFree: false }, warning: 'High fat, high sodium'
    },
    {
        id: 2, name: 'Margherita Pizza', category: 'Main', price: 15, calories: 850, protein: 28, carbs: 95, fat: 32, sugar: 6,
        health: { diabetes: false, cholesterol: false, bloodPressure: false, sugarFree: true }, warning: 'High carbs, high sodium'
    },
    {
        id: 3, name: 'Carbonara Pasta', category: 'Main', price: 13, calories: 720, protein: 25, carbs: 85, fat: 28, sugar: 4,
        health: { diabetes: false, cholesterol: false, bloodPressure: false, sugarFree: true }, warning: 'High carbs, cream-based'
    },
    {
        id: 4, name: 'Caesar Salad', category: 'Starter', price: 8, calories: 320, protein: 12, carbs: 18, fat: 22, sugar: 3,
        health: { diabetes: true, cholesterol: false, bloodPressure: true, sugarFree: true }, warning: 'Dressing may be high in fat'
    },
    {
        id: 5, name: 'Tomato Soup', category: 'Starter', price: 6, calories: 180, protein: 4, carbs: 28, fat: 6, sugar: 12,
        health: { diabetes: true, cholesterol: true, bloodPressure: true, sugarFree: false }, warning: 'Contains natural sugars'
    },
    {
        id: 6, name: 'Grilled Steak', category: 'Main', price: 25, calories: 480, protein: 52, carbs: 2, fat: 28, sugar: 0,
        health: { diabetes: true, cholesterol: false, bloodPressure: true, sugarFree: true }, warning: 'High in saturated fat'
    },
    {
        id: 7, name: 'Truffle Fries', category: 'Side', price: 5, calories: 420, protein: 5, carbs: 52, fat: 22, sugar: 1,
        health: { diabetes: false, cholesterol: false, bloodPressure: false, sugarFree: true }, warning: 'Fried, high carbs'
    },
    {
        id: 8, name: 'Gelato', category: 'Dessert', price: 6, calories: 280, protein: 4, carbs: 38, fat: 12, sugar: 28,
        health: { diabetes: false, cholesterol: false, bloodPressure: true, sugarFree: false }, warning: 'Very high sugar content'
    },
    {
        id: 9, name: 'Tiramisu', category: 'Dessert', price: 7, calories: 450, protein: 6, carbs: 48, fat: 26, sugar: 32,
        health: { diabetes: false, cholesterol: false, bloodPressure: false, sugarFree: false }, warning: 'Very high sugar, caffeine'
    },
    {
        id: 10, name: 'Craft Soda', category: 'Drink', price: 3, calories: 150, protein: 0, carbs: 38, fat: 0, sugar: 38,
        health: { diabetes: false, cholesterol: true, bloodPressure: true, sugarFree: false }, warning: 'Very high sugar'
    },
    {
        id: 11, name: 'Espresso', category: 'Drink', price: 4, calories: 5, protein: 0, carbs: 1, fat: 0, sugar: 0,
        health: { diabetes: true, cholesterol: true, bloodPressure: false, sugarFree: true }, warning: 'Caffeine may affect BP'
    },
    {
        id: 12, name: 'Wine Glass', category: 'Drink', price: 9, calories: 125, protein: 0, carbs: 4, fat: 0, sugar: 1,
        health: { diabetes: true, cholesterol: true, bloodPressure: false, sugarFree: true }, warning: 'Alcohol - consult doctor'
    },
];

// Provider component
export function OrderProvider({ children }) {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState(null);

    // Track ready order notifications
    const [readyNotifications, setReadyNotifications] = useState([]);
    const previousOrdersRef = useRef([]);

    // Fetch orders from API
    const fetchOrders = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await orderApi.getAll();
            setOrders(data);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch orders:', err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Initialize socket and fetch initial orders
    useEffect(() => {
        // Initialize socket connection
        initSocket(
            () => setIsConnected(true),
            () => setIsConnected(false)
        );

        // Subscribe to real-time events
        const unsubscribe = subscribeToOrders({
            onOrderCreated: (order) => {
                setOrders(prev => [order, ...prev]);
            },
            onOrderUpdated: ({ order }) => {
                setOrders(prev => prev.map(o => o.id === order.id ? order : o));
            },
            onOrderDeleted: ({ orderId }) => {
                setOrders(prev => prev.filter(o => o.id !== orderId));
            },
            onOrdersRefresh: (allOrders) => {
                setOrders(allOrders);
            }
        });

        // Fetch initial orders
        fetchOrders();

        return () => {
            unsubscribe();
        };
    }, [fetchOrders]);

    // Detect when orders become ready (for notifications)
    useEffect(() => {
        const prevOrders = previousOrdersRef.current;

        const newlyReady = orders.filter(order => {
            const prevOrder = prevOrders.find(p => p.id === order.id);
            return prevOrder && prevOrder.status !== 'ready' && order.status === 'ready';
        });

        if (newlyReady.length > 0) {
            setReadyNotifications(prev => [
                ...prev,
                ...newlyReady.map(order => ({
                    id: Date.now() + Math.random(),
                    orderId: order.id,
                    table: order.table,
                    items: order.items,
                    timestamp: new Date().toLocaleTimeString()
                }))
            ]);
        }

        previousOrdersRef.current = orders;
    }, [orders]);

    // Dismiss a notification
    const dismissNotification = useCallback((notificationId) => {
        setReadyNotifications(prev => prev.filter(n => n.id !== notificationId));
    }, []);

    // Dismiss all notifications
    const dismissAllNotifications = useCallback(() => {
        setReadyNotifications([]);
    }, []);

    // Add a new order via API
    const addOrder = useCallback(async (orderData) => {
        try {
            await orderApi.create(orderData);
            // Note: order will be added via Socket.IO event
            return true;
        } catch (err) {
            console.error('Failed to create order:', err);
            setError(err.message);
            return false;
        }
    }, []);

    // Update order status via API
    const updateOrderStatus = useCallback(async (orderId, newStatus) => {
        try {
            await orderApi.updateStatus(orderId, newStatus);
            // Note: order will be updated via Socket.IO event
        } catch (err) {
            console.error('Failed to update order status:', err);
            setError(err.message);
        }
    }, []);

    // Delete order via API
    const deleteOrder = useCallback(async (orderId) => {
        try {
            await orderApi.delete(orderId);
            // Note: order will be removed via Socket.IO event
        } catch (err) {
            console.error('Failed to delete order:', err);
            setError(err.message);
        }
    }, []);

    // Get orders by status
    const getOrdersByStatus = useCallback((status) => {
        return orders.filter(order => order.status === status);
    }, [orders]);

    // Get stats
    const getStats = useCallback(() => ({
        total: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        preparing: orders.filter(o => o.status === 'preparing').length,
        ready: orders.filter(o => o.status === 'ready').length,
        completed: orders.filter(o => o.status === 'completed').length,
    }), [orders]);

    // Get health condition stats
    const getHealthStats = useCallback(() => {
        const ordersWithHealth = orders.filter(o => o.healthConditions);
        return {
            totalWithConditions: ordersWithHealth.filter(o =>
                o.healthConditions.diabetes || o.healthConditions.cholesterol ||
                o.healthConditions.bloodPressure || o.healthConditions.sugarFree
            ).length,
            diabetes: ordersWithHealth.filter(o => o.healthConditions.diabetes).length,
            cholesterol: ordersWithHealth.filter(o => o.healthConditions.cholesterol).length,
            bloodPressure: ordersWithHealth.filter(o => o.healthConditions.bloodPressure).length,
            sugarFree: ordersWithHealth.filter(o => o.healthConditions.sugarFree).length,
        };
    }, [orders]);

    // Get age statistics from orders
    const getAgeStats = useCallback(() => {
        const ordersWithAge = orders.filter(o => o.customerInfo && typeof o.customerInfo.avgAge === 'number');
        if (ordersWithAge.length === 0) return { avgAge: 0, children: 0, teens: 0, adults: 0, seniors: 0, totalPeople: 0 };

        let totalAge = 0;
        let children = 0, teens = 0, adults = 0, seniors = 0, totalPeople = 0;

        ordersWithAge.forEach(o => {
            const age = o.customerInfo.avgAge;
            const people = (o.customerInfo.adults || 0) + (o.customerInfo.children || 0);
            totalAge += age * people;
            totalPeople += people;

            if (age < 12) children += people;
            else if (age >= 12 && age < 18) teens += people;
            else if (age >= 18 && age < 65) adults += people;
            else seniors += people;
        });

        return {
            avgAge: totalPeople > 0 ? Math.round(totalAge / totalPeople) : 0,
            children,
            teens,
            adults,
            seniors,
            totalPeople
        };
    }, [orders]);

    // Get food waste prediction stats
    const getFoodWasteStats = useCallback(() => {
        let goodPortions = 0, excessPortions = 0, lightPortions = 0;
        let totalCaloriesOrdered = 0, recommendedCalories = 0;

        orders.forEach(o => {
            if (!o.items || !o.customerInfo) return;

            const orderedCal = o.items.reduce((sum, item) => sum + ((item.calories || 0) * (item.quantity || 1)), 0);
            totalCaloriesOrdered += orderedCal;

            const age = o.customerInfo.avgAge || 30;
            const adults = o.customerInfo.adults || 1;
            const children = o.customerInfo.children || 0;

            let adultCal = 700;
            if (age < 12) adultCal = 400;
            else if (age >= 12 && age < 18) adultCal = 550;
            else if (age >= 18 && age < 30) adultCal = 750;
            else if (age >= 30 && age < 50) adultCal = 700;
            else if (age >= 50 && age < 65) adultCal = 600;
            else if (age >= 65) adultCal = 500;

            const recCal = (adults * adultCal) + (children * 400);
            recommendedCalories += recCal;

            const ratio = orderedCal / recCal;
            if (ratio >= 0.6 && ratio <= 1.2) goodPortions++;
            else if (ratio > 1.2) excessPortions++;
            else lightPortions++;
        });

        return {
            goodPortions,
            excessPortions,
            lightPortions,
            potentialWaste: Math.max(0, totalCaloriesOrdered - recommendedCalories),
            totalOrders: orders.length
        };
    }, [orders]);

    // Refresh orders from API
    const refreshOrders = useCallback(() => {
        fetchOrders();
        requestOrdersRefresh();
    }, [fetchOrders]);

    const value = {
        orders,
        isLoading,
        isConnected,
        error,
        addOrder,
        updateOrderStatus,
        deleteOrder,
        getOrdersByStatus,
        getStats,
        getHealthStats,
        getAgeStats,
        getFoodWasteStats,
        refreshOrders,
        readyNotifications,
        dismissNotification,
        dismissAllNotifications
    };

    return (
        <OrderContext.Provider value={value}>
            {children}
        </OrderContext.Provider>
    );
}

// Custom hook to use the context
export function useOrders() {
    const context = useContext(OrderContext);
    if (!context) {
        throw new Error('useOrders must be used within an OrderProvider');
    }
    return context;
}
