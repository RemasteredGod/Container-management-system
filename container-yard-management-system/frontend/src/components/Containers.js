import React, { useState, useEffect } from 'react';
import { Alert, Button } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import '../styles/App.css';

const Containers = () => {
  // Authentication context
  const { currentUser } = useAuth();

  // State management
  const [containers, setContainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Get Indian cities for dropdowns
  const [cities, setCities] = useState([
    'Mumbai',
    'Delhi',
    'Bangalore',
    'Chennai',
    'Kolkata',
    'Hyderabad',
    'Ahmedabad',
    'Pune',
    'Jaipur',
    'Lucknow',
    'Kanpur',
    'Nagpur',
    'Indore',
    'Thane',
    'Bhopal',
    'Visakhapatnam',
    'Patna',
    'Vadodara',
    'Ghaziabad',
    'Ludhiana',
    'Coimbatore',
    'Kochi',
    'Surat',
    'Guwahati',
    'Bhubaneswar',
  ]);

  // Urgency status options
  const urgencyOptions = ['Low', 'Medium', 'High', 'Critical'];

  // Container status options
  const statusOptions = ['In Transit', 'At Yard', 'Delivered'];

  // Form state
  const [currentContainer, setCurrentContainer] = useState({
    container_id: '',
    status: 'In Transit',
    pickup_city: '',
    destination_city: '',
    total_items: 1,
    total_weight: '',
    urgency_status: 'Medium',
    fill_percentage: 50,
    priority: 'normal',
  });

  // Alert state
  const [alert, setAlert] = useState({
    show: false,
    variant: '',
    message: '',
  });

  // API URL
  const API_URL = 'http://localhost:5000';

  // Initial data fetching
  useEffect(() => {
    fetchContainers();
  }, []);

  // Fetch containers from API
  const fetchContainers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/containers`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setContainers(data.containers);
      } else {
        throw new Error(data.error || 'Failed to fetch containers');
      }
    } catch (err) {
      console.error('Error fetching containers:', err);
      setError(`Failed to load containers: ${err.message}`);
      setAlert({
        show: true,
        variant: 'danger',
        message: `Failed to load containers: ${err.message}`,
      });

      // Use mock data as fallback only when there's an error
      const mockContainers = [
        {
          id: 'C1001',
          container_id: 'C1001',
          status: 'In Transit',
          pickup_city: 'Mumbai',
          destination_city: 'Delhi',
          total_items: 45,
          total_weight: 2500,
          urgency_status: 'High',
          created_at: '2025-04-20T10:30:00',
          updated_at: '2025-04-21T08:15:00',
          fill_percentage: 85,
        },
        {
          id: 'C1002',
          container_id: 'C1002',
          status: 'At Yard',
          pickup_city: 'Chennai',
          destination_city: 'Bangalore',
          total_items: 30,
          total_weight: 1800,
          urgency_status: 'Medium',
          created_at: '2025-04-19T14:20:00',
          updated_at: '2025-04-19T18:45:00',
          fill_percentage: 60,
        },
        {
          id: 'C1003',
          container_id: 'C1003',
          status: 'Delivered',
          pickup_city: 'Kolkata',
          destination_city: 'Hyderabad',
          total_items: 60,
          total_weight: 3200,
          urgency_status: 'Low',
          created_at: '2025-04-18T09:10:00',
          updated_at: '2025-04-22T11:30:00',
          fill_percentage: 95,
        },
      ];
      setContainers(mockContainers);
    } finally {
      setLoading(false);
    }
  };

  // Create new container
  const handleAddContainer = async () => {
    try {
      // Validate container ID format (e.g., C followed by numbers)
      if (!/^C\d{4,}$/.test(currentContainer.container_id)) {
        throw new Error(
          'Container ID must start with C followed by at least 4 numbers'
        );
      }

      // Ensure required fields are filled
      if (
        !currentContainer.pickup_city ||
        !currentContainer.destination_city ||
        !currentContainer.total_weight
      ) {
        throw new Error('Please fill all required fields');
      }

      const response = await fetch(`${API_URL}/api/containers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...currentContainer,
          // Convert string values to appropriate types
          total_items: parseInt(currentContainer.total_items, 10),
          total_weight: parseFloat(currentContainer.total_weight),
          fill_percentage: parseInt(currentContainer.fill_percentage, 10),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create container');
      }

      if (result.success) {
        // Important: Make sure we add the new container to our state
        const newContainer = result.container;
        setContainers([...containers, newContainer]);

        setAlert({
          show: true,
          variant: 'success',
          message: 'Container added successfully!',
        });
        setShowAddModal(false);
        resetForm();
      } else {
        throw new Error(result.error || 'Failed to create container');
      }
    } catch (err) {
      console.error('Error adding container:', err);
      setAlert({
        show: true,
        variant: 'danger',
        message: `Error adding container: ${err.message}`,
      });
    }
  };

  // Update existing container
  const handleUpdateContainer = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/containers/${currentContainer.container_id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            ...currentContainer,
            // Convert string values to appropriate types
            total_items: parseInt(currentContainer.total_items, 10),
            total_weight: parseFloat(currentContainer.total_weight),
            fill_percentage: parseInt(currentContainer.fill_percentage, 10),
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update container');
      }

      const result = await response.json();

      if (result.success) {
        // Update the container in the local state
        const updatedContainers = containers.map((container) =>
          container.id === currentContainer.id ? result.container : container
        );

        setContainers(updatedContainers);
        setAlert({
          show: true,
          variant: 'success',
          message: 'Container updated successfully!',
        });
        setShowEditModal(false);
      } else {
        throw new Error(result.error || 'Failed to update container');
      }
    } catch (err) {
      console.error('Error updating container:', err);
      setAlert({
        show: true,
        variant: 'danger',
        message: `Error updating container: ${err.message}`,
      });
    }
  };

  // Delete container
  const handleDeleteContainer = async (id) => {
    if (window.confirm('Are you sure you want to delete this container?')) {
      try {
        const response = await fetch(`${API_URL}/api/containers/${id}`, {
          method: 'DELETE',
          credentials: 'include',
          headers: {
            Accept: 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to delete container');
        }

        const result = await response.json();

        if (result.success) {
          const filteredContainers = containers.filter(
            (container) => container.id !== id
          );
          setContainers(filteredContainers);
          setAlert({
            show: true,
            variant: 'success',
            message: 'Container deleted successfully!',
          });
        } else {
          throw new Error(result.error || 'Failed to delete container');
        }
      } catch (err) {
        console.error('Error deleting container:', err);
        setAlert({
          show: true,
          variant: 'danger',
          message: `Error deleting container: ${err.message}`,
        });
      }
    }
  };

  // Set container for editing
  const editContainer = (container) => {
    setCurrentContainer(container);
    setShowEditModal(true);
  };

  // Reset form values
  const resetForm = () => {
    setCurrentContainer({
      container_id: '',
      status: 'In Transit',
      pickup_city: '',
      destination_city: '',
      total_items: 1,
      total_weight: '',
      urgency_status: 'Medium',
      fill_percentage: 50,
      priority: 'normal',
    });
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentContainer({
      ...currentContainer,
      [name]: name === 'total_items' ? parseInt(value, 10) : value,
    });
  };

  // Get progress bar color based on urgency and fill percentage
  const getProgressColor = (fillPercentage, urgency) => {
    if (urgency === 'Critical' || urgency === 'High') {
      return 'var(--status-delayed)'; // Red for urgent containers
    } else if (fillPercentage >= 90) {
      return 'var(--status-delayed)'; // Red for high fill
    } else if (fillPercentage >= 75) {
      return 'var(--status-in-transit)'; // Yellow/amber for approaching threshold
    } else {
      return 'var(--status-delivered)'; // Green for normal levels
    }
  };

  return (
    <div className="containers-page">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">Container Management</h1>
          <p className="welcome-message">
            Create, manage, and track shipping containers across your logistics
            network.
          </p>
        </div>
      </div>

      {/* Notification area */}
      {alert.show && (
        <div
          className={`notification ${
            alert.variant === 'danger'
              ? 'error-notification'
              : 'success-notification'
          }`}
        >
          <div className="notification-icon">
            <i
              className={
                alert.variant === 'danger'
                  ? 'fas fa-exclamation-circle'
                  : 'fas fa-check-circle'
              }
            ></i>
          </div>
          <div className="notification-content">{alert.message}</div>
          <button
            className="notification-close"
            onClick={() => setAlert({ ...alert, show: false })}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      {/* Add container button */}
      <div className="dashboard-actions">
        <button
          className="btn btn-primary"
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
        >
          <i className="fas fa-plus"></i> Create New Container
        </button>
      </div>

      {/* Dashboard Content */}
      <div className="dashboard-content animate-in">
        <div className="recent-containers">
          <h2>
            <i className="fas fa-boxes"></i> Container Records
          </h2>
          {loading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Loading containers...</p>
            </div>
          ) : error ? (
            <Alert variant="danger">{error}</Alert>
          ) : containers.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-box-open fa-3x"></i>
              <p>
                No containers found. Click "Create New Container" to add your
                first container.
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="container-table">
                <thead>
                  <tr>
                    <th>Container ID</th>
                    <th>Status</th>
                    <th>Pickup City</th>
                    <th>Destination City</th>
                    <th>Items</th>
                    <th>Weight (kg)</th>
                    <th>Urgency</th>
                    <th>Fill %</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {containers.map((container) => (
                    <tr key={container.id}>
                      <td>{container.container_id}</td>
                      <td>
                        <span
                          className={`status-badge status-${container.status
                            .toLowerCase()
                            .replace(/\s+/g, '-')}`}
                        >
                          {container.status}
                        </span>
                      </td>
                      <td>{container.pickup_city}</td>
                      <td>{container.destination_city}</td>
                      <td>{container.total_items}</td>
                      <td>{container.total_weight}</td>
                      <td>
                        <span
                          className={`status-badge priority-${container.urgency_status.toLowerCase()}`}
                        >
                          {container.urgency_status}
                        </span>
                      </td>
                      <td>
                        <div className="inline-progress">
                          <div className="progress-bar-container">
                            <div
                              className="progress-bar"
                              style={{
                                width: `${container.fill_percentage}%`,
                                backgroundColor: getProgressColor(
                                  container.fill_percentage,
                                  container.urgency_status
                                ),
                              }}
                            ></div>
                          </div>
                          <span className="fill-text">
                            {container.fill_percentage}%
                          </span>
                        </div>
                      </td>
                      <td className="action-buttons">
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => editContainer(container)}
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteContainer(container.id)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Container Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="card modal-card animate-in">
            <div className="card-header">
              <h2>
                <i className="fas fa-plus-circle"></i> Add New Container
              </h2>
              <button
                className="modal-close"
                onClick={() => setShowAddModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="card-body">
              <form className="container-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Container ID</label>
                    <input
                      type="text"
                      name="container_id"
                      value={currentContainer.container_id}
                      onChange={handleInputChange}
                      placeholder="C1234"
                      required
                    />
                    <span className="help-text">
                      Container ID should start with 'C' followed by numbers.
                    </span>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Status</label>
                    <select
                      name="status"
                      value={currentContainer.status}
                      onChange={handleInputChange}
                    >
                      {statusOptions.map((status, index) => (
                        <option key={index} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Urgency Status</label>
                    <select
                      name="urgency_status"
                      value={currentContainer.urgency_status}
                      onChange={handleInputChange}
                    >
                      {urgencyOptions.map((option, index) => (
                        <option key={index} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Pickup City</label>
                    <select
                      name="pickup_city"
                      value={currentContainer.pickup_city}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Pickup City</option>
                      {cities.map((city, index) => (
                        <option key={index} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Destination City</label>
                    <select
                      name="destination_city"
                      value={currentContainer.destination_city}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Destination City</option>
                      {cities.map((city, index) => (
                        <option key={index} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Total Items</label>
                    <input
                      type="number"
                      min="1"
                      name="total_items"
                      value={currentContainer.total_items}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Total Weight (kg)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      name="total_weight"
                      value={currentContainer.total_weight}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="button-group">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleAddContainer}
                  >
                    Add Container
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Container Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="card modal-card animate-in">
            <div className="card-header">
              <h2>
                <i className="fas fa-edit"></i> Edit Container
              </h2>
              <button
                className="modal-close"
                onClick={() => setShowEditModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="card-body">
              <form className="container-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Container ID</label>
                    <input
                      type="text"
                      name="container_id"
                      value={currentContainer.container_id}
                      onChange={handleInputChange}
                      disabled
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Status</label>
                    <select
                      name="status"
                      value={currentContainer.status}
                      onChange={handleInputChange}
                    >
                      {statusOptions.map((status, index) => (
                        <option key={index} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Urgency Status</label>
                    <select
                      name="urgency_status"
                      value={currentContainer.urgency_status}
                      onChange={handleInputChange}
                    >
                      {urgencyOptions.map((option, index) => (
                        <option key={index} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Pickup City</label>
                    <select
                      name="pickup_city"
                      value={currentContainer.pickup_city}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Pickup City</option>
                      {cities.map((city, index) => (
                        <option key={index} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Destination City</label>
                    <select
                      name="destination_city"
                      value={currentContainer.destination_city}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Destination City</option>
                      {cities.map((city, index) => (
                        <option key={index} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Total Items</label>
                    <input
                      type="number"
                      min="1"
                      name="total_items"
                      value={currentContainer.total_items}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Total Weight (kg)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      name="total_weight"
                      value={currentContainer.total_weight}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="button-group">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowEditModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleUpdateContainer}
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
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
        .action-buttons {
          display: flex;
          gap: 8px;
        }
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        .modal-card {
          width: 90%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
        }
        .modal-close {
          background: none;
          border: none;
          font-size: 1.25rem;
          cursor: pointer;
          color: var(--light-text);
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
        .priority-low {
          background-color: rgba(22, 163, 74, 0.1) !important;
          color: var(--status-delivered) !important;
        }
        .priority-medium {
          background-color: rgba(59, 130, 246, 0.1) !important;
          color: var(--status-at-yard) !important;
        }
        .priority-high,
        .priority-critical {
          background-color: rgba(239, 68, 68, 0.1) !important;
          color: var(--status-delayed) !important;
        }
      `}</style>
    </div>
  );
};

export default Containers;
