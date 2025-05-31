import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Alert,
  Spinner,
  Tabs,
  Tab,
  Badge,
} from 'react-bootstrap';
import MSTVisualizer from './MSTVisualizer';
import NetworkVisualizer from './NetworkVisualizer';
import { useAuth } from '../contexts/AuthContext';
import './NetworkDashboard.css'; // Import the stylesheet

const NetworkDashboard = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mstData, setMstData] = useState(null);
  const [mapUrl, setMapUrl] = useState(null);
  const [selectedPath, setSelectedPath] = useState([]);
  const [activeTab, setActiveTab] = useState('interactive');
  const [networkMetrics, setNetworkMetrics] = useState({
    nodes: 0,
    connections: 0,
    totalDistance: 0,
    efficiency: 0,
  });

  // API URL
  const API_URL = 'http://localhost:5000';

  // Fetch MST data from backend
  useEffect(() => {
    const fetchMstData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch the MST data from our new endpoint
        const response = await fetch(`${API_URL}/api/visualize/mst`, {
          credentials: 'include',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.message || 'Failed to fetch MST data');
        }

        setMstData({
          mst: data.mst_edges,
          totalDistance: data.total_distance,
          edgeCount: data.mst_edges.length,
          hubCount: data.hub_count,
        });

        // Update network metrics for the stat cards
        setNetworkMetrics({
          nodes: data.hub_count,
          connections: data.mst_edges.length,
          totalDistance: parseFloat(data.total_distance.toFixed(2)),
          // Calculate efficiency score (normalized between 0-100)
          efficiency: Math.min(
            100,
            Math.round((100 * (data.hub_count - 1)) / data.mst_edges.length)
          ),
        });

        // Set the map URL for the Folium visualization
        setMapUrl(data.map_url);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching MST data:', err);
        setError(err.message || 'Failed to load network data');
        setLoading(false);
      }
    };

    fetchMstData();
  }, []);

  // Handle path selection between two hubs
  const handleSelectPath = (source, target) => {
    setSelectedPath([source, target]);
  };

  return (
    <Container fluid className="mt-4 pb-4">
      {/* Network stats cards */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="mb-0">Network Optimization Dashboard</h2>
              <p className="text-muted mb-0">
                Visualize and optimize your logistics network using minimum
                spanning trees
              </p>
            </div>
            <div>
              <Button variant="danger">
                <i className="fas fa-plus me-2"></i>
                Create New Container
              </Button>
            </div>
          </div>

          <div className="network-quick-actions mb-3">
            <Button variant="outline-dark" className="me-2">
              <i className="fas fa-box me-1"></i> Container Management
            </Button>
            <Button variant="outline-dark" className="me-2 active">
              <i className="fas fa-project-diagram me-1"></i> Network
              Visualization
            </Button>
            <Button variant="outline-dark">
              <i className="fas fa-chart-line me-1"></i> Logistics Statistics
            </Button>
          </div>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={3}>
          <Card className="dashboard-stat-card shadow-sm border-0 h-100">
            <Card.Body className="d-flex flex-column">
              <div className="d-flex align-items-center mb-3">
                <div className="stat-icon bg-primary-subtle rounded-circle p-3 me-3">
                  <i className="fas fa-network-wired text-primary"></i>
                </div>
                <div>
                  <h6 className="text-uppercase text-muted m-0">
                    NETWORK NODES
                  </h6>
                </div>
              </div>
              <div className="stat-value mt-2">
                {loading ? (
                  <div className="placeholder-glow">
                    <span className="placeholder col-8"></span>
                  </div>
                ) : (
                  <h3>{networkMetrics.nodes}</h3>
                )}
              </div>
              {!loading && (
                <div className="mt-auto">
                  <Badge bg="success" className="mt-2">
                    <i className="fas fa-check me-1"></i> Optimal
                  </Badge>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="dashboard-stat-card shadow-sm border-0 h-100">
            <Card.Body className="d-flex flex-column">
              <div className="d-flex align-items-center mb-3">
                <div className="stat-icon bg-success-subtle rounded-circle p-3 me-3">
                  <i className="fas fa-route text-success"></i>
                </div>
                <div>
                  <h6 className="text-uppercase text-muted m-0">
                    OPTIMIZED CONNECTIONS
                  </h6>
                </div>
              </div>
              <div className="stat-value mt-2">
                {loading ? (
                  <div className="placeholder-glow">
                    <span className="placeholder col-8"></span>
                  </div>
                ) : (
                  <h3>{networkMetrics.connections}</h3>
                )}
              </div>
              {!loading && (
                <div className="mt-auto">
                  <Badge bg="success" className="mt-2">
                    <i className="fas fa-chart-line me-1"></i> Minimized
                  </Badge>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="dashboard-stat-card shadow-sm border-0 h-100">
            <Card.Body className="d-flex flex-column">
              <div className="d-flex align-items-center mb-3">
                <div className="stat-icon bg-info-subtle rounded-circle p-3 me-3">
                  <i className="fas fa-road text-info"></i>
                </div>
                <div>
                  <h6 className="text-uppercase text-muted m-0">
                    TOTAL DISTANCE
                  </h6>
                </div>
              </div>
              <div className="stat-value mt-2">
                {loading ? (
                  <div className="placeholder-glow">
                    <span className="placeholder col-8"></span>
                  </div>
                ) : (
                  <h3>
                    {networkMetrics.totalDistance}{' '}
                    <small className="text-muted">km</small>
                  </h3>
                )}
              </div>
              {!loading && (
                <div className="mt-auto">
                  <Badge bg="info" className="mt-2">
                    <i className="fas fa-compress-arrows-alt me-1"></i>{' '}
                    Optimized
                  </Badge>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="dashboard-stat-card shadow-sm border-0 h-100">
            <Card.Body className="d-flex flex-column">
              <div className="d-flex align-items-center mb-3">
                <div className="stat-icon bg-warning-subtle rounded-circle p-3 me-3">
                  <i className="fas fa-tachometer-alt text-warning"></i>
                </div>
                <div>
                  <h6 className="text-uppercase text-muted m-0">
                    EFFICIENCY SCORE
                  </h6>
                </div>
              </div>
              <div className="stat-value mt-2">
                {loading ? (
                  <div className="placeholder-glow">
                    <span className="placeholder col-8"></span>
                  </div>
                ) : (
                  <h3>
                    {networkMetrics.efficiency}
                    <small>%</small>
                  </h3>
                )}
              </div>
              {!loading && (
                <div className="mt-auto">
                  <Badge bg="warning" className="mt-2">
                    <i className="fas fa-bolt me-1"></i> High Performance
                  </Badge>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {error && (
        <Row className="mb-4">
          <Col>
            <Alert variant="danger">
              <Alert.Heading>Error Loading Network Data</Alert.Heading>
              <p>{error}</p>
            </Alert>
          </Col>
        </Row>
      )}

      <Row className="mb-4">
        <Col>
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-dark text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="fas fa-project-diagram me-2"></i>
                Network Visualization
              </h5>
              <div>
                <Button variant="outline-light" size="sm" className="me-2">
                  <i className="fas fa-download me-1"></i> Export
                </Button>
                <Button variant="outline-light" size="sm">
                  <i className="fas fa-sync me-1"></i> Refresh
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              <Tabs
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k)}
                className="mb-3 nav-tabs-modern"
              >
                <Tab eventKey="interactive" title="Interactive Visualization">
                  <div className="mb-3">
                    <p>
                      This visualization shows the minimum spanning tree (MST)
                      of your logistics network. The MST represents the most
                      efficient way to connect all your logistics hubs with the
                      minimum total distance.
                    </p>
                  </div>

                  <div
                    style={{ height: '600px', position: 'relative' }}
                    className="border rounded bg-light"
                  >
                    {loading ? (
                      <div className="text-center py-5">
                        <Spinner animation="border" variant="primary" />
                        <p className="mt-2">Loading network data...</p>
                      </div>
                    ) : (
                      <NetworkVisualizer />
                    )}
                  </div>
                </Tab>

                <Tab eventKey="python" title="Python MST Visualization">
                  <div className="mb-3">
                    <p>
                      This visualization uses our Python backend to calculate
                      the minimum spanning tree using Kruskal's algorithm. It
                      shows the optimal network that connects all hubs with the
                      minimum total distance.
                    </p>

                    {mstData && (
                      <div className="d-flex flex-wrap mb-3">
                        <div className="me-3 mb-2 stats-badge">
                          <strong>Total Distance:</strong>{' '}
                          <span className="badge bg-primary">
                            {mstData.totalDistance.toFixed(2)} km
                          </span>
                        </div>
                        <div className="me-3 mb-2 stats-badge">
                          <strong>Network Connections:</strong>{' '}
                          <span className="badge bg-success">
                            {mstData.edgeCount}
                          </span>
                        </div>
                        <div className="mb-2 stats-badge">
                          <strong>Connected Hubs:</strong>{' '}
                          <span className="badge bg-info">
                            {mstData.hubCount}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div
                    style={{ height: '600px', position: 'relative' }}
                    className="border rounded"
                  >
                    {loading ? (
                      <div className="text-center py-5">
                        <Spinner animation="border" variant="primary" />
                        <p className="mt-2">Loading Python MST data...</p>
                      </div>
                    ) : mapUrl ? (
                      <div
                        className="embed-responsive"
                        style={{ height: '100%' }}
                      >
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
                      <MSTVisualizer
                        mstData={mstData}
                        selectedPath={selectedPath}
                      />
                    )}
                  </div>
                </Tab>

                <Tab eventKey="analytics" title="Network Analytics">
                  <div className="mb-3">
                    <p>
                      Network analytics provides insights into your logistics
                      network's efficiency, highlighting key hubs, bottlenecks,
                      and optimization opportunities.
                    </p>
                  </div>

                  {loading ? (
                    <div className="text-center py-5">
                      <Spinner animation="border" variant="primary" />
                      <p className="mt-2">Loading analytics data...</p>
                    </div>
                  ) : mstData ? (
                    <Row>
                      <Col md={6}>
                        <Card className="mb-3 h-100 shadow-sm border-0">
                          <Card.Header className="bg-light">
                            <h5 className="mb-0">Network Efficiency</h5>
                          </Card.Header>
                          <Card.Body>
                            <div className="mb-3">
                              <h5>Minimum Spanning Tree Analysis</h5>
                              <p>
                                Your network consists of {mstData.hubCount}{' '}
                                connected hubs with a total optimal distance of{' '}
                                {mstData.totalDistance.toFixed(2)} km.
                              </p>
                              <p>
                                The MST algorithm has found the most efficient
                                way to connect all hubs using only{' '}
                                {mstData.edgeCount} connections, eliminating
                                redundant routes.
                              </p>
                            </div>
                            <div>
                              <h5>Network Density</h5>
                              <p>
                                Network density:{' '}
                                <Badge bg="primary">
                                  {(
                                    (2 * mstData.edgeCount) /
                                    (mstData.hubCount * (mstData.hubCount - 1))
                                  ).toFixed(4)}
                                </Badge>
                              </p>
                              <p>
                                Average distance per connection:{' '}
                                <Badge bg="info">
                                  {(
                                    mstData.totalDistance / mstData.edgeCount
                                  ).toFixed(2)}{' '}
                                  km
                                </Badge>
                              </p>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col md={6}>
                        <Card className="mb-3 h-100 shadow-sm border-0">
                          <Card.Header className="bg-light">
                            <h5 className="mb-0">
                              Optimization Recommendations
                            </h5>
                          </Card.Header>
                          <Card.Body>
                            <div className="mb-3">
                              <h5>Logistics Insights</h5>
                              <ul>
                                <li>
                                  Consider establishing regional distribution
                                  centers at major hub junctions
                                </li>
                                <li>
                                  The network diameter is approximately{' '}
                                  {Math.ceil(Math.sqrt(mstData.hubCount) * 2)}{' '}
                                  hops
                                </li>
                                <li>
                                  Focus cargo consolidation at hubs with 3+
                                  connections
                                </li>
                                <li>
                                  Consider adding redundant routes for critical
                                  high-traffic paths
                                </li>
                              </ul>
                            </div>
                            <div>
                              <Button variant="primary" className="me-2">
                                <i className="fas fa-file-pdf me-2"></i>
                                Generate Full Report
                              </Button>
                              <Button variant="outline-secondary">
                                <i className="fas fa-cogs me-2"></i>
                                Advanced Analysis
                              </Button>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  ) : (
                    <Alert variant="warning">
                      No network data available for analytics. Please refresh
                      the page or try again later.
                    </Alert>
                  )}
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-info text-white">
              <h5 className="mb-0">
                <i className="fas fa-info-circle me-2"></i>
                About Minimum Spanning Trees
              </h5>
            </Card.Header>
            <Card.Body>
              <p>
                A <strong>Minimum Spanning Tree (MST)</strong> is a subset of
                edges in a connected, undirected graph that connects all
                vertices together with the minimal total edge weight.
              </p>
              <p>
                In the context of logistics networks, MST identifies the most
                cost-effective way to connect all hubs while minimizing the
                total distance or cost of connections.
              </p>
              <p>
                Our system uses <strong>Kruskal's algorithm</strong> to find the
                MST of your logistics network, providing optimal routes and
                identifying the most efficient network configuration.
              </p>
              <Button
                variant="outline-info"
                href="https://en.wikipedia.org/wiki/Minimum_spanning_tree"
                target="_blank"
              >
                Learn More About MSTs
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default NetworkDashboard;
