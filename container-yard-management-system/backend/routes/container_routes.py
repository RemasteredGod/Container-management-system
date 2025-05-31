from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from models import db, Container, Inventory, Hub, ContainerJourney

# Create blueprint
container_bp = Blueprint('container', __name__)

@container_bp.route('/api/containers', methods=['GET'])
def get_containers():
    """Get all containers or filter by query parameters"""
    try:
        # Check for query parameters
        status = request.args.get('status')
        hub_id = request.args.get('hub_id')
        
        query = Container.query
        
        if status:
            query = query.filter(Container.status == status)
        
        if hub_id:
            query = query.filter(Container.hub_id == hub_id)
            
        containers = query.all()
        return jsonify({'success': True, 'containers': [container.to_dict() for container in containers]})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@container_bp.route('/api/containers/<string:container_id>', methods=['GET'])
def get_container(container_id):
    """Get a specific container by ID"""
    try:
        container = Container.query.filter_by(container_id=container_id).first()
        
        if not container:
            return jsonify({'success': False, 'error': 'Container not found'}), 404
            
        return jsonify({'success': True, 'container': container.to_dict()})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@container_bp.route('/api/containers', methods=['POST'])
@login_required
def create_container():
    """Create a new container"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'success': False, 'error': 'No data provided'}), 400
        
        # Check required fields
        if 'container_id' not in data:
            return jsonify({'success': False, 'error': 'Container ID is required'}), 400
        
        # Check if container ID already exists
        existing = Container.query.filter_by(container_id=data['container_id']).first()
        if existing:
            return jsonify({'success': False, 'error': 'Container ID already exists'}), 400
        
        # Create new container with all fields that might come from frontend
        container = Container(
            container_id=data['container_id'],
            status=data.get('status', 'In Transit'),
            container_type=data.get('container_type'),
            size=data.get('size'),
            total_weight=data.get('total_weight'),
            fill_percentage=data.get('fill_percentage', 50),
            total_items=data.get('total_items', 0),
            urgency_status=data.get('urgency_status', 'Medium'),
            pickup_city=data.get('pickup_city'),
            pickup_lat=data.get('pickup_lat'),
            pickup_lng=data.get('pickup_lng'),
            destination_city=data.get('destination_city'),
            destination_lat=data.get('destination_lat'),
            destination_lng=data.get('destination_lng'),
            contents=data.get('contents'),
            notes=data.get('notes'),
            priority=data.get('priority', 'normal'),
            user_id=current_user.id
        )
        
        db.session.add(container)
        db.session.commit()
        
        return jsonify({
            'success': True, 
            'message': 'Container created successfully', 
            'container': container.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        print(f"Error creating container: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@container_bp.route('/api/containers/<string:container_id>', methods=['PUT'])
@login_required
def update_container(container_id):
    """Update an existing container"""
    try:
        data = request.get_json()
        container = Container.query.filter_by(container_id=container_id).first()
        
        if not container:
            return jsonify({'success': False, 'error': 'Container not found'}), 404
        
        # Update fields
        for key, value in data.items():
            if key != 'container_id' and hasattr(container, key):
                setattr(container, key, value)
        
        db.session.commit()
        return jsonify({'success': True, 'message': 'Container updated', 'container': container.to_dict()})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@container_bp.route('/api/containers/<string:container_id>', methods=['DELETE'])
@login_required
def delete_container(container_id):
    """Delete a container"""
    try:
        container = Container.query.filter_by(container_id=container_id).first()
        
        if not container:
            return jsonify({'success': False, 'error': 'Container not found'}), 404
        
        db.session.delete(container)
        db.session.commit()
        return jsonify({'success': True, 'message': 'Container deleted'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@container_bp.route('/api/containers/<string:container_id>/inventory', methods=['GET'])
def get_container_inventory(container_id):
    """Get inventory items assigned to a container"""
    try:
        container = Container.query.filter_by(container_id=container_id).first()
        
        if not container:
            return jsonify({'success': False, 'error': 'Container not found'}), 404
        
        inventory = Inventory.query.filter_by(container_id=container.id).all()
        return jsonify({'success': True, 'inventory': [item.to_dict() for item in inventory]})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@container_bp.route('/api/containers/stats', methods=['GET'])
def get_container_stats():
    """Get statistics about containers"""
    try:
        total = Container.query.count()
        in_yard = Container.query.filter_by(status='In Yard').count()
        in_transit = Container.query.filter_by(status='In Transit').count()
        delivered = Container.query.filter_by(status='Delivered').count()
        
        return jsonify({
            'success': True,
            'stats': {
                'total': total,
                'in_yard': in_yard,
                'in_transit': in_transit,
                'delivered': delivered
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500