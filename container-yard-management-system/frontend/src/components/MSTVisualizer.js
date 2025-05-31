import React, { useState, useEffect, useRef } from 'react';

// MST Network Visualizer Component
const MSTVisualizer = ({ mstData, selectedPath = [] }) => {
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [graphData, setGraphData] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Transform MST data into a format suitable for visualization
  useEffect(() => {
    const fetchHubDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        // API call to get hub details (IDs mapped to names and coordinates)
        const response = await fetch(
          'http://localhost:5000/api/logistics/hubs',
          {
            credentials: 'include',
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch hub details: ${response.status}`);
        }

        const hubsData = await response.json();

        if (!hubsData.success) {
          throw new Error(hubsData.message || 'Failed to fetch hub details');
        }

        // Extract major hubs and regular hubs
        const { majorHubs, hubs } = hubsData;

        // Create a mapping of hub IDs to their details
        const hubMap = {};

        // Add all hubs to the map
        Object.entries(hubs).forEach(([majorId, hubsList]) => {
          hubsList.forEach((hub) => {
            hubMap[hub.id] = {
              id: hub.id,
              name: hub.name,
              majorHub: majorHubs[majorId].name,
              coordinates: hub.coordinates,
            };
          });
        });

        // Process MST data to create the visualization graph
        if (mstData && mstData.mst) {
          const nodes = new Set();
          const links = [];

          // Add all nodes and links from MST
          mstData.mst.forEach((edge) => {
            nodes.add(edge.source);
            nodes.add(edge.target);

            links.push({
              source: edge.source,
              target: edge.target,
              distance: edge.distance,
              isOnPath:
                selectedPath.includes(edge.source) &&
                selectedPath.includes(edge.target),
            });
          });

          // Convert nodes set to array of node objects with details
          const nodeArray = Array.from(nodes).map((nodeId) => {
            const hub = hubMap[nodeId] || {
              name: `Hub ${nodeId}`,
              majorHub: 'Unknown',
              coordinates: { lat: 0, lng: 0 },
            };

            return {
              id: nodeId,
              name: hub.name,
              majorHub: hub.majorHub,
              lat: hub.coordinates.lat,
              lng: hub.coordinates.lng,
              isOnPath: selectedPath.includes(nodeId),
            };
          });

          setGraphData({
            nodes: nodeArray,
            links,
          });
        }

        setLoading(false);
      } catch (err) {
        console.error('Error processing MST data:', err);
        setError(err.message || 'Failed to process MST data');
        setLoading(false);
      }
    };

    fetchHubDetails();
  }, [mstData, selectedPath]);

  // Update canvas size based on container dimensions
  useEffect(() => {
    const updateSize = () => {
      if (canvasRef.current) {
        const container = canvasRef.current.parentElement;
        setDimensions({
          width: container.clientWidth,
          height: container.clientHeight,
        });
      }
    };

    window.addEventListener('resize', updateSize);
    updateSize();

    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Draw the network graph on canvas
  useEffect(() => {
    if (!graphData || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { width, height } = dimensions;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Find min/max coordinates to scale the graph
    let minLat = Infinity,
      maxLat = -Infinity,
      minLng = Infinity,
      maxLng = -Infinity;

    graphData.nodes.forEach((node) => {
      minLat = Math.min(minLat, node.lat);
      maxLat = Math.max(maxLat, node.lat);
      minLng = Math.min(minLng, node.lng);
      maxLng = Math.max(maxLng, node.lng);
    });

    // Add 10% padding
    const latRange = maxLat - minLat;
    const lngRange = maxLng - minLng;
    minLat -= latRange * 0.1;
    maxLat += latRange * 0.1;
    minLng -= lngRange * 0.1;
    maxLng += lngRange * 0.1;

    // Function to map coordinates to canvas position
    const mapToCanvas = (lat, lng) => {
      const x = ((lng - minLng) / (maxLng - minLng)) * width;
      const y = height - ((lat - minLat) / (maxLat - minLat)) * height; // Invert Y axis
      return [x, y];
    };

    // Draw links (edges)
    graphData.links.forEach((link) => {
      const sourceNode = graphData.nodes.find((n) => n.id === link.source);
      const targetNode = graphData.nodes.find((n) => n.id === link.target);

      if (!sourceNode || !targetNode) return;

      const [x1, y1] = mapToCanvas(sourceNode.lat, sourceNode.lng);
      const [x2, y2] = mapToCanvas(targetNode.lat, targetNode.lng);

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);

      // Style based on whether this link is part of selected path
      if (link.isOnPath) {
        ctx.strokeStyle = '#e12d39'; // Red for selected path
        ctx.lineWidth = 3;
      } else {
        ctx.strokeStyle = 'rgba(242, 176, 53, 0.6)'; // Gold for MST
        ctx.lineWidth = 1.5;
      }

      ctx.stroke();

      // Draw distance label if the link is part of the selected path
      if (link.isOnPath) {
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;

        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Inter, sans-serif';
        ctx.fillText(`${link.distance.toFixed(1)} km`, midX + 5, midY - 5);
      }
    });

    // Draw nodes (hubs)
    graphData.nodes.forEach((node) => {
      const [x, y] = mapToCanvas(node.lat, node.lng);

      // Draw node circle
      ctx.beginPath();
      ctx.arc(x, y, node.isOnPath ? 8 : 6, 0, 2 * Math.PI);

      if (node.isOnPath) {
        ctx.fillStyle = '#e12d39'; // Red for selected path
      } else if (node.id === hoveredNode) {
        ctx.fillStyle = '#f7b731'; // Yellow for hovered node
      } else {
        ctx.fillStyle = '#F2B035'; // Gold for normal nodes
      }

      ctx.fill();

      // Draw node border
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#121212';
      ctx.stroke();

      // Draw node label
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(node.name, x, y - 12);
    });
  }, [graphData, dimensions, hoveredNode]);

  // Handle mouse movement for node hovering
  const handleMouseMove = (e) => {
    if (!graphData || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Find if mouse is over any node
    const { width, height } = dimensions;

    // Find min/max coordinates to scale the graph (same logic as in drawing)
    let minLat = Infinity,
      maxLat = -Infinity,
      minLng = Infinity,
      maxLng = -Infinity;

    graphData.nodes.forEach((node) => {
      minLat = Math.min(minLat, node.lat);
      maxLat = Math.max(maxLat, node.lat);
      minLng = Math.min(minLng, node.lng);
      maxLng = Math.max(maxLng, node.lng);
    });

    // Add 10% padding
    const latRange = maxLat - minLat;
    const lngRange = maxLng - minLng;
    minLat -= latRange * 0.1;
    maxLat += latRange * 0.1;
    minLng -= lngRange * 0.1;
    maxLng += lngRange * 0.1;

    // Function to map coordinates to canvas position
    const mapToCanvas = (lat, lng) => {
      const x = ((lng - minLng) / (maxLng - minLng)) * width;
      const y = height - ((lat - minLat) / (maxLat - minLat)) * height; // Invert Y axis
      return [x, y];
    };

    // Check each node
    let foundNode = null;

    for (const node of graphData.nodes) {
      const [nodeX, nodeY] = mapToCanvas(node.lat, node.lng);
      const distance = Math.sqrt(
        Math.pow(x - nodeX, 2) + Math.pow(y - nodeY, 2)
      );

      if (distance <= (node.isOnPath ? 10 : 8)) {
        foundNode = node.id;
        break;
      }
    }

    setHoveredNode(foundNode);
  };

  // Display node information on hover
  const renderHoveredNodeInfo = () => {
    if (!hoveredNode || !graphData) return null;

    const node = graphData.nodes.find((n) => n.id === hoveredNode);
    if (!node) return null;

    return (
      <div className="node-info-tooltip">
        <div className="node-info-header">{node.name}</div>
        <div className="node-info-detail">
          <span>Major Hub:</span> {node.majorHub}
        </div>
        <div className="node-info-detail">
          <span>Position:</span> {node.lat.toFixed(4)}, {node.lng.toFixed(4)}
        </div>
      </div>
    );
  };

  return (
    <div className="mst-visualizer-container">
      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading network data...</p>
        </div>
      )}

      {error && !loading && (
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i> {error}
        </div>
      )}

      <div className="mst-canvas-container">
        <canvas
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          onMouseMove={handleMouseMove}
          style={{ cursor: hoveredNode ? 'pointer' : 'default' }}
        />
        {hoveredNode && renderHoveredNodeInfo()}
      </div>

      {mstData && (
        <div className="mst-stats">
          <div className="mst-stat">
            <span className="stat-label">Total MST Distance:</span>
            <span className="stat-value">
              {mstData.totalDistance.toFixed(2)} km
            </span>
          </div>
          <div className="mst-stat">
            <span className="stat-label">Number of Connections:</span>
            <span className="stat-value">{mstData.edgeCount}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MSTVisualizer;
