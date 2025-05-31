import sys
import ssl
import certifi
import os
import requests
import logging
import geopy
import csv
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderUnavailable, GeocoderServiceError
from tabulate import tabulate
from flask import jsonify
from pathlib import Path

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Configure SSL certificates properly
geopy.geocoders.options.default_ssl_context = ssl.create_default_context(cafile=certifi.where())

# API Configuration - Get from environment variables with fallbacks
ORS_API_KEY = os.environ.get("ORS_API_KEY", "5b3ce3597851110001cf62480dc1469b88f248a7825ce5221a92e361")
OWM_API_KEY = os.environ.get("OWM_API_KEY", "f22b8105f58599ce05b1dd7812869c50")

class StateSelector:
    """
    Manages the list of Indian states for logistics operations.
    """
    INDIAN_STATES = {
        1: "Andhra Pradesh",     2: "Arunachal Pradesh", 3: "Assam",
        4: "Bihar",              5: "Chhattisgarh",     6: "Goa",
        7: "Gujarat",            8: "Haryana",          9: "Himachal Pradesh",
        10: "Jharkhand",         11: "Karnataka",       12: "Kerala",
        13: "Madhya Pradesh",    14: "Maharashtra",     15: "Manipur",
        16: "Meghalaya",         17: "Mizoram",         18: "Nagaland",
        19: "Odisha",            20: "Punjab",          21: "Rajasthan",
        22: "Sikkim",            23: "Tamil Nadu",      24: "Telangana",
        25: "Tripura",           26: "Uttar Pradesh",   27: "Uttarakhand",
        28: "West Bengal"
    }

    @classmethod
    def get_states(cls):
        """Returns a dictionary of state IDs and names."""
        return {str(num): state for num, state in cls.INDIAN_STATES.items()}


class GeoCoder:
    """
    Handles geocoding operations to convert addresses to coordinates.
    """
    def __init__(self):
        self.geolocator = Nominatim(
            user_agent="container_logistics",
            scheme='https'
        )

    def get_city_coords(self, city, state):
        """
        Converts a city and state to geographical coordinates.
        
        Args:
            city (str): City name
            state (str): State name
            
        Returns:
            tuple: (latitude, longitude) or None if geocoding failed
        """
        try:
            location = self.geolocator.geocode(
                f"{city}, {state}, India",
                timeout=15,
                exactly_one=True
            )
            if location:
                return (location.latitude, location.longitude)
            logger.warning(f"Could not geocode location: {city}, {state}, India")
            return None
        except (GeocoderUnavailable, GeocoderServiceError) as e:
            logger.error(f"Geocoding error: {str(e)}")
            return None


# Define major Indian hubs for visualization
indianHubsData = [
    {
        'city': 'Mumbai',
        'state': 'Maharashtra',
        'coordinates': {'lat': 19.0760, 'lng': 72.8777},
        'is_major': True,
        'hub_type': 'port',
        'facilities': ['container_storage', 'customs', 'rail_connection']
    },
    {
        'city': 'Delhi',
        'state': 'Delhi',
        'coordinates': {'lat': 28.7041, 'lng': 77.1025},
        'is_major': True,
        'hub_type': 'inland',
        'facilities': ['container_storage', 'customs', 'rail_connection']
    },
    {
        'city': 'Chennai',
        'state': 'Tamil Nadu',
        'coordinates': {'lat': 13.0827, 'lng': 80.2707},
        'is_major': True,
        'hub_type': 'port',
        'facilities': ['container_storage', 'customs', 'rail_connection', 'refrigeration']
    },
    {
        'city': 'Kolkata',
        'state': 'West Bengal',
        'coordinates': {'lat': 22.5726, 'lng': 88.3639},
        'is_major': True,
        'hub_type': 'port',
        'facilities': ['container_storage', 'customs', 'rail_connection']
    },
    {
        'city': 'Bangalore',
        'state': 'Karnataka',
        'coordinates': {'lat': 12.9716, 'lng': 77.5946},
        'is_major': False,
        'hub_type': 'inland',
        'facilities': ['container_storage', 'rail_connection']
    },
    {
        'city': 'Hyderabad',
        'state': 'Telangana',
        'coordinates': {'lat': 17.3850, 'lng': 78.4867},
        'is_major': False,
        'hub_type': 'inland',
        'facilities': ['container_storage']
    },
    {
        'city': 'Ahmedabad',
        'state': 'Gujarat',
        'coordinates': {'lat': 23.0225, 'lng': 72.5714},
        'is_major': False,
        'hub_type': 'inland',
        'facilities': ['container_storage', 'rail_connection']
    },
    {
        'city': 'Goa',
        'state': 'Goa',
        'coordinates': {'lat': 15.2993, 'lng': 74.1240},
        'is_major': False,
        'hub_type': 'port',
        'facilities': ['container_storage', 'customs']
    },
    {
        'city': 'Visakhapatnam',
        'state': 'Andhra Pradesh',
        'coordinates': {'lat': 17.6868, 'lng': 83.2185},
        'is_major': True,
        'hub_type': 'port',
        'facilities': ['container_storage', 'customs', 'rail_connection']
    },
    {
        'city': 'Cochin',
        'state': 'Kerala',
        'coordinates': {'lat': 9.9312, 'lng': 76.2673},
        'is_major': True,
        'hub_type': 'port',
        'facilities': ['container_storage', 'customs', 'rail_connection', 'refrigeration']
    }
]


