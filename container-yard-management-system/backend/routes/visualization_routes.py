from flask import Blueprint, request, jsonify, send_from_directory, current_app
import os
from pathlib import Path
from services.route_visualizer import RouteVisualizer
from services.logistics_optimizer import get_hubs_data
from services.mst_service import mst_optimizer  # Import MST optimizer

visualization_bp = Blueprint('visualization', __name__)
route_visualizer = RouteVisualizer()

@visualization_bp.route('/api/visualize/route', methods=['POST'])
def visualize_route():
    """Generate and return a route visualization map between two hubs"""
    data = request.get_json()
    
    if not data:
        return jsonify({'success': False, 'message': 'No data provided'}), 400
    
    # Get hub information
    major_hubs, hubs = get_hubs_data()
    
    # Get start and end location details
    start_major_hub = data.get('start_major_hub')
    start_hub = data.get('start_hub')
    end_major_hub = data.get('end_major_hub')
    end_hub = data.get('end_hub')
    
    # Validate required fields
    if not all([start_major_hub, start_hub, end_major_hub, end_hub]):
        return jsonify({
            'success': False, 
            'message': 'Missing required fields: start_major_hub, start_hub, end_major_hub, end_hub'
        }), 400
    
    # Find start hub coordinates
    start_coords = None
    if start_major_hub in hubs:
        for hub in hubs[start_major_hub]:
            if hub['id'] == start_hub:
                start_coords = (hub['coordinates']['lat'], hub['coordinates']['lng'])
                start_name = f"{hub['name']}, {major_hubs[start_major_hub]['name']}"
                break
    
    if not start_coords:
        return jsonify({
            'success': False, 
            'message': f'Could not find coordinates for the selected start hub'
        }), 400
    
    # Find end hub coordinates
    end_coords = None
    if end_major_hub in hubs:
        for hub in hubs[end_major_hub]:
            if hub['id'] == end_hub:
                end_coords = (hub['coordinates']['lat'], hub['coordinates']['lng'])
                end_name = f"{hub['name']}, {major_hubs[end_major_hub]['name']}"
                break
    
    if not end_coords:
        return jsonify({
            'success': False, 
            'message': f'Could not find coordinates for the selected destination hub'
        }), 400
    
    # Create the route visualization
    result = route_visualizer.create_route_map(
        start_coords, 
        end_coords, 
        start_name, 
        end_name
    )
    
    if not result['success']:
        return jsonify({
            'success': False,
            'message': result.get('error', 'Failed to generate route visualization')
        }), 500
    
    # Return the map details
    return jsonify({
        'success': True,
        'map_file': result['map_file'],
        'map_url': f"/api/visualize/maps/{result['map_file']}",
        'distance_km': result['distance_km'],
        'duration_hrs': result['duration_hrs']
    }), 200

@visualization_bp.route('/api/visualize/hubs', methods=['GET'])
def visualize_all_hubs():
    """Generate and return a visualization of all major hubs and their sub-hubs"""
    major_hubs, hub_data = get_hubs_data()
    
    # Prepare data for visualization
    vis_data = []
    for major_id, major_hub in major_hubs.items():
        # Add the major hub
        vis_data.append({
            'city': major_hub['name'],
            'state': 'Major Hub',
            'coordinates': major_hub['coordinates'],
            'is_major': True
        })
        
        # Add sub-hubs
        if major_id in hub_data:
            for hub in hub_data[major_id]:
                vis_data.append({
                    'city': hub['name'],
                    'state': major_hub['name'],
                    'coordinates': hub['coordinates'],
                    'is_major': False
                })
    
    result = route_visualizer.create_multi_hub_map(vis_data)
    
    if not result['success']:
        return jsonify({
            'success': False,
            'message': result.get('error', 'Failed to generate hubs visualization')
        }), 500
    
    # Return the map details
    return jsonify({
        'success': True,
        'map_file': result['map_file'],
        'map_url': f"/api/visualize/maps/{result['map_file']}",
        'hub_count': result['hub_count']
    }), 200

@visualization_bp.route('/api/visualize/mst', methods=['GET'])
def visualize_mst():
    """Generate and return a visualization of the minimum spanning tree of the logistics network"""
    # Get hub information
    major_hubs, hub_data = get_hubs_data()
    
    # Build MST using the hub data
    mst_edges, total_distance = mst_optimizer.build_mst(hub_data)
    
    if not mst_edges:
        return jsonify({
            'success': False,
            'message': 'Not enough hubs to build MST or error building MST'
        }), 400
    
    # Create a map with the MST visualization
    # Prepare data for visualization with hub details
    hub_details = {}
    for major_id, hubs in hub_data.items():
        for hub in hubs:
            hub_details[hub['id']] = {
                'name': hub['name'],
                'coordinates': hub['coordinates'],
                'major_hub': major_hubs[major_id]['name'] if major_id in major_hubs else 'Unknown'
            }
    
    # Create MST visualization
    result = route_visualizer.create_mst_map(mst_edges, hub_details)
    
    if not result['success']:
        return jsonify({
            'success': False,
            'message': result.get('error', 'Failed to generate MST visualization')
        }), 500
    
    # Return the MST network data for visualization
    return jsonify({
        'success': True,
        'map_file': result['map_file'],
        'map_url': f"/api/visualize/maps/{result['map_file']}",
        'mst_edges': mst_optimizer.get_mst_for_visualization(),
        'total_distance': total_distance,
        'hub_count': result['hub_count']
    }), 200

@visualization_bp.route('/api/visualize/maps/<path:filename>')
def get_map(filename):
    """Serve generated map files"""
    maps_dir = Path(current_app.root_path) / 'static' / 'maps'
    return send_from_directory(maps_dir, filename)