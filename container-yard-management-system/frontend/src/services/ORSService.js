// OpenRouteService API utility functions
import axios from 'axios';

// Store API key
const apiKey = '5b3ce3597851110001cf62480edc01ecbb824a08832640ef5faac2af';

// Base URLs
const geocodeUrl = 'https://api.openrouteservice.org/geocode/search';
const directionsUrl =
  'https://api.openrouteservice.org/v2/directions/driving-car';
const optimizationUrl = 'https://api.openrouteservice.org/optimization';

/**
 * Geocode an address to coordinates
 * @param {string} query - Address or place name to search
 * @returns {Promise} - Resolves to coordinates {lat, lng}
 */
export const geocodeAddress = async (query) => {
  try {
    const response = await axios.get(geocodeUrl, {
      params: {
        api_key: apiKey,
        text: query,
        size: 1, // Return only the top result
      },
    });

    if (response.data.features && response.data.features.length > 0) {
      const [lng, lat] = response.data.features[0].geometry.coordinates;
      return {
        lat,
        lng,
        name: response.data.features[0].properties.name,
        formattedAddress: response.data.features[0].properties.label,
      };
    }
    throw new Error('Location not found');
  } catch (error) {
    console.error('Geocoding error:', error);
    throw error;
  }
};

/**
 * Reverse geocode coordinates to address
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise} - Resolves to address details
 */
export const reverseGeocode = async (lat, lng) => {
  try {
    const response = await axios.get(
      'https://api.openrouteservice.org/geocode/reverse',
      {
        params: {
          api_key: apiKey,
          'point.lat': lat,
          'point.lon': lng,
        },
      }
    );

    if (response.data.features && response.data.features.length > 0) {
      return {
        name: response.data.features[0].properties.name,
        address: response.data.features[0].properties.label,
      };
    }
    return { address: 'Unknown location' };
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return { address: 'Error retrieving address' };
  }
};

/**
 * Get route between two coordinates
 * @param {Object} start - Start coordinates {lat, lng}
 * @param {Object} end - End coordinates {lat, lng}
 * @returns {Promise} - Resolves to route data
 */
export const getRoute = async (start, end) => {
  try {
    const response = await axios.get(directionsUrl, {
      params: {
        api_key: apiKey,
        start: `${start.lng},${start.lat}`,
        end: `${end.lng},${end.lat}`,
      },
    });

    if (response.data.features && response.data.features.length > 0) {
      const route = response.data.features[0];
      const coordinates = decodePolyline(route.geometry).map((point) => ({
        lat: point[0],
        lng: point[1],
      }));

      return {
        path: coordinates,
        distance: route.properties.segments[0].distance / 1000, // Convert to km
        duration: route.properties.segments[0].duration / 60, // Convert to minutes
      };
    }
    throw new Error('Route not found');
  } catch (error) {
    console.error('Routing error:', error);
    throw error;
  }
};

/**
 * Get optimized route through multiple points using the MST algorithm
 * @param {Array} points - Array of coordinates objects {lat, lng, id}
 * @returns {Promise} - Resolves to optimized route data
 */
export const getOptimizedRoute = async (points) => {
  try {
    // Prepare waypoints in ORS format
    const locations = points.map((point) => [point.lng, point.lat]);

    const response = await axios.post(
      optimizationUrl,
      {
        jobs: points.map((point, index) => ({
          id: index,
          location: [point.lng, point.lat],
        })),
        vehicles: [
          {
            id: 1,
            start: [points[0].lng, points[0].lat],
            end: [points[points.length - 1].lng, points[points.length - 1].lat],
          },
        ],
      },
      {
        headers: {
          Authorization: apiKey,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data && response.data.routes) {
      // Process the optimized route
      const route = response.data.routes[0];
      return {
        path: route.steps.map((step) => ({
          lat: step.location[1],
          lng: step.location[0],
        })),
        distance: route.distance / 1000, // Convert to km
        duration: route.duration / 60, // Convert to minutes
      };
    }
    throw new Error('Could not optimize route');
  } catch (error) {
    console.error('Route optimization error:', error);
    throw error;
  }
};

/**
 * Find nearby hubs based on a location
 * @param {Object} location - Coordinates {lat, lng}
 * @param {number} radius - Search radius in km
 * @returns {Promise} - Resolves to array of nearby hubs
 */
export const findNearbyHubs = async (location, radius = 50) => {
  // This would typically be a backend call to search a database
  // For demo purposes we're returning mock data
  return [
    {
      id: 'hub1',
      name: 'Nagpur Distribution Center',
      lat: 21.1458,
      lng: 79.0882,
      distance: `${Math.round(Math.random() * radius)}km from route`,
      type: 'Major Hub',
    },
    {
      id: 'hub2',
      name: 'Aurangabad Logistics Park',
      lat: 19.8762,
      lng: 75.3433,
      distance: `${Math.round(Math.random() * radius)}km from route`,
      type: 'Local Hub',
    },
    {
      id: 'hub3',
      name: 'Kolhapur Container Depot',
      lat: 16.705,
      lng: 74.2433,
      distance: `${Math.round(Math.random() * radius)}km from route`,
      type: 'Container Yard',
    },
  ];
};

/**
 * Helper function to decode polyline from ORS
 * @param {string} encodedPolyline - Encoded polyline string
 * @returns {Array} - Array of coordinate pairs
 */
function decodePolyline(encodedPolyline) {
  // Polyline decoding implementation
  // Simplified for brevity but would implement the full algorithm in production
  // This is a placeholder
  return encodedPolyline.split(',').map((point) => {
    const [lng, lat] = point.split(' ');
    return [parseFloat(lat), parseFloat(lng)];
  });
}

export default {
  geocodeAddress,
  reverseGeocode,
  getRoute,
  getOptimizedRoute,
  findNearbyHubs,
};
