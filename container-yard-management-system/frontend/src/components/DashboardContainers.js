import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import '../styles/App.css';

const DashboardContainers = () => {
  const { currentUser } = useContext(AuthContext);
  const [containers, setContainers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    container_id: '',
    status: 'In Transit',
    destination: '',
    arrival: ''
  });
  const [stats, setStats] = useState({
    totalContainers: 0,
    inTransit: 0,
    atYard: 0,
    delivered: 0,
    delayed: 0
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  // Fetch containers on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Fetch dashboard data from the API
  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/dashboard2', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const data = await response.json();
      
      setContainers(data.containers || []);
      setStats({
        totalContainers: data.stats?.totalContainers || 0,
        inTransit: data.stats?.inTransit || 0,
        atYard: data.stats?.atYard || 0,
        delivered: data.stats?.delivered || 0,
        delayed: data.stats?.delayed || 0
      });
      
      setIsLoading(false);
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field when user types
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!formData.container_id) {
      errors.container_id = 'Container ID is required';
    }
    
    if (!formData.destination) {
      errors.destination = 'Destination is required';
    }
    
    if (!formData.arrival) {
      errors.arrival = 'Arrival date is required';
    } else {
      // Check if date is valid
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(formData.arrival)) {
        errors.arrival = 'Invalid date format (YYYY-MM-DD)';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      let response;
      
      if (isEditing) {
        // Update existing container
        response = await fetch(`/api/containers2/${editId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify(formData)
        });
      } else {
        // Create new container
        response = await fetch('/api/containers2', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify(formData)
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Operation failed');
      }

      // Reset form and fetch updated data
      setFormData({
        container_id: '',
        status: 'In Transit',
        destination: '',
        arrival: ''
      });
      setIsEditing(false);
      setEditId(null);
      setShowModal(false);
      fetchDashboardData();
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle edit container
  const handleEdit = (container) => {
    setIsEditing(true);
    setEditId(container.container_id);
    setFormData({
      container_id: container.container_id,
      status: container.status,
      destination: container.destination,
      arrival: container.arrival
    });
    setShowModal(true);
  };

  // Handle delete container
  const handleDelete = async (containerId) => {
    if (!window.confirm('Are you sure you want to delete this container?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/containers2/${containerId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to delete container');
      }

      // Refresh the list
      fetchDashboardData();
    } catch (err) {
      setError(err.message);
    }
  };

  // Format date for display
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Not scheduled';
    
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  // Get CSS class based on container status
  const getStatusClass = (status) => {
    switch (status) {
      case 'In Transit': return 'status-in-transit';
      case 'At Yard': return 'status-at-yard';
      case 'Delivered': return 'status-delivered';
      case 'Delayed': return 'status-delayed';
      default: return '';
    }
  };

  return (
    <div className="dashboard-containers-page">
      <div className="dashboard-header">
        <h1>Dashboard Containers</h1>
        <p>Manage containers specifically used for dashboard visualization</p>
        <button 
          className="btn btn-primary create-container-btn"
          onClick={() => {
            setIsEditing(false);
            setFormData({
              container_id: '',
              status: 'In Transit',
              destination: '',
              arrival: ''
            });
            setFormErrors({});
            setShowModal(true);
          }}
        >
          <i className="fas fa-plus"></i> Add Dashboard Container
        </button>
      </div>
      
      {error && (
        <div className="alert alert-danger">
          <i className="fas fa-exclamation-circle"></i> {error}
          <button 
            className="close-btn"
            onClick={() => setError(null)}
          >
            &times;
          </button>
        </div>
      )}

      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon total">
            <i className="fas fa-cubes"></i>
          </div>
          <div className="stat-info">
            <h3>Total Containers</h3>
            <p className="stat-value">{stats.totalContainers}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon in-transit">
            <i className="fas fa-shipping-fast"></i>
          </div>
          <div className="stat-info">
            <h3>In Transit</h3>
            <p className="stat-value">{stats.inTransit}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon at-yard">
            <i className="fas fa-warehouse"></i>
          </div>
          <div className="stat-info">
            <h3>At Yard</h3>
            <p className="stat-value">{stats.atYard}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon delivered">
            <i className="fas fa-check-circle"></i>
          </div>
          <div className="stat-info">
            <h3>Delivered</h3>
            <p className="stat-value">{stats.delivered}</p>
          </div>
        </div>
      </div>

      <div className="container-table-wrapper">
        <h2>Dashboard Container List</h2>
        {isLoading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading containers...</p>
          </div>
        ) : containers.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-box-open fa-3x"></i>
            <h3>No Dashboard Containers Found</h3>
            <p>Add your first dashboard container to get started</p>
          </div>
        ) : (
          <table className="container-table">
            <thead>
              <tr>
                <th>Container ID</th>
                <th>Status</th>
                <th>Destination</th>
                <th>Arrival Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {containers.map((container) => (
                <tr key={container.container_id || container.id}>
                  <td className="container-id">{container.container_id}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(container.status)}`}>
                      {container.status}
                    </span>
                  </td>
                  <td>{container.destination}</td>
                  <td>{formatDate(container.arrival)}</td>
                  <td className="actions-cell">
                    <button 
                      className="btn-icon edit-btn" 
                      onClick={() => handleEdit(container)}
                      aria-label="Edit container"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button 
                      className="btn-icon delete-btn" 
                      onClick={() => handleDelete(container.container_id)}
                      aria-label="Delete container"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit Container Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{isEditing ? 'Edit Dashboard Container' : 'Add Dashboard Container'}</h2>
              <button 
                className="modal-close-btn"
                onClick={() => setShowModal(false)}
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="container-form">
              <div className="form-group">
                <label htmlFor="container_id">Container ID</label>
                <input
                  type="text"
                  id="container_id"
                  name="container_id"
                  value={formData.container_id}
                  onChange={handleChange}
                  placeholder="e.g., DASH1001"
                  disabled={isEditing}
                  className={formErrors.container_id ? 'has-error' : ''}
                />
                {formErrors.container_id && (
                  <div className="error-message">{formErrors.container_id}</div>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="In Transit">In Transit</option>
                  <option value="At Yard">At Yard</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Delayed">Delayed</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="destination">Destination</label>
                <input
                  type="text"
                  id="destination"
                  name="destination"
                  value={formData.destination}
                  onChange={handleChange}
                  placeholder="e.g., Shanghai, China"
                  className={formErrors.destination ? 'has-error' : ''}
                />
                {formErrors.destination && (
                  <div className="error-message">{formErrors.destination}</div>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor="arrival">Arrival Date (YYYY-MM-DD)</label>
                <input
                  type="date"
                  id="arrival"
                  name="arrival"
                  value={formData.arrival}
                  onChange={handleChange}
                  placeholder="YYYY-MM-DD"
                  className={formErrors.arrival ? 'has-error' : ''}
                />
                {formErrors.arrival && (
                  <div className="error-message">{formErrors.arrival}</div>
                )}
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {isEditing ? 'Save Changes' : 'Add Container'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardContainers;
