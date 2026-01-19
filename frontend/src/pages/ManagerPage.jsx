import { useEffect } from 'react';
import {
    UtensilsCrossed,
    BarChart3,
    Trash2,
    RefreshCw,
    Heart,
    LogOut,
    User
} from 'lucide-react';
import { useOrders } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';

function ManagerPage() {
    const { orders, getStats, getHealthStats, getAgeStats, getFoodWasteStats, deleteOrder, refreshOrders } = useOrders();
    const { user, logout } = useAuth();
    const stats = getStats();
    const healthStats = getHealthStats();
    const ageStats = getAgeStats();
    const wasteStats = getFoodWasteStats();

    // Auto-refresh orders every 2 seconds for real-time updates
    useEffect(() => {
        const interval = setInterval(() => {
            refreshOrders();
        }, 2000);
        return () => clearInterval(interval);
    }, [refreshOrders]);

    const getStatusBadge = (status) => {
        const badges = {
            pending: 'badge badge-pending',
            preparing: 'badge badge-preparing',
            ready: 'badge badge-ready',
            completed: 'badge badge-completed'
        };
        return badges[status] || 'badge';
    };

    return (
        <div className="app-container">
            {/* Header - Manager Only */}
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
                        <button onClick={refreshOrders} className="btn btn-secondary">
                            <RefreshCw size={16} />
                            Refresh
                        </button>
                        <div className="role-badge manager">
                            <BarChart3 size={18} />
                            Manager Dashboard
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
                {/* Order Stats Grid */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-label">Total Orders</div>
                        <div className="stat-value blue">{stats.total}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Pending</div>
                        <div className="stat-value red">{stats.pending}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Preparing</div>
                        <div className="stat-value yellow">{stats.preparing}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Ready</div>
                        <div className="stat-value green">{stats.ready}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Completed</div>
                        <div className="stat-value gray">{stats.completed}</div>
                    </div>
                </div>

                {/* Food Waste Analytics Card */}
                <div className="card waste-analytics-card">
                    <div className="card-header">
                        <h2 className="card-title">
                            🗑️ Food Waste Analytics
                        </h2>
                        <p className="card-subtitle">Predict and reduce food waste based on order patterns</p>
                    </div>

                    <div className="waste-stats-grid">
                        <div className="waste-stat-item">
                            <div className="waste-stat-icon">✅</div>
                            <div className="waste-stat-value green">{wasteStats.goodPortions}</div>
                            <div className="waste-stat-label">Good Portions</div>
                        </div>
                        <div className="waste-stat-item">
                            <div className="waste-stat-icon">⚠️</div>
                            <div className="waste-stat-value yellow">{wasteStats.lightPortions}</div>
                            <div className="waste-stat-label">Light Orders</div>
                        </div>
                        <div className="waste-stat-item">
                            <div className="waste-stat-icon">🚫</div>
                            <div className="waste-stat-value red">{wasteStats.excessPortions}</div>
                            <div className="waste-stat-label">Excess (Waste Risk)</div>
                        </div>
                        <div className="waste-stat-item">
                            <div className="waste-stat-icon">📊</div>
                            <div className="waste-stat-value blue">{Math.round(wasteStats.potentialWaste).toLocaleString()}</div>
                            <div className="waste-stat-label">Est. Excess Calories</div>
                        </div>
                    </div>
                </div>

                {/* Age Demographics Card */}
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">
                            👥 Age Demographics
                        </h2>
                        <p className="card-subtitle">Customer age distribution for better portion planning</p>
                    </div>

                    <div className="age-demographics-grid">
                        <div className="age-demo-item">
                            <div className="age-demo-value">{ageStats.avgAge}</div>
                            <div className="age-demo-label">Avg Age</div>
                        </div>
                        <div className="age-demo-item">
                            <div className="age-demo-value">{ageStats.totalPeople}</div>
                            <div className="age-demo-label">Total Guests</div>
                        </div>
                        <div className="age-demo-item">
                            <div className="age-demo-value">{ageStats.children}</div>
                            <div className="age-demo-label">Children</div>
                        </div>
                        <div className="age-demo-item">
                            <div className="age-demo-value">{ageStats.teens}</div>
                            <div className="age-demo-label">Teens</div>
                        </div>
                        <div className="age-demo-item">
                            <div className="age-demo-value">{ageStats.adults}</div>
                            <div className="age-demo-label">Adults</div>
                        </div>
                        <div className="age-demo-item">
                            <div className="age-demo-value">{ageStats.seniors}</div>
                            <div className="age-demo-label">Seniors</div>
                        </div>
                    </div>
                </div>

                {/* Health Statistics Card */}
                <div className="card health-stats-card">
                    <div className="card-header">
                        <h2 className="card-title">
                            <Heart size={20} style={{ marginRight: '8px', display: 'inline', color: '#ef4444' }} />
                            Customer Health Conditions
                        </h2>
                        <p className="card-subtitle">Tracking customers with lifestyle diseases</p>
                    </div>

                    <div className="health-stats-grid">
                        <div className="health-stat-item">
                            <span className="health-stat-icon">🩺</span>
                            <div className="health-stat-info">
                                <span className="health-stat-label">Total with Conditions</span>
                                <span className="health-stat-value">{healthStats.totalWithConditions}</span>
                            </div>
                        </div>
                        <div className="health-stat-item">
                            <span className="health-stat-icon">🩸</span>
                            <div className="health-stat-info">
                                <span className="health-stat-label">Diabetes</span>
                                <span className="health-stat-value">{healthStats.diabetes}</span>
                            </div>
                        </div>
                        <div className="health-stat-item">
                            <span className="health-stat-icon">🫀</span>
                            <div className="health-stat-info">
                                <span className="health-stat-label">Cholesterol</span>
                                <span className="health-stat-value">{healthStats.cholesterol}</span>
                            </div>
                        </div>
                        <div className="health-stat-item">
                            <span className="health-stat-icon">💓</span>
                            <div className="health-stat-info">
                                <span className="health-stat-label">Blood Pressure</span>
                                <span className="health-stat-value">{healthStats.bloodPressure}</span>
                            </div>
                        </div>
                        <div className="health-stat-item">
                            <span className="health-stat-icon">🍬</span>
                            <div className="health-stat-info">
                                <span className="health-stat-label">Sugar Sensitive</span>
                                <span className="health-stat-value">{healthStats.sugarFree}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Orders List */}
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">All Orders</h2>
                    </div>

                    {orders.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">📋</div>
                            <p>No orders yet</p>
                        </div>
                    ) : (
                        <div className="orders-list">
                            {orders.map(order => (
                                <div key={order.id} className="manager-order-card">
                                    <div className="manager-order-header">
                                        <div className="manager-order-info">
                                            <span className="manager-order-table">Table {order.table}</span>
                                            <span className="manager-order-waiter">by {order.waiter}</span>
                                            <span className={getStatusBadge(order.status)}>
                                                {order.status.toUpperCase()}
                                            </span>
                                            {order.healthConditions && (
                                                Object.entries(order.healthConditions).some(([k, v]) => v) && (
                                                    <span className="badge badge-health">🩺 Health</span>
                                                )
                                            )}
                                            {order.customerInfo && (
                                                <span className="badge badge-age">🎂 Age: {order.customerInfo.avgAge}</span>
                                            )}
                                        </div>
                                        <div className="manager-order-actions">
                                            <span className="text-muted">{order.timestamp}</span>
                                            <button
                                                onClick={() => deleteOrder(order.id)}
                                                className="btn btn-icon btn-danger"
                                                title="Delete Order"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="manager-order-items">
                                        {order.items.map(item => (
                                            <span key={item.id} className="manager-order-item">
                                                {item.quantity}x {item.name}
                                                {item.notes && <em> ({item.notes})</em>}
                                            </span>
                                        ))}
                                    </div>
                                    {/* Show health conditions if any */}
                                    {order.healthConditions && Object.entries(order.healthConditions).some(([k, v]) => v) && (
                                        <div className="manager-order-health">
                                            {order.healthConditions.diabetes && <span className="health-tag">🩸 Diabetes</span>}
                                            {order.healthConditions.cholesterol && <span className="health-tag">🫀 Cholesterol</span>}
                                            {order.healthConditions.bloodPressure && <span className="health-tag">💓 BP</span>}
                                            {order.healthConditions.sugarFree && <span className="health-tag">🍬 Sugar</span>}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ManagerPage;
