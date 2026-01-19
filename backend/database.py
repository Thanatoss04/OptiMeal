"""
Database configuration and initialization for Restaurant System
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os

# Database file path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE_PATH = os.path.join(BASE_DIR, 'restaurant.db')
DATABASE_URL = f'sqlite:///{DATABASE_PATH}'

# Create engine
engine = create_engine(DATABASE_URL, echo=False, connect_args={'check_same_thread': False})

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()

def init_db():
    """Initialize database tables"""
    from models import Order, OrderItem
    Base.metadata.create_all(bind=engine)
    print(f"Database initialized at: {DATABASE_PATH}")

def get_db():
    """Get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
