import logging
from models import db, Inventory
from flask import current_app

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class InventoryService:
    """
    Service for managing inventory operations in the container yard management system.
    Handles CRUD operations for inventory items.
    """
    
    def __init__(self):
        self.db = db
    
    def get_all_items(self):
        """
        Get all inventory items from the database.
        
        Returns:
            list: List of inventory items as dictionaries
        """
        try:
            items = Inventory.query.all()
            return [item.to_dict() for item in items]
        except Exception as e:
            logger.error(f"Error fetching inventory items: {str(e)}")
            return {'error': f"Error fetching inventory items: {str(e)}", 'success': False}
    
    def get_item_by_id(self, item_id):
        """
        Get a specific inventory item by its ID.
        
        Args:
            item_id: The ID of the inventory item
            
        Returns:
            dict: The inventory item as a dictionary
        """
        try:
            item = Inventory.query.get(item_id)
            if item:
                return item.to_dict()
            else:
                return {'error': f"Item with ID {item_id} not found", 'success': False}
        except Exception as e:
            logger.error(f"Error fetching inventory item {item_id}: {str(e)}")
            return {'error': f"Error fetching inventory item: {str(e)}", 'success': False}
    
    def add_item(self, item_data):
        """
        Add a new inventory item to the database.
        
        Args:
            item_data (dict): Data for the new inventory item
            
        Returns:
            dict: Result of the operation
        """
        try:
            # Validate required fields
            if 'product_name' not in item_data or not item_data['product_name']:
                return {'error': "Product name is required", 'success': False}
                
            # Create new inventory item
            new_item = Inventory(
                product_name=item_data['product_name'],
                quantity=item_data.get('quantity', 1),
                height=item_data.get('height'),
                weight=item_data.get('weight'),
                type=item_data.get('type')
            )
            
            # Add and commit to database
            self.db.session.add(new_item)
            self.db.session.commit()
            
            return {'message': "Inventory item added successfully", 'item': new_item.to_dict(), 'success': True}
            
        except Exception as e:
            self.db.session.rollback()
            logger.error(f"Error adding inventory item: {str(e)}")
            return {'error': f"Error adding inventory item: {str(e)}", 'success': False}
    
    def update_item(self, item_id, item_data):
        """
        Update an existing inventory item.
        
        Args:
            item_id: The ID of the inventory item to update
            item_data (dict): Updated data for the inventory item
            
        Returns:
            dict: Result of the operation
        """
        try:
            item = Inventory.query.get(item_id)
            if not item:
                return {'error': f"Item with ID {item_id} not found", 'success': False}
            
            # Update fields if provided
            if 'product_name' in item_data:
                item.product_name = item_data['product_name']
            if 'quantity' in item_data:
                item.quantity = item_data['quantity']
            if 'height' in item_data:
                item.height = item_data['height']
            if 'weight' in item_data:
                item.weight = item_data['weight']
            if 'type' in item_data:
                item.type = item_data['type']
            
            # Commit changes
            self.db.session.commit()
            
            return {'message': "Inventory item updated successfully", 'item': item.to_dict(), 'success': True}
            
        except Exception as e:
            self.db.session.rollback()
            logger.error(f"Error updating inventory item {item_id}: {str(e)}")
            return {'error': f"Error updating inventory item: {str(e)}", 'success': False}
    
    def delete_item(self, item_id):
        """
        Delete an inventory item from the database.
        
        Args:
            item_id: The ID of the inventory item to delete
            
        Returns:
            dict: Result of the operation
        """
        try:
            item = Inventory.query.get(item_id)
            if not item:
                return {'error': f"Item with ID {item_id} not found", 'success': False}
            
            # Delete the item
            self.db.session.delete(item)
            self.db.session.commit()
            
            return {'message': f"Inventory item {item_id} deleted successfully", 'success': True}
            
        except Exception as e:
            self.db.session.rollback()
            logger.error(f"Error deleting inventory item {item_id}: {str(e)}")
            return {'error': f"Error deleting inventory item: {str(e)}", 'success': False}
            
    def search_items(self, search_term):
        """
        Search for inventory items by product name.
        
        Args:
            search_term: The search term to look for in product names
            
        Returns:
            list: List of matching inventory items
        """
        try:
            items = Inventory.query.filter(Inventory.product_name.like(f"%{search_term}%")).all()
            return [item.to_dict() for item in items]
        except Exception as e:
            logger.error(f"Error searching inventory items: {str(e)}")
            return {'error': f"Error searching inventory items: {str(e)}", 'success': False}
            
    def get_inventory_stats(self):
        """
        Get statistics about the inventory.
        
        Returns:
            dict: Statistics about the inventory
        """
        try:
            total_items = Inventory.query.count()
            total_quantity = db.session.query(db.func.sum(Inventory.quantity)).scalar() or 0
            item_types = db.session.query(Inventory.type, db.func.count(Inventory.id)).group_by(Inventory.type).all()
            type_counts = {t[0] or 'Unspecified': t[1] for t in item_types}
            
            return {
                'total_items': total_items,
                'total_quantity': total_quantity,
                'type_distribution': type_counts,
                'success': True
            }
        except Exception as e:
            logger.error(f"Error getting inventory statistics: {str(e)}")
            return {'error': f"Error getting inventory statistics: {str(e)}", 'success': False}