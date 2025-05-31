import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000',
});

const RouteVisualizer = () => {
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

  // Fetch hubs data when component mounts
  useEffect(() => {
    const fetchHubs = async () => {
      try {
        console.log(
          'Fetching hubs from:',
          `${api.defaults.baseURL}/api/logistics/hubs`
        );
        const response = await api.get('/api/logistics/hubs');
        if (response.data.success) {
          setMajorHubs(response.data.majorHubs);
          setHubs(response.data.hubs);
        }
      } catch (err) {
        setError('Failed to load hubs. Please try again later.');
        console.error('Error fetching hubs:', err);
      }
    };

    fetchHubs();
  }, []);

  // Update available hubs based on selected major hub
  useEffect(() => {
    if (startMajorHub) {
      // Logic to filter hubs based on selected major hub would go here
    }
  }, [startMajorHub]);

  useEffect(() => {
    if (endMajorHub) {
      // Logic to filter hubs based on selected major hub would go here
    }
  }, [endMajorHub]);

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
      const response = await api.post('/api/visualize/route', {
        start_major_hub: startMajorHub,
        start_hub: startHub,
        end_major_hub: endMajorHub,
        end_hub: endHub,
      });

      if (response.data.success) {
        setSuccess(true);
        // Ensure the map URL is using the correct base URL
        const mapUrlPath = response.data.map_url;
        setMapUrl(`${api.defaults.baseURL}${mapUrlPath}`);
        setRouteInfo({
          distance: response.data.distance_km.toFixed(2),
          duration: response.data.duration_hrs.toFixed(2),
        });
      } else {
        throw new Error(response.data.message || 'Failed to visualize route');
      }
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
      console.error('Visualization error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Route Visualization</h2>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="row">
        <div className="col-md-5">
          <div className="card p-3 mb-4">
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <h5 className="mb-3">Origin</h5>
                <div className="mb-3">
                  <label htmlFor="startMajorHub" className="form-label">
                    Select Major Hub
                  </label>
                  <select
                    id="startMajorHub"
                    className="form-select"
                    value={startMajorHub}
                    onChange={(e) => setStartMajorHub(e.target.value)}
                  >
                    <option value="">Select a major hub</option>
                    {Object.keys(majorHubs).map((hubId) => (
                      <option key={`start-major-${hubId}`} value={hubId}>
                        {majorHubs[hubId].name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label htmlFor="startHub" className="form-label">
                    Select Hub
                  </label>
                  <select
                    id="startHub"
                    className="form-select"
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

                <h5 className="mb-3">Destination</h5>
                <div className="mb-3">
                  <label htmlFor="endMajorHub" className="form-label">
                    Select Major Hub
                  </label>
                  <select
                    id="endMajorHub"
                    className="form-select"
                    value={endMajorHub}
                    onChange={(e) => setEndMajorHub(e.target.value)}
                  >
                    <option value="">Select a major hub</option>
                    {Object.keys(majorHubs).map((hubId) => (
                      <option key={`end-major-${hubId}`} value={hubId}>
                        {majorHubs[hubId].name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label htmlFor="endHub" className="form-label">
                    Select Hub
                  </label>
                  <select
                    id="endHub"
                    className="form-select"
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

                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={loading}
                >
                  {loading ? 'Visualizing Route...' : 'Visualize Route'}
                </button>
              </form>
            </div>
          </div>

          {routeInfo && (
            <div className="card p-3">
              <div className="card-body">
                <h5>Route Information</h5>
                <p>
                  <strong>From:</strong>{' '}
                  {startHub
                    ? hubs[startMajorHub].find((h) => h.id === startHub)?.name
                    : ''}
                  , {majorHubs[startMajorHub]?.name || ''}
                  <br />
                  <strong>To:</strong>{' '}
                  {endHub
                    ? hubs[endMajorHub].find((h) => h.id === endHub)?.name
                    : ''}
                  , {majorHubs[endMajorHub]?.name || ''}
                  <br />
                  <strong>Distance:</strong> {routeInfo.distance} km
                  <br />
                  <strong>Estimated Time:</strong> {routeInfo.duration} hours
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="col-md-7">
          {loading && (
            <div
              className="d-flex justify-content-center align-items-center"
              style={{ height: '400px' }}
            >
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}

          {mapUrl && !loading && (
            <div className="map-container">
              <div
                style={{
                  position: 'relative',
                  paddingBottom: '75%',
                  height: 0,
                }}
              >
                <iframe
                  src={mapUrl}
                  title="Route Map"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    border: 0,
                    borderRadius: '4px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  }}
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          )}

          {!mapUrl && !loading && (
            <div
              className="border rounded d-flex justify-content-center align-items-center bg-light"
              style={{ height: '400px' }}
            >
              <div className="text-center text-muted">
                <i className="fas fa-map fa-3x mb-3"></i>
                <h5>Select origin and destination to visualize route</h5>
                <p>
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

export default RouteVisualizer;
