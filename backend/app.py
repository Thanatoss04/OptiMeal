"""
Flask Backend for Restaurant Automation System
REST API + Socket.IO for real-time updates
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from datetime import datetime
import random
import os

from database import SessionLocal, init_db
from models import Order, OrderItem

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'restaurant-secret-key-2024')

# CORS origins - allow frontend URLs
FRONTEND_URL = os.environ.get('FRONTEND_URL', '')
cors_origins = ['http://localhost:5173', 'http://127.0.0.1:5173']
if FRONTEND_URL:
    cors_origins.append(FRONTEND_URL)

# Enable CORS for frontend
CORS(app, origins=cors_origins)

# Initialize Socket.IO
socketio = SocketIO(app, cors_allowed_origins=cors_origins)

# Menu items (matching frontend)
MENU_ITEMS = [
    {'id': 1, 'name': 'Classic Burger', 'category': 'Main', 'price': 12, 'calories': 650, 'protein': 35, 'carbs': 45, 'fat': 38, 'sugar': 8},
    {'id': 2, 'name': 'Margherita Pizza', 'category': 'Main', 'price': 15, 'calories': 850, 'protein': 28, 'carbs': 95, 'fat': 32, 'sugar': 6},
    {'id': 3, 'name': 'Carbonara Pasta', 'category': 'Main', 'price': 13, 'calories': 720, 'protein': 25, 'carbs': 85, 'fat': 28, 'sugar': 4},
    {'id': 4, 'name': 'Caesar Salad', 'category': 'Starter', 'price': 8, 'calories': 320, 'protein': 12, 'carbs': 18, 'fat': 22, 'sugar': 3},
    {'id': 5, 'name': 'Tomato Soup', 'category': 'Starter', 'price': 6, 'calories': 180, 'protein': 4, 'carbs': 28, 'fat': 6, 'sugar': 12},
    {'id': 6, 'name': 'Grilled Steak', 'category': 'Main', 'price': 25, 'calories': 480, 'protein': 52, 'carbs': 2, 'fat': 28, 'sugar': 0},
    {'id': 7, 'name': 'Truffle Fries', 'category': 'Side', 'price': 5, 'calories': 420, 'protein': 5, 'carbs': 52, 'fat': 22, 'sugar': 1},
    {'id': 8, 'name': 'Gelato', 'category': 'Dessert', 'price': 6, 'calories': 280, 'protein': 4, 'carbs': 38, 'fat': 12, 'sugar': 28},
    {'id': 9, 'name': 'Tiramisu', 'category': 'Dessert', 'price': 7, 'calories': 450, 'protein': 6, 'carbs': 48, 'fat': 26, 'sugar': 32},
    {'id': 10, 'name': 'Craft Soda', 'category': 'Drink', 'price': 3, 'calories': 150, 'protein': 0, 'carbs': 38, 'fat': 0, 'sugar': 38},
    {'id': 11, 'name': 'Espresso', 'category': 'Drink', 'price': 4, 'calories': 5, 'protein': 0, 'carbs': 1, 'fat': 0, 'sugar': 0},
    {'id': 12, 'name': 'Wine Glass', 'category': 'Drink', 'price': 9, 'calories': 125, 'protein': 0, 'carbs': 4, 'fat': 0, 'sugar': 1},
]


# ============ REST API ENDPOINTS ============

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'ok', 'message': 'Restaurant API is running'})


@app.route('/api/menu', methods=['GET'])
def get_menu():
    """Get all menu items"""
    return jsonify(MENU_ITEMS)


@app.route('/api/orders', methods=['GET'])
def get_orders():
    """Get all orders"""
    db = SessionLocal()
    try:
        orders = db.query(Order).order_by(Order.timestamp.desc()).all()
        return jsonify([order.to_dict() for order in orders])
    finally:
        db.close()


@app.route('/api/orders', methods=['POST'])
def create_order():
    """Create a new order"""
    data = request.json
    db = SessionLocal()
    try:
        # Create order
        order = Order(
            table=data.get('table', ''),
            status='pending',
            waiter=data.get('waiter', f'Waiter {random.randint(1, 5)}'),
            timestamp=datetime.utcnow(),
            customer_info=data.get('customerInfo'),
            health_conditions=data.get('healthConditions')
        )
        db.add(order)
        db.flush()  # Get the order ID

        # Add order items
        for item_data in data.get('items', []):
            item = OrderItem(
                order_id=order.id,
                menu_item_id=item_data.get('menuItemId', item_data.get('id', 0)),
                name=item_data.get('name', ''),
                category=item_data.get('category', ''),
                price=item_data.get('price', 0),
                quantity=item_data.get('quantity', 1),
                notes=item_data.get('notes', ''),
                calories=item_data.get('calories', 0),
                protein=item_data.get('protein', 0),
                carbs=item_data.get('carbs', 0),
                fat=item_data.get('fat', 0),
                sugar=item_data.get('sugar', 0)
            )
            db.add(item)

        db.commit()
        order_dict = order.to_dict()

        # Emit real-time event to all connected clients
        socketio.emit('order_created', order_dict)

        return jsonify(order_dict), 201
    except Exception as e:
        db.rollback()
        return jsonify({'error': str(e)}), 400
    finally:
        db.close()


@app.route('/api/orders/<int:order_id>/status', methods=['PUT'])
def update_order_status(order_id):
    """Update order status"""
    data = request.json
    new_status = data.get('status')
    
    if new_status not in ['pending', 'preparing', 'ready', 'completed']:
        return jsonify({'error': 'Invalid status'}), 400

    db = SessionLocal()
    try:
        order = db.query(Order).filter(Order.id == order_id).first()
        if not order:
            return jsonify({'error': 'Order not found'}), 404

        old_status = order.status
        order.status = new_status
        db.commit()
        order_dict = order.to_dict()

        # Emit real-time event for status update
        socketio.emit('order_updated', {
            'order': order_dict,
            'oldStatus': old_status,
            'newStatus': new_status
        })

        return jsonify(order_dict)
    finally:
        db.close()


@app.route('/api/orders/<int:order_id>', methods=['DELETE'])
def delete_order(order_id):
    """Delete an order"""
    db = SessionLocal()
    try:
        order = db.query(Order).filter(Order.id == order_id).first()
        if not order:
            return jsonify({'error': 'Order not found'}), 404

        db.delete(order)
        db.commit()

        # Emit real-time event for deletion
        socketio.emit('order_deleted', {'orderId': order_id})

        return jsonify({'message': 'Order deleted', 'orderId': order_id})
    finally:
        db.close()


@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get order statistics"""
    db = SessionLocal()
    try:
        orders = db.query(Order).all()
        
        stats = {
            'total': len(orders),
            'pending': len([o for o in orders if o.status == 'pending']),
            'preparing': len([o for o in orders if o.status == 'preparing']),
            'ready': len([o for o in orders if o.status == 'ready']),
            'completed': len([o for o in orders if o.status == 'completed']),
        }

        # Health stats
        orders_with_health = [o for o in orders if o.health_conditions]
        health_stats = {
            'diabetes': len([o for o in orders_with_health if o.health_conditions.get('diabetes')]),
            'cholesterol': len([o for o in orders_with_health if o.health_conditions.get('cholesterol')]),
            'bloodPressure': len([o for o in orders_with_health if o.health_conditions.get('bloodPressure')]),
            'sugarFree': len([o for o in orders_with_health if o.health_conditions.get('sugarFree')]),
        }

        return jsonify({
            'orderStats': stats,
            'healthStats': health_stats
        })
    finally:
        db.close()


# ============ SOCKET.IO EVENTS ============

@socketio.on('connect')
def handle_connect():
    """Handle client connection"""
    print(f'Client connected: {request.sid}')
    emit('connected', {'message': 'Connected to restaurant server'})


@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection"""
    print(f'Client disconnected: {request.sid}')


@socketio.on('request_refresh')
def handle_refresh_request():
    """Handle request for full data refresh"""
    db = SessionLocal()
    try:
        orders = db.query(Order).order_by(Order.timestamp.desc()).all()
        emit('orders_refresh', [order.to_dict() for order in orders])
    finally:
        db.close()


# ============ MAIN ============

if __name__ == '__main__':
    # Initialize database
    init_db()
    
    print("=" * 50)
    print("Restaurant Automation System - Backend Server")
    print("=" * 50)
    print("REST API: http://localhost:5000/api")
    print("Socket.IO: ws://localhost:5000")
    print("=" * 50)
    
    # Run with Socket.IO
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)
