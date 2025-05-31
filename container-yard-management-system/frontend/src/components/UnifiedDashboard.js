import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../styles/App.css';
import { Alert, Card, Badge, Spinner } from 'react-bootstrap';

// Import our custom components
import MapPicker from './MapPicker';
import CreateContainerModal from './CreateContainerModal';
import NetworkVisualizer from './NetworkVisualizer';
import MSTVisualizer from './MSTVisualizer';
import './NetworkDashboard.css'; // Import network dashboard styles

const UnifiedDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [containers, setContainers] = useState([]);
  const [majorHubs, setMajorHubs] = useState([]);
  const [hubs, setHubs] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedContainer, setSelectedContainer] = useState(null);
  const [activeTab, setActiveTab] = useState('containers');
  const [mstData, setMstData] = useState(null);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [networkMetrics, setNetworkMetrics] = useState({
    nodes: 0,
    connections: 0,
    totalDistance: 0,
    efficiency: 0,
  });
  const [mapUrl, setMapUrl] = useState(null);
  const [networkVisualizationTab, setNetworkVisualizationTab] =
    useState('interactive');

  // Fetch required data on component mount
  useEffect(() => {
    fetchContainers();
    fetchHubs();
    fetchMSTData();

    // Check for messages from route navigation (like after dispatching a container)
    if (location.state?.success) {
      setNotification({
        type: 'success',
        message: location.state.message,
      });

      // Clear location state after showing the notification
      window.history.replaceState({}, document.title);

      // Auto-dismiss notification after 5 seconds
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    }
  }, [location]);

  // Fetch containers data
  const fetchContainers = async () => {
    try {
      const response = await axios.get('/api/containers');
      if (response.data.success) {
        setContainers(response.data.containers);
      } else {
        console.warn('API returned unsuccessful response for containers');
        // Fall back to mock data
        useMockData();
      }
    } catch (error) {
      console.error('Error fetching containers:', error);
      // Fall back to mock data during development
      useMockData();
    }
  };

  // Use mock data when API fails
  const useMockData = () => {
    setContainers([
      {
        id: 'MAEU1234567',
        container_id: 'MAEU1234567',
        type: '20GP',
        status: 'In Yard',
        major_hub: 'mumbai_hub',
        hub: 'mumbai_north',
        contents: 'Electronics',
        notes: 'Handle with care',
        fill_percentage: 75,
        priority: 'normal',
        pickup_lat: '19.0760',
        pickup_lng: '72.8777',
        drop_lat: '18.5204',
        drop_lng: '73.8567',
        pickup_address: 'Mumbai Port',
        drop_address: 'Pune Logistics Hub',
      },
      {
        id: 'CMAU7654321',
        container_id: 'CMAU7654321',
        type: '40HC',
        status: 'In Transit',
        major_hub: 'delhi_hub',
        hub: 'delhi_tughlakabad',
        contents: 'Textiles',
        notes: '',
        fill_percentage: 90,
        priority: 'high',
        pickup_lat: '28.7041',
        pickup_lng: '77.1025',
        drop_lat: '20.2961',
        drop_lng: '85.8245',
        pickup_address: 'Delhi Hub',
        drop_address: 'Bhubaneswar, Odisha',
      },
      {
        id: 'HLXU5432198',
        container_id: 'HLXU5432198',
        type: '40RF',
        status: 'Delivered',
        major_hub: 'chennai_hub',
        hub: 'chennai_port',
        contents: 'Perishable Goods',
        notes: 'Temperature controlled',
        fill_percentage: 65,
        priority: 'urgent',
        pickup_lat: '13.0827',
        pickup_lng: '80.2707',
        drop_lat: '12.9716',
        drop_lng: '77.5946',
        pickup_address: 'Chennai Port',
        drop_address: 'Bangalore City',
      },
    ]);
  };

  // Fetch hubs data
  const fetchHubs = async () => {
    try {
      const response = await axios.get('/api/logistics/hubs');
      if (response.data?.success) {
        setMajorHubs(response.data.majorHubs);
        setHubs(response.data.hubs);
      } else {
        // Mock data for development
        setMajorHubs([
          { id: 'mumbai_hub', name: 'Mumbai Container Terminal' },
          { id: 'delhi_hub', name: 'Delhi Inland Container Depot' },
          { id: 'chennai_hub', name: 'Chennai Port Terminal' },
          { id: 'kolkata_hub', name: 'Kolkata Container Facility' },
          { id: 'bangalore_hub', name: 'Bangalore Logistics Park' },
        ]);

        setHubs([
          {
            id: 'mumbai_north',
            name: 'Mumbai North Terminal',
            major_hub: 'mumbai_hub',
          },
          {
            id: 'mumbai_south',
            name: 'Mumbai South Terminal',
            major_hub: 'mumbai_hub',
          },
          {
            id: 'delhi_tughlakabad',
            name: 'Tughlakabad ICD',
            major_hub: 'delhi_hub',
          },
          {
            id: 'delhi_patparganj',
            name: 'Patparganj ICD',
            major_hub: 'delhi_hub',
          },
          {
            id: 'chennai_port',
            name: 'Chennai Port',
            major_hub: 'chennai_hub',
          },
          {
            id: 'kolkata_dock',
            name: 'Kolkata Dock System',
            major_hub: 'kolkata_hub',
          },
          {
            id: 'whitefield',
            name: 'Whitefield ICD',
            major_hub: 'bangalore_hub',
          },
        ]);
      }
    } catch (error) {
      console.error('Error fetching hubs:', error);
    }
  };

  // Fetch MST data for visualization
  const fetchMSTData = async () => {
    try {
      setLoading(true);
      // First try to fetch from our new dedicated endpoint
      const response = await axios
        .get('http://localhost:5000/api/visualize/mst', {
          withCredentials: true,
        })
        .catch(() => {
          // Fall back to the old endpoint if new one fails
          return axios.get('/api/logistics/mst');
        });

      if (response.data?.success) {
        // Handle data from new endpoint
        const data = response.data;

        setMstData({
          mst: data.mst_edges,
          totalDistance: data.total_distance,
          edgeCount: data.mst_edges?.length || 0,
          hubCount: data.hub_count || 0,
        });

        // Set map URL if available
        if (data.map_url) {
          setMapUrl(data.map_url);
        }

        // Update network metrics
        setNetworkMetrics({
          nodes: data.hub_count || 0,
          connections: data.mst_edges?.length || 0,
          totalDistance: parseFloat(data.total_distance?.toFixed(2)) || 0,
          // Calculate an efficiency score
          efficiency: Math.min(
            100,
            Math.round(
              (100 * (data.hub_count - 1)) / data.mst_edges?.length || 0
            )
          ),
        });
      } else {
        // Handle old endpoint data or use mock data
        const mockMST = {
          nodeCount: 12,
          edgeCount: 11,
          totalDistance: 2680.42,
          nodes: [
            { id: 'mumbai_hub', lat: 19.076, lng: 72.8777 },
            { id: 'delhi_hub', lat: 28.7041, lng: 77.1025 },
            { id: 'chennai_hub', lat: 13.0827, lng: 80.2707 },
            { id: 'kolkata_hub', lat: 22.5726, lng: 88.3639 },
            { id: 'bangalore_hub', lat: 12.9716, lng: 77.5946 },
          ],
          edges: [
            { from: 'mumbai_hub', to: 'delhi_hub', distance: 1163 },
            { from: 'delhi_hub', to: 'kolkata_hub', distance: 1304 },
            { from: 'kolkata_hub', to: 'chennai_hub', distance: 1369 },
            { from: 'chennai_hub', to: 'bangalore_hub', distance: 335 },
          ],
        };

        setMstData(mockMST);

        // Update metrics with mock data
        setNetworkMetrics({
          nodes: mockMST.nodeCount || 0,
          connections: mockMST.edgeCount || 0,
          totalDistance: parseFloat(mockMST.totalDistance?.toFixed(2)) || 0,
          efficiency: 94.8, // Mock efficiency score
        });
      }
    } catch (error) {
      console.error('Error fetching MST data:', error);
      // Set mock data as fallback
      setNetworkMetrics({
        nodes: 12,
        connections: 11,
        totalDistance: 2680.42,
        efficiency: 94.8,
      });
    } finally {
      setLoading(false);
    }
  };

  // Open container creation modal
  const openCreateModal = () => {
    setSelectedContainer(null);
    setShowCreateModal(true);
  };

  // Handle container save from modal
  const handleSaveContainer = async (containerData) => {
    try {
      // In a real implementation, this would call an API endpoint
      const isNewContainer = !selectedContainer;
      let updatedContainer;

      if (isNewContainer) {
        // For demo purposes, just add the container to state
        updatedContainer = {
          ...containerData,
          id: containerData.container_id,
          created_at: new Date().toISOString(),
        };

        setContainers([...containers, updatedContainer]);

        setNotification({
          type: 'success',
          message: `Container ${containerData.container_id} created successfully!`,
        });
      } else {
        // Update existing container
        updatedContainer = {
          ...containerData,
          id: selectedContainer.id,
          updated_at: new Date().toISOString(),
        };

        setContainers(
          containers.map((c) =>
            c.id === selectedContainer.id ? updatedContainer : c
          )
        );

        setNotification({
          type: 'success',
          message: `Container ${containerData.container_id} updated successfully!`,
        });
      }

      // Auto-dismiss notification after 5 seconds
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    } catch (error) {
      console.error('Error saving container:', error);
      setNotification({
        type: 'danger',
        message: `Error ${
          selectedContainer ? 'updating' : 'creating'
        } container: ${error.message}`,
      });
    }
  };

  // Open container edit modal
  const handleEditContainer = (container) => {
    setSelectedContainer(container);
    setShowCreateModal(true);
  };

  // Handle container deletion
  const handleDeleteContainer = async (containerId) => {
    if (!window.confirm('Are you sure you want to delete this container?')) {
      return;
    }

    try {
      // In a real implementation, this would call an API endpoint
      setContainers(containers.filter((c) => c.id !== containerId));

      setNotification({
        type: 'success',
        message: `Container ${containerId} deleted successfully!`,
      });

      // Auto-dismiss notification after 5 seconds
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    } catch (error) {
      console.error('Error deleting container:', error);
      setNotification({
        type: 'danger',
        message: `Error deleting container: ${error.message}`,
      });
    }
  };

  // Handle container actions (Urgent or Dispatch)
  const handleContainerAction = (container, action) => {
    // Navigate to the route optimization page with container details
    navigate('/route-optimization', {
      state: {
        container: container,
        action: action,
      },
    });
  };

  // Calculate progress bar color based on fill percentage
  const getProgressColor = (fillPercentage, priority) => {
    if (priority === 'urgent' && fillPercentage >= 50) {
      return 'var(--status-delayed)'; // Red for urgent containers past threshold
    } else if (fillPercentage >= 90) {
      return 'var(--status-delayed)'; // Red for regular containers past threshold
    } else if (fillPercentage >= 75) {
      return 'var(--status-in-transit)'; // Yellow/amber for approaching threshold
    } else {
      return 'var(--status-delivered)'; // Green for normal levels
    }
  };

  // Render container cards
  const renderContainerCards = () => {
    if (containers.length === 0) {
      return (
        <div className="empty-state">
          <i className="fas fa-box-open fa-3x"></i>
          <p>
            No containers found. Click "Create New Container" to add your first
            container.
          </p>
        </div>
      );
    }

    return (
      <div className="container-grid">
        {containers.map((container) => (
          <div
            key={container.id || container.container_id}
            className="card animate-in"
          >
            <div className="card-header">
              <h2>
                <i className="fas fa-shipping-fast"></i>{' '}
                {container.id || container.container_id}
              </h2>
              <span
                className={`status-badge status-${
                  container.status?.toLowerCase().replace(/\s/g, '-') ||
                  'in-yard'
                }`}
              >
                {container.status || 'In Yard'}
              </span>
            </div>

            <div className="card-body">
              <div className="detail-row">
                <span className="detail-label">Type:</span>
                <span className="detail-value">{container.type || 'N/A'}</span>
              </div>

              <div className="detail-row">
                <span className="detail-label">Contents:</span>
                <span className="detail-value">
                  {container.contents || 'N/A'}
                </span>
              </div>

              <div className="detail-row">
                <span className="detail-label">Hub:</span>
                <span className="detail-value">
                  {hubs.find((h) => h.id === container.hub)?.name ||
                    container.hub ||
                    'N/A'}
                </span>
              </div>

              <div className="detail-row">
                <span className="detail-label">Major Hub:</span>
                <span className="detail-value">
                  {majorHubs.find((h) => h.id === container.major_hub)?.name ||
                    container.major_hub ||
                    'N/A'}
                </span>
              </div>

              <div className="detail-row">
                <span className="detail-label">Priority:</span>
                <span
                  className={`detail-value priority-${
                    container.priority || 'normal'
                  }`}
                >
                  {container.priority
                    ? container.priority.charAt(0).toUpperCase() +
                      container.priority.slice(1)
                    : 'Normal'}
                </span>
              </div>

              {/* Fill percentage bar */}
              <div className="fill-percentage-container">
                <span className="detail-label">Fill %:</span>
                <div className="progress-bar-container">
                  <div
                    className="progress-bar"
                    style={{
                      width: `${container.fill_percentage || 0}%`,
                      backgroundColor: getProgressColor(
                        container.fill_percentage || 0,
                        container.priority || 'normal'
                      ),
                    }}
                  ></div>
                </div>
                <span className="percentage-value">
                  {container.fill_percentage || 0}%
                </span>
              </div>

              {/* Show pickup/drop info if available */}
              {container.pickup_lat && container.pickup_lng && (
                <div className="detail-row">
                  <span className="detail-label">Pickup:</span>
                  <span className="detail-value coord-value">
                    {container.pickup_address ||
                      `${container.pickup_lat}, ${container.pickup_lng}`}
                  </span>
                </div>
              )}

              {container.drop_lat && container.drop_lng && (
                <div className="detail-row">
                  <span className="detail-label">Destination:</span>
                  <span className="detail-value coord-value">
                    {container.drop_address ||
                      `${container.drop_lat}, ${container.drop_lng}`}
                  </span>
                </div>
              )}

              <div className="container-actions">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleEditContainer(container)}
                >
                  <i className="fas fa-edit"></i> Edit
                </button>
                <button
                  className="btn btn-warning btn-sm"
                  onClick={() => handleContainerAction(container, 'urgent')}
                  disabled={container.status === 'Delivered'}
                >
                  <i className="fas fa-exclamation-triangle"></i> Urgent
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => handleContainerAction(container, 'dispatch')}
                  disabled={
                    container.status === 'In Transit' ||
                    container.status === 'Delivered'
                  }
                >
                  <i className="fas fa-truck"></i> Dispatch
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Placeholder for empty state */}
        {containers.length === 0 && (
          <div className="empty-state">
            <i className="fas fa-box-open fa-3x"></i>
            <p>
              No containers found. Click "Create New Container" to add your
              first container.
            </p>
          </div>
        )}
      </div>
    );
  };

  // Render MST visualization tab - enhanced version
  const renderMSTVisualizer = () => {
    return (
      <div className="mst-visualizer-container">
        {/* Network stats cards */}
        <div className="dashboard-summary">
          <div className="stats-container">
            <div className="stat-card">
              <div className="stat-card-inner">
                <div className="stat-icon">
                  <i className="fas fa-network-wired"></i>
                </div>
                <div className="stat-content">
                  <h3>Network Nodes</h3>
                  <div className="stat-value">
                    {loading ? (
                      <div className="placeholder-glow">
                        <span className="placeholder col-8"></span>
                      </div>
                    ) : (
                      networkMetrics.nodes
                    )}
                  </div>
                  {!loading && (
                    <Badge bg="success">
                      <i className="fas fa-check me-1"></i> Optimal
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-inner">
                <div className="stat-icon">
                  <i className="fas fa-route"></i>
                </div>
                <div className="stat-content">
                  <h3>Optimized Connections</h3>
                  <div className="stat-value">
                    {loading ? (
                      <div className="placeholder-glow">
                        <span className="placeholder col-8"></span>
                      </div>
                    ) : (
                      networkMetrics.connections
                    )}
                  </div>
                  {!loading && (
                    <Badge bg="success">
                      <i className="fas fa-chart-line me-1"></i> Minimized
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-inner">
                <div className="stat-icon">
                  <i className="fas fa-road"></i>
                </div>
                <div className="stat-content">
                  <h3>Total Distance</h3>
                  <div className="stat-value">
                    {loading ? (
                      <div className="placeholder-glow">
                        <span className="placeholder col-8"></span>
                      </div>
                    ) : (
                      `${networkMetrics.totalDistance} km`
                    )}
                  </div>
                  {!loading && (
                    <Badge bg="info">
                      <i className="fas fa-compress-arrows-alt me-1"></i>{' '}
                      Optimized
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-inner">
                <div className="stat-icon">
                  <i className="fas fa-tachometer-alt"></i>
                </div>
                <div className="stat-content">
                  <h3>Efficiency Score</h3>
                  <div className="stat-value">
                    {loading ? (
                      <div className="placeholder-glow">
                        <span className="placeholder col-8"></span>
                      </div>
                    ) : (
                      `${networkMetrics.efficiency}%`
                    )}
                  </div>
                  {!loading && (
                    <Badge bg="warning">
                      <i className="fas fa-bolt me-1"></i> High Performance
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <Card className="shadow-sm border-0 mt-4">
          <Card.Header className="bg-dark text-white d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              <i className="fas fa-project-diagram me-2"></i>
              Network Visualization
            </h5>
            <div>
              <button
                className={`btn btn-sm ${
                  networkVisualizationTab === 'interactive'
                    ? 'btn-light'
                    : 'btn-outline-light'
                } me-2`}
                onClick={() => setNetworkVisualizationTab('interactive')}
              >
                <i className="fas fa-globe me-1"></i> Interactive
              </button>
              <button
                className={`btn btn-sm ${
                  networkVisualizationTab === 'python'
                    ? 'btn-light'
                    : 'btn-outline-light'
                }`}
                onClick={() => setNetworkVisualizationTab('python')}
              >
                <i className="fas fa-map me-1"></i> Python MST
              </button>
            </div>
          </Card.Header>

          <Card.Body>
            <div
              style={{ height: '600px', position: 'relative' }}
              className="border rounded bg-light"
            >
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-2">Loading network data...</p>
                </div>
              ) : networkVisualizationTab === 'interactive' ? (
                <NetworkVisualizer />
              ) : mapUrl ? (
                <div className="embed-responsive" style={{ height: '100%' }}>
                  <iframe
                    src={mapUrl}
                    className="embed-responsive-item"
                    style={{
                      width: '100%',
                      height: '100%',
                      border: 'none',
                    }}
                    title="MST Network Map"
                  ></iframe>
                </div>
              ) : (
                <MSTVisualizer mstData={mstData} selectedPath={[]} />
              )}
            </div>
          </Card.Body>
        </Card>

        <Card className="shadow-sm border-0 mt-4">
          <Card.Header className="bg-light">
            <h5 className="mb-0">Network Optimization Insights</h5>
          </Card.Header>
          <Card.Body>
            <div className="row">
              <div className="col-md-6">
                <h5>Minimum Spanning Tree Analysis</h5>
                <p>
                  Your network consists of {networkMetrics.nodes} connected hubs
                  with a total optimal distance of{' '}
                  {networkMetrics.totalDistance} km.
                </p>
                <p>
                  The MST algorithm has found the most efficient way to connect
                  all hubs using only {networkMetrics.connections} connections,
                  eliminating redundant routes.
                </p>
              </div>
              <div className="col-md-6">
                <h5>Logistics Optimization Recommendations</h5>
                <ul>
                  <li>
                    Consider establishing regional distribution centers at major
                    hub junctions
                  </li>
                  <li>
                    The network diameter is approximately{' '}
                    {Math.ceil(Math.sqrt(networkMetrics.nodes) * 2)} hops
                  </li>
                  <li>Focus cargo consolidation at hubs with 3+ connections</li>
                  <li>
                    Consider adding redundant routes for critical high-traffic
                    paths
                  </li>
                </ul>
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>
    );
  };

  // Render statistics tab
  const renderStatistics = () => {
    return (
      <div className="statistics-container">
        <div className="dashboard-summary">
          <div className="stats-container">
            <div className="stat-card">
              <div className="stat-card-inner">
                <div className="stat-icon">
                  <i className="fas fa-box"></i>
                </div>
                <div className="stat-content">
                  <h3>Active Containers</h3>
                  <div className="stat-value">{containers.length}</div>
                </div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-inner">
                <div className="stat-icon">
                  <i className="fas fa-truck-moving"></i>
                </div>
                <div className="stat-content">
                  <h3>In Transit</h3>
                  <div className="stat-value">
                    {containers.filter((c) => c.status === 'In Transit').length}
                  </div>
                </div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-inner">
                <div className="stat-icon">
                  <i className="fas fa-fill-drip"></i>
                </div>
                <div className="stat-content">
                  <h3>Average Fill</h3>
                  <div className="stat-value">
                    {containers.length
                      ? `${Math.round(
                          containers.reduce(
                            (acc, c) => acc + (c.fill_percentage || 0),
                            0
                          ) / containers.length
                        )}%`
                      : '0%'}
                  </div>
                </div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-inner">
                <div className="stat-icon">
                  <i className="fas fa-exclamation-circle"></i>
                </div>
                <div className="stat-content">
                  <h3>Urgent Status</h3>
                  <div className="stat-value">
                    {containers.filter((c) => c.priority === 'urgent').length}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="recent-containers">
          <h2>
            <i className="fas fa-clipboard-list"></i> Container Status Overview
          </h2>
          <div className="table-responsive">
            <table className="container-table">
              <thead>
                <tr>
                  <th>Container ID</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Fill %</th>
                  <th>Location</th>
                </tr>
              </thead>
              <tbody>
                {containers.slice(0, 5).map((container) => (
                  <tr key={container.id || container.container_id}>
                    <td>{container.id || container.container_id}</td>
                    <td>{container.type || 'N/A'}</td>
                    <td>
                      <span
                        className={`status-badge status-${
                          container.status?.toLowerCase().replace(/\s/g, '-') ||
                          'in-yard'
                        }`}
                      >
                        {container.status || 'In Yard'}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`priority-${container.priority || 'normal'}`}
                      >
                        {container.priority
                          ? container.priority.charAt(0).toUpperCase() +
                            container.priority.slice(1)
                          : 'Normal'}
                      </span>
                    </td>
                    <td>{container.fill_percentage || 0}%</td>
                    <td>{container.hub || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Main render
  return (
    <div className="unified-dashboard">
      <div className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">Container Yard Management System</h1>
          <p className="welcome-message">
            Monitor and manage all container operations from a single interface.
            Coordinate logistics, track inventory, and optimize routes.
          </p>
        </div>
      </div>

      {/* Notification area */}
      {notification && (
        <Alert
          variant={notification.type}
          className={`notification ${
            notification.type === 'danger'
              ? 'error-notification'
              : 'success-notification'
          }`}
          onClose={() => setNotification(null)}
          dismissible
        >
          <div className="notification-icon">
            <i
              className={
                notification.type === 'danger'
                  ? 'fas fa-exclamation-circle'
                  : 'fas fa-check-circle'
              }
            ></i>
          </div>
          <div className="notification-content">{notification.message}</div>
          <button
            className="notification-close"
            onClick={() => setNotification(null)}
          >
            <i className="fas fa-times"></i>
          </button>
        </Alert>
      )}

      <div className="dashboard-tabs">
        <button
          className={`tab-button ${activeTab === 'containers' ? 'active' : ''}`}
          onClick={() => setActiveTab('containers')}
        >
          <i className="fas fa-box-open"></i> Container Management
        </button>
        <button
          className={`tab-button ${activeTab === 'mst' ? 'active' : ''}`}
          onClick={() => setActiveTab('mst')}
        >
          <i className="fas fa-project-diagram"></i> Network Visualization
        </button>
        <button
          className={`tab-button ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          <i className="fas fa-chart-line"></i> Logistics Statistics
        </button>
      </div>

      {/* Create Container Button */}
      <div className="dashboard-actions">
        <button className="btn btn-primary" onClick={openCreateModal}>
          <i className="fas fa-plus"></i> Create New Container
        </button>
      </div>

      {/* Dashboard Content */}
      <div className="dashboard-content animate-in">
        {activeTab === 'containers' && renderContainerCards()}
        {activeTab === 'mst' && renderMSTVisualizer()}
        {activeTab === 'stats' && renderStatistics()}
      </div>

      {/* Container Creation/Edit Modal */}
      <CreateContainerModal
        show={showCreateModal}
        handleClose={() => setShowCreateModal(false)}
        handleSave={handleSaveContainer}
        container={selectedContainer}
      />
    </div>
  );
};

export default UnifiedDashboard;
