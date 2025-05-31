import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getRoute, findNearbyHubs } from '../services/ORSService';

const RouteOptimizationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { container, action } = location.state || {};
  const [loading, setLoading] = useState(true);
  const [routeStats, setRouteStats] = useState(null);
  const [nearbyHubs, setNearbyHubs] = useState([]);
  const [activeTab, setActiveTab] = useState('route');

  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const routePolylineRef = useRef(null);
  const markersRef = useRef([]);

  // Ensure we have valid container data
  useEffect(() => {
    if (!container || (!container.pickup_lat && !container.pickup_lng)) {
      navigate('/');
    } else {
      loadMapAndRoute();
    }
  }, [container]);

  const loadMapAndRoute = async () => {
    // First ensure Leaflet CSS is loaded
    if (!document.querySelector('link[href*="leaflet.css"]')) {
      const cssLink = document.createElement('link');
      cssLink.rel = 'stylesheet';
      cssLink.href = 'https://unpkg.com/leaflet/dist/leaflet.css';
      document.head.appendChild(cssLink);
    }

    // Load Leaflet JS if not already loaded
    if (!window.L) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet/dist/leaflet.js';
      script.onload = () => initializeMap();
      document.body.appendChild(script);
    } else {
      initializeMap();
    }
  };

  const initializeMap = async () => {
    if (!mapContainerRef.current || mapRef.current) return;

    setLoading(true);
    const L = window.L;

    // Create map centered on starting point
    const startPoint = {
      lat: parseFloat(container.pickup_lat),
      lng: parseFloat(container.pickup_lng),
    };

    const map = L.map(mapContainerRef.current).setView(
      [startPoint.lat, startPoint.lng],
      12
    );

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Store map reference
    mapRef.current = map;

    // Add markers and route if we have both pickup and drop coordinates
    if (
      container.pickup_lat &&
      container.pickup_lng &&
      container.drop_lat &&
      container.drop_lng
    ) {
      // Draw route between points
      await loadRouteDetails();
    }
  };

  const loadRouteDetails = async () => {
    if (!mapRef.current || !window.L) return;

    try {
      setLoading(true);
      const L = window.L;

      // Get coordinates from container
      const start = {
        lat: parseFloat(container.pickup_lat),
        lng: parseFloat(container.pickup_lng),
      };

      const end = {
        lat: parseFloat(container.drop_lat),
        lng: parseFloat(container.drop_lng),
      };

      // Get route from ORS API
      const route = await getRoute(start, end);

      // Create custom icons
      const originIcon = L.icon({
        iconUrl:
          'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        shadowUrl:
          'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      const destinationIcon = L.icon({
        iconUrl:
          'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl:
          'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      // Add origin marker
      const originMarker = L.marker([start.lat, start.lng], {
        icon: originIcon,
      }).addTo(mapRef.current);

      originMarker.bindPopup(
        `<strong>Pickup Location</strong><br/>${
          container.pickup_address || `${start.lat}, ${start.lng}`
        }`
      );

      // Add destination marker
      const destinationMarker = L.marker([end.lat, end.lng], {
        icon: destinationIcon,
      }).addTo(mapRef.current);

      destinationMarker.bindPopup(
        `<strong>Drop Location</strong><br/>${
          container.drop_address || `${end.lat}, ${end.lng}`
        }`
      );

      // Store markers
      markersRef.current = [originMarker, destinationMarker];

      // Draw route polyline
      if (route && route.path) {
        // Remove existing polyline if any
        if (routePolylineRef.current) {
          routePolylineRef.current.remove();
        }

        // Draw new polyline
        const polyline = L.polyline(
          route.path.map((point) => [point.lat, point.lng]),
          { color: 'blue', weight: 6, opacity: 0.7 }
        ).addTo(mapRef.current);

        routePolylineRef.current = polyline;

        // Fit map to route bounds
        const bounds = polyline.getBounds();
        mapRef.current.fitBounds(bounds, { padding: [50, 50] });
      }

      // Update route statistics
      setRouteStats({
        distance: route.distance.toFixed(2),
        duration: route.duration.toFixed(0),
        fuelSavings: calculateFuelSavings(route.distance),
        emissionReduction: calculateEmissionReduction(route.distance),
      });

      // Get nearby hubs
      const midPoint = {
        lat: (start.lat + end.lat) / 2,
        lng: (start.lng + end.lng) / 2,
      };

      const hubs = await findNearbyHubs(midPoint);
      setNearbyHubs(hubs);
    } catch (error) {
      console.error('Error loading route details:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate fuel savings based on optimized route
  const calculateFuelSavings = (distance) => {
    // Assume 10% fuel savings from optimization
    const avgFuelConsumption = 0.12; // liters per km for a truck
    const fuelPrice = 1.8; // $ per liter (adjust based on local prices)

    const totalFuelUsed = distance * avgFuelConsumption;
    const savings = totalFuelUsed * 0.1 * fuelPrice;

    return savings.toFixed(2);
  };

  // Calculate emission reduction
  const calculateEmissionReduction = (distance) => {
    // Average CO2 emission for trucks is around 900g/km
    const avgEmission = 0.9; // kg per km

    // Assume 10% reduction from optimization
    return (distance * avgEmission * 0.1).toFixed(2);
  };

  // Handle dispatch confirmation
  const handleConfirmDispatch = async () => {
    try {
      // In a real implementation, this would send a request to the backend
      console.log(
        `Container ${container.id} dispatched with ${action} priority`
      );

      // Navigate back to dashboard with success message
      navigate('/', {
        state: {
          success: true,
          message: `Container ${container.id} has been dispatched successfully with ${action} priority!`,
        },
      });
    } catch (error) {
      console.error('Error dispatching container:', error);
    }
  };

  // Render tabs
  const renderTabs = () => {
    return (
      <div className="route-tabs">
        <button
          className={`tab-button ${activeTab === 'route' ? 'active' : ''}`}
          onClick={() => setActiveTab('route')}
        >
          <i className="fas fa-route"></i> Optimized Route
        </button>
        <button
          className={`tab-button ${activeTab === 'hubs' ? 'active' : ''}`}
          onClick={() => setActiveTab('hubs')}
        >
          <i className="fas fa-warehouse"></i> Nearby Hubs
        </button>
        <button
          className={`tab-button ${
            activeTab === 'environmental' ? 'active' : ''
          }`}
          onClick={() => setActiveTab('environmental')}
        >
          <i className="fas fa-leaf"></i> Environmental Impact
        </button>
      </div>
    );
  };

  // Render route info
  const renderRouteInfo = () => {
    return (
      <div className="route-info-container">
        {routeStats && (
          <div className="route-stats">
            <div className="stat-item">
              <i className="fas fa-road"></i>
              <div className="stat-value">{routeStats.distance} km</div>
              <div className="stat-label">Total Distance</div>
            </div>
            <div className="stat-item">
              <i className="fas fa-clock"></i>
              <div className="stat-value">{routeStats.duration} min</div>
              <div className="stat-label">Estimated Time</div>
            </div>
            {action === 'urgent' && (
              <div className="stat-item urgent">
                <i className="fas fa-exclamation-triangle"></i>
                <div className="stat-value">Priority</div>
                <div className="stat-label">Urgent Delivery</div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Render nearby hubs
  const renderNearbyHubs = () => {
    return (
      <div className="nearby-hubs-container">
        <h3>Nearby Container Hubs</h3>
        {nearbyHubs.length === 0 ? (
          <p>No nearby hubs found along this route.</p>
        ) : (
          <div className="hub-list">
            {nearbyHubs.map((hub) => (
              <div key={hub.id} className="hub-card">
                <div className="hub-header">
                  <h4>{hub.name}</h4>
                  <span className="hub-type">{hub.type}</span>
                </div>
                <div className="hub-details">
                  <div>
                    <i className="fas fa-map-marker-alt"></i> {hub.distance}
                  </div>
                  <div>
                    <i className="fas fa-map-pin"></i> {hub.lat.toFixed(4)},{' '}
                    {hub.lng.toFixed(4)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Render environmental impact
  const renderEnvironmentalImpact = () => {
    return (
      <div className="environmental-impact-container">
        <h3>Environmental Benefits</h3>
        {routeStats && (
          <div className="impact-stats">
            <div className="impact-item">
              <i className="fas fa-gas-pump"></i>
              <div className="impact-value">${routeStats.fuelSavings}</div>
              <div className="impact-label">Fuel Cost Savings</div>
            </div>
            <div className="impact-item">
              <i className="fas fa-leaf"></i>
              <div className="impact-value">
                {routeStats.emissionReduction} kg
              </div>
              <div className="impact-label">CO₂ Emission Reduction</div>
            </div>
          </div>
        )}
        <div className="impact-note">
          <p>
            <i className="fas fa-info-circle"></i> These calculations are based
            on route optimization compared to standard routes. Actual savings
            may vary based on vehicle type, road conditions, and driving
            behavior.
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="route-optimization-page">
      <div className="page-header">
        <h1>
          {action === 'urgent' ? 'Urgent Dispatch' : 'Route Optimization'}
          <span
            className={`status-badge ${
              action === 'urgent' ? 'urgent' : 'normal'
            }`}
          >
            {action === 'urgent' ? 'PRIORITY' : 'Standard'}
          </span>
        </h1>
        <p className="subtitle">
          Container ID: {container?.id || container?.container_id}
        </p>
      </div>

      <div className="route-main-container">
        <div className="route-sidebar">
          <div className="container-details-card">
            <h2>Container Details</h2>
            <div className="details-list">
              <div className="detail-item">
                <span className="detail-label">Type:</span>
                <span className="detail-value">{container?.type || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Contents:</span>
                <span className="detail-value">
                  {container?.contents || 'N/A'}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Status:</span>
                <span
                  className={`status-badge status-${
                    container?.status?.toLowerCase().replace(/\s/g, '-') ||
                    'in-yard'
                  }`}
                >
                  {container?.status || 'In Yard'}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Fill %:</span>
                <div className="progress-container">
                  <div
                    className="progress-bar"
                    style={{
                      width: `${container?.fill_percentage || 0}%`,
                      backgroundColor:
                        container?.fill_percentage >= 90
                          ? '#ff4d4f'
                          : container?.fill_percentage >= 75
                          ? '#faad14'
                          : '#52c41a',
                    }}
                  ></div>
                </div>
                <span className="fill-value">
                  {container?.fill_percentage || 0}%
                </span>
              </div>
            </div>

            <div className="location-details">
              <h3>Route Information</h3>
              <div className="location-item">
                <i className="fas fa-map-marker-alt pickup-marker"></i>
                <div className="location-text">
                  <div className="location-label">Pickup:</div>
                  <div className="location-value">
                    {container?.pickup_address ||
                      `${container?.pickup_lat}, ${container?.pickup_lng}` ||
                      'N/A'}
                  </div>
                </div>
              </div>
              <div className="location-item">
                <i className="fas fa-map-marker-alt drop-marker"></i>
                <div className="location-text">
                  <div className="location-label">Destination:</div>
                  <div className="location-value">
                    {container?.drop_address ||
                      `${container?.drop_lat}, ${container?.drop_lng}` ||
                      'N/A'}
                  </div>
                </div>
              </div>
            </div>

            {/* Route statistics */}
            {renderRouteInfo()}

            {/* Action buttons */}
            <div className="action-buttons">
              <button
                className="btn btn-secondary"
                onClick={() => navigate('/')}
              >
                <i className="fas fa-arrow-left"></i> Back to Dashboard
              </button>
              <button
                className={`btn ${
                  action === 'urgent' ? 'btn-danger' : 'btn-primary'
                }`}
                onClick={handleConfirmDispatch}
              >
                <i className="fas fa-truck"></i>{' '}
                {action === 'urgent'
                  ? 'Confirm Urgent Dispatch'
                  : 'Confirm Dispatch'}
              </button>
            </div>
          </div>
        </div>

        <div className="route-content">
          <div className="map-container">
            {loading && (
              <div className="loading-overlay">
                <div className="spinner"></div>
                <div>Loading route data...</div>
              </div>
            )}
            {/* Map container */}
            <div
              ref={mapContainerRef}
              style={{ height: '400px', width: '100%', borderRadius: '8px' }}
            ></div>
          </div>

          {/* Tabs for additional info */}
          <div className="route-additional-info">
            {renderTabs()}
            <div className="tab-content">
              {activeTab === 'route' && renderRouteInfo()}
              {activeTab === 'hubs' && renderNearbyHubs()}
              {activeTab === 'environmental' && renderEnvironmentalImpact()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteOptimizationPage;
