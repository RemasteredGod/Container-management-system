import React, { useContext, useState, useEffect, useMemo } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import Header from './Header';

// Constants for API configuration - hardcoded fallback to avoid process.env issues
const API_BASE_URL = 'http://localhost:5000';

/**
 * Dashboard Component - Main control center for container yard management
 * Displays stats, container information, and provides logistics planning tools
 */
function Dashboard() {
  const { currentUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Container form state with validation
  const [containerForm, setContainerForm] = useState({
    length: '',
    width: '',
    height: '',
    weight: '',
    itemType: '',
    containerStatus: '',
  });

  // Journey form state
  const [journeyForm, setJourneyForm] = useState({
    origin_city: '',
    origin_state: '',
    dest_city: '',
    dest_state: '',
    urgency: '',
  });

  // Transport plan state
  const [transportPlan, setTransportPlan] = useState(null);

  // Animation states
  const [animate, setAnimate] = useState({
    dashboard: false,
    container: false,
    journey: false,
    plan: false,
  });

  // When component mounts, start animations in sequence
  useEffect(() => {
    setTimeout(() => setAnimate((prev) => ({ ...prev, dashboard: true })), 100);
    setTimeout(() => setAnimate((prev) => ({ ...prev, container: true })), 300);
    setTimeout(() => setAnimate((prev) => ({ ...prev, journey: true })), 500);
    setTimeout(() => setAnimate((prev) => ({ ...prev, plan: true })), 700);
  }, []);

  // Mock data to use if API fails
  const mockDashboardData = {
    stats: {
      totalContainers: 125,
      inTransit: 43,
      atYard: 67,
      delivered: 15,
    },
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
  };

  useEffect(() => {
    // Fetch dashboard data when component mounts
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Make sure we're sending proper credentials
      const response = await fetch(`${API_BASE_URL}/api/dashboard2`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch dashboard data: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log('Dashboard data from API:', data); // Debug logging
      setDashboardData(data);
    } catch (err) {
      console.error('API fetch failed, using mock data instead:', err);
      // Use mock data instead of showing error
      setDashboardData(mockDashboardData);
      // Set a user-friendly error message
      setError(
        'Using offline data. Connection to server failed: ' + err.message
      );
    } finally {
      setLoading(false);
    }
  };

  const validateContainerForm = () => {
    const errors = [];

    // Validate dimensions
    if (!containerForm.length) errors.push('Container length is required');
    else if (containerForm.length <= 0 || containerForm.length > 12.19)
      errors.push('Container length must be between 0 and 12.19 meters');

    if (!containerForm.width) errors.push('Container width is required');
    else if (containerForm.width <= 0 || containerForm.width > 2.44)
      errors.push('Container width must be between 0 and 2.44 meters');

    if (!containerForm.height) errors.push('Container height is required');
    else if (containerForm.height <= 0 || containerForm.height > 2.89)
      errors.push('Container height must be between 0 and 2.89 meters');

    if (!containerForm.weight) errors.push('Container weight is required');
    else if (containerForm.weight <= 0 || containerForm.weight > 30480)
      errors.push('Container weight must be between 0 and 30,480 kg');

    // Validate selections
    if (!containerForm.itemType) errors.push('Item type is required');
    if (!containerForm.containerStatus)
      errors.push('Container status is required');

    return errors;
  };

  const validateJourneyForm = () => {
    const errors = [];

    if (!journeyForm.origin_city?.trim())
      errors.push('Origin city is required');
    if (!journeyForm.origin_state) errors.push('Origin state is required');
    if (!journeyForm.dest_city?.trim())
      errors.push('Destination city is required');
    if (!journeyForm.dest_state) errors.push('Destination state is required');
    if (!journeyForm.urgency) errors.push('Please select urgency level');

    return errors;
  };

  const handleContainerFormChange = (e) => {
    const { name, value } = e.target;
    setContainerForm({
      ...containerForm,
      [name]: value,
    });

    // Clear form errors on change
    setFormError(null);
  };

  const handleJourneyFormChange = (e) => {
    const { name, value } = e.target;
    setJourneyForm({
      ...journeyForm,
      [name]: value,
    });

    // Clear form errors on change
    setFormError(null);
  };

  const handleFormReset = () => {
    setContainerForm({
      length: '',
      width: '',
      height: '',
      weight: '',
      itemType: '',
      containerStatus: '',
    });

    setJourneyForm({
      origin_city: '',
      origin_state: '',
      dest_city: '',
      dest_state: '',
      urgency: '',
    });

    setTransportPlan(null);
    setFormError(null);
    setSuccessMessage(null);
  };

  const calculateRoute = async (e) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    // Validate both forms
    const containerErrors = validateContainerForm();
    const journeyErrors = validateJourneyForm();

    const allErrors = [...containerErrors, ...journeyErrors];

    if (allErrors.length > 0) {
      setFormError(allErrors);
      return;
    }

    try {
      setLoading(true);

      // Combine container details and journey parameters
      const requestData = {
        // Container dimensions
        length: parseFloat(containerForm.length),
        width: parseFloat(containerForm.width),
        height: parseFloat(containerForm.height),
        weight: parseFloat(containerForm.weight),

        // Location information
        origin_city: journeyForm.origin_city,
        origin_state: journeyForm.origin_state,
        dest_city: journeyForm.dest_city,
        dest_state: journeyForm.dest_state,

        // Transport parameters
        urgency: journeyForm.urgency,
      };

      // Call the logistics optimization API
      const response = await fetch(`${API_BASE_URL}/api/logistics/optimize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Add credentials to include auth cookies
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            result.errors?.join(', ') ||
            'Error calculating route'
        );
      }

      if (result.success) {
        // Transform API response to match our transportPlan structure
        setTransportPlan({
          route: {
            distance: result.route.distance_km,
            travelTime: result.route.duration_hrs,
            fuelConsumption: Math.round(result.route.distance_km * 0.12), // Estimated fuel consumption
            carbonFootprint: Math.round(result.route.distance_km * 2.3), // Estimated carbon footprint
            origin: result.route.origin,
            destination: result.route.destination,
            transportMode: result.route.transport_mode,
          },
          pricing: {
            basePrice: Math.round(result.route.cost * 0.5),
            distanceFee: Math.round(result.route.cost * 0.3),
            weightFee: Math.round(result.route.cost * 0.2),
            urgencyFee:
              journeyForm.urgency === 'urgent'
                ? Math.round(result.route.cost * 0.15)
                : 0,
            total: Math.round(result.route.cost),
          },
        });
        setSuccessMessage('Route calculated successfully!');
      } else {
        throw new Error(result.message || 'Error calculating route');
      }
    } catch (err) {
      setFormError([
        err.message ||
          'Error calculating route. Please check your inputs and try again.',
      ]);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmTransport = () => {
    // In a real application, this would submit the transport plan to the backend
    setSuccessMessage(
      'Transport plan confirmed! A confirmation email has been sent.'
    );
    // You could also redirect to a confirmation page or show a modal
  };

  // Memoized accessibility helpers
  const getStatusColorClass = useMemo(
    () => (status) => {
      switch (status?.toLowerCase()) {
        case 'in transit':
          return 'status-in-transit';
        case 'at yard':
          return 'status-at-yard';
        case 'delivered':
          return 'status-delivered';
        case 'delayed':
          return 'status-delayed';
        default:
          return 'status-unknown';
      }
    },
    []
  );

  return (
    <div className="app-container dockshift-theme">
      <Header />
      <main className="main-content-container dockshift-theme">
        {/* Page Header */}
        <div className="page-header">
          <div className="page-header-content">
            <h1 className="page-title">Container Management Dashboard</h1>
            <p className="welcome-message">
              Welcome, {currentUser?.firstName || 'User'}!
            </p>
          </div>
        </div>

        {/* Notification Area */}
        {error && (
          <div className="notification error-notification" role="alert">
            <div className="notification-icon">
              <i className="fas fa-exclamation-circle" aria-hidden="true"></i>
            </div>
            <div className="notification-content">{error}</div>
            <button
              className="notification-close"
              onClick={() => setError(null)}
              aria-label="Close notification"
            >
              &times;
            </button>
          </div>
        )}

        {successMessage && (
          <div className="notification success-notification" role="alert">
            <div className="notification-icon">
              <i className="fas fa-check-circle" aria-hidden="true"></i>
            </div>
            <div className="notification-content">{successMessage}</div>
            <button
              className="notification-close"
              onClick={() => setSuccessMessage(null)}
              aria-label="Close notification"
            >
              &times;
            </button>
          </div>
        )}

        {/* Dashboard Summary */}
        {dashboardData && (
          <div
            className={`dashboard-summary ${
              animate.dashboard ? 'animate-in' : ''
            }`}
          >
            <div className="stats-container">
              <div className="stat-card">
                <div className="stat-card-inner">
                  <div className="stat-icon">
                    <i className="fas fa-boxes" aria-hidden="true"></i>
                  </div>
                  <div className="stat-content">
                    <h3>Total Containers</h3>
                    <p className="stat-value">
                      {dashboardData.stats.totalContainers}
                    </p>
                  </div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-card-inner">
                  <div className="stat-icon">
                    <i className="fas fa-shipping-fast" aria-hidden="true"></i>
                  </div>
                  <div className="stat-content">
                    <h3>In Transit</h3>
                    <p className="stat-value">
                      {dashboardData.stats.inTransit}
                    </p>
                  </div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-card-inner">
                  <div className="stat-icon">
                    <i className="fas fa-warehouse" aria-hidden="true"></i>
                  </div>
                  <div className="stat-content">
                    <h3>At Yard</h3>
                    <p className="stat-value">{dashboardData.stats.atYard}</p>
                  </div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-card-inner">
                  <div className="stat-icon">
                    <i className="fas fa-check-circle" aria-hidden="true"></i>
                  </div>
                  <div className="stat-content">
                    <h3>Delivered</h3>
                    <p className="stat-value">
                      {dashboardData.stats.delivered}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="recent-containers">
              <h2>Recent Containers</h2>
              <div className="table-responsive">
                <table
                  className="container-table"
                  aria-label="Recent container shipments"
                >
                  <thead>
                    <tr>
                      <th scope="col">ID</th>
                      <th scope="col">Status</th>
                      <th scope="col">Destination</th>
                      <th scope="col">Arrival Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.containers.map((container) => (
                      <tr key={container.id}>
                        <td>{container.id}</td>
                        <td>
                          <span
                            className={`status-badge ${getStatusColorClass(
                              container.status
                            )}`}
                          >
                            {container.status}
                          </span>
                        </td>
                        <td>{container.destination}</td>
                        <td>{container.arrival}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Form Error Display */}
        {formError && formError.length > 0 && (
          <div className="form-errors" role="alert">
            <h3>Please fix the following errors:</h3>
            <ul>
              {formError.map((err, index) => (
                <li key={index}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Main Dashboard Grid */}
        <div className="dashboard-grid">
          {/* Container Details Section */}
          <section
            className={`container-details card ${
              animate.container ? 'animate-in' : ''
            }`}
          >
            <div className="card-header">
              <h2>
                <i className="fas fa-cube" aria-hidden="true"></i>
                Container Details
              </h2>
            </div>
            <div className="card-body">
              <form>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="containerLength">
                      Length (m):
                      <span className="field-requirements">(Max: 12.19m)</span>
                    </label>
                    <input
                      id="containerLength"
                      type="number"
                      name="length"
                      max="12.19"
                      step="0.01"
                      placeholder="Enter container length"
                      required
                      value={containerForm.length}
                      onChange={handleContainerFormChange}
                      aria-describedby="lengthHelp"
                    />
                    <small id="lengthHelp" className="help-text">
                      Standard 40ft container length is 12.19m
                    </small>
                  </div>
                  <div className="form-group">
                    <label htmlFor="containerWidth">
                      Width (m):
                      <span className="field-requirements">(Max: 2.44m)</span>
                    </label>
                    <input
                      id="containerWidth"
                      type="number"
                      name="width"
                      max="2.44"
                      step="0.01"
                      placeholder="Enter container width"
                      required
                      value={containerForm.width}
                      onChange={handleContainerFormChange}
                      aria-describedby="widthHelp"
                    />
                    <small id="widthHelp" className="help-text">
                      Standard container width is 2.44m
                    </small>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="containerHeight">
                      Height (m):
                      <span className="field-requirements">(Max: 2.59m)</span>
                    </label>
                    <input
                      id="containerHeight"
                      type="number"
                      name="height"
                      max="2.59"
                      step="0.01"
                      placeholder="Enter container height"
                      required
                      value={containerForm.height}
                      onChange={handleContainerFormChange}
                      aria-describedby="heightHelp"
                    />
                    <small id="heightHelp" className="help-text">
                      Standard container height is 2.59m
                    </small>
                  </div>
                  <div className="form-group">
                    <label htmlFor="containerWeight">
                      Weight (kg):
                      <span className="field-requirements">
                        (Max: 30,480kg)
                      </span>
                    </label>
                    <input
                      id="containerWeight"
                      type="number"
                      name="weight"
                      max="30480"
                      placeholder="Enter container weight"
                      required
                      value={containerForm.weight}
                      onChange={handleContainerFormChange}
                      aria-describedby="weightHelp"
                    />
                    <small id="weightHelp" className="help-text">
                      Standard max weight is 30,480kg
                    </small>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="itemType">Item Type:</label>
                    <select
                      id="itemType"
                      name="itemType"
                      required
                      value={containerForm.itemType}
                      onChange={handleContainerFormChange}
                      aria-describedby="itemTypeHelp"
                    >
                      <option value="" disabled>
                        Select item type
                      </option>
                      <option value="non-hazardous">Non-Hazardous</option>
                      <option value="hazardous">Hazardous</option>
                      <option value="perishable">Perishable</option>
                      <option value="fragile">Fragile</option>
                    </select>
                    <small id="itemTypeHelp" className="help-text">
                      Different types require specific handling
                    </small>
                  </div>
                  <div className="form-group">
                    <label htmlFor="containerStatus">Status:</label>
                    <select
                      id="containerStatus"
                      name="containerStatus"
                      required
                      value={containerForm.containerStatus}
                      onChange={handleContainerFormChange}
                    >
                      <option value="" disabled>
                        Select status
                      </option>
                      <option value="ready">Ready for Transport</option>
                      <option value="in-transit">In Transit</option>
                      <option value="delivered">Delivered</option>
                      <option value="delayed">Delayed</option>
                    </select>
                  </div>
                </div>
              </form>
            </div>
          </section>

          {/* Journey Parameters Section */}
          <section
            className={`journey-parameters card ${
              animate.journey ? 'animate-in' : ''
            }`}
          >
            <div className="card-header">
              <h2>
                <i className="fas fa-route" aria-hidden="true"></i>
                Journey Parameters
              </h2>
            </div>
            <div className="card-body">
              <form onSubmit={calculateRoute}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="origin_city">Origin City:</label>
                    <input
                      id="origin_city"
                      type="text"
                      name="origin_city"
                      placeholder="Enter origin city"
                      required
                      value={journeyForm.origin_city}
                      onChange={handleJourneyFormChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="origin_state">Origin State:</label>
                    <select
                      id="origin_state"
                      name="origin_state"
                      required
                      value={journeyForm.origin_state}
                      onChange={handleJourneyFormChange}
                    >
                      <option value="" disabled>
                        Select origin state
                      </option>
                      <option value="Andhra Pradesh">Andhra Pradesh</option>
                      <option value="Arunachal Pradesh">
                        Arunachal Pradesh
                      </option>
                      <option value="Assam">Assam</option>
                      <option value="Bihar">Bihar</option>
                      <option value="Chhattisgarh">Chhattisgarh</option>
                      <option value="Goa">Goa</option>
                      <option value="Gujarat">Gujarat</option>
                      <option value="Haryana">Haryana</option>
                      <option value="Himachal Pradesh">Himachal Pradesh</option>
                      <option value="Jharkhand">Jharkhand</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Kerala">Kerala</option>
                      <option value="Madhya Pradesh">Madhya Pradesh</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Manipur">Manipur</option>
                      <option value="Meghalaya">Meghalaya</option>
                      <option value="Mizoram">Mizoram</option>
                      <option value="Nagaland">Nagaland</option>
                      <option value="Odisha">Odisha</option>
                      <option value="Punjab">Punjab</option>
                      <option value="Rajasthan">Rajasthan</option>
                      <option value="Sikkim">Sikkim</option>
                      <option value="Tamil Nadu">Tamil Nadu</option>
                      <option value="Telangana">Telangana</option>
                      <option value="Tripura">Tripura</option>
                      <option value="Uttar Pradesh">Uttar Pradesh</option>
                      <option value="Uttarakhand">Uttarakhand</option>
                      <option value="West Bengal">West Bengal</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="dest_city">Destination City:</label>
                    <input
                      id="dest_city"
                      type="text"
                      name="dest_city"
                      placeholder="Enter destination city"
                      required
                      value={journeyForm.dest_city}
                      onChange={handleJourneyFormChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="dest_state">Destination State:</label>
                    <select
                      id="dest_state"
                      name="dest_state"
                      required
                      value={journeyForm.dest_state}
                      onChange={handleJourneyFormChange}
                    >
                      <option value="" disabled>
                        Select destination state
                      </option>
                      <option value="Andhra Pradesh">Andhra Pradesh</option>
                      <option value="Arunachal Pradesh">
                        Arunachal Pradesh
                      </option>
                      <option value="Assam">Assam</option>
                      <option value="Bihar">Bihar</option>
                      <option value="Chhattisgarh">Chhattisgarh</option>
                      <option value="Goa">Goa</option>
                      <option value="Gujarat">Gujarat</option>
                      <option value="Haryana">Haryana</option>
                      <option value="Himachal Pradesh">Himachal Pradesh</option>
                      <option value="Jharkhand">Jharkhand</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Kerala">Kerala</option>
                      <option value="Madhya Pradesh">Madhya Pradesh</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Manipur">Manipur</option>
                      <option value="Meghalaya">Meghalaya</option>
                      <option value="Mizoram">Mizoram</option>
                      <option value="Nagaland">Nagaland</option>
                      <option value="Odisha">Odisha</option>
                      <option value="Punjab">Punjab</option>
                      <option value="Rajasthan">Rajasthan</option>
                      <option value="Sikkim">Sikkim</option>
                      <option value="Tamil Nadu">Tamil Nadu</option>
                      <option value="Telangana">Telangana</option>
                      <option value="Tripura">Tripura</option>
                      <option value="Uttar Pradesh">Uttar Pradesh</option>
                      <option value="Uttarakhand">Uttarakhand</option>
                      <option value="West Bengal">West Bengal</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="urgency">Urgency:</label>
                    <div className="urgency-selector">
                      <div className="urgency-option">
                        <input
                          type="radio"
                          id="normal"
                          name="urgency"
                          value="normal"
                          checked={journeyForm.urgency === 'normal'}
                          onChange={handleJourneyFormChange}
                        />
                        <label htmlFor="normal" className="urgency-label">
                          <i className="fas fa-clock" aria-hidden="true"></i>
                          <span>Normal</span>
                          <small>Standard shipping rates apply</small>
                        </label>
                      </div>
                      <div className="urgency-option">
                        <input
                          type="radio"
                          id="urgent"
                          name="urgency"
                          value="urgent"
                          checked={journeyForm.urgency === 'urgent'}
                          onChange={handleJourneyFormChange}
                        />
                        <label htmlFor="urgent" className="urgency-label">
                          <i className="fas fa-bolt" aria-hidden="true"></i>
                          <span>Urgent</span>
                          <small>Premium rates apply (50% surcharge)</small>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="button-group">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <i
                          className="fas fa-spinner fa-spin"
                          aria-hidden="true"
                        ></i>
                        Calculating...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-calculator" aria-hidden="true"></i>
                        Calculate Route
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleFormReset}
                  >
                    <i className="fas fa-undo" aria-hidden="true"></i>
                    Reset
                  </button>
                </div>
              </form>
            </div>
          </section>

          {/* Transport Plan Section */}
          <section
            className={`transport-plan card ${
              animate.plan ? 'animate-in' : ''
            }`}
          >
            <div className="card-header">
              <h2>
                <i className="fas fa-truck" aria-hidden="true"></i>
                Transport Plan
              </h2>
            </div>
            <div className="card-body">
              {transportPlan ? (
                <div className="transport-plan-details">
                  <div className="info-card">
                    <div className="info-card-header">
                      <h3>
                        <i
                          className="fas fa-map-marked-alt"
                          aria-hidden="true"
                        ></i>
                        Route Information
                      </h3>
                    </div>
                    <div className="info-card-body">
                      <div className="info-item">
                        <span className="info-label">Distance:</span>
                        <span className="info-value">
                          {transportPlan.route.distance} km
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">
                          Estimated Travel Time:
                        </span>
                        <span className="info-value">
                          {transportPlan.route.travelTime} hours
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Fuel Consumption:</span>
                        <span className="info-value">
                          {transportPlan.route.fuelConsumption} liters
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Carbon Footprint:</span>
                        <span className="info-value">
                          {transportPlan.route.carbonFootprint} kg CO
                          <sub>2</sub>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="info-card pricing-card">
                    <div className="info-card-header">
                      <h3>
                        <i
                          className="fas fa-file-invoice-dollar"
                          aria-hidden="true"
                        ></i>
                        Price Quote
                      </h3>
                    </div>
                    <div className="info-card-body">
                      <div className="quote-breakdown">
                        <div className="quote-item">
                          <span className="quote-label">Base Price:</span>
                          <span className="quote-value">
                            ${transportPlan.pricing.basePrice}
                          </span>
                        </div>
                        <div className="quote-item">
                          <span className="quote-label">Distance Fee:</span>
                          <span className="quote-value">
                            ${transportPlan.pricing.distanceFee}
                          </span>
                        </div>
                        <div className="quote-item">
                          <span className="quote-label">Weight Fee:</span>
                          <span className="quote-value">
                            ${transportPlan.pricing.weightFee}
                          </span>
                        </div>
                        <div className="quote-item">
                          <span className="quote-label">Urgency Fee:</span>
                          <span className="quote-value">
                            ${transportPlan.pricing.urgencyFee}
                          </span>
                        </div>
                        <div className="quote-total">
                          <span className="quote-label">Total:</span>
                          <span className="quote-value">
                            ${transportPlan.pricing.total}
                          </span>
                        </div>
                      </div>
                      <button
                        className="btn btn-success"
                        onClick={handleConfirmTransport}
                      >
                        <i
                          className="fas fa-check-circle"
                          aria-hidden="true"
                        ></i>
                        Confirm Transport Plan
                      </button>
                    </div>
                  </div>

                  <div className="map-container">
                    <h3>
                      <i className="fas fa-map" aria-hidden="true"></i>
                      Route Map
                    </h3>
                    <div className="route-map">
                      <div className="map-placeholder">
                        <div className="route-info">
                          <div className="route-endpoints">
                            <div className="route-origin">
                              <i
                                className="fas fa-dot-circle"
                                aria-hidden="true"
                              ></i>
                              <span>
                                {journeyForm.origin_city},{' '}
                                {journeyForm.origin_state}
                              </span>
                            </div>
                            <div className="route-arrow">
                              <i
                                className="fas fa-long-arrow-alt-down"
                                aria-hidden="true"
                              ></i>
                            </div>
                            <div className="route-destination">
                              <i
                                className="fas fa-map-marker-alt"
                                aria-hidden="true"
                              ></i>
                              <span>
                                {journeyForm.dest_city},{' '}
                                {journeyForm.dest_state}
                              </span>
                            </div>
                          </div>
                          <div className="transport-mode">
                            <i className="fas fa-truck" aria-hidden="true"></i>
                            <span>{transportPlan.route.transportMode}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="no-plan-message">
                  <div className="empty-state">
                    <i className="fas fa-route fa-4x" aria-hidden="true"></i>
                    <p>
                      Enter container details and journey parameters to
                      calculate a transport plan.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
