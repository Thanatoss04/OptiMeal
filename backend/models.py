"""
SQLAlchemy models for Restaurant System
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base


class Order(Base):
    """Order model - represents a customer order"""
    __tablename__ = 'orders'

    id = Column(Integer, primary_key=True, autoincrement=True)
    table = Column(String(50), nullable=False)
    status = Column(String(20), default='pending')  # pending, preparing, ready, completed
    waiter = Column(String(100), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Customer info stored as JSON
    customer_info = Column(JSON, nullable=True)
    # Health conditions stored as JSON
    health_conditions = Column(JSON, nullable=True)
    
    # Relationship to order items
    items = relationship('OrderItem', back_populates='order', cascade='all, delete-orphan')

    def to_dict(self):
        """Convert order to dictionary"""
        return {
            'id': self.id,
            'table': self.table,
            'status': self.status,
            'waiter': self.waiter,
            'timestamp': self.timestamp.strftime('%H:%M:%S') if self.timestamp else None,
            'customerInfo': self.customer_info,
            'healthConditions': self.health_conditions,
            'items': [item.to_dict() for item in self.items]
        }


class OrderItem(Base):
    """Order item model - represents individual items in an order"""
    __tablename__ = 'order_items'

    id = Column(Integer, primary_key=True, autoincrement=True)
    order_id = Column(Integer, ForeignKey('orders.id'), nullable=False)
    
    # Item details
    menu_item_id = Column(Integer, nullable=False)
    name = Column(String(200), nullable=False)
    category = Column(String(100), nullable=True)
    price = Column(Float, default=0)
    quantity = Column(Integer, default=1)
    notes = Column(Text, nullable=True)
    
    # Nutritional info (cached from menu)
    calories = Column(Integer, default=0)
    protein = Column(Float, default=0)
    carbs = Column(Float, default=0)
    fat = Column(Float, default=0)
    sugar = Column(Float, default=0)
    
    # Relationship back to order
    order = relationship('Order', back_populates='items')

    def to_dict(self):
        """Convert item to dictionary"""
        return {
            'id': self.id,
            'menuItemId': self.menu_item_id,
            'name': self.name,
            'category': self.category,
            'price': self.price,
            'quantity': self.quantity,
            'notes': self.notes,
            'calories': self.calories,
            'protein': self.protein,
            'carbs': self.carbs,
            'fat': self.fat,
            'sugar': self.sugar
        }
