import { useState, useEffect } from 'react';
import {
    UtensilsCrossed,
    Users,
    Plus,
    X,
    Heart,
    UserPlus,
    CheckCircle,
    LogOut,
    User,
    Bell,
    XCircle
} from 'lucide-react';
import { useOrders, menuItems } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';

// Health condition options
const HEALTH_OPTIONS = [
    { id: 'normal', label: '✅ Normal', icon: '✅' },
    { id: 'diabetes', label: '🩸 Diabetes', icon: '🩸' },
    { id: 'cholesterol', label: '🫀 Cholesterol', icon: '🫀' },
    { id: 'bloodPressure', label: '💓 Blood Pressure', icon: '💓' },
    { id: 'sugarFree', label: '🍬 Sugar Sensitive', icon: '🍬' }
];

function WaiterPage() {
    const { addOrder, refreshOrders, readyNotifications, dismissNotification, dismissAllNotifications } = useOrders();
    const { user, logout } = useAuth();
    const [currentOrder, setCurrentOrder] = useState({ table: '', items: [] });
    const [submitSuccess, setSubmitSuccess] = useState(false);

    // Auto-refresh orders every 2 seconds to catch ready notifications
    useEffect(() => {
        const interval = setInterval(() => {
            refreshOrders();
        }, 2000);
        return () => clearInterval(interval);
    }, [refreshOrders]);

    // Individual customers list
    const [customers, setCustomers] = useState([
        { id: 1, age: 30, healthCondition: 'normal' }
    ]);

    // Add a new customer
    const addCustomer = () => {
        setCustomers(prev => [
            ...prev,
            { id: Date.now(), age: 30, healthCondition: 'normal' }
        ]);
    };

    // Remove a customer
    const removeCustomer = (customerId) => {
        if (customers.length > 1) {
            setCustomers(prev => prev.filter(c => c.id !== customerId));
        }
    };

    // Update customer info
    const updateCustomer = (customerId, field, value) => {
        setCustomers(prev => prev.map(c =>
            c.id === customerId ? { ...c, [field]: value } : c
        ));
    };

    // Get aggregated health conditions from all customers
    const getAggregatedHealthConditions = () => {
        const conditions = {
            diabetes: false,
            cholesterol: false,
            bloodPressure: false,
            sugarFree: false
        };
        customers.forEach(c => {
            if (c.healthCondition === 'diabetes') conditions.diabetes = true;
            if (c.healthCondition === 'cholesterol') conditions.cholesterol = true;
            if (c.healthCondition === 'bloodPressure') conditions.bloodPressure = true;
            if (c.healthCondition === 'sugarFree') conditions.sugarFree = true;
        });
        return conditions;
    };

    const healthConditions = getAggregatedHealthConditions();
    const hasHealthCondition = healthConditions.diabetes || healthConditions.cholesterol ||
        healthConditions.bloodPressure || healthConditions.sugarFree;

    // Check if item is suitable for any customer's health conditions
    const isItemSuitable = (item) => {
        if (!hasHealthCondition) return true;

        // Item is unsuitable if ANY customer has a condition the item doesn't support
        for (const customer of customers) {
            const condition = customer.healthCondition;
            if (condition === 'diabetes' && !item.health.diabetes) return false;
            if (condition === 'cholesterol' && !item.health.cholesterol) return false;
            if (condition === 'bloodPressure' && !item.health.bloodPressure) return false;
            if (condition === 'sugarFree' && !item.health.sugarFree) return false;
        }
        return true;
    };

    // Get recommended items based on all customers' health conditions
    const getRecommendedItems = () => {
        if (!hasHealthCondition) return [];
        return menuItems.filter(item => isItemSuitable(item));
    };

    // Get recommended items for a specific customer based on their health condition
    const getRecommendationsForCustomer = (customer) => {
        if (customer.healthCondition === 'normal') {
            return menuItems; // All items are suitable for normal condition
        }

        return menuItems.filter(item => {
            const condition = customer.healthCondition;
            if (condition === 'diabetes') return item.health.diabetes;
            if (condition === 'cholesterol') return item.health.cholesterol;
            if (condition === 'bloodPressure') return item.health.bloodPressure;
            if (condition === 'sugarFree') return item.health.sugarFree;
            return true;
        });
    };

    // Calculate recommended calories based on individual customers
    const getRecommendedCalories = () => {
        let totalCalories = 0;
        customers.forEach(customer => {
            const age = customer.age;
            let calories = 700;

            if (age < 12) calories = 400;
            else if (age >= 12 && age < 18) calories = 550;
            else if (age >= 18 && age < 30) calories = 750;
            else if (age >= 30 && age < 50) calories = 700;
            else if (age >= 50 && age < 65) calories = 600;
            else if (age >= 65) calories = 500;

            totalCalories += calories;
        });
        return totalCalories;
    };

    // Calculate current order calories
    const getCurrentCalories = () => {
        return currentOrder.items.reduce((sum, item) => sum + (item.calories * item.quantity), 0);
    };

    // Get portion recommendation status
    const getPortionStatus = () => {
        const recommended = getRecommendedCalories();
        const current = getCurrentCalories();
        const percentage = (current / recommended) * 100;

        if (percentage === 0) return { status: 'empty', message: 'Add items to see recommendation', color: 'gray' };
        if (percentage < 60) return { status: 'low', message: '⚠️ Order may be too light', color: 'yellow' };
        if (percentage >= 60 && percentage <= 120) return { status: 'good', message: '✅ Perfect portion size!', color: 'green' };
        if (percentage > 120 && percentage <= 150) return { status: 'high', message: '⚠️ Order is slightly heavy', color: 'yellow' };
        return { status: 'excess', message: '🚫 Too much food - may lead to waste!', color: 'red' };
    };

    // Add item to current order
    const addItemToOrder = (item) => {
        setCurrentOrder(prev => ({
            ...prev,
            items: [...prev.items, { ...item, quantity: 1, notes: '', id: Date.now() }]
        }));
    };

    // Update order item
    const updateOrderItem = (itemId, field, value) => {
        setCurrentOrder(prev => ({
            ...prev,
            items: prev.items.map(item =>
                item.id === itemId ? { ...item, [field]: value } : item
            )
        }));
    };

    // Remove order item
    const removeOrderItem = (itemId) => {
        setCurrentOrder(prev => ({
            ...prev,
            items: prev.items.filter(item => item.id !== itemId)
        }));
    };

    // Calculate order total
    const getOrderTotal = () => {
        return currentOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    // Submit order
    const handleSubmitOrder = () => {
        if (!currentOrder.table.trim()) {
            alert('Please enter a table number');
            return;
        }
        if (currentOrder.items.length === 0) {
            alert('Please add at least one item');
            return;
        }

        const portionStatus = getPortionStatus();
        if (portionStatus.status === 'excess') {
            if (!confirm('⚠️ Your order seems too large and may lead to food waste. Proceed anyway?')) {
                return;
            }
        }

        // Create customerInfo from customers list for backwards compatibility
        const avgAge = Math.round(customers.reduce((sum, c) => sum + c.age, 0) / customers.length);

        const success = addOrder({
            table: currentOrder.table,
            items: currentOrder.items,
            customers: customers, // New: individual customer data
            customerInfo: {
                numberOfPeople: customers.length,
                adults: customers.filter(c => c.age >= 18).length,
                children: customers.filter(c => c.age < 18).length,
                avgAge: avgAge
            },
            healthConditions: getAggregatedHealthConditions()
        });

        if (success) {
            setCurrentOrder({ table: '', items: [] });
            setCustomers([{ id: 1, age: 30, healthCondition: 'normal' }]);
            setSubmitSuccess(true);
            setTimeout(() => setSubmitSuccess(false), 3000);
        }
    };

    const portionStatus = getPortionStatus();
    const recommendedItems = getRecommendedItems();

    return (
        <div className="app-container">
            {/* Header */}
            <header className="header">
                <div className="header-content">
                    <div className="logo">
                        <UtensilsCrossed className="logo-icon" size={28} />
                        <span>OptiMeal</span>
                    </div>
                    <div className="header-actions">
                        <div className="user-badge">
                            <User size={16} className="user-badge-icon" />
                            <span>{user?.name}</span>
                        </div>
                        <div className="role-badge waiter">
                            <UtensilsCrossed size={18} />
                            Waiter
                        </div>
                        <button onClick={logout} className="btn btn-secondary logout-btn">
                            <LogOut size={16} />
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="main-content">
                {/* Ready Order Notifications */}
                {readyNotifications.length > 0 && (
                    <div className="notification-container">
                        <div className="notification-header">
                            <div className="notification-title">
                                <Bell size={20} className="notification-bell" />
                                <span>Orders Ready to Serve ({readyNotifications.length})</span>
                            </div>
                            {readyNotifications.length > 1 && (
                                <button
                                    onClick={dismissAllNotifications}
                                    className="btn btn-secondary btn-sm"
                                >
                                    Dismiss All
                                </button>
                            )}
                        </div>
                        <div className="notification-list">
                            {readyNotifications.map(notification => (
                                <div key={notification.id} className="notification-item">
                                    <div className="notification-content">
                                        <div className="notification-table">
                                            🍽️ Table {notification.table}
                                        </div>
                                        <div className="notification-items">
                                            {notification.items.map((item, idx) => (
                                                <span key={idx} className="notification-item-tag">
                                                    {item.quantity}x {item.name}
                                                </span>
                                            ))}
                                        </div>
                                        <div className="notification-time">
                                            Ready at {notification.timestamp}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => dismissNotification(notification.id)}
                                        className="btn btn-icon notification-dismiss"
                                        title="Dismiss"
                                    >
                                        <XCircle size={20} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {submitSuccess && (
                    <div className="success-banner">
                        ✅ Order submitted successfully! Kitchen has been notified.
                    </div>
                )}

                {/* Table Number */}
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">📍 Table Information</h2>
                    </div>
                    <div className="input-group">
                        <label className="input-label">Table Number</label>
                        <input
                            type="text"
                            value={currentOrder.table}
                            onChange={(e) => setCurrentOrder(prev => ({ ...prev, table: e.target.value }))}
                            className="input"
                            placeholder="e.g., 1, 2, A1"
                            style={{ maxWidth: '200px' }}
                        />
                    </div>
                </div>

                {/* Customer List */}
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">
                            <Users size={20} style={{ marginRight: '8px', display: 'inline' }} />
                            Customers ({customers.length})
                        </h2>
                        <p className="card-subtitle">Add each customer's age and health condition</p>
                    </div>

                    <div className="customers-list">
                        {customers.map((customer, index) => (
                            <div key={customer.id} className="customer-row">
                                <div className="customer-number">#{index + 1}</div>

                                <div className="customer-field">
                                    <label className="input-label">Age</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="100"
                                        value={customer.age}
                                        onChange={(e) => updateCustomer(customer.id, 'age', parseInt(e.target.value) || 1)}
                                        className="input customer-age-input"
                                    />
                                </div>

                                <div className="customer-field customer-health-field">
                                    <label className="input-label">Health Condition</label>
                                    <div className="health-options">
                                        {HEALTH_OPTIONS.map(option => (
                                            <button
                                                key={option.id}
                                                type="button"
                                                className={`health-option-btn ${customer.healthCondition === option.id ? 'active' : ''}`}
                                                onClick={() => updateCustomer(customer.id, 'healthCondition', option.id)}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {customers.length > 1 && (
                                    <button
                                        onClick={() => removeCustomer(customer.id)}
                                        className="btn btn-icon btn-danger customer-remove"
                                        title="Remove customer"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    <button onClick={addCustomer} className="btn btn-secondary mt-md">
                        <UserPlus size={18} />
                        Add Customer
                    </button>

                    {/* Portion Indicator */}
                    <div className={`portion-indicator ${portionStatus.color}`} style={{ marginTop: '1.5rem' }}>
                        <div className="portion-bar-container">
                            <div className="portion-bar-label">
                                <span>Recommended: {getRecommendedCalories()} cal ({customers.length} people)</span>
                                <span>Current: {getCurrentCalories()} cal</span>
                            </div>
                            <div className="portion-bar-track">
                                <div
                                    className="portion-bar-fill"
                                    style={{
                                        width: `${Math.min((getCurrentCalories() / getRecommendedCalories()) * 100, 100)}%`,
                                        backgroundColor: portionStatus.color === 'green' ? '#22c55e' :
                                            portionStatus.color === 'yellow' ? '#eab308' :
                                                portionStatus.color === 'red' ? '#ef4444' : '#6b7280'
                                    }}
                                />
                            </div>
                        </div>
                        <div className="portion-message">{portionStatus.message}</div>
                    </div>
                </div>

                {/* Health Summary & Per-Person Recommendations */}
                <div className="card health-card">
                    <div className="card-header">
                        <h2 className="card-title">
                            <Heart size={20} style={{ marginRight: '8px', display: 'inline', color: '#ef4444' }} />
                            Food Recommendations by Customer
                        </h2>
                        <p className="card-subtitle">Personalized recommendations based on each customer's health condition</p>
                    </div>

                    <div className="per-customer-recommendations">
                        {customers.map((customer, index) => {
                            const customerRecommendations = getRecommendationsForCustomer(customer);
                            const healthOption = HEALTH_OPTIONS.find(h => h.id === customer.healthCondition);

                            return (
                                <div key={customer.id} className="customer-recommendation-card">
                                    <div className="customer-rec-header">
                                        <span className="customer-rec-number">Customer #{index + 1}</span>
                                        <span className="customer-rec-info">
                                            Age: {customer.age} | {healthOption?.label}
                                        </span>
                                    </div>
                                    <div className="customer-rec-title">
                                        <CheckCircle size={14} style={{ color: '#22c55e' }} />
                                        Recommended ({customerRecommendations.length} items)
                                    </div>
                                    <div className="customer-rec-items">
                                        {customerRecommendations.slice(0, 6).map(item => (
                                            <span key={item.id} className="recommended-item-tag">
                                                {item.name}
                                            </span>
                                        ))}
                                        {customerRecommendations.length > 6 && (
                                            <span className="recommended-item-tag more">+{customerRecommendations.length - 6} more</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {hasHealthCondition && (
                        <div className="health-recommendations" style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
                            <h4 className="recommendations-title">
                                <CheckCircle size={16} style={{ color: '#22c55e' }} />
                                Safe for Everyone ({recommendedItems.length} items)
                            </h4>
                            <div className="recommended-items-list">
                                {recommendedItems.map(item => (
                                    <span key={item.id} className="recommended-item-tag safe-for-all">
                                        {item.name}
                                    </span>
                                ))}
                                {recommendedItems.length === 0 && (
                                    <span className="text-muted">No items are safe for all customers' conditions</span>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Menu Grid */}
                <div className="card">
                    <div className="mb-lg">
                        <h3 className="card-title mb-md">
                            Menu Items
                            {hasHealthCondition && (
                                <span className="health-filter-note">
                                    (🟢 Suitable for all customers)
                                </span>
                            )}
                        </h3>
                        <div className="menu-grid">
                            {menuItems.map(item => {
                                const suitable = isItemSuitable(item);
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => addItemToOrder(item)}
                                        className={`menu-item ${hasHealthCondition ? (suitable ? 'health-suitable' : 'health-unsuitable') : ''}`}
                                    >
                                        {hasHealthCondition && (
                                            <div className={`health-badge ${suitable ? 'suitable' : 'unsuitable'}`}>
                                                {suitable ? '✓ Safe' : '⚠ Caution'}
                                            </div>
                                        )}
                                        <div className="menu-item-category">{item.category}</div>
                                        <div className="menu-item-name">{item.name}</div>
                                        <div className="menu-item-price">${item.price}</div>
                                        <div className="menu-item-nutrition">
                                            <span className="nutrition-item calories">{item.calories} cal</span>
                                            <span className="nutrition-item protein">P: {item.protein}g</span>
                                            <span className="nutrition-item carbs">C: {item.carbs}g</span>
                                            <span className="nutrition-item fat">F: {item.fat}g</span>
                                        </div>
                                        {hasHealthCondition && !suitable && item.warning && (
                                            <div className="menu-item-warning">
                                                ⚠️ {item.warning}
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Current Order */}
                    {currentOrder.items.length > 0 && (
                        <div>
                            <div className="flex justify-between items-center mb-md">
                                <h3 className="card-title">Current Order</h3>
                                <div className="order-summary">
                                    <span className="text-muted">
                                        Total: <strong style={{ color: 'var(--color-accent-primary)', fontSize: '1.25rem' }}>
                                            ${getOrderTotal()}
                                        </strong>
                                    </span>
                                    <span className="calorie-total">{getCurrentCalories()} cal</span>
                                </div>
                            </div>

                            {currentOrder.items.map(item => (
                                <div key={item.id} className="order-item">
                                    <div className="order-item-header">
                                        <span className="order-item-name">
                                            {item.name} - ${item.price}
                                            <span className="order-item-calories">({item.calories * item.quantity} cal)</span>
                                        </span>
                                        <button
                                            onClick={() => removeOrderItem(item.id)}
                                            className="btn btn-icon btn-danger"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                    <div className="order-item-controls">
                                        <div className="order-item-control">
                                            <label className="input-label">Qty</label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) => updateOrderItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                                                className="input"
                                            />
                                        </div>
                                        <div className="order-item-control" style={{ flex: 2 }}>
                                            <label className="input-label">Special Notes</label>
                                            <input
                                                type="text"
                                                value={item.notes}
                                                onChange={(e) => updateOrderItem(item.id, 'notes', e.target.value)}
                                                className="input"
                                                placeholder="e.g., no onions, extra cheese"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <button
                                onClick={handleSubmitOrder}
                                className={`btn btn-lg btn-full mt-lg ${portionStatus.status === 'excess' ? 'btn-warning' : 'btn-primary'}`}
                            >
                                <Plus size={20} />
                                Submit Order to Kitchen
                            </button>
                        </div>
                    )}

                    {currentOrder.items.length === 0 && (
                        <div className="empty-state">
                            <div className="empty-state-icon">🍽️</div>
                            <p>Select menu items to create an order</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default WaiterPage;
