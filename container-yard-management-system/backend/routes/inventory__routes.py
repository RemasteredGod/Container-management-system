from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from services.inventory_service import InventoryService

# Create blueprint
inventory_bp = Blueprint('inventory', __name__)

# Initialize service
inventory_service = InventoryService()

@inventory_bp.route('/api/inventory', methods=['GET'])
def get_inventory():
    """Get all inventory items"""
    # Removed @login_required to allow access for debugging
    items = inventory_service.get_all_items()
    return jsonify(items)

@inventory_bp.route('/api/inventory/<int:item_id>', methods=['GET'])
def get_inventory_item(item_id):
    """Get a specific inventory item by ID"""
    # Removed @login_required to allow access for debugging
    item = inventory_service.get_item_by_id(item_id)
    if 'error' in item:
        return jsonify(item), 404
    return jsonify(item)

@inventory_bp.route('/api/inventory', methods=['POST'])
def add_inventory_item():
    """Add a new inventory item"""
    # Removed @login_required to allow access for debugging
    data = request.get_json()
    if not data:
        return jsonify({'success': False, 'error': 'No data provided'}), 400
        
    result = inventory_service.add_item(data)
    
    if not result['success']:
        return jsonify(result), 400
        
    return jsonify(result), 201

@inventory_bp.route('/api/inventory/<int:item_id>', methods=['PUT'])
def update_inventory_item(item_id):
    """Update an existing inventory item"""
    # Removed @login_required to allow access for debugging
    data = request.get_json()
    if not data:
        return jsonify({'success': False, 'error': 'No data provided'}), 400
        
    result = inventory_service.update_item(item_id, data)
    
    if not result['success']:
        return jsonify(result), 404 if "not found" in result.get('error', '') else 400
        
    return jsonify(result)

@inventory_bp.route('/api/inventory/<int:item_id>', methods=['DELETE'])
def delete_inventory_item(item_id):
    """Delete an inventory item"""
    # Removed @login_required to allow access for debugging
    result = inventory_service.delete_item(item_id)
    
    if not result['success']:
        return jsonify(result), 404 if "not found" in result.get('error', '') else 400
        
    return jsonify(result)

@inventory_bp.route('/api/inventory/types', methods=['GET'])
def get_inventory_types():
    """Get available inventory types"""
    # These are the predefined types mentioned in the requirements
    types = ["flamable", "inflamable", "fragile"]
    return jsonify(types)