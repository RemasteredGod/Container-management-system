from flask import Blueprint, request, jsonify
from models import db, Container2
from flask_login import current_user, login_required
import datetime

# Create blueprint for Container2 routes
container2_bp = Blueprint('container2', __name__)

@container2_bp.route('/api/containers2', methods=['GET'])
@login_required
def get_containers2():
    """Get all containers2 for the current user"""
    try:
        containers = Container2.query.filter_by(user_id=current_user.id).all()
        return jsonify({
            'success': True,
            'containers': [container.to_dict() for container in containers]
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@container2_bp.route('/api/containers2/<container_id>', methods=['GET'])
@login_required
def get_container2(container_id):
    """Get a specific container2 by ID"""
    try:
        container = Container2.query.filter_by(
            container_id=container_id, 
            user_id=current_user.id
        ).first()
        
        if not container:
            return jsonify({
                'success': False,
                'error': 'Container not found'
            }), 404
            
        return jsonify({
            'success': True,
            'container': container.to_dict()
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@container2_bp.route('/api/containers2', methods=['POST'])
@login_required
def create_container2():
    """Create a new dashboard container (Container2)"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['container_id', 'status', 'destination', 'arrival']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        # Check if container_id already exists
        existing_container = Container2.query.filter_by(
            container_id=data['container_id']
        ).first()
        
        if existing_container:
            return jsonify({
                'success': False,
                'error': 'Container ID already exists'
            }), 400
        
        # Create new container
        new_container = Container2(
            container_id=data['container_id'],
            status=data['status'],
            destination=data['destination'],
            arrival=data['arrival'],
            user_id=current_user.id
        )
        
        db.session.add(new_container)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Container created successfully',
            'container': new_container.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@container2_bp.route('/api/containers2/<container_id>', methods=['PUT'])
@login_required
def update_container2(container_id):
    """Update an existing dashboard container (Container2)"""
    try:
        # Get the container
        container = Container2.query.filter_by(
            container_id=container_id,
            user_id=current_user.id
        ).first()
        
        if not container:
            return jsonify({
                'success': False,
                'error': 'Container not found'
            }), 404
            
        # Get the JSON data
        data = request.get_json()
        
        # Update container fields if provided
        if 'status' in data:
            container.status = data['status']
            
        if 'destination' in data:
            container.destination = data['destination']
            
        if 'arrival' in data:
            container.arrival = data['arrival']
        
        # Update the timestamp
        container.updated_at = datetime.datetime.utcnow()
        
        # Save changes
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Container updated successfully',
            'container': container.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@container2_bp.route('/api/containers2/<container_id>', methods=['DELETE'])
@login_required
def delete_container2(container_id):
    """Delete a dashboard container (Container2)"""
    try:
        # Get the container
        container = Container2.query.filter_by(
            container_id=container_id,
            user_id=current_user.id
        ).first()
        
        if not container:
            return jsonify({
                'success': False,
                'error': 'Container not found'
            }), 404
            
        # Delete the container
        db.session.delete(container)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Container deleted successfully'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@container2_bp.route('/api/dashboard2', methods=['GET'])
@login_required
def get_dashboard2_data():
    """Get dashboard container data for current user"""
    try:
        # Get containers specific to this dashboard
        containers = Container2.query.filter_by(user_id=current_user.id).all()
        
        # Count containers by status
        status_counts = {
            'In Transit': 0,
            'At Yard': 0,
            'Delivered': 0,
            'Delayed': 0
        }
        
        for container in containers:
            status = container.status
            if status in status_counts:
                status_counts[status] += 1
        
        # Calculate total containers
        total_containers = len(containers)
        
        # Calculate percentage delivered
        percentage_delivered = 0
        if total_containers > 0:
            percentage_delivered = (status_counts['Delivered'] / total_containers) * 100
        
        # Get containers due in the next 7 days
        today = datetime.datetime.now().date()
        upcoming_arrivals = []
        
        for container in containers:
            try:
                arrival_date = datetime.datetime.strptime(container.arrival, "%Y-%m-%d").date()
                days_left = (arrival_date - today).days
                
                if 0 <= days_left <= 7:
                    upcoming_arrivals.append({
                        'container_id': container.container_id,
                        'destination': container.destination,
                        'arrival': container.arrival,
                        'days_left': days_left
                    })
            except ValueError:
                # Skip if date format is invalid
                pass
        
        # Sort upcoming arrivals by days left
        upcoming_arrivals.sort(key=lambda x: x['days_left'])
        
        # Prepare dashboard data
        dashboard_data = {
            'total_containers': total_containers,
            'status_counts': status_counts,
            'percentage_delivered': round(percentage_delivered, 1),
            'upcoming_arrivals': upcoming_arrivals[:5],  # Top 5 upcoming arrivals
            'containers': [container.to_dict() for container in containers]
        }
        
        return jsonify(dashboard_data)
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500