import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, Row, Col, Button, Spinner, Badge, Form } from 'react-bootstrap';
import * as d3 from 'd3';
import './NetworkVisualizer.css';

class UnionFind {
  constructor(size) {
    this.parent = Array.from({ length: size }, (_, i) => i);
    this.rank = Array(size).fill(0);
  }

  find(x) {
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]);
    }
    return this.parent[x];
  }

  union(x, y) {
    const xroot = this.find(x);
    const yroot = this.find(y);
    if (xroot === yroot) return false;

    if (this.rank[xroot] < this.rank[yroot]) {
      this.parent[xroot] = yroot;
    } else {
      this.parent[yroot] = xroot;
      if (this.rank[xroot] === this.rank[yroot]) {
        this.rank[xroot]++;
      }
    }
    return true;
  }
}

const NetworkVisualizer = () => {
  const [hubs, setHubs] = useState([]);
  const [mst, setMst] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedView, setSelectedView] = useState('mst'); // 'mst', 'all', 'major'
  const [selectedPath, setSelectedPath] = useState([]);
  const [startHub, setStartHub] = useState('');
  const [endHub, setEndHub] = useState('');
  const [totalDistance, setTotalDistance] = useState(0);
  const [cargoStatus, setCargoStatus] = useState({});
  const [networkMetrics, setNetworkMetrics] = useState({
    hubCount: 0,
    majorHubs: 0,
    subHubs: 0,
    connections: 0,
    density: 0,
  });

  const svgRef = useRef(null);
  const tooltipRef = useRef(null);
  const containerRef = useRef(null);

  // Config
  const CONFIG = {
    ORS_API_KEY: '5b3ce3597851110001cf624863fa5d6c0925454c9424faa7c4c91985',
    EXPRESS_THRESHOLD: 0.5,
    STANDARD_THRESHOLD: 0.8,
    HYBRID_THRESHOLD: 0.65,
    MAX_HUBS: 100,
    SPEED_PROFILE: { express: 60, standard: 40 },
    MAX_RETRIES: 3,
    RETRY_BASE_DELAY: 2,
    HUB_DATA: `State,City,Latitude,Longitude,Type
Andhra Pradesh,Vijayawada,16.504347,80.645843,major
Arunachal Pradesh,Itanagar,27.091086,93.596806,major
Assam,Guwahati,26.135341,91.735217,major
Bihar,Patna,25.587789,85.142771,major
Chhattisgarh,Raipur,21.241661,81.638798,major
Goa,Panaji,15.482654,73.833124,major
Gujarat,Ahmedabad,23.030405,72.562137,major
Haryana,Gurugram,28.465335,77.025125,major
Himachal Pradesh,Shimla,31.106605,77.180773,major
Jharkhand,Ranchi,23.348013,85.314384,major
Karnataka,Bengaluru,12.97365,77.590186,major
Kerala,Kochi,9.929815,76.277007,major
Madhya Pradesh,Indore,22.714174,75.854346,major
Maharashtra,Mumbai,19.069646,72.880307,major
Manipur,Imphal,24.813476,93.944452,major
Meghalaya,Shillong,25.578503,91.891416,major
Mizoram,Aizawl,23.73101,92.711071,major
Nagaland,Dimapur,25.896172,93.718831,major
Odisha,Bhubaneswar,20.297132,85.830375,major
Punjab,Ludhiana,30.90374,75.857833,major
Rajasthan,Jaipur,26.921195,75.784667,major
Sikkim,Gangtok,27.324654,88.613151,major
Tamil Nadu,Chennai,13.084113,80.267506,major
Telangana,Hyderabad,17.379828,78.489978,major
Tripura,Agartala,23.835036,91.278077,major
Uttar Pradesh,Lucknow,26.84023,80.950943,major
Uttarakhand,Dehradun,30.319949,78.032139,major
West Bengal,Kolkata,22.565836,88.363023,major
Delhi,New Delhi,28.613407,77.216016,major
Jammu and Kashmir,Srinagar,34.08646,74.800107,major
Ladakh,Leh,34.162043,77.577688,major
West Bengal,Kolkata,22.572912,88.361454,sub
West Bengal,Howrah,22.587306,88.258067,sub
West Bengal,Durgapur,23.521529,87.305634,sub
West Bengal,Asansol,23.669562,86.943659,sub
West Bengal,Siliguri,26.726044,88.394222,sub
West Bengal,Darjeeling,27.044137,88.269625,sub
West Bengal,Kharagpur,22.349619,87.236139,sub
West Bengal,Haldia,22.064258,88.11926,sub
West Bengal,Malda,25.017916,88.139606,sub
West Bengal,Bardhaman,23.232716,87.85383,sub
Odisha,Bhubaneswar,20.286648,85.819319,sub
Odisha,Cuttack,20.471047,85.87992,sub
Odisha,Rourkela,22.258521,84.847716,sub
Odisha,Sambalpur,21.464943,83.977969,sub
Odisha,Berhampur,19.315731,84.792629,sub
Odisha,Puri,19.810011,85.827176,sub
Odisha,Balasore,21.494781,86.941383,sub
Odisha,Jharsuguda,21.861882,84.015541,sub
Odisha,Angul,20.848924,85.106252,sub
Odisha,Baripada,21.928826,86.733417,sub
Maharashtra,Mumbai,19.073313,72.873124,sub
Maharashtra,Pune,18.526,73.862396,sub
Maharashtra,Nagpur,21.15335,79.095673,sub
Maharashtra,Nashik,20.005171,73.795204,sub
Maharashtra,Thane,19.226139,72.988056,sub
Maharashtra,Aurangabad,19.877461,75.350927,sub
Maharashtra,Solapur,17.65678,75.907452,sub
Maharashtra,Amravati,20.933012,77.774769,sub
Maharashtra,Kolhapur,16.699147,74.235303,sub
Maharashtra,Navi Mumbai,19.033618,73.035662,sub`,
  };

  // Haversine distance calculation (used when API is unavailable)
  const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth radius in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Load hubs from config
  const loadHubs = useCallback(() => {
    try {
      console.log('Loading hub network data...');
      const lines = CONFIG.HUB_DATA.split('\n');
      const header = lines[0].split(',');
      const hubsList = [];

      for (
        let i = 1;
        i < lines.length && hubsList.length < CONFIG.MAX_HUBS;
        i++
      ) {
        const values = lines[i].split(',');
        const hub = {};

        header.forEach((key, index) => {
          if (key === 'Latitude' || key === 'Longitude') {
            hub[key.toLowerCase()] = parseFloat(values[index]);
          } else {
            hub[key.toLowerCase()] = values[index];
          }
        });

        hub.id = `${hub.state.slice(0, 3)}-${hub.city.slice(
          0,
          5
        )}`.toUpperCase();
        hubsList.push(hub);
      }

      console.log(`Successfully loaded ${hubsList.length} hubs`);

      // Calculate network metrics
      const majorHubs = hubsList.filter((h) => h.type === 'major').length;
      const subHubs = hubsList.filter((h) => h.type === 'sub').length;

      setNetworkMetrics({
        hubCount: hubsList.length,
        majorHubs,
        subHubs,
        connections: 0, // Will update after MST calculation
        density: 0, // Will update after MST calculation
      });

      return hubsList;
    } catch (error) {
      console.error('Error loading hubs:', error);
      throw new Error('Failed to load hub network data');
    }
  }, [CONFIG]);

  // Build Minimum Spanning Tree (MST)
  const buildMST = useCallback((hubsList) => {
    console.log('Building optimal network (MST)...');
    const edges = [];

    // Calculate distances between all pairs of hubs
    for (let i = 0; i < hubsList.length; i++) {
      for (let j = i + 1; j < hubsList.length; j++) {
        const dist = calculateHaversineDistance(
          hubsList[i].latitude,
          hubsList[i].longitude,
          hubsList[j].latitude,
          hubsList[j].longitude
        );
        edges.push([dist, i, j]);
      }
    }

    // Sort edges by distance (ascending)
    edges.sort((a, b) => a[0] - b[0]);

    const mstEdges = [];
    const uf = new UnionFind(hubsList.length);
    let totalDist = 0;

    // Apply Kruskal's algorithm
    for (const [dist, u, v] of edges) {
      if (uf.union(u, v)) {
        mstEdges.push([u, v, dist]);
        totalDist += dist;

        if (mstEdges.length === hubsList.length - 1) {
          break; // MST is complete
        }
      }
    }

    console.log(`MST Construction Complete`);
    console.log(`Total Connections: ${mstEdges.length}`);
    console.log(`Network Distance: ${totalDist.toFixed(2)}km`);

    // Update network metrics
    setNetworkMetrics((prev) => ({
      ...prev,
      connections: mstEdges.length,
      density:
        (2 * mstEdges.length) / (hubsList.length * (hubsList.length - 1)),
    }));

    return { mstEdges, totalDist };
  }, []);

  // Find optimal path between two hubs
  const findOptimalPath = useCallback((startId, endId, hubsList, mstEdges) => {
    // Create adjacency list from MST
    const adj = {};
    for (const [u, v, dist] of mstEdges) {
      const hubU = hubsList[u].id;
      const hubV = hubsList[v].id;

      if (!adj[hubU]) adj[hubU] = [];
      if (!adj[hubV]) adj[hubV] = [];

      adj[hubU].push([hubV, dist]);
      adj[hubV].push([hubU, dist]);
    }

    // Breadth-first search
    const visited = { [startId]: null };
    const queue = [startId];

    while (queue.length > 0) {
      const current = queue.shift();

      if (current === endId) break;

      for (const [neighbor, dist] of adj[current] || []) {
        if (!visited.hasOwnProperty(neighbor)) {
          visited[neighbor] = current;
          queue.push(neighbor);
        }
      }
    }

    // Reconstruct path
    const path = [];
    let totalDist = 0;
    let current = endId;

    while (current) {
      path.unshift(current);
      const prev = visited[current];

      if (prev) {
        for (const [neighbor, dist] of adj[current] || []) {
          if (neighbor === prev) {
            totalDist += dist;
            break;
          }
        }
      }

      current = prev;
    }

    return { path, totalDist };
  }, []);

  // Add cargo to container
  const addCargo = useCallback((containerId, mode, fillPct) => {
    setCargoStatus((prevStatus) => {
      const hubCode = containerId.split('-')[1];
      const newStatus = { ...prevStatus };

      if (!newStatus[hubCode]) {
        newStatus[hubCode] = {
          express: {},
          standard: {},
        };
      }

      if (!newStatus[hubCode][mode][containerId]) {
        newStatus[hubCode][mode][containerId] = 0;
      }

      newStatus[hubCode][mode][containerId] += fillPct;

      console.log(
        `Added ${fillPct * 100}% to ${containerId} (${mode}) at ${hubCode}`
      );

      return newStatus;
    });
  }, []);

  // Initialize data when component mounts
  useEffect(() => {
    const initializeNetwork = async () => {
      setLoading(true);
      try {
        // Load hubs data
        const hubsList = loadHubs();
        setHubs(hubsList);

        // Build MST
        const { mstEdges, totalDist } = buildMST(hubsList);
        setMst(mstEdges);
        setTotalDistance(totalDist);

        // Set default start and end hubs
        if (hubsList.length >= 2) {
          const majorHubs = hubsList.filter((h) => h.type === 'major');
          if (majorHubs.length >= 2) {
            setStartHub(majorHubs[0].id);
            setEndHub(majorHubs[1].id);
          } else {
            setStartHub(hubsList[0].id);
            setEndHub(hubsList[1].id);
          }
        }

        setLoading(false);
      } catch (err) {
        console.error('Failed to initialize network:', err);
        setError(`Failed to load network data: ${err.message}`);
        setLoading(false);
      }
    };

    initializeNetwork();
  }, [loadHubs, buildMST]);

  // Handle finding path between selected hubs
  const handleFindPath = () => {
    if (!startHub || !endHub) return;

    const hubsMap = {};
    hubs.forEach((hub, index) => {
      hubsMap[hub.id] = index;
    });

    const { path, totalDist } = findOptimalPath(startHub, endHub, hubs, mst);
    setSelectedPath(path);

    // Calculate ETA for both shipping modes
    const expressETA = totalDist / CONFIG.SPEED_PROFILE.express;
    const standardETA = totalDist / CONFIG.SPEED_PROFILE.standard;

    console.log(`Route from ${startHub} to ${endHub}`);
    console.log(`➔ ${path.join(' → ')}`);
    console.log(`Total Distance: ${totalDist.toFixed(2)}km`);
    console.log(`Express ETA: ${expressETA.toFixed(1)} hours`);
    console.log(`Standard ETA: ${standardETA.toFixed(1)} hours`);

    // Simulate adding some cargo
    const containerId = `CTN-${startHub}-${new Date()
      .getTime()
      .toString()
      .slice(-6)}`;
    addCargo(
      containerId,
      Math.random() < 0.5 ? 'express' : 'standard',
      Math.random() * 0.5 + 0.3
    );
  };

  // Draw network visualization using D3
  useEffect(() => {
    if (loading || !hubs.length || !mst.length) return;

    const width = containerRef.current ? containerRef.current.offsetWidth : 800;
    const height = 600;

    // Clear previous SVG content
    d3.select(svgRef.current).selectAll('*').remove();

    // Create SVG
    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height])
      .attr('style', 'max-width: 100%; height: auto; font: 10px sans-serif;');

    // Filter nodes and links based on selected view
    let displayHubs = hubs;
    if (selectedView === 'major') {
      displayHubs = hubs.filter((h) => h.type === 'major');
    }

    const displayedHubIds = new Set(displayHubs.map((h) => h.id));

    // Create a projection for India
    const projection = d3
      .geoMercator()
      .center([83, 23]) // Center on India
      .scale(1200)
      .translate([width / 2, height / 2]);

    // Process nodes with position
    const nodes = displayHubs.map((hub) => ({
      id: hub.id,
      name: hub.city,
      state: hub.state,
      type: hub.type,
      x: projection([hub.longitude, hub.latitude])[0],
      y: projection([hub.longitude, hub.latitude])[1],
    }));

    // Create node lookup for edge processing
    const nodeById = new Map(nodes.map((node) => [node.id, node]));

    // Process links based on selected view
    let links = [];

    if (selectedView === 'mst') {
      // Show only MST edges
      links = mst
        .filter(([u, v]) => {
          const sourceId = hubs[u].id;
          const targetId = hubs[v].id;
          return displayedHubIds.has(sourceId) && displayedHubIds.has(targetId);
        })
        .map(([u, v, dist]) => ({
          source: nodeById.get(hubs[u].id),
          target: nodeById.get(hubs[v].id),
          distance: dist,
        }))
        .filter((link) => link.source && link.target);
    } else if (selectedView === 'all') {
      // Show all possible connections for selected hubs
      for (let i = 0; i < displayHubs.length; i++) {
        for (let j = i + 1; j < displayHubs.length; j++) {
          const source = displayHubs[i].id;
          const target = displayHubs[j].id;

          if (nodeById.has(source) && nodeById.has(target)) {
            links.push({
              source: nodeById.get(source),
              target: nodeById.get(target),
              distance: calculateHaversineDistance(
                displayHubs[i].latitude,
                displayHubs[i].longitude,
                displayHubs[j].latitude,
                displayHubs[j].longitude
              ),
            });
          }
        }
      }
    }

    // Process selected path links
    let pathLinks = [];
    if (selectedPath.length > 1) {
      for (let i = 0; i < selectedPath.length - 1; i++) {
        if (
          nodeById.has(selectedPath[i]) &&
          nodeById.has(selectedPath[i + 1])
        ) {
          pathLinks.push({
            source: nodeById.get(selectedPath[i]),
            target: nodeById.get(selectedPath[i + 1]),
          });
        }
      }
    }

    // Draw edges/links
    svg
      .append('g')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.4)
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke-width', (d) => 1.5)
      .attr('x1', (d) => d.source.x)
      .attr('y1', (d) => d.source.y)
      .attr('x2', (d) => d.target.x)
      .attr('y2', (d) => d.target.y)
      .append('title')
      .text(
        (d) => `${d.source.name} ↔ ${d.target.name}: ${d.distance.toFixed(1)}km`
      );

    // Draw highlighted path
    svg
      .append('g')
      .attr('stroke', '#d32f2f')
      .attr('stroke-opacity', 0.8)
      .selectAll('line')
      .data(pathLinks)
      .join('line')
      .attr('stroke-width', 3)
      .attr('x1', (d) => d.source.x)
      .attr('y1', (d) => d.source.y)
      .attr('x2', (d) => d.target.x)
      .attr('y2', (d) => d.target.y)
      .attr('class', 'link-path');

    // Draw nodes
    svg
      .append('g')
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('cx', (d) => d.x)
      .attr('cy', (d) => d.y)
      .attr('r', (d) => (d.type === 'major' ? 6 : 4))
      .attr('class', (d) => {
        if (selectedPath.includes(d.id)) {
          return 'node-path';
        }
        return d.type === 'major' ? 'node-major' : 'node-sub';
      })
      .on('mouseover', (event, d) => {
        d3
          .select(tooltipRef.current)
          .style('visibility', 'visible')
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY + 10}px`)
          .attr('class', 'tooltip-network').html(`
            <strong>${d.name}, ${d.state}</strong><br>
            ID: ${d.id}<br>
            Type: ${d.type === 'major' ? 'Major Hub' : 'Sub Hub'}
          `);
      })
      .on('mouseout', () => {
        d3.select(tooltipRef.current).style('visibility', 'hidden');
      })
      .on('click', (event, d) => {
        // Select hub as start or end for path finding
        if (event.ctrlKey || event.metaKey) {
          setEndHub(d.id);
        } else {
          setStartHub(d.id);
        }
      });

    // Draw labels for major hubs
    svg
      .append('g')
      .selectAll('text')
      .data(nodes.filter((node) => node.type === 'major'))
      .join('text')
      .attr('x', (d) => d.x + 8)
      .attr('y', (d) => d.y + 3)
      .text((d) => d.name)
      .attr('font-family', 'sans-serif')
      .attr('font-size', 10)
      .attr('fill', '#333');

    // Add start/end labels if path is selected
    if (selectedPath.length > 1) {
      const startNode = nodeById.get(selectedPath[0]);
      const endNode = nodeById.get(selectedPath[selectedPath.length - 1]);

      if (startNode) {
        svg
          .append('text')
          .attr('x', startNode.x + 8)
          .attr('y', startNode.y - 8)
          .text('START')
          .attr('font-family', 'sans-serif')
          .attr('font-size', 10)
          .attr('font-weight', 'bold')
          .attr('fill', '#d32f2f');
      }

      if (endNode) {
        svg
          .append('text')
          .attr('x', endNode.x + 8)
          .attr('y', endNode.y - 8)
          .text('END')
          .attr('font-family', 'sans-serif')
          .attr('font-size', 10)
          .attr('font-weight', 'bold')
          .attr('fill', '#d32f2f');
      }
    }
  }, [hubs, mst, selectedView, selectedPath, loading]);

  if (loading) {
    return (
      <div className="text-center my-5">
        <div className="network-spinner"></div>
        <p className="mt-3">Loading logistics network...</p>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger my-3">{error}</div>;
  }

  return (
    <div className="network-visualizer">
      <Card className="mb-4 shadow-sm border-0">
        <Card.Header className="bg-dark text-white d-flex justify-content-between align-items-center">
          <div>
            <h5 className="mb-0">
              <i className="fas fa-project-diagram me-2"></i>
              Logistics Network Visualization
            </h5>
          </div>
          <div>
            <Badge bg="light" text="dark" className="me-2">
              {networkMetrics.majorHubs} Major Hubs
            </Badge>
            <Badge bg="light" text="dark">
              {networkMetrics.subHubs} Sub Hubs
            </Badge>
          </div>
        </Card.Header>

        <Card.Body>
          <Row className="mb-3">
            <Col md={6} lg={8}>
              <Form.Group>
                <Form.Label>
                  <strong>Network View</strong>
                </Form.Label>
                <div className="d-flex">
                  <Form.Check
                    type="radio"
                    label="Optimal Network (MST)"
                    name="networkView"
                    id="viewMST"
                    checked={selectedView === 'mst'}
                    onChange={() => setSelectedView('mst')}
                    className="me-3"
                  />
                  <Form.Check
                    type="radio"
                    label="Major Hubs Only"
                    name="networkView"
                    id="viewMajor"
                    checked={selectedView === 'major'}
                    onChange={() => setSelectedView('major')}
                    className="me-3"
                  />
                  <Form.Check
                    type="radio"
                    label="All Connections"
                    name="networkView"
                    id="viewAll"
                    checked={selectedView === 'all'}
                    onChange={() => setSelectedView('all')}
                  />
                </div>
              </Form.Group>
            </Col>
            <Col md={6} lg={4} className="text-end">
              {totalDistance > 0 && (
                <div className="text-muted">
                  <small>
                    Network Distance:{' '}
                    <strong>{totalDistance.toFixed(2)} km</strong>
                  </small>
                </div>
              )}
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6} lg={4}>
              <Form.Group className="mb-3">
                <Form.Label>
                  <strong>Starting Hub</strong>
                </Form.Label>
                <Form.Select
                  value={startHub}
                  onChange={(e) => setStartHub(e.target.value)}
                >
                  <option value="">Select Starting Hub</option>
                  {hubs.map((hub) => (
                    <option key={`start-${hub.id}`} value={hub.id}>
                      {hub.city}, {hub.state} (
                      {hub.type === 'major' ? 'Major' : 'Sub'})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6} lg={4}>
              <Form.Group className="mb-3">
                <Form.Label>
                  <strong>Destination Hub</strong>
                </Form.Label>
                <Form.Select
                  value={endHub}
                  onChange={(e) => setEndHub(e.target.value)}
                >
                  <option value="">Select Destination Hub</option>
                  {hubs.map((hub) => (
                    <option key={`end-${hub.id}`} value={hub.id}>
                      {hub.city}, {hub.state} (
                      {hub.type === 'major' ? 'Major' : 'Sub'})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={12} lg={4} className="d-flex align-items-end">
              <Button
                variant="danger"
                className="mb-3 w-100"
                onClick={handleFindPath}
                disabled={!startHub || !endHub}
              >
                <i className="fas fa-route me-2"></i>
                Find Optimal Route
              </Button>
            </Col>
          </Row>

          {selectedPath.length > 0 && (
            <div className="route-info bg-light p-3 mb-3 rounded border">
              <h6 className="mb-2">
                <i className="fas fa-map-signs me-2"></i>
                Optimal Route
              </h6>
              <p className="mb-1">
                <Badge bg="danger" className="me-2">
                  {selectedPath.length} Hubs
                </Badge>
                {selectedPath.join(' → ')}
              </p>
              {startHub && endHub && (
                <div className="mt-2 d-flex flex-wrap">
                  <Badge bg="light" text="dark" className="me-3 mb-1">
                    <i className="fas fa-bolt me-1"></i>
                    Express ETA:{' '}
                    {(totalDistance / CONFIG.SPEED_PROFILE.express).toFixed(
                      1
                    )}{' '}
                    hours
                  </Badge>
                  <Badge bg="light" text="dark" className="me-3 mb-1">
                    <i className="fas fa-truck me-1"></i>
                    Standard ETA:{' '}
                    {(totalDistance / CONFIG.SPEED_PROFILE.standard).toFixed(
                      1
                    )}{' '}
                    hours
                  </Badge>
                </div>
              )}
            </div>
          )}

          <div
            className="network-container border rounded bg-light"
            ref={containerRef}
          >
            <svg ref={svgRef} className="w-100"></svg>
            <div
              ref={tooltipRef}
              className="tooltip-network"
              style={{ visibility: 'hidden' }}
            />
          </div>

          <div className="legend mt-3 d-flex">
            <div className="me-4">
              <span
                className="d-inline-block me-2"
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: '#ef5350',
                }}
              ></span>
              Major Hub
            </div>
            <div className="me-4">
              <span
                className="d-inline-block me-2"
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: '#90a4ae',
                }}
              ></span>
              Sub Hub
            </div>
            <div className="me-4">
              <span
                className="d-inline-block me-2"
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: '#d32f2f',
                }}
              ></span>
              Path Hub
            </div>
            <div>
              <span
                className="d-inline-block me-2"
                style={{
                  width: '20px',
                  height: '2px',
                  backgroundColor: '#d32f2f',
                  position: 'relative',
                  top: '-3px',
                }}
              ></span>
              Optimal Route
            </div>
          </div>

          <div className="tips mt-3">
            <small className="text-muted">
              <i className="fas fa-info-circle me-1"></i>
              Click on a hub to set it as the start point, or Ctrl+Click to set
              as the destination. Hover over hubs and routes for more details.
            </small>
          </div>
        </Card.Body>
      </Card>

      {/* Network analytics */}
      <Card className="shadow-sm border-0">
        <Card.Header className="bg-light">
          <h5 className="mb-0">Network Optimization Insights</h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <h6>Minimum Spanning Tree Analysis</h6>
              <p>
                Your network consists of {networkMetrics.hubCount} connected
                hubs with a total optimal distance of {totalDistance.toFixed(2)}{' '}
                km.
              </p>
              <p>
                The MST algorithm has found the most efficient way to connect
                all hubs using only {networkMetrics.connections} connections,
                eliminating redundant routes.
              </p>
            </Col>
            <Col md={6}>
              <h6>Logistics Optimization Recommendations</h6>
              <ul className="mb-0">
                <li>
                  Consider establishing regional distribution centers at major
                  hub junctions
                </li>
                <li>
                  The network diameter is approximately{' '}
                  {Math.ceil(Math.sqrt(networkMetrics.hubCount) * 2)} hops
                </li>
                <li>Focus cargo consolidation at hubs with 3+ connections</li>
                <li>
                  Consider adding redundant routes for critical high-traffic
                  paths
                </li>
              </ul>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
};

export default NetworkVisualizer;
