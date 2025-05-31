import React, { useContext, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import '../styles/App.css';

const Profile = () => {
  const { currentUser } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: currentUser?.firstName || '',
    lastName: currentUser?.lastName || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    jobTitle: currentUser?.jobTitle || '',
    department: currentUser?.department || '',
  });

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Placeholder for API call to update user profile
      console.log('Profile update data:', formData);

      // Mock successful update - in a real application, you'd update the backend
      // and then update the currentUser in AuthContext

      setIsEditing(false);
      // Show success message
      alert('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    if (isEditing) {
      // Reset form data when canceling edit
      setFormData({
        firstName: currentUser?.firstName || '',
        lastName: currentUser?.lastName || '',
        email: currentUser?.email || '',
        phone: currentUser?.phone || '',
        jobTitle: currentUser?.jobTitle || '',
        department: currentUser?.department || '',
      });
    }
    setIsEditing(!isEditing);
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>My Profile</h1>
        <button
          className={`btn ${isEditing ? 'btn-outline' : 'btn-primary'}`}
          onClick={toggleEditMode}
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      <div className="profile-content">
        <div className="profile-section user-avatar-section">
          <div className="large-avatar">
            {currentUser?.firstName ? currentUser.firstName.charAt(0) : 'U'}
          </div>
          <div className="user-name-container">
            <h2>
              {currentUser?.firstName} {currentUser?.lastName}
            </h2>
            <p className="user-email">{currentUser?.email}</p>
          </div>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-control"
                  disabled
                />
                <small className="form-text text-muted">
                  Email cannot be changed
                </small>
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="jobTitle">Job Title</label>
                <input
                  type="text"
                  id="jobTitle"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label htmlFor="department">Department</label>
                <input
                  type="text"
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
            </div>

            <div className="profile-actions">
              <button type="submit" className="btn btn-primary">
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div className="profile-details">
            <div className="profile-section">
              <h3>Personal Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Full Name</span>
                  <span className="info-value">
                    {currentUser?.firstName} {currentUser?.lastName}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Email</span>
                  <span className="info-value">{currentUser?.email}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Phone</span>
                  <span className="info-value">
                    {currentUser?.phone || 'Not provided'}
                  </span>
                </div>
              </div>
            </div>

            <div className="profile-section">
              <h3>Work Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Job Title</span>
                  <span className="info-value">
                    {currentUser?.jobTitle || 'Not provided'}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Department</span>
                  <span className="info-value">
                    {currentUser?.department || 'Not provided'}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Member Since</span>
                  <span className="info-value">
                    {currentUser?.createdAt
                      ? new Date(currentUser.createdAt).toLocaleDateString()
                      : 'Unknown'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