class RouteOptimizer:
    """
    Optimizes transportation routes based on origin, destination, and urgency.
    """
    # Realistic transport modes for container shipping
    TRANSPORT_MODES = {
        'urgent': ['driving-hgv', 'driving-truck'],  # Heavy goods vehicles for urgent delivery
        'normal': ['driving-hgv', 'driving-car']     # Standard options for normal delivery
    }

    @staticmethod
    def optimize_route(start, end, urgency):
        """
        Calculates an optimized route between two points.
        
        Args:
            start (tuple): (lat, lon) of starting point
            end (tuple): (lat, lon) of ending point
            urgency (str): 'urgent' or 'normal' priority
            
        Returns:
            dict: Route data or None if optimization failed
        """
        try:
            profile = RouteOptimizer.TRANSPORT_MODES[urgency][0]
            url = f"https://api.openrouteservice.org/v2/directions/{profile}"
            headers = {"Authorization": ORS_API_KEY}
            params = {
                "start": f"{start[1]},{start[0]}",
                "end": f"{end[1]},{end[0]}"
            }
            
            logger.info(f"Optimizing route from {start} to {end} using {profile} mode")
            response = requests.get(url, headers=headers, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            if 'features' in data and len(data['features']) > 0:
                return data
            
            logger.warning("No route features found in API response")
            return None
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Route API request error: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Routing error: {str(e)}")
            return None


class LogisticsSystem:
    """
    Core logistics system for container management and transportation.
    """
    @staticmethod
    def validate_container(length, width, height, weight):
        """
        Validates container dimensions and weight against standard limits.
        
        Args:
            length, width, height (float): Container dimensions in meters
            weight (float): Container weight in kg
            
        Returns:
            list: Validation errors, if any
        """
        # Standard ISO container limits
        iso_max = {
            'standard_20ft': {'length': 6.06, 'width': 2.44, 'height': 2.59, 'weight': 24000},
            'standard_40ft': {'length': 12.19, 'width': 2.44, 'height': 2.59, 'weight': 30480},
            'high_cube_40ft': {'length': 12.19, 'width': 2.44, 'height': 2.89, 'weight': 30480}
        }
        
        # Minimum reasonable values for a container
        min_values = {
            'length': 0.5,  # 0.5 meters minimum length
            'width': 0.5,   # 0.5 meters minimum width
            'height': 0.5,  # 0.5 meters minimum height
            'weight': 10    # 10 kg minimum weight
        }
        
        errors = []
        
        # Check if dimensions are within reasonable ranges
        if length <= 0:
            errors.append("Container length must be a positive number")
        elif length < min_values['length']:
            errors.append(f"Container length ({length}m) is below minimum size ({min_values['length']}m)")
        elif length > iso_max['standard_40ft']['length']:
            errors.append(f"Container length ({length}m) exceeds maximum standard size ({iso_max['standard_40ft']['length']}m)")
            
        if width <= 0:
            errors.append("Container width must be a positive number")
        elif width < min_values['width']:
            errors.append(f"Container width ({width}m) is below minimum size ({min_values['width']}m)")
        elif width > iso_max['standard_40ft']['width']:
            errors.append(f"Container width ({width}m) exceeds maximum standard size ({iso_max['standard_40ft']['width']}m)")
            
        if height <= 0:
            errors.append("Container height must be a positive number")
        elif height < min_values['height']:
            errors.append(f"Container height ({height}m) is below minimum size ({min_values['height']}m)")
        elif height > iso_max['high_cube_40ft']['height']:
            errors.append(f"Container height ({height}m) exceeds maximum standard size ({iso_max['high_cube_40ft']['height']}m)")
            
        if weight <= 0:
            errors.append("Container weight must be a positive number")
        elif weight < min_values['weight']:
            errors.append(f"Container weight ({weight}kg) is below minimum weight ({min_values['weight']}kg)")
        elif weight > iso_max['standard_40ft']['weight']:
            errors.append(f"Container weight ({weight}kg) exceeds maximum limit of {iso_max['standard_40ft']['weight']}kg")
            
        return errors


def generate_logistics_plan(data):
    """
    Generates a comprehensive logistics plan for container transportation.
    
    Args:
        data (dict): Container and journey details
        
    Returns:
        tuple: (JSON response, status code)
    """
    try:
        # Extract container details with proper type conversion
        try:
            container = {
                'length': float(data.get('length', 0)) if data.get('length') not in (None, '') else 0,
                'width': float(data.get('width', 0)) if data.get('width') not in (None, '') else 0,
                'height': float(data.get('height', 0)) if data.get('height') not in (None, '') else 0,
                'weight': float(data.get('weight', 0)) if data.get('weight') not in (None, '') else 0
            }
        except ValueError as e:
            logger.error(f"Type conversion error: {str(e)}")
            return jsonify({
                'success': False, 
                'message': 'Invalid container dimensions. Please enter numeric values only.'
            }), 400
        
        logger.info(f"Processing container with dimensions: l={container['length']}m, w={container['width']}m, h={container['height']}m, weight={container['weight']}kg")
        
        # Validate container
        validation_errors = LogisticsSystem.validate_container(
            container['length'],
            container['width'],
            container['height'],
            container['weight']
        )
        
        if validation_errors:
            return jsonify({
                'success': False, 
                'errors': validation_errors
            }), 400
        
        # Get coordinates
        geocoder = GeoCoder()
        
        # Origin
        origin_city = data.get('origin_city', '').strip()
        origin_state = data.get('origin_state', '').strip()
        if not origin_city or not origin_state:
            return jsonify({
                'success': False, 
                'message': 'Origin city and state are required'
            }), 400
            
        origin_coords = geocoder.get_city_coords(origin_city, origin_state)
        if not origin_coords:
            return jsonify({
                'success': False, 
                'message': f'Could not find coordinates for {origin_city}, {origin_state}'
            }), 400
            
        # Destination
        dest_city = data.get('dest_city', '').strip()
        dest_state = data.get('dest_state', '').strip()
        if not dest_city or not dest_state:
            return jsonify({
                'success': False, 
                'message': 'Destination city and state are required'
            }), 400
            
        dest_coords = geocoder.get_city_coords(dest_city, dest_state)
        if not dest_coords:
            return jsonify({
                'success': False, 
                'message': f'Could not find coordinates for {dest_city}, {dest_state}'
            }), 400
            
        # Route optimization
        urgency = data.get('urgency', 'normal').lower()
        if urgency not in ['urgent', 'normal']:
            logger.warning(f"Invalid urgency value: {urgency}, defaulting to 'normal'")
            urgency = 'normal'
            
        route_data = RouteOptimizer.optimize_route(origin_coords, dest_coords, urgency)
        if not route_data:
            return jsonify({
                'success': False, 
                'message': 'Failed to optimize route. Please try again later.'
            }), 500
            
        # Process results
        try:
            summary = route_data['features'][0]['properties']['summary']
            distance_km = summary['distance'] / 1000
            duration_hrs = summary['duration'] / 3600
            
            # Calculate cost based on distance, weight and urgency factor
            base_cost = distance_km * 15
            weight_factor = max(container['weight'], 1) / 1000  # Avoid division by zero
            urgency_factor = 1.5 if urgency == 'urgent' else 1.0
            
            cost = base_cost * weight_factor * urgency_factor
            
            # Return results
            return jsonify({
                'success': True,
                'route': {
                    'origin': f"{origin_city}, {origin_state}",
                    'destination': f"{dest_city}, {dest_state}",
                    'distance_km': round(distance_km, 2),
                    'duration_hrs': round(duration_hrs, 2),
                    'transport_mode': 'Truck (Expedited)' if urgency == 'urgent' else 'Truck (Standard)',
                    'cost': round(cost, 2),
                    'container': container
                }
            }), 200
            
        except KeyError as e:
            logger.error(f"Missing data in route response: {str(e)}")
            return jsonify({
                'success': False, 
                'message': f'Missing data in route response: {str(e)}'
            }), 500
            
    except Exception as e:
        logger.error(f"Error generating logistics plan: {str(e)}")
        return jsonify({
            'success': False, 
            'message': f'Error generating logistics plan: {str(e)}'
        }), 500

def get_indian_states():
    """Returns a dictionary of Indian states for use in forms."""
    return StateSelector.get_states()

def get_hubs_data():
    """
    Returns hardcoded hub data from the CSV files
    Returns:
        tuple: (major_hubs_dict, hubs_dict)
    """
    logger.info("Using hardcoded hub data")
    
    # Define states as major hubs (from major_hubs_india.csv)
    major_hubs = {
        "1": {"name": "Andhra Pradesh", "coordinates": {"lat": 16.504347, "lng": 80.645843}},
        "2": {"name": "Arunachal Pradesh", "coordinates": {"lat": 27.091086, "lng": 93.596806}},
        "3": {"name": "Assam", "coordinates": {"lat": 26.135341, "lng": 91.735217}},
        "4": {"name": "Bihar", "coordinates": {"lat": 25.587789, "lng": 85.142771}},
        "5": {"name": "Chhattisgarh", "coordinates": {"lat": 21.241661, "lng": 81.638798}},
        "6": {"name": "Goa", "coordinates": {"lat": 15.482654, "lng": 73.833124}},
        "7": {"name": "Gujarat", "coordinates": {"lat": 23.030405, "lng": 72.562137}},
        "8": {"name": "Haryana", "coordinates": {"lat": 28.465335, "lng": 77.025125}},
        "9": {"name": "Himachal Pradesh", "coordinates": {"lat": 31.106605, "lng": 77.180773}},
        "10": {"name": "Jharkhand", "coordinates": {"lat": 23.348013, "lng": 85.314384}},
        "11": {"name": "Karnataka", "coordinates": {"lat": 12.97365, "lng": 77.590186}},
        "12": {"name": "Kerala", "coordinates": {"lat": 9.929815, "lng": 76.277007}},
        "13": {"name": "Madhya Pradesh", "coordinates": {"lat": 22.714174, "lng": 75.854346}},
        "14": {"name": "Maharashtra", "coordinates": {"lat": 19.069646, "lng": 72.880307}},
        "15": {"name": "Manipur", "coordinates": {"lat": 24.813476, "lng": 93.944452}},
        "16": {"name": "Meghalaya", "coordinates": {"lat": 25.578503, "lng": 91.891416}},
        "17": {"name": "Mizoram", "coordinates": {"lat": 23.73101, "lng": 92.711071}},
        "18": {"name": "Nagaland", "coordinates": {"lat": 25.896172, "lng": 93.718831}},
        "19": {"name": "Odisha", "coordinates": {"lat": 20.297132, "lng": 85.830375}},
        "20": {"name": "Punjab", "coordinates": {"lat": 30.90374, "lng": 75.857833}},
        "21": {"name": "Rajasthan", "coordinates": {"lat": 26.921195, "lng": 75.784667}},
        "22": {"name": "Sikkim", "coordinates": {"lat": 27.324654, "lng": 88.613151}},
        "23": {"name": "Tamil Nadu", "coordinates": {"lat": 13.084113, "lng": 80.267506}},
        "24": {"name": "Telangana", "coordinates": {"lat": 17.379828, "lng": 78.489978}},
        "25": {"name": "Tripura", "coordinates": {"lat": 23.835036, "lng": 91.278077}},
        "26": {"name": "Uttar Pradesh", "coordinates": {"lat": 26.84023, "lng": 80.950943}},
        "27": {"name": "Uttarakhand", "coordinates": {"lat": 30.319949, "lng": 78.032139}},
        "28": {"name": "West Bengal", "coordinates": {"lat": 22.565836, "lng": 88.363023}},
        "29": {"name": "Delhi", "coordinates": {"lat": 28.613407, "lng": 77.216016}},
        "30": {"name": "Jammu and Kashmir", "coordinates": {"lat": 34.08646, "lng": 74.800107}},
        "31": {"name": "Ladakh", "coordinates": {"lat": 34.162043, "lng": 77.577688}}
    }
    
    # Define cities as hubs within major hubs (from expanded_major_hubs.csv)
    hubs = {
        # West Bengal (ID: 28)
        "28": [
            {"id": "28_1", "name": "Kolkata", "coordinates": {"lat": 22.572912, "lng": 88.361454}},
            {"id": "28_2", "name": "Howrah", "coordinates": {"lat": 22.587306, "lng": 88.258067}},
            {"id": "28_3", "name": "Durgapur", "coordinates": {"lat": 23.521529, "lng": 87.305634}},
            {"id": "28_4", "name": "Asansol", "coordinates": {"lat": 23.669562, "lng": 86.943659}},
            {"id": "28_5", "name": "Siliguri", "coordinates": {"lat": 26.726044, "lng": 88.394222}},
            {"id": "28_6", "name": "Darjeeling", "coordinates": {"lat": 27.044137, "lng": 88.269625}},
            {"id": "28_7", "name": "Kharagpur", "coordinates": {"lat": 22.349619, "lng": 87.236139}},
            {"id": "28_8", "name": "Haldia", "coordinates": {"lat": 22.064258, "lng": 88.11926}},
            {"id": "28_9", "name": "Malda", "coordinates": {"lat": 25.017916, "lng": 88.139606}},
            {"id": "28_10", "name": "Bardhaman", "coordinates": {"lat": 23.232716, "lng": 87.85383}}
        ],
        # Odisha (ID: 19)
        "19": [
            {"id": "19_1", "name": "Bhubaneswar", "coordinates": {"lat": 20.286648, "lng": 85.819319}},
            {"id": "19_2", "name": "Cuttack", "coordinates": {"lat": 20.471047, "lng": 85.87992}},
            {"id": "19_3", "name": "Rourkela", "coordinates": {"lat": 22.258521, "lng": 84.847716}},
            {"id": "19_4", "name": "Sambalpur", "coordinates": {"lat": 21.464943, "lng": 83.977969}},
            {"id": "19_5", "name": "Berhampur", "coordinates": {"lat": 19.315731, "lng": 84.792629}},
            {"id": "19_6", "name": "Puri", "coordinates": {"lat": 19.810011, "lng": 85.827176}},
            {"id": "19_7", "name": "Balasore", "coordinates": {"lat": 21.494781, "lng": 86.941383}},
            {"id": "19_8", "name": "Jharsuguda", "coordinates": {"lat": 21.861882, "lng": 84.015541}},
            {"id": "19_9", "name": "Angul", "coordinates": {"lat": 20.848924, "lng": 85.106252}},
            {"id": "19_10", "name": "Baripada", "coordinates": {"lat": 21.928826, "lng": 86.733417}}
        ],
        # Maharashtra (ID: 14)
        "14": [
            {"id": "14_1", "name": "Mumbai", "coordinates": {"lat": 19.073313, "lng": 72.873124}},
            {"id": "14_2", "name": "Pune", "coordinates": {"lat": 18.526, "lng": 73.862396}},
            {"id": "14_3", "name": "Nagpur", "coordinates": {"lat": 21.15335, "lng": 79.095673}},
            {"id": "14_4", "name": "Nashik", "coordinates": {"lat": 20.005171, "lng": 73.795204}},
            {"id": "14_5", "name": "Thane", "coordinates": {"lat": 19.226139, "lng": 72.988056}},
            {"id": "14_6", "name": "Aurangabad", "coordinates": {"lat": 19.877461, "lng": 75.350927}},
            {"id": "14_7", "name": "Solapur", "coordinates": {"lat": 17.65678, "lng": 75.907452}},
            {"id": "14_8", "name": "Amravati", "coordinates": {"lat": 20.933012, "lng": 77.774769}},
            {"id": "14_9", "name": "Kolhapur", "coordinates": {"lat": 16.699147, "lng": 74.235303}},
            {"id": "14_10", "name": "Navi Mumbai", "coordinates": {"lat": 19.033618, "lng": 73.035662}}
        ]
    }
    
    # Add some sample cities for other states to have more options in the UI
    # Delhi (ID: 29)
    hubs["29"] = [
        {"id": "29_1", "name": "New Delhi", "coordinates": {"lat": 28.613407, "lng": 77.216016}},
        {"id": "29_2", "name": "South Delhi", "coordinates": {"lat": 28.543145, "lng": 77.160732}},
        {"id": "29_3", "name": "North Delhi", "coordinates": {"lat": 28.679142, "lng": 77.209021}}
    ]
    
    # Gujarat (ID: 7)
    hubs["7"] = [
        {"id": "7_1", "name": "Ahmedabad", "coordinates": {"lat": 23.030405, "lng": 72.562137}},
        {"id": "7_2", "name": "Surat", "coordinates": {"lat": 21.197096, "lng": 72.840075}},
        {"id": "7_3", "name": "Vadodara", "coordinates": {"lat": 22.310696, "lng": 73.192635}},
        {"id": "7_4", "name": "Rajkot", "coordinates": {"lat": 22.291606, "lng": 70.793217}}
    ]
    
    # Tamil Nadu (ID: 23)
    hubs["23"] = [
        {"id": "23_1", "name": "Chennai", "coordinates": {"lat": 13.084113, "lng": 80.267506}},
        {"id": "23_2", "name": "Coimbatore", "coordinates": {"lat": 11.016844, "lng": 76.955832}},
        {"id": "23_3", "name": "Madurai", "coordinates": {"lat": 9.925201, "lng": 78.119775}}
    ]
    
    return major_hubs, hubs