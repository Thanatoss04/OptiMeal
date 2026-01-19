import { useEffect } from 'react';
import {
    UtensilsCrossed,
    ChefHat,
    Check,
    Clock,
    Flame,
    Bell,
    RefreshCw,
    LogOut,
    User
} from 'lucide-react';
import { useOrders } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';

function KitchenPage() {
    const { getOrdersByStatus, updateOrderStatus, refreshOrders } = useOrders();
    const { user, logout } = useAuth();

    // Auto-refresh orders every 2 seconds for real-time updates
    useEffect(() => {
        const interval = setInterval(() => {
            refreshOrders();
        }, 2000);
        return () => clearInterval(interval);
    }, [refreshOrders]);

    const pendingOrders = getOrdersByStatus('pending');
    const preparingOrders = getOrdersByStatus('preparing');
    const readyOrders = getOrdersByStatus('ready');

    const OrderColumn = ({ title, columnOrders, status, icon: Icon, onAction, actionLabel, actionIcon: ActionIcon }) => (
        <div className={`kitchen-column ${status}`}>
            <div className="kitchen-column-header">
                <div className="kitchen-column-title">
                    <Icon size={20} />
                    {title}
                </div>
                <span className="kitchen-column-count">{columnOrders.length}</span>
            </div>

            {columnOrders.length === 0 ? (
                <div className="empty-state">
                    <p className="text-muted">No orders</p>
                </div>
            ) : (
                columnOrders.map(order => (
                    <div key={order.id} className={`order-card ${status}`}>
                        <div className="order-card-header">
                            <span className="order-card-table">Table {order.table}</span>
                            <span className="order-card-time">
                                <Clock size={12} style={{ marginRight: '4px', display: 'inline' }} />
                                {order.timestamp}
                            </span>
                        </div>
                        <div className="order-card-items">
                            {order.items.map(item => (
                                <div key={item.id} className="order-card-item">
                                    <strong>{item.quantity}x</strong> {item.name}
                                    {item.notes && <div className="order-card-notes">📝 {item.notes}</div>}
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={() => onAction(order.id)}
                            className="btn btn-secondary btn-full"
                        >
                            <ActionIcon size={16} />
                            {actionLabel}
                        </button>
                    </div>
                ))
            )}
        </div>
    );

    return (
        <div className="app-container">
            {/* Header - Kitchen Only */}
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
                            Refresh Orders
                        </button>
                        <div className="role-badge kitchen">
                            <ChefHat size={18} />
                            Kitchen Interface
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
                <div className="kitchen-board">
                    <OrderColumn
                        title="Pending"
                        columnOrders={pendingOrders}
                        status="pending"
                        icon={Bell}
                        onAction={(id) => updateOrderStatus(id, 'preparing')}
                        actionLabel="Start Cooking"
                        actionIcon={Flame}
                    />
                    <OrderColumn
                        title="Preparing"
                        columnOrders={preparingOrders}
                        status="preparing"
                        icon={Flame}
                        onAction={(id) => updateOrderStatus(id, 'ready')}
                        actionLabel="Mark Ready"
                        actionIcon={Check}
                    />
                    <OrderColumn
                        title="Ready to Serve"
                        columnOrders={readyOrders}
                        status="ready"
                        icon={Check}
                        onAction={(id) => updateOrderStatus(id, 'completed')}
                        actionLabel="Complete Order"
                        actionIcon={Check}
                    />
                </div>
            </div>
        </div>
    );
}

export default KitchenPage;
