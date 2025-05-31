from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
import datetime

# Initialize SQLAlchemy
db = SQLAlchemy()

class User(db.Model, UserMixin):
    """User model for authentication and authorization"""
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    first_name = db.Column(db.String(50))
    last_name = db.Column(db.String(50))
    role = db.Column(db.String(20), default='user')  # user, admin, etc.
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    @property
    def password(self):
        raise AttributeError('password is not a readable attribute')
    
    @password.setter
    def password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def __repr__(self):
        return f'<User {self.username}>'


class Container(db.Model):
    """Container model representing shipping containers"""
    id = db.Column(db.Integer, primary_key=True)
    container_id = db.Column(db.String(20), unique=True, nullable=False)
    size = db.Column(db.String(10))  # Standard sizes: 20ft, 40ft, etc.
    container_type = db.Column(db.String(20))  # Dry, Refrigerated, Open top, etc.
    status = db.Column(db.String(20), default='In Transit')  # In Transit, In Yard, Delivered
    weight = db.Column(db.Float)  # Weight in kg
    origin_city = db.Column(db.String(50))
    origin_state = db.Column(db.String(50))
    destination_city = db.Column(db.String(50))
    destination_state = db.Column(db.String(50))
    departure_date = db.Column(db.DateTime)
    arrival_date = db.Column(db.DateTime)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    def to_dict(self):
        """Convert container to dictionary"""
        return {
            'id': self.id,
            'container_id': self.container_id,
            'size': self.size,
            'container_type': self.container_type,
            'status': self.status,
            'weight': self.weight,
            'origin_city': self.origin_city,
            'origin_state': self.origin_state,
            'destination_city': self.destination_city,
            'destination_state': self.destination_state,
            'departure_date': self.departure_date.isoformat() if self.departure_date else None,
            'arrival_date': self.arrival_date.isoformat() if self.arrival_date else None,
            'user_id': self.user_id,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
    
    def __repr__(self):
        return f'<Container {self.container_id}>'


class Container2(db.Model):
    """Container2 model specifically for dashboard use"""
    id = db.Column(db.Integer, primary_key=True)
    container_id = db.Column(db.String(20), unique=True, nullable=False)
    status = db.Column(db.String(20), default='In Transit')  # In Transit, At Yard, Delivered, Delayed
    destination = db.Column(db.String(100))
    arrival = db.Column(db.String(20))  # Date in YYYY-MM-DD format
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    def to_dict(self):
        """Convert container2 to dictionary"""
        return {
            'id': self.id,
            'container_id': self.container_id,
            'status': self.status,
            'destination': self.destination,
            'arrival': self.arrival,
            'user_id': self.user_id,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
    
    def __repr__(self):
        return f'<Container2 {self.container_id}>'


class Inventory(db.Model):
    """Inventory model for tracking items in containers"""
    id = db.Column(db.Integer, primary_key=True)
    inventory_id = db.Column(db.String(20), unique=True, nullable=False)
    container_id = db.Column(db.String(20), db.ForeignKey('container.container_id'))
    item_name = db.Column(db.String(100), nullable=False)
    quantity = db.Column(db.Integer, default=1)
    unit = db.Column(db.String(20), default='unit')  # kg, unit, box, etc.
    weight = db.Column(db.Float)  # Weight in kg
    volume = db.Column(db.Float)  # Volume in cubic meters
    item_type = db.Column(db.String(50))  # Electronics, Clothing, Food, etc.
    is_hazardous = db.Column(db.Boolean, default=False)
    is_fragile = db.Column(db.Boolean, default=False)
    is_perishable = db.Column(db.Boolean, default=False)
    expiry_date = db.Column(db.DateTime)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    def to_dict(self):
        """Convert inventory to dictionary"""
        return {
            'id': self.id,
            'inventory_id': self.inventory_id,
            'container_id': self.container_id,
            'item_name': self.item_name,
            'quantity': self.quantity,
            'unit': self.unit,
            'weight': self.weight,
            'volume': self.volume,
            'item_type': self.item_type,
            'is_hazardous': self.is_hazardous,
            'is_fragile': self.is_fragile,
            'is_perishable': self.is_perishable,
            'expiry_date': self.expiry_date.isoformat() if self.expiry_date else None,
            'user_id': self.user_id,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    def __repr__(self):
        return f'<Inventory {self.inventory_id}>'


class Hub(db.Model):
    """Hub model representing major logistics hubs/yards"""
    id = db.Column(db.Integer, primary_key=True)
    hub_id = db.Column(db.String(20), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    city = db.Column(db.String(50), nullable=False)
    state = db.Column(db.String(50), nullable=False)
    country = db.Column(db.String(50), nullable=False)
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    capacity = db.Column(db.Integer)  # Container capacity
    current_occupancy = db.Column(db.Integer, default=0)
    hub_type = db.Column(db.String(20))  # Port, Inland, Distribution Center
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    def to_dict(self):
        """Convert hub to dictionary"""
        return {
            'id': self.id,
            'hub_id': self.hub_id,
            'name': self.name,
            'city': self.city,
            'state': self.state,
            'country': self.country,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'capacity': self.capacity,
            'current_occupancy': self.current_occupancy,
            'hub_type': self.hub_type,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
    
    def __repr__(self):
        return f'<Hub {self.name}>'


class Route(db.Model):
    """Route model representing transportation routes between hubs"""
    id = db.Column(db.Integer, primary_key=True)
    route_id = db.Column(db.String(20), unique=True, nullable=False)
    origin_hub_id = db.Column(db.String(20), db.ForeignKey('hub.hub_id'))
    destination_hub_id = db.Column(db.String(20), db.ForeignKey('hub.hub_id'))
    distance_km = db.Column(db.Float, nullable=False)
    duration_hrs = db.Column(db.Float, nullable=False)
    transport_mode = db.Column(db.String(20))  # Road, Rail, Sea, Air
    cost_per_km = db.Column(db.Float)
    carbon_footprint = db.Column(db.Float)  # kg of CO2 per km
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    def to_dict(self):
        """Convert route to dictionary"""
        return {
            'id': self.id,
            'route_id': self.route_id,
            'origin_hub_id': self.origin_hub_id,
            'destination_hub_id': self.destination_hub_id,
            'distance_km': self.distance_km,
            'duration_hrs': self.duration_hrs,
            'transport_mode': self.transport_mode,
            'cost_per_km': self.cost_per_km,
            'carbon_footprint': self.carbon_footprint,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
    
    def __repr__(self):
        return f'<Route {self.route_id}>'


class ContainerJourney(db.Model):
    """ContainerJourney model tracking the journey of containers through different hubs"""
    id = db.Column(db.Integer, primary_key=True)
    journey_id = db.Column(db.String(20), unique=True, nullable=False)
    container_id = db.Column(db.String(20), db.ForeignKey('container.container_id'))
    origin_hub_id = db.Column(db.String(20), db.ForeignKey('hub.hub_id'))
    destination_hub_id = db.Column(db.String(20), db.ForeignKey('hub.hub_id'))
    current_hub_id = db.Column(db.String(20), db.ForeignKey('hub.hub_id'))
    departure_time = db.Column(db.DateTime)
    arrival_time = db.Column(db.DateTime)
    status = db.Column(db.String(20), default='Scheduled')  # Scheduled, In Transit, Arrived, Delayed
    route_id = db.Column(db.String(20), db.ForeignKey('route.route_id'))
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    def to_dict(self):
        """Convert container journey to dictionary"""
        return {
            'id': self.id,
            'journey_id': self.journey_id,
            'container_id': self.container_id,
            'origin_hub_id': self.origin_hub_id,
            'destination_hub_id': self.destination_hub_id,
            'current_hub_id': self.current_hub_id,
            'departure_time': self.departure_time.isoformat() if self.departure_time else None,
            'arrival_time': self.arrival_time.isoformat() if self.arrival_time else None,
            'status': self.status,
            'route_id': self.route_id,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
    
    def __repr__(self):
        return f'<ContainerJourney {self.journey_id}>'