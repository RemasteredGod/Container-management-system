import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';
import RouteVisualizer from './RouteVisualizer';
import Inventories from './Inventories';
import Containers from './Containers';
import Header from './Header';

// Container Card Component
const ContainerCard = ({ container }) => {
  const getStatusClass = (status) => {
    status = status.toLowerCase().replace(/\s+/g, '-');
    if (status === 'in-transit') return 'in-transit';
    if (status === 'at-yard' || status === 'in-yard') return 'in-yard';
    if (status === 'delivered') return 'delivered';
    return '';
  };

  // Fill percentage with default value
  const fillPercentage = container.fill_percentage || 0;

  // Determine if container is ready for dispatch based on urgency and fill level
  const isUrgent = container.is_urgent || false;
  const dispatchThreshold = isUrgent ? 50 : 90;
  const isReadyForDispatch = fillPercentage >= dispatchThreshold;

  // Get color for fill bar
  const getFillColor = () => {
    if (fillPercentage >= 90) return '#e53935'; // Red for very full
    if (fillPercentage >= 75) return '#ff9800'; // Orange for mostly full
    if (fillPercentage >= 50) return '#4caf50'; // Green for half full
    return '#2196f3'; // Blue for low fill
  };

  return (
    <div className={`container-card ${isUrgent ? 'urgent' : ''}`}>
      <div className="container-card-header">
        <span className="container-id">{container.id}</span>
        <span
          className={`container-status ${getStatusClass(container.status)}`}
        >
          {container.status}
        </span>
        {isUrgent && (
          <span className="urgency-badge">
            <i className="fas fa-exclamation-circle"></i> URGENT
          </span>
        )}
      </div>

      {/* Fill percentage indicator */}
      <div className="fill-percentage-container">
        <div className="fill-percentage-bar-container">
          <div
            className="fill-percentage-bar"
            style={{
              width: `${fillPercentage}%`,
              backgroundColor: getFillColor(),
            }}
          ></div>
          {/* Threshold indicator */}
          <div
            className="dispatch-threshold"
            style={{ left: `${dispatchThreshold}%` }}
            title={`Dispatch at ${dispatchThreshold}%`}
          ></div>
        </div>
        <div className="fill-percentage-text">
          {fillPercentage}% filled
          {isReadyForDispatch && <span className="dispatch-ready"> READY</span>}
        </div>
      </div>

      <div className="container-content">
        <div className="container-detail">
          <span className="detail-label">Type:</span>
          <span className="detail-value">{container.type || '40HQ'}</span>
        </div>
        <div className="container-detail">
          <span className="detail-label">Location:</span>
          <span className="detail-value">
            {container.location || 'Block A, Row 3, Slot 12'}
          </span>
        </div>
        <div className="container-detail">
          <span className="detail-label">Arrival:</span>
          <span className="detail-value">
            {container.arrival_date || container.arrival || '4/20/2025'}
          </span>
        </div>
        <div className="container-detail">
          <span className="detail-label">Departure:</span>
          <span className="detail-value">
            {container.departure_date || container.departure || '5/15/2025'}
          </span>
        </div>
        <div className="container-detail">
          <span className="detail-label">Contents:</span>
          <span className="detail-value">
            {container.contents_description ||
              container.contents ||
              'Electronics'}
          </span>
        </div>
        <div className="container-detail">
          <span className="detail-label">Weight:</span>
          <span className="detail-value">
            {container.total_weight ? `${container.total_weight} kg` : 'N/A'}
          </span>
        </div>
      </div>
      <div className="container-actions">
        <button className="container-action-btn view">
          <i className="fas fa-eye"></i>
          View Details
        </button>
        {isReadyForDispatch && (
          <button className="container-action-btn dispatch">
            <i className="fas fa-shipping-fast"></i>
            Dispatch
          </button>
        )}
        {!isReadyForDispatch && (
          <button className="container-action-btn update">
            <i className="fas fa-edit"></i>
            Update Status
          </button>
        )}
        {!isUrgent && (
          <button className="container-action-btn set-urgent">
            <i className="fas fa-exclamation-triangle"></i>
            Mark Urgent
          </button>
        )}
      </div>
    </div>
  );
};

// Custom Route Visualizer Component for Dashboard
const DashboardRouteVisualizer = () => {
  // States for managing form data and API responses
  const [majorHubs, setMajorHubs] = useState({});
  const [hubs, setHubs] = useState({});
  const [startMajorHub, setStartMajorHub] = useState('');
  const [startHub, setStartHub] = useState('');
  const [endMajorHub, setEndMajorHub] = useState('');
  const [endHub, setEndHub] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [mapUrl, setMapUrl] = useState('');
  const [routeInfo, setRouteInfo] = useState(null);

  // API base URL
  const API_URL = 'http://localhost:5000';

  // Fetch hubs data when component mounts
  useEffect(() => {
    const fetchHubs = async () => {
      try {
        console.log('Fetching hubs from:', `${API_URL}/api/logistics/hubs`);
        const response = await fetch(`${API_URL}/api/logistics/hubs`, {
          credentials: 'include',
          headers: {
            Accept: 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        if (data.success) {
          setMajorHubs(data.majorHubs);
          setHubs(data.hubs);
        }
      } catch (err) {
        setError('Failed to load hubs. Using mock data instead.');
        console.error('Error fetching hubs:', err);

        // Use mock data as fallback
        setMajorHubs({
          mh1: { id: 'mh1', name: 'Mumbai' },
          mh2: { id: 'mh2', name: 'Delhi' },
          mh3: { id: 'mh3', name: 'Chennai' },
          mh4: { id: 'mh4', name: 'Kolkata' },
        });

        setHubs({
          mh1: [
            { id: 'h1', name: 'Mumbai Port Terminal' },
            { id: 'h2', name: 'Nhava Sheva Port' },
            { id: 'h3', name: 'Western Distribution Center' },
          ],
          mh2: [
            { id: 'h4', name: 'Delhi Logistics Hub' },
            { id: 'h5', name: 'Northern Distribution Center' },
            { id: 'h6', name: 'Gurgaon Gateway' },
          ],
          mh3: [
            { id: 'h7', name: 'Chennai Port Complex' },
            { id: 'h8', name: 'Southern Distribution Hub' },
          ],
          mh4: [
            { id: 'h9', name: 'Kolkata Port Trust' },
            { id: 'h10', name: 'Eastern Logistics Center' },
          ],
        });
      }
    };

    fetchHubs();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset previous states
    setLoading(true);
    setError('');
    setSuccess(false);
    setMapUrl('');
    setRouteInfo(null);

    try {
      // Validate inputs
      if (!startMajorHub || !startHub || !endMajorHub || !endHub) {
        throw new Error('Please select both origin and destination hubs');
      }

      // Make API request to visualize route
      const response = await fetch(`${API_URL}/api/visualize/route`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          start_major_hub: startMajorHub,
          start_hub: startHub,
          end_major_hub: endMajorHub,
          end_hub: endHub,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        // Ensure the map URL is using the correct base URL
        const mapUrlPath = data.map_url;
        setMapUrl(`${API_URL}${mapUrlPath}`);
        setRouteInfo({
          distance: data.distance_km.toFixed(2),
          duration: data.duration_hrs.toFixed(2),
        });
      } else {
        throw new Error(data.message || 'Failed to visualize route');
      }
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
      console.error('Visualization error:', err);

      // Use mock data for demo purposes
      setTimeout(() => {
        setSuccess(true);
        setRouteInfo({
          distance: '1245.78',
          duration: '16.5',
        });
        // Mock map visualization - in a real app this would be an actual map
        setMapUrl('https://maps.google.com/');
        setLoading(false);
      }, 1500);
    } finally {
      if (!success) {
        setLoading(false);
      }
    }
  };

  return (
    <div className="route-visualizer-container">
      <h2 className="section-title">Route Visualization</h2>
      <p className="section-subtitle">
        Plan and optimize transportation routes between major hubs
      </p>

      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i> {error}
        </div>
      )}

      <div className="route-layout">
        <div className="route-form-container">
          <form onSubmit={handleSubmit}>
            <div className="route-form">
              <div className="route-section">
                <h3>Origin</h3>
                <div className="route-form-group">
                  <label>Select Major Hub</label>
                  <select
                    value={startMajorHub}
                    onChange={(e) => {
                      setStartMajorHub(e.target.value);
                      setStartHub('');
                    }}
                  >
                    <option value="">Select a major hub</option>
                    {Object.keys(majorHubs).map((hubId) => (
                      <option key={`start-major-${hubId}`} value={hubId}>
                        {majorHubs[hubId].name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="route-form-group">
                  <label>Select Hub</label>
                  <select
                    value={startHub}
                    onChange={(e) => setStartHub(e.target.value)}
                    disabled={!startMajorHub}
                  >
                    <option value="">Select a hub</option>
                    {startMajorHub &&
                      hubs[startMajorHub] &&
                      hubs[startMajorHub].map((hub) => (
                        <option key={`start-hub-${hub.id}`} value={hub.id}>
                          {hub.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="route-section">
                <h3>Destination</h3>
                <div className="route-form-group">
                  <label>Select Major Hub</label>
                  <select
                    value={endMajorHub}
                    onChange={(e) => {
                      setEndMajorHub(e.target.value);
                      setEndHub('');
                    }}
                  >
                    <option value="">Select a major hub</option>
                    {Object.keys(majorHubs).map((hubId) => (
                      <option key={`end-major-${hubId}`} value={hubId}>
                        {majorHubs[hubId].name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="route-form-group">
                  <label>Select Hub</label>
                  <select
                    value={endHub}
                    onChange={(e) => setEndHub(e.target.value)}
                    disabled={!endMajorHub}
                  >
                    <option value="">Select a hub</option>
                    {endMajorHub &&
                      hubs[endMajorHub] &&
                      hubs[endMajorHub].map((hub) => (
                        <option key={`end-hub-${hub.id}`} value={hub.id}>
                          {hub.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            </div>

            <button type="submit" className="visualize-btn" disabled={loading}>
              <i className="fas fa-map-marked-alt"></i>
              {loading ? 'Calculating Route...' : 'Visualize Route'}
            </button>
          </form>

          {routeInfo && (
            <div className="route-info-box">
              <h4>Route Information</h4>
              <div className="route-detail">
                <span className="detail-label">Origin:</span>
                <span className="detail-value">
                  {startHub && hubs[startMajorHub]
                    ? hubs[startMajorHub].find((h) => h.id === startHub)?.name
                    : ''}
                  , {majorHubs[startMajorHub]?.name || ''}
                </span>
              </div>
              <div className="route-detail">
                <span className="detail-label">Destination:</span>
                <span className="detail-value">
                  {endHub && hubs[endMajorHub]
                    ? hubs[endMajorHub].find((h) => h.id === endHub)?.name
                    : ''}
                  , {majorHubs[endMajorHub]?.name || ''}
                </span>
              </div>
              <div className="route-detail">
                <span className="detail-label">Distance:</span>
                <span className="detail-value">{routeInfo.distance} km</span>
              </div>
              <div className="route-detail">
                <span className="detail-label">Est. Time:</span>
                <span className="detail-value">{routeInfo.duration} hours</span>
              </div>
            </div>
          )}
        </div>

        <div className="route-map-container">
          {loading && (
            <div className="loading-container map-loading">
              <div className="loading-spinner"></div>
              <p>Calculating optimal route...</p>
            </div>
          )}

          {mapUrl && !loading && (
            <div className="map-iframe-container">
              <iframe
                src={mapUrl}
                title="Route Map"
                className="route-map-iframe"
                allowFullScreen
              ></iframe>
            </div>
          )}

          {!mapUrl && !loading && (
            <div className="route-placeholder">
              <div className="map-placeholder-content">
                <i className="fas fa-map-marked-alt fa-3x"></i>
                <p className="route-info-text">
                  Select origin and destination to visualize route
                </p>
                <p className="route-info-subtext">
                  The map will display the optimal route between the selected
                  locations
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Container Management Dashboard Component
const ContainerManagementDashboard = ({ containers }) => {
  // Mock data for container cards to match screenshot
  const mockContainers = [
    {
      id: 'C1042',
      status: 'In Yard',
      type: '40HQ',
      location: 'Block A, Row 3, Slot 12',
      arrival: '4/20/2025',
      departure: '5/15/2025',
      contents: 'Electronics',
    },
    {
      id: 'C7589',
      status: 'In Transit',
      type: '20GP',
      location: 'En route to yard',
      arrival: '4/26/2025',
      departure: '5/10/2025',
      contents: 'Automotive Parts',
    },
    {
      id: 'C2305',
      status: 'In Yard',
      type: '40RF',
      location: 'Block C, Row 1, Slot 4',
      arrival: '4/18/2025',
      departure: '4/29/2025',
      contents: 'Perishable Goods',
    },
  ];

  return (
    <div className="container-management-dashboard">
      <h2>Container Management</h2>
      <p className="dashboard-subtitle">
        Monitor and manage every container with detailed tracking and status
        information
      </p>

      <div className="container-cards-grid">
        {mockContainers.map((container) => (
          <ContainerCard key={container.id} container={container} />
        ))}
      </div>
    </div>
  );
};

// Custom Panel Component
const DashboardPanel = ({
  id,
  title,
  width = 400,
  height = 300,
  minConstraints = [300, 200],
  maxConstraints = [Infinity, 700],
  children,
  onResize,
}) => {
  return (
    <ResizableBox
      className="dashboard-panel"
      width={width}
      height={height}
      minConstraints={minConstraints}
      maxConstraints={maxConstraints}
      handle={<div className="custom-handle"></div>}
      onResize={(e, data) => {
        if (onResize) {
          onResize(id, data.size);
        }
      }}
    >
      <div className="panel-header">
        <h3>{title}</h3>
        <div className="panel-controls">
          <button className="panel-control minimize">
            <i className="fas fa-minus"></i>
          </button>
          <button className="panel-control expand">
            <i className="fas fa-expand"></i>
          </button>
        </div>
      </div>
      <div className="panel-content">{children}</div>
    </ResizableBox>
  );
};

// Dashboard Command Bar Component
const CommandBar = ({ onSearchChange, activeModule, setActiveModule }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { currentUser } = useAuth();

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    if (onSearchChange) {
      onSearchChange(e.target.value);
    }
  };

  const currentTime = new Date();
  const currentHour = currentTime.getHours();
  let greeting = 'Good morning';

  if (currentHour >= 12 && currentHour < 17) {
    greeting = 'Good afternoon';
  } else if (currentHour >= 17) {
    greeting = 'Good evening';
  }

  return (
    <div className="command-bar">
      <div className="greeting-section">
        <h2>
          {greeting}, {currentUser?.firstName || 'User'}
        </h2>
        <p className="date-display">
          {currentTime.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      <div className="search-section">
        <div className="search-container">
          <i className="fas fa-search search-icon"></i>
          <input
            type="text"
            placeholder="Search across containers, inventory, routes..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="search-input"
          />
          <button className="voice-search">
            <i className="fas fa-microphone"></i>
          </button>
        </div>
      </div>

      <div className="module-selector">
        <button
          className={`module-button ${
            activeModule === 'routes' ? 'active' : ''
          }`}
          onClick={() => setActiveModule('routes')}
        >
          <i className="fas fa-route"></i>
          <span>Routes</span>
        </button>
        <button
          className={`module-button ${
            activeModule === 'inventory' ? 'active' : ''
          }`}
          onClick={() => setActiveModule('inventory')}
        >
          <i className="fas fa-boxes"></i>
          <span>Inventory</span>
        </button>
        <button
          className={`module-button ${
            activeModule === 'containers' ? 'active' : ''
          }`}
          onClick={() => setActiveModule('containers')}
        >
          <i className="fas fa-shipping-fast"></i>
          <span>Containers</span>
        </button>
      </div>

      <div className="quick-actions">
        <button className="action-button">
          <i className="fas fa-plus"></i>
          <span>New</span>
        </button>
        <button className="action-button">
          <i className="fas fa-cog"></i>
        </button>
        <button className="action-button notification">
          <i className="fas fa-bell"></i>
          <span className="notification-badge">3</span>
        </button>
      </div>
    </div>
  );
};

// Stats Overview Component
const StatsOverview = ({ stats }) => {
  return (
    <div className="stats-overview">
      <div className="stat-card total">
        <div className="stat-icon">
          <i className="fas fa-cubes"></i>
        </div>
        <div className="stat-details">
          <span className="stat-value">{stats.totalContainers}</span>
          <span className="stat-label">Total Containers</span>
        </div>
        <div className="stat-trend positive">
          <i className="fas fa-arrow-up"></i>
          <span>4%</span>
        </div>
      </div>

      <div className="stat-card transit">
        <div className="stat-icon">
          <i className="fas fa-shipping-fast"></i>
        </div>
        <div className="stat-details">
          <span className="stat-value">{stats.inTransit}</span>
          <span className="stat-label">In Transit</span>
        </div>
        <div className="stat-trend positive">
          <i className="fas fa-arrow-up"></i>
          <span>7%</span>
        </div>
      </div>

      <div className="stat-card yard">
        <div className="stat-icon">
          <i className="fas fa-warehouse"></i>
        </div>
        <div className="stat-details">
          <span className="stat-value">{stats.atYard}</span>
          <span className="stat-label">At Yard</span>
        </div>
        <div className="stat-trend negative">
          <i className="fas fa-arrow-down"></i>
          <span>2%</span>
        </div>
      </div>

      <div className="stat-card delivered">
        <div className="stat-icon">
          <i className="fas fa-check-circle"></i>
        </div>
        <div className="stat-details">
          <span className="stat-value">{stats.delivered}</span>
          <span className="stat-label">Delivered</span>
        </div>
        <div className="stat-trend positive">
          <i className="fas fa-arrow-up"></i>
          <span>12%</span>
        </div>
      </div>
    </div>
  );
};

const ModularDashboard = () => {
  const [activeModule, setActiveModule] = useState('containers');
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [panelSizes, setPanelSizes] = useState({
    main: { width: 1200, height: 800 },
    secondary: { width: 400, height: 600 },
    tertiary: { width: 1200, height: 300 },
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch from API
      const response = await fetch('http://localhost:5000/api/dashboard', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch dashboard data: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      setDashboardStats(data);
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      // Use mock data as fallback
      setDashboardStats({
        containers: [
          {
            id: 'C1001',
            status: 'In Transit',
            destination: 'Port of Rotterdam',
            arrival: '2025-05-03',
          },
          {
            id: 'C1002',
            status: 'At Yard',
            destination: 'Hamburg',
            arrival: '2025-04-28',
          },
          {
            id: 'C1003',
            status: 'Delivered',
            destination: 'Shanghai',
            arrival: '2025-04-22',
          },
        ],
        stats: {
          totalContainers: 125,
          inTransit: 43,
          atYard: 67,
          delivered: 15,
        },
      });
      setError('Using offline data. Connection to server failed.');
    } finally {
      setLoading(false);
    }
  };

  const handlePanelResize = (id, size) => {
    setPanelSizes((prev) => ({
      ...prev,
      [id]: size,
    }));
  };

  const renderMainContent = () => {
    switch (activeModule) {
      case 'routes':
        return <DashboardRouteVisualizer />;
      case 'inventory':
        return <Inventories />;
      case 'containers':
        return (
          <ContainerManagementDashboard
            containers={dashboardStats?.containers}
          />
        );
      default:
        return <div>Select a module to view</div>;
    }
  };

  return (
    <div className="modular-dashboard-container">
      <Header />
      <main className="dashboard-main">
        <CommandBar
          onSearchChange={(query) => console.log('Search:', query)}
          activeModule={activeModule}
          setActiveModule={setActiveModule}
        />

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading dashboard data...</p>
          </div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <>
            {dashboardStats && <StatsOverview stats={dashboardStats.stats} />}

            <div className="dashboard-panels">
              <div className="panel-layout">
                <DashboardPanel
                  id="main"
                  title={
                    activeModule === 'routes'
                      ? 'Route Visualization'
                      : activeModule === 'inventory'
                      ? 'Inventory Management'
                      : 'Container Management'
                  }
                  width={panelSizes.main.width}
                  height={panelSizes.main.height}
                  onResize={handlePanelResize}
                >
                  {renderMainContent()}
                </DashboardPanel>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default ModularDashboard;
