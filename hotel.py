import React, { useState, useEffect } from 'react';
import { Clock, Users, ChefHat, BarChart3, Plus, Check, X, Eye } from 'lucide-react';

const RestaurantSystem = () => {
  const [view, setView] = useState('waiter');
  const [orders, setOrders] = useState([]);
  const [currentOrder, setCurrentOrder] = useState({ table: '', items: [] });
  const [newItem, setNewItem] = useState({ name: '', quantity: 1, notes: '' });

  const menuItems = [
    { id: 1, name: 'Burger', category: 'Main', price: 12 },
    { id: 2, name: 'Pizza', category: 'Main', price: 15 },
    { id: 3, name: 'Pasta', category: 'Main', price: 13 },
    { id: 4, name: 'Salad', category: 'Starter', price: 8 },
    { id: 5, name: 'Soup', category: 'Starter', price: 6 },
    { id: 6, name: 'Steak', category: 'Main', price: 25 },
    { id: 7, name: 'Fries', category: 'Side', price: 5 },
    { id: 8, name: 'Ice Cream', category: 'Dessert', price: 6 },
    { id: 9, name: 'Cake', category: 'Dessert', price: 7 },
    { id: 10, name: 'Soda', category: 'Drink', price: 3 },
  ];

  const addItemToOrder = (item) => {
    setCurrentOrder(prev => ({
      ...prev,
      items: [...prev.items, { ...item, quantity: 1, notes: '', id: Date.now() }]
    }));
  };

  const updateOrderItem = (itemId, field, value) => {
    setCurrentOrder(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === itemId ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeOrderItem = (itemId) => {
    setCurrentOrder(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
  };

  const submitOrder = () => {
    if (currentOrder.table && currentOrder.items.length > 0) {
      const newOrder = {
        id: Date.now(),
        table: currentOrder.table,
        items: currentOrder.items,
        status: 'pending',
        timestamp: new Date().toLocaleTimeString(),
        waiter: 'Waiter ' + Math.floor(Math.random() * 5 + 1)
      };
      setOrders(prev => [...prev, newOrder]);
      setCurrentOrder({ table: '', items: [] });
      alert('Order submitted successfully!');
    } else {
      alert('Please add table number and items');
    }
  };

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
  };

  const deleteOrder = (orderId) => {
    setOrders(prev => prev.filter(order => order.id !== orderId));
  };

  // Waiter Interface
  const WaiterView = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">New Order</h2>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Table Number</label>
          <input
            type="text"
            value={currentOrder.table}
            onChange={(e) => setCurrentOrder(prev => ({ ...prev, table: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter table number"
          />
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-800">Menu Items</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => addItemToOrder(item)}
                className="p-3 bg-blue-50 hover:bg-blue-100 rounded-lg text-left transition"
              >
                <div className="font-semibold text-gray-800">{item.name}</div>
                <div className="text-sm text-gray-600">${item.price}</div>
                <div className="text-xs text-gray-500">{item.category}</div>
              </button>
            ))}
          </div>
        </div>

        {currentOrder.items.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">Current Order</h3>
            <div className="space-y-3">
              {currentOrder.items.map(item => (
                <div key={item.id} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-800">{item.name}</span>
                    <button
                      onClick={() => removeOrderItem(item.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-600 mb-1">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateOrderItem(item.id, 'quantity', parseInt(e.target.value))}
                        className="w-full px-2 py-1 border border-gray-300 rounded"
                      />
                    </div>
                    <div className="flex-2">
                      <label className="block text-xs text-gray-600 mb-1">Special Notes</label>
                      <input
                        type="text"
                        value={item.notes}
                        onChange={(e) => updateOrderItem(item.id, 'notes', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded"
                        placeholder="e.g., no onions"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={submitOrder}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2"
            >
              <Plus size={20} />
              Submit Order
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // Kitchen Interface
  const KitchenView = () => {
    const pendingOrders = orders.filter(o => o.status === 'pending');
    const preparingOrders = orders.filter(o => o.status === 'preparing');
    const readyOrders = orders.filter(o => o.status === 'ready');

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <OrderColumn 
            title="Pending" 
            orders={pendingOrders} 
            color="red"
            onAction={(id) => updateOrderStatus(id, 'preparing')}
            actionLabel="Start Cooking"
          />
          <OrderColumn 
            title="Preparing" 
            orders={preparingOrders} 
            color="yellow"
            onAction={(id) => updateOrderStatus(id, 'ready')}
            actionLabel="Mark Ready"
          />
          <OrderColumn 
            title="Ready" 
            orders={readyOrders} 
            color="green"
            onAction={(id) => updateOrderStatus(id, 'completed')}
            actionLabel="Complete"
          />
        </div>
      </div>
    );
  };

  const OrderColumn = ({ title, orders, color, onAction, actionLabel }) => {
    const colorClasses = {
      red: 'bg-red-100 border-red-300',
      yellow: 'bg-yellow-100 border-yellow-300',
      green: 'bg-green-100 border-green-300'
    };

    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-bold mb-4 text-gray-800">{title} ({orders.length})</h3>
        <div className="space-y-3">
          {orders.map(order => (
            <div key={order.id} className={`border-2 ${colorClasses[color]} rounded-lg p-4`}>
              <div className="flex justify-between items-start mb-2">
                <div className="font-bold text-lg">Table {order.table}</div>
                <div className="text-sm text-gray-600">{order.timestamp}</div>
              </div>
              <div className="mb-3 space-y-1">
                {order.items.map(item => (
                  <div key={item.id} className="text-sm">
                    <span className="font-semibold">{item.quantity}x {item.name}</span>
                    {item.notes && <span className="text-gray-600 italic"> - {item.notes}</span>}
                  </div>
                ))}
              </div>
              <button
                onClick={() => onAction(order.id)}
                className="w-full bg-gray-800 hover:bg-gray-900 text-white py-2 rounded-lg flex items-center justify-center gap-2"
              >
                <Check size={16} />
                {actionLabel}
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Manager Interface
  const ManagerView = () => {
    const stats = {
      total: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      preparing: orders.filter(o => o.status === 'preparing').length,
      ready: orders.filter(o => o.status === 'ready').length,
      completed: orders.filter(o => o.status === 'completed').length,
    };

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard label="Total Orders" value={stats.total} color="blue" />
          <StatCard label="Pending" value={stats.pending} color="red" />
          <StatCard label="Preparing" value={stats.preparing} color="yellow" />
          <StatCard label="Ready" value={stats.ready} color="green" />
          <StatCard label="Completed" value={stats.completed} color="gray" />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">All Orders</h2>
          <div className="space-y-3">
            {orders.map(order => (
              <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-bold text-lg">Table {order.table}</span>
                    <span className="ml-3 text-sm text-gray-600">by {order.waiter}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      order.status === 'pending' ? 'bg-red-100 text-red-700' :
                      order.status === 'preparing' ? 'bg-yellow-100 text-yellow-700' :
                      order.status === 'ready' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {order.status.toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-500">{order.timestamp}</span>
                    <button
                      onClick={() => deleteOrder(order.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
                <div className="text-sm space-y-1">
                  {order.items.map(item => (
                    <div key={item.id} className="text-gray-700">
                      {item.quantity}x {item.name}
                      {item.notes && <span className="text-gray-500 italic"> ({item.notes})</span>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {orders.length === 0 && (
              <div className="text-center text-gray-500 py-8">No orders yet</div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const StatCard = ({ label, value, color }) => {
    const colorClasses = {
      blue: 'bg-blue-100 text-blue-700',
      red: 'bg-red-100 text-red-700',
      yellow: 'bg-yellow-100 text-yellow-700',
      green: 'bg-green-100 text-green-700',
      gray: 'bg-gray-100 text-gray-700'
    };

    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="text-sm text-gray-600 mb-1">{label}</div>
        <div className={`text-3xl font-bold ${colorClasses[color]}`}>{value}</div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg mb-6 p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-800">Restaurant Automation System</h1>
            <div className="flex gap-2">
              <button
                onClick={() => setView('waiter')}
                className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 ${
                  view === 'waiter' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                <Users size={20} />
                Waiter
              </button>
              <button
                onClick={() => setView('kitchen')}
                className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 ${
                  view === 'kitchen' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                <ChefHat size={20} />
                Kitchen
              </button>
              <button
                onClick={() => setView('manager')}
                className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 ${
                  view === 'manager' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                <BarChart3 size={20} />
                Manager
              </button>
            </div>
          </div>
        </div>

        {view === 'waiter' && <WaiterView />}
        {view === 'kitchen' && <KitchenView />}
        {view === 'manager' && <ManagerView />}
      </div>
    </div>
  );
};