"""
Database initialization script for the Container Yard Management System.
This script populates the database with initial data for testing.

Run this script after the app has been initialized to create test data.
"""
import os
import sys
from pathlib import Path
from datetime import datetime, timedelta
from flask import Flask
import random

# Add parent directory to path to fix import issues
sys.path.insert(0, str(Path(__file__).parent))

from models import db, User, Container, Inventory, Hub, Route, ContainerJourney, ContainerStatus, PriorityLevel, InventoryType

# Create Flask app
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(os.path.abspath(os.path.dirname(__file__)), '..', '..', 'instance', 'container_yard.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize app with database
db.init_app(app)

def create_test_users():
    """Create test users for the system"""
    print("Creating test users...")
    users = []
    
    # Admin user
    admin = User(
        username='admin',
        email='admin@dockshift.com',
        first_name='Admin',
        last_name='User',
        role='admin'
    )
    admin.password = 'admin123'
    users.append(admin)
    
    # Regular users
    user1 = User(
        username='johnsmith',
        email='john.smith@dockshift.com',
        first_name='John',
        last_name='Smith',
        role='user'
    )
    user1.password = 'password123'
    users.append(user1)
    
    user2 = User(
        username='anujpatel',
        email='anuj.patel@dockshift.com',
        first_name='Anuj',
        last_name='Patel',
        role='manager'
    )
    user2.password = 'password123'
    users.append(user2)
    
    # Add users to database
    for user in users:
        db.session.add(user)
    
    db.session.commit()
    print(f"Created {len(users)} test users")
    return users

def create_hubs():
    """Create hub data for the system"""
    print("Creating hubs...")
    hubs = []
    
    # Major hubs
    mumbai_hub = Hub(
        hub_id='mumbai_hub',
        name='Mumbai Container Terminal',
        city='Mumbai',
        state='Maharashtra',
        is_major=True,
        hub_type='port',
        latitude=19.0760,
        longitude=72.8777
    )
    hubs.append(mumbai_hub)
    
    delhi_hub = Hub(
        hub_id='delhi_hub',
        name='Delhi Inland Container Depot',
        city='New Delhi',
        state='Delhi',
        is_major=True,
        hub_type='inland',
        latitude=28.7041,
        longitude=77.1025
    )
    hubs.append(delhi_hub)
    
    chennai_hub = Hub(
        hub_id='chennai_hub',
        name='Chennai Port Terminal',
        city='Chennai',
        state='Tamil Nadu',
        is_major=True,
        hub_type='port',
        latitude=13.0827,
        longitude=80.2707
    )
    hubs.append(chennai_hub)
    
    kolkata_hub = Hub(
        hub_id='kolkata_hub',
        name='Kolkata Port Trust',
        city='Kolkata',
        state='West Bengal',
        is_major=True,
        hub_type='port',
        latitude=22.5726,
        longitude=88.3639
    )
    hubs.append(kolkata_hub)
    
    bangalore_hub = Hub(
        hub_id='bangalore_hub',
        name='Bangalore Logistics Hub',
        city='Bengaluru',
        state='Karnataka',
        is_major=True,
        hub_type='inland',
        latitude=12.9716,
        longitude=77.5946
    )
    hubs.append(bangalore_hub)
    
    # Add major hubs to database first to get their IDs
    for hub in hubs:
        db.session.add(hub)
    db.session.commit()
    
    # Sub-hubs
    sub_hubs = [
        # Mumbai sub-hubs
        Hub(
            hub_id='mumbai_north',
            name='Mumbai North Terminal',
            city='Mumbai',
            state='Maharashtra',
            is_major=False,
            hub_type='terminal',
            latitude=19.1136,
            longitude=72.8697,
            major_hub_id=mumbai_hub.id
        ),
        Hub(
            hub_id='mumbai_south',
            name='Mumbai South Terminal',
            city='Mumbai',
            state='Maharashtra',
            is_major=False,
            hub_type='terminal',
            latitude=18.9750,
            longitude=72.8258,
            major_hub_id=mumbai_hub.id
        ),
        Hub(
            hub_id='navi_mumbai',
            name='Navi Mumbai Terminal',
            city='Navi Mumbai',
            state='Maharashtra',
            is_major=False,
            hub_type='terminal',
            latitude=19.0330,
            longitude=73.0297,
            major_hub_id=mumbai_hub.id
        ),
        
        # Delhi sub-hubs
        Hub(
            hub_id='delhi_tughlakabad',
            name='Tughlakabad ICD',
            city='Delhi',
            state='Delhi',
            is_major=False,
            hub_type='icd',
            latitude=28.5177,
            longitude=77.2590,
            major_hub_id=delhi_hub.id
        ),
        Hub(
            hub_id='delhi_patparganj',
            name='Patparganj ICD',
            city='Delhi',
            state='Delhi',
            is_major=False,
            hub_type='icd',
            latitude=28.6129,
            longitude=77.2773,
            major_hub_id=delhi_hub.id
        ),
        Hub(
            hub_id='ghaziabad',
            name='Ghaziabad Terminal',
            city='Ghaziabad',
            state='Uttar Pradesh',
            is_major=False,
            hub_type='terminal',
            latitude=28.6692,
            longitude=77.4538,
            major_hub_id=delhi_hub.id
        ),
        
        # Chennai sub-hubs
        Hub(
            hub_id='chennai_port',
            name='Chennai Port',
            city='Chennai',
            state='Tamil Nadu',
            is_major=False,
            hub_type='port',
            latitude=13.1000,
            longitude=80.2929,
            major_hub_id=chennai_hub.id
        ),
        Hub(
            hub_id='ennore',
            name='Ennore Terminal',
            city='Chennai',
            state='Tamil Nadu',
            is_major=False,
            hub_type='terminal',
            latitude=13.2611,
            longitude=80.3323,
            major_hub_id=chennai_hub.id
        ),
        
        # Kolkata sub-hubs
        Hub(
            hub_id='kolkata_dock',
            name='Kolkata Dock System',
            city='Kolkata',
            state='West Bengal',
            is_major=False,
            hub_type='dock',
            latitude=22.5550,
            longitude=88.3247,
            major_hub_id=kolkata_hub.id
        ),
        Hub(
            hub_id='haldia',
            name='Haldia Terminal',
            city='Haldia',
            state='West Bengal',
            is_major=False,
            hub_type='terminal',
            latitude=22.0667,
            longitude=88.0698,
            major_hub_id=kolkata_hub.id
        ),
        
        # Bangalore sub-hubs
        Hub(
            hub_id='whitefield',
            name='Whitefield ICD',
            city='Bengaluru',
            state='Karnataka',
            is_major=False,
            hub_type='icd',
            latitude=12.9698,
            longitude=77.7500,
            major_hub_id=bangalore_hub.id
        ),
        Hub(
            hub_id='bangalore_city',
            name='Bangalore City Terminal',
            city='Bengaluru',
            state='Karnataka',
            is_major=False,
            hub_type='terminal',
            latitude=12.9767,
            longitude=77.5713,
            major_hub_id=bangalore_hub.id
        ),
    ]
    
    # Add sub-hubs to database
    for hub in sub_hubs:
        db.session.add(hub)
    
    db.session.commit()
    print(f"Created {len(hubs) + len(sub_hubs)} hubs")
    
    return hubs + sub_hubs

def create_routes(hubs):
    """Create shipping routes between hubs"""
    print("Creating routes...")
    routes = []
    
    # Get major hubs
    major_hubs = [hub for hub in hubs if hub.is_major]
    
    # Create routes between major hubs
    for i, origin in enumerate(major_hubs):
        for j, destination in enumerate(major_hubs):
            if i != j:  # Don't create route to self
                # Calculate a realistic distance (using simple approximation)
                lat_diff = abs(origin.latitude - destination.latitude)
                lng_diff = abs(origin.longitude - destination.longitude)
                # Rough distance in km (not accurate but good enough for test data)
                distance = (lat_diff + lng_diff) * 111.32 * 0.8
                
                # Determine transport mode based on hubs
                if origin.hub_type == 'port' and destination.hub_type == 'port':
                    transport_mode = 'Ship'
                    duration = distance / 30  # approximate 30 km/h for ships
                    cost_factor = 0.8  # ships are cheaper per km but slower
                else:
                    transport_mode = 'Truck'
                    duration = distance / 60  # approximate 60 km/h for trucks
                    cost_factor = 1.2  # trucks are more expensive per km but faster
                
                # Calculate cost based on distance
                cost = distance * cost_factor * 10  # $10 per km base rate adjusted by mode
                
                route = Route(
                    origin_hub_id=origin.id,
                    destination_hub_id=destination.id,
                    distance_km=round(distance, 2),
                    duration_hrs=round(duration, 2),
                    transport_mode=transport_mode,
                    cost=round(cost, 2)
                )
                routes.append(route)
    
    # Add routes to database
    for route in routes:
        db.session.add(route)
    
    db.session.commit()
    print(f"Created {len(routes)} routes")
    return routes

def create_inventory_items(users):
    """Create inventory items for the system"""
    print("Creating inventory items...")
    inventory_items = []
    
    # Create different types of inventory
    item_types = [t.value for t in InventoryType]
    product_names = [
        'Electronics', 'Textiles', 'Automobile Parts', 'Furniture', 
        'Food Products', 'Chemicals', 'Pharmaceuticals', 'Machinery',
        'Construction Materials', 'Paper Products', 'Plastic Goods'
    ]
    
    for _ in range(30):
        item = Inventory(
            product_name=f"{random.choice(product_names)} {random.randint(1000, 9999)}",
            quantity=random.randint(1, 100),
            height=round(random.uniform(0.1, 2.5), 2),
            weight=round(random.uniform(1, 500), 2),
            type=random.choice(item_types),
            user_id=random.choice(users).id
        )
        inventory_items.append(item)
    
    # Add items to database
    for item in inventory_items:
        db.session.add(item)
    
    db.session.commit()
    print(f"Created {len(inventory_items)} inventory items")
    return inventory_items

def create_containers(users, hubs, inventory_items):
    """Create containers for the system"""
    print("Creating containers...")
    containers = []
    
    # Container attributes
    statuses = [s.value for s in ContainerStatus]
    container_types = ['20GP', '40GP', '40HC', '40RF', '45HC']
    priorities = [p.value for p in PriorityLevel]
    content_types = ['Electronics', 'Textiles', 'Automotive Parts', 'Chemicals', 'Food Products', 'Machinery', 'Furniture']
    
    # Create containers
    for i in range(1, 21):
        # Select hub
        hub = random.choice(hubs)
        
        # Generate container attributes
        container_id = f"DOCK{i:04d}"
        status = random.choice(statuses)
        container_type = random.choice(container_types)
        
        # Set dates based on status
        now = datetime.now()
        if status == 'In Transit' or status == 'Delivered':
            arrival_date = now - timedelta(days=random.randint(5, 30))
            departure_date = now - timedelta(days=random.randint(1, 4))
        else:
            arrival_date = now - timedelta(days=random.randint(1, 10))
            departure_date = now + timedelta(days=random.randint(1, 15)) if random.random() > 0.3 else None
        
        # Create container
        container = Container(
            container_id=container_id,
            status=status,
            container_type=container_type,
            size='Standard' if '20' in container_type else 'Large',
            total_weight=round(random.uniform(1000, 25000), 2),
            fill_percentage=random.randint(10, 100),
            hub_id=hub.id,
            arrival_date=arrival_date,
            departure_date=departure_date,
            contents=random.choice(content_types),
            notes=f"Test container {i}",
            priority=random.choice(priorities),
            user_id=random.choice(users).id
        )
        
        # Add location data if available
        if hub.latitude and hub.longitude:
            container.pickup_lat = hub.latitude
            container.pickup_lng = hub.longitude
            
            # Set a random destination from another hub
            destination_hub = random.choice([h for h in hubs if h.id != hub.id])
            container.destination_city = destination_hub.city
            container.destination_lat = destination_hub.latitude
            container.destination_lng = destination_hub.longitude
        
        containers.append(container)
    
    # Add containers to database
    for container in containers:
        db.session.add(container)
    
    db.session.commit()
    
    # Now assign some inventory items to containers
    unassigned_items = list(inventory_items)
    for container in containers:
        # Assign 0-5 items to each container
        num_items = min(len(unassigned_items), random.randint(0, 5))
        if num_items > 0:
            items_to_assign = random.sample(unassigned_items, num_items)
            for item in items_to_assign:
                item.container_id = container.id
                unassigned_items.remove(item)
    
    db.session.commit()
    print(f"Created {len(containers)} containers")
    return containers

def create_container_journeys(containers, routes):
    """Create journey records for containers"""
    print("Creating container journeys...")
    journeys = []
    
    # Only create journeys for containers in transit
    in_transit_containers = [c for c in containers if c.status == 'In Transit']
    
    for container in in_transit_containers:
        # Get a random route
        route = random.choice(routes)
        
        # Create journey status
        journey_status = random.choice(['Planned', 'In Progress', 'Completed'])
        
        # Set times based on status
        now = datetime.now()
        if journey_status == 'Completed':
            start_time = now - timedelta(days=random.randint(5, 10))
            end_time = start_time + timedelta(hours=route.duration_hrs)
        elif journey_status == 'In Progress':
            start_time = now - timedelta(days=random.randint(1, 3))
            end_time = None  # Still in progress
        else:  # Planned
            start_time = now + timedelta(days=random.randint(1, 5))
            end_time = None  # Not started yet
        
        journey = ContainerJourney(
            container_id=container.id,
            route_id=route.id,
            sequence_number=1,  # First leg of journey
            start_time=start_time,
            end_time=end_time,
            status=journey_status
        )
        journeys.append(journey)
    
    # Add journeys to database
    for journey in journeys:
        db.session.add(journey)
    
    db.session.commit()
    print(f"Created {len(journeys)} container journeys")
    return journeys

def init_database():
    """Initialize the database with test data"""
    print("Starting database initialization...")
    
    # Create database tables
    with app.app_context():
        # Drop all tables first to ensure a fresh start
        db.drop_all()
        db.create_all()
        
        # Create test data
        users = create_test_users()
        hubs = create_hubs()
        routes = create_routes(hubs)
        inventory_items = create_inventory_items(users)
        containers = create_containers(users, hubs, inventory_items)
        journeys = create_container_journeys(containers, routes)
        
        print("Database initialization completed successfully!")

if __name__ == '__main__':
    init_database()