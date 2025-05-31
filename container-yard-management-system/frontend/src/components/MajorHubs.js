import React, { useState, useEffect } from 'react';
import '../styles/App.css';

const MajorHubs = () => {
  // State for storing the hub data
  const [hubs, setHubs] = useState([]);
  // State for the selected hub
  const [selectedHub, setSelectedHub] = useState(null);
  // State for sub-hubs in the selected state
  const [subHubs, setSubHubs] = useState([]);
  // State for the selected sub-hub
  const [selectedSubHub, setSelectedSubHub] = useState(null);
  // State for loading status
  const [loading, setLoading] = useState(true);
  // State for active containers at the hub
  const [hubContainers, setHubContainers] = useState([]);

  // Indian states and cities data
  const indianHubsData = [
    {
      state: 'Andhra Pradesh',
      city: 'Vijayawada',
      coordinates: { lat: 16.504347, lng: 80.645843 },
      containerCount: 12,
      inTransit: 3,
      inYard: 9,
    },
    {
      state: 'Arunachal Pradesh',
      city: 'Itanagar',
      coordinates: { lat: 27.091086, lng: 93.596806 },
      containerCount: 5,
      inTransit: 2,
      inYard: 3,
    },
    {
      state: 'Assam',
      city: 'Guwahati',
      coordinates: { lat: 26.135341, lng: 91.735217 },
      containerCount: 8,
      inTransit: 1,
      inYard: 7,
    },
    {
      state: 'Bihar',
      city: 'Patna',
      coordinates: { lat: 25.587789, lng: 85.142771 },
      containerCount: 10,
      inTransit: 4,
      inYard: 6,
    },
    {
      state: 'Chhattisgarh',
      city: 'Raipur',
      coordinates: { lat: 21.241661, lng: 81.638798 },
      containerCount: 7,
      inTransit: 3,
      inYard: 4,
    },
    {
      state: 'Goa',
      city: 'Panaji',
      coordinates: { lat: 15.482654, lng: 73.833124 },
      containerCount: 6,
      inTransit: 2,
      inYard: 4,
    },
    {
      state: 'Gujarat',
      city: 'Ahmedabad',
      coordinates: { lat: 23.030405, lng: 72.562137 },
      containerCount: 15,
      inTransit: 5,
      inYard: 10,
    },
    {
      state: 'Haryana',
      city: 'Gurugram',
      coordinates: { lat: 28.465335, lng: 77.025125 },
      containerCount: 20,
      inTransit: 10,
      inYard: 10,
    },
    {
      state: 'Himachal Pradesh',
      city: 'Shimla',
      coordinates: { lat: 31.106605, lng: 77.180773 },
      containerCount: 4,
      inTransit: 1,
      inYard: 3,
    },
    {
      state: 'Jharkhand',
      city: 'Ranchi',
      coordinates: { lat: 23.348013, lng: 85.314384 },
      containerCount: 9,
      inTransit: 3,
      inYard: 6,
    },
    {
      state: 'Karnataka',
      city: 'Bengaluru',
      coordinates: { lat: 12.97365, lng: 77.590186 },
      containerCount: 25,
      inTransit: 10,
      inYard: 15,
    },
    {
      state: 'Kerala',
      city: 'Kochi',
      coordinates: { lat: 9.929815, lng: 76.277007 },
      containerCount: 11,
      inTransit: 4,
      inYard: 7,
    },
    {
      state: 'Madhya Pradesh',
      city: 'Indore',
      coordinates: { lat: 22.714174, lng: 75.854346 },
      containerCount: 14,
      inTransit: 5,
      inYard: 9,
    },
    {
      state: 'Maharashtra',
      city: 'Mumbai',
      coordinates: { lat: 19.069646, lng: 72.880307 },
      containerCount: 47,
      inTransit: 18,
      inYard: 29,
    },
    {
      state: 'Manipur',
      city: 'Imphal',
      coordinates: { lat: 24.813476, lng: 93.944452 },
      containerCount: 3,
      inTransit: 1,
      inYard: 2,
    },
    {
      state: 'Meghalaya',
      city: 'Shillong',
      coordinates: { lat: 25.578503, lng: 91.891416 },
      containerCount: 4,
      inTransit: 1,
      inYard: 3,
    },
    {
      state: 'Mizoram',
      city: 'Aizawl',
      coordinates: { lat: 23.73101, lng: 92.711071 },
      containerCount: 2,
      inTransit: 1,
      inYard: 1,
    },
    {
      state: 'Nagaland',
      city: 'Dimapur',
      coordinates: { lat: 25.896172, lng: 93.718831 },
      containerCount: 5,
      inTransit: 2,
      inYard: 3,
    },
    {
      state: 'Odisha',
      city: 'Bhubaneswar',
      coordinates: { lat: 20.297132, lng: 85.830375 },
      containerCount: 23,
      inTransit: 8,
      inYard: 15,
    },
    {
      state: 'Punjab',
      city: 'Ludhiana',
      coordinates: { lat: 30.90374, lng: 75.857833 },
      containerCount: 10,
      inTransit: 4,
      inYard: 6,
    },
    {
      state: 'Rajasthan',
      city: 'Jaipur',
      coordinates: { lat: 26.921195, lng: 75.784667 },
      containerCount: 18,
      inTransit: 7,
      inYard: 11,
    },
    {
      state: 'Sikkim',
      city: 'Gangtok',
      coordinates: { lat: 27.324654, lng: 88.613151 },
      containerCount: 2,
      inTransit: 1,
      inYard: 1,
    },
    {
      state: 'Tamil Nadu',
      city: 'Chennai',
      coordinates: { lat: 13.084113, lng: 80.267506 },
      containerCount: 30,
      inTransit: 12,
      inYard: 18,
    },
    {
      state: 'Telangana',
      city: 'Hyderabad',
      coordinates: { lat: 17.379828, lng: 78.489978 },
      containerCount: 28,
      inTransit: 10,
      inYard: 18,
    },
    {
      state: 'Tripura',
      city: 'Agartala',
      coordinates: { lat: 23.835036, lng: 91.278077 },
      containerCount: 3,
      inTransit: 1,
      inYard: 2,
    },
    {
      state: 'Uttar Pradesh',
      city: 'Lucknow',
      coordinates: { lat: 26.84023, lng: 80.950943 },
      containerCount: 22,
      inTransit: 9,
      inYard: 13,
    },
    {
      state: 'Uttarakhand',
      city: 'Dehradun',
      coordinates: { lat: 30.319949, lng: 78.032139 },
      containerCount: 6,
      inTransit: 2,
      inYard: 4,
    },
    {
      state: 'West Bengal',
      city: 'Kolkata',
      coordinates: { lat: 22.565836, lng: 88.363023 },
      containerCount: 35,
      inTransit: 15,
      inYard: 20,
    },
    {
      state: 'Delhi',
      city: 'New Delhi',
      coordinates: { lat: 28.613407, lng: 77.216016 },
      containerCount: 40,
      inTransit: 20,
      inYard: 20,
    },
    {
      state: 'Jammu and Kashmir',
      city: 'Srinagar',
      coordinates: { lat: 34.08646, lng: 74.800107 },
      containerCount: 3,
      inTransit: 1,
      inYard: 2,
    },
    {
      state: 'Ladakh',
      city: 'Leh',
      coordinates: { lat: 34.162043, lng: 77.577688 },
      containerCount: 2,
      inTransit: 1,
      inYard: 1,
    },
  ];

  // Sub-hubs data (more detailed locations within states)
  const subHubsData = [
    {
      state: 'West Bengal',
      city: 'Kolkata',
      coordinates: { lat: 22.572912, lng: 88.361454 },
    },
    {
      state: 'West Bengal',
      city: 'Howrah',
      coordinates: { lat: 22.587306, lng: 88.258067 },
    },
    {
      state: 'West Bengal',
      city: 'Durgapur',
      coordinates: { lat: 23.521529, lng: 87.305634 },
    },
    {
      state: 'West Bengal',
      city: 'Asansol',
      coordinates: { lat: 23.669562, lng: 86.943659 },
    },
    {
      state: 'West Bengal',
      city: 'Siliguri',
      coordinates: { lat: 26.726044, lng: 88.394222 },
    },
    {
      state: 'West Bengal',
      city: 'Darjeeling',
      coordinates: { lat: 27.044137, lng: 88.269625 },
    },
    {
      state: 'West Bengal',
      city: 'Kharagpur',
      coordinates: { lat: 22.349619, lng: 87.236139 },
    },
    {
      state: 'West Bengal',
      city: 'Haldia',
      coordinates: { lat: 22.064258, lng: 88.11926 },
    },
    {
      state: 'West Bengal',
      city: 'Malda',
      coordinates: { lat: 25.017916, lng: 88.139606 },
    },
    {
      state: 'West Bengal',
      city: 'Bardhaman',
      coordinates: { lat: 23.232716, lng: 87.85383 },
    },
    {
      state: 'Odisha',
      city: 'Bhubaneswar',
      coordinates: { lat: 20.286648, lng: 85.819319 },
    },
    {
      state: 'Odisha',
      city: 'Cuttack',
      coordinates: { lat: 20.471047, lng: 85.87992 },
    },
    {
      state: 'Odisha',
      city: 'Rourkela',
      coordinates: { lat: 22.258521, lng: 84.847716 },
    },
    {
      state: 'Odisha',
      city: 'Sambalpur',
      coordinates: { lat: 21.464943, lng: 83.977969 },
    },
    {
      state: 'Odisha',
      city: 'Berhampur',
      coordinates: { lat: 19.315731, lng: 84.792629 },
    },
    {
      state: 'Odisha',
      city: 'Puri',
      coordinates: { lat: 19.810011, lng: 85.827176 },
    },
    {
      state: 'Odisha',
      city: 'Balasore',
      coordinates: { lat: 21.494781, lng: 86.941383 },
    },
    {
      state: 'Odisha',
      city: 'Jharsuguda',
      coordinates: { lat: 21.861882, lng: 84.015541 },
    },
    {
      state: 'Odisha',
      city: 'Angul',
      coordinates: { lat: 20.848924, lng: 85.106252 },
    },
    {
      state: 'Odisha',
      city: 'Baripada',
      coordinates: { lat: 21.928826, lng: 86.733417 },
    },
    {
      state: 'Maharashtra',
      city: 'Mumbai',
      coordinates: { lat: 19.073313, lng: 72.873124 },
    },
    {
      state: 'Maharashtra',
      city: 'Pune',
      coordinates: { lat: 18.526, lng: 73.862396 },
    },
    {
      state: 'Maharashtra',
      city: 'Nagpur',
      coordinates: { lat: 21.15335, lng: 79.095673 },
    },
    {
      state: 'Maharashtra',
      city: 'Nashik',
      coordinates: { lat: 20.005171, lng: 73.795204 },
    },
    {
      state: 'Maharashtra',
      city: 'Thane',
      coordinates: { lat: 19.226139, lng: 72.988056 },
    },
    {
      state: 'Maharashtra',
      city: 'Aurangabad',
      coordinates: { lat: 19.877461, lng: 75.350927 },
    },
    {
      state: 'Maharashtra',
      city: 'Solapur',
      coordinates: { lat: 17.65678, lng: 75.907452 },
    },
    {
      state: 'Maharashtra',
      city: 'Amravati',
      coordinates: { lat: 20.933012, lng: 77.774769 },
    },
    {
      state: 'Maharashtra',
      city: 'Kolhapur',
      coordinates: { lat: 16.699147, lng: 74.235303 },
    },
    {
      state: 'Maharashtra',
      city: 'Navi Mumbai',
      coordinates: { lat: 19.033618, lng: 73.035662 },
    },
  ];

  // Load the hub data when the component mounts
  useEffect(() => {
    setHubs(indianHubsData);
    setLoading(false);
  }, []);

  // Handle hub selection
  const handleHubSelection = (e) => {
    const hubCity = e.target.value;
    if (hubCity) {
      const hub = hubs.find((hub) => hub.city === hubCity);
      setSelectedHub(hub);

      // Find sub-hubs in the same state
      const stateSubHubs = subHubsData.filter(
        (subHub) => subHub.state === hub.state
      );
      setSubHubs(stateSubHubs);
      setSelectedSubHub(null); // Reset selected sub-hub

      // Generate mock container data for the selected hub
      generateMockContainers(hub);
    } else {
      setSelectedHub(null);
      setSubHubs([]);
      setSelectedSubHub(null);
      setHubContainers([]);
    }
  };

  // Generate mock container data for the selected hub
  const generateMockContainers = (hub) => {
    const containerTypes = ['40HC', '20GP', '40GP', '45HC', '20RF'];
    const statuses = ['In Yard', 'In Transit', 'Delivered'];
    const contents = [
      'Electronics',
      'Textiles',
      'Machinery',
      'Automotive Parts',
      'Furniture',
      'Food Products',
      'Chemicals',
    ];

    // Generate between 3-8 containers
    const count = Math.floor(Math.random() * 6) + 3;
    const mockContainers = [];

    for (let i = 0; i < count; i++) {
      mockContainers.push({
        id: `${hub.city.substring(0, 3).toUpperCase()}${Math.floor(
          1000 + Math.random() * 9000
        )}`,
        type: containerTypes[Math.floor(Math.random() * containerTypes.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        contents: contents[Math.floor(Math.random() * contents.length)],
        fillPercentage: Math.floor(Math.random() * 40) + 60, // 60-100%
        arrivalDate: new Date(
          Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
        ).toLocaleDateString(),
      });
    }

    setHubContainers(mockContainers);
  };

  // Handle sub-hub selection
  const handleSubHubSelection = (e) => {
    const subHubCity = e.target.value;
    if (subHubCity) {
      const subHub = subHubs.find((hub) => hub.city === subHubCity);
      setSelectedSubHub(subHub);
    } else {
      setSelectedSubHub(null);
    }
  };

  // Format coordinates for display
  const formatCoordinates = (coordinates) => {
    if (!coordinates) return '';
    return `${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)}`;
  };

  return (
    <div className="major-hubs-page">
      <div className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">Major Logistics Hubs</h1>
          <p className="welcome-message">
            View and manage container hubs across India. Monitor container
            counts, locations, and operational statistics.
          </p>
        </div>
      </div>

      <div className="dashboard-content animate-in">
        <div className="dashboard-grid">
          <div className="card">
            <div className="card-header">
              <h2>
                <i className="fas fa-search-location"></i> Hub Selector
              </h2>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="loading-spinner">
                  <div className="spinner"></div>
                  <p>Loading hub data...</p>
                </div>
              ) : (
                <form>
                  <div className="form-group">
                    <label htmlFor="hubDropdown">
                      Select Major Logistics Hub:
                    </label>
                    <select
                      id="hubDropdown"
                      onChange={handleHubSelection}
                      defaultValue=""
                    >
                      <option value="">-- Select a Major Hub --</option>
                      {hubs.map((hub) => (
                        <option
                          key={`${hub.state}-${hub.city}`}
                          value={hub.city}
                        >
                          {hub.city}, {hub.state}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedHub && subHubs.length > 0 && (
                    <div className="form-group">
                      <label htmlFor="subHubDropdown">
                        Select Sub-Hub Location:
                      </label>
                      <select
                        id="subHubDropdown"
                        onChange={handleSubHubSelection}
                        defaultValue=""
                      >
                        <option value="">-- Select a Sub-Hub --</option>
                        {subHubs.map((subHub) => (
                          <option
                            key={`sub-${subHub.state}-${subHub.city}`}
                            value={subHub.city}
                          >
                            {subHub.city}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </form>
              )}
            </div>
          </div>

          {selectedHub && (
            <div className="card">
              <div className="card-header">
                <h2>
                  <i className="fas fa-map-marker-alt"></i> Hub Details
                </h2>
              </div>
              <div className="card-body">
                <h3>
                  {selectedHub.city}, {selectedHub.state}
                </h3>

                <div className="stats-container hub-stats">
                  <div className="stat-card">
                    <div className="stat-card-inner">
                      <div className="stat-icon">
                        <i className="fas fa-boxes"></i>
                      </div>
                      <div className="stat-content">
                        <h3>Container Count</h3>
                        <div className="stat-value">
                          {selectedHub.containerCount || 'N/A'}
                        </div>
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
                          {selectedHub.inTransit || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-card-inner">
                      <div className="stat-icon">
                        <i className="fas fa-warehouse"></i>
                      </div>
                      <div className="stat-content">
                        <h3>In Yard</h3>
                        <div className="stat-value">
                          {selectedHub.inYard || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="info-card hub-location">
                  <div className="info-card-header">
                    <h3>
                      <i className="fas fa-map-pin"></i> Location Details
                    </h3>
                  </div>
                  <div className="info-card-body">
                    <div className="info-item">
                      <span className="info-label">State:</span>
                      <span className="info-value">{selectedHub.state}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">City:</span>
                      <span className="info-value">{selectedHub.city}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Latitude:</span>
                      <span className="info-value">
                        {selectedHub.coordinates.lat.toFixed(6)}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Longitude:</span>
                      <span className="info-value">
                        {selectedHub.coordinates.lng.toFixed(6)}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Full Coordinates:</span>
                      <span className="info-value">
                        {formatCoordinates(selectedHub.coordinates)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedSubHub && (
            <div className="card">
              <div className="card-header">
                <h2>
                  <i className="fas fa-industry"></i> Sub-Hub Details
                </h2>
              </div>
              <div className="card-body">
                <h3>{selectedSubHub.city}</h3>

                <div className="info-card hub-location">
                  <div className="info-card-header">
                    <h3>
                      <i className="fas fa-map-pin"></i> Location Details
                    </h3>
                  </div>
                  <div className="info-card-body">
                    <div className="info-item">
                      <span className="info-label">State:</span>
                      <span className="info-value">{selectedSubHub.state}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">City:</span>
                      <span className="info-value">{selectedSubHub.city}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Latitude:</span>
                      <span className="info-value">
                        {selectedSubHub.coordinates.lat.toFixed(6)}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Longitude:</span>
                      <span className="info-value">
                        {selectedSubHub.coordinates.lng.toFixed(6)}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Full Coordinates:</span>
                      <span className="info-value">
                        {formatCoordinates(selectedSubHub.coordinates)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedHub && hubContainers.length > 0 && (
            <div className="card full-width">
              <div className="card-header">
                <h2>
                  <i className="fas fa-shipping-fast"></i> Active Containers at{' '}
                  {selectedHub.city}
                </h2>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="container-table">
                    <thead>
                      <tr>
                        <th>Container ID</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Contents</th>
                        <th>Fill %</th>
                        <th>Arrival Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {hubContainers.map((container, index) => (
                        <tr key={index}>
                          <td>{container.id}</td>
                          <td>{container.type}</td>
                          <td>
                            <span
                              className={`status-badge status-${container.status
                                .toLowerCase()
                                .replace(/\s/g, '-')}`}
                            >
                              {container.status}
                            </span>
                          </td>
                          <td>{container.contents}</td>
                          <td>
                            <div className="inline-progress">
                              <div className="progress-bar-container">
                                <div
                                  className="progress-bar"
                                  style={{
                                    width: `${container.fillPercentage}%`,
                                    backgroundColor:
                                      container.fillPercentage >= 90
                                        ? 'var(--status-delayed)'
                                        : container.fillPercentage >= 75
                                        ? 'var(--status-in-transit)'
                                        : 'var(--status-delivered)',
                                  }}
                                ></div>
                              </div>
                              <span className="fill-text">
                                {container.fillPercentage}%
                              </span>
                            </div>
                          </td>
                          <td>{container.arrivalDate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .hub-stats {
          margin-bottom: var(--spacing-lg);
        }
        .hub-location {
          margin-bottom: var(--spacing-md);
        }
        .inline-progress {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .progress-bar-container {
          width: 80px;
          height: 8px;
          background: rgba(156, 163, 175, 0.2);
          border-radius: 4px;
          overflow: hidden;
        }
        .progress-bar {
          height: 100%;
          transition: width 0.3s ease;
        }
        .fill-text {
          font-size: 0.75rem;
          color: var(--dark-text);
        }
        .full-width {
          grid-column: 1 / -1;
        }
        .loading-spinner {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }
        .spinner {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 3px solid rgba(59, 130, 246, 0.1);
          border-top-color: var(--primary-color);
          animation: spinner 0.8s linear infinite;
          margin-bottom: 1rem;
        }
        @keyframes spinner {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default MajorHubs;
