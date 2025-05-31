import logging
import uuid
from datetime import datetime

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class Container:
    """
    Container class representing a shipping container with products and fill status
    """
    def __init__(self, container_id=None, container_type='40HQ', location=None, hub_id=None):
        self.id = container_id or f"C{str(uuid.uuid4())[:6].upper()}"
        self.type = container_type
        self.status = "In Yard"
        self.location = location
        self.hub_id = hub_id
        self.fill_percentage = 0
        self.contents = []
        self.total_weight = 0
        self.max_weight = 30480  # kg (standard 40ft container)
        self.max_volume = 67.7   # cubic meters (standard 40ft container)
        self.current_volume = 0
        self.is_urgent = False
        self.arrival_date = datetime.now().strftime('%Y-%m-%d')
        self.departure_date = None
        self.route = None

    def add_product(self, product):
        """
        Add a product to the container
        
        Args:
            product (dict): Product with weight, volume, and other details
            
        Returns:
            bool: True if product added, False if container would be overfilled
        """
        # Check if adding this product would exceed container capacity
        new_weight = self.total_weight + product['weight']
        new_volume = self.current_volume + product['volume']
        
        if new_weight > self.max_weight or new_volume > self.max_volume:
            return False
        
        # Add product
        self.contents.append(product)
        self.total_weight = new_weight
        self.current_volume = new_volume
        
        # Update fill percentage (use the higher percentage of weight or volume)
        weight_percentage = (self.total_weight / self.max_weight) * 100
        volume_percentage = (self.current_volume / self.max_volume) * 100
        self.fill_percentage = max(weight_percentage, volume_percentage)
        
        logger.info(f"Added product to container {self.id}. Fill percentage now: {self.fill_percentage:.2f}%")
        return True

    def should_dispatch(self):
        """
        Determine if container should be dispatched based on fill percentage and urgency
        
        Returns:
            bool: True if container should be dispatched
        """
        if self.is_urgent and self.fill_percentage >= 50:
            logger.info(f"Urgent container {self.id} ready for dispatch at {self.fill_percentage:.2f}%")
            return True
        
        if self.fill_percentage >= 90:
            logger.info(f"Container {self.id} ready for dispatch at {self.fill_percentage:.2f}%")
            return True
            
        return False

    def set_urgency(self, is_urgent):
        """Set container urgency status"""
        self.is_urgent = is_urgent
        logger.info(f"Container {self.id} urgency set to {is_urgent}")

    def dispatch(self, route=None):
        """
        Dispatch the container with an optional route assignment
        
        Args:
            route (dict): Route details including source, destination, ETA
            
        Returns:
            dict: Updated container info
        """
        self.status = "In Transit"
        self.departure_date = datetime.now().strftime('%Y-%m-%d')
        
        if route:
            self.route = route
            
        logger.info(f"Container {self.id} dispatched from {self.location}")
        return self.to_dict()

    def to_dict(self):
        """Convert container to dictionary for API responses"""
        return {
            "id": self.id,
            "type": self.type,
            "status": self.status,
            "location": self.location,
            "hub_id": self.hub_id,
            "fill_percentage": round(self.fill_percentage, 2),
            "contents": self.contents,
            "total_weight": self.total_weight,
            "current_volume": round(self.current_volume, 2),
            "is_urgent": self.is_urgent,
            "arrival_date": self.arrival_date,
            "departure_date": self.departure_date,
            "route": self.route
        }


class ContainerService:
    """
    Service for managing containers, inventory assignment, and dispatching
    """
    def __init__(self):
        self.containers = {}  # Dictionary of container ID to Container object
        self.dispatched_containers = {}  # Keep track of dispatched containers

    def create_container(self, container_type='40HQ', location=None, hub_id=None):
        """
        Create a new container
        
        Args:
            container_type (str): Type of container (e.g., '40HQ', '20GP')
            location (str): Location description
            hub_id (str): ID of the hub where the container is located
            
        Returns:
            dict: Container information
        """
        container = Container(container_type=container_type, location=location, hub_id=hub_id)
        self.containers[container.id] = container
        logger.info(f"Created new container {container.id} of type {container_type} at {location}")
        return container.to_dict()

    def get_container(self, container_id):
        """Get container by ID"""
        container = self.containers.get(container_id) or self.dispatched_containers.get(container_id)
        if not container:
            return None
        return container.to_dict()

    def get_all_containers(self):
        """Get all active containers"""
        return [container.to_dict() for container in self.containers.values()]

    def get_hub_containers(self, hub_id):
        """Get all containers at a specific hub"""
        return [
            container.to_dict() for container in self.containers.values()
            if container.hub_id == hub_id
        ]

    def add_product_to_container(self, container_id, product):
        """
        Add a product to a specific container
        
        Args:
            container_id (str): Container ID
            product (dict): Product details with weight and volume
            
        Returns:
            tuple: (success, message, updated_container_dict or None)
        """
        container = self.containers.get(container_id)
        if not container:
            return False, f"Container {container_id} not found", None
            
        success = container.add_product(product)
        if not success:
            return False, "Container capacity exceeded", container.to_dict()
            
        # Check if container should be dispatched
        if container.should_dispatch():
            logger.info(f"Container {container_id} ready for dispatch")
            
        return True, "Product added successfully", container.to_dict()

    def set_container_urgency(self, container_id, is_urgent):
        """
        Set a container's urgency status
        
        Args:
            container_id (str): Container ID
            is_urgent (bool): Whether the container is urgent
            
        Returns:
            tuple: (success, message, updated_container_dict or None)
        """
        container = self.containers.get(container_id)
        if not container:
            return False, f"Container {container_id} not found", None
        
        container.set_urgency(is_urgent)
        
        # Check if container should be dispatched after urgency change
        if container.should_dispatch():
            logger.info(f"Urgent container {container_id} ready for dispatch")
            
        return True, "Urgency status updated", container.to_dict()

    def dispatch_container(self, container_id, route=None):
        """
        Dispatch a container
        
        Args:
            container_id (str): Container ID
            route (dict): Route information
            
        Returns:
            tuple: (success, message, updated_container_dict or None)
        """
        container = self.containers.get(container_id)
        if not container:
            return False, f"Container {container_id} not found", None
            
        # Dispatch the container
        result = container.dispatch(route)
        
        # Move to dispatched containers
        self.dispatched_containers[container_id] = container
        del self.containers[container_id]
        
        return True, "Container dispatched successfully", result

    def get_dispatch_ready_containers(self):
        """
        Get all containers that are ready for dispatch
        
        Returns:
            list: Container dictionaries that are ready for dispatch
        """
        ready_containers = []
        
        for container in self.containers.values():
            if container.should_dispatch():
                ready_containers.append(container.to_dict())
                
        return ready_containers

# Create a singleton instance for global use
container_service = ContainerService()