import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });

  const [errors, setErrors] = useState({});
  const [registrationError, setRegistrationError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });

    // Clear field-specific error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }

    // Clear general registration error when user makes changes
    if (registrationError) {
      setRegistrationError('');
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 4) {
      newErrors.username = 'Username must be at least 4 characters';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'You must accept the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Send only needed data
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        username: formData.username,
        password: formData.password,
      };

      await register(userData);
      navigate('/login', {
        state: { message: 'Registration successful! You can now log in.' },
      });
    } catch (error) {
      console.error('Registration error:', error);
      setRegistrationError(
        'Registration failed. This username or email may already be in use.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container dockshift-theme">
      <div className="auth-card register-card dockshift-theme">
        <div className="auth-header dockshift-theme">
          <div
            className="logo-circle"
            style={{ background: 'var(--dockshift-primary)', color: 'white' }}
          >
            DS
          </div>
          <h2>Create an Account</h2>
          <p>Join DockShift Management System</p>
        </div>

        {registrationError && (
          <div className="error-message">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            {registrationError}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label
                htmlFor="firstName"
                style={{ color: 'var(--dockshift-text)' }}
              >
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Enter your first name"
                className={errors.firstName ? 'error' : ''}
                style={{
                  background: 'var(--dockshift-card-bg)',
                  color: 'var(--dockshift-text)',
                  border: '1px solid var(--dockshift-border)',
                }}
              />
              {errors.firstName && (
                <div className="field-error">{errors.firstName}</div>
              )}
            </div>
            <div className="form-group">
              <label
                htmlFor="lastName"
                style={{ color: 'var(--dockshift-text)' }}
              >
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Enter your last name"
                className={errors.lastName ? 'error' : ''}
                style={{
                  background: 'var(--dockshift-card-bg)',
                  color: 'var(--dockshift-text)',
                  border: '1px solid var(--dockshift-border)',
                }}
              />
              {errors.lastName && (
                <div className="field-error">{errors.lastName}</div>
              )}
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="email" style={{ color: 'var(--dockshift-text)' }}>
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className={errors.email ? 'error' : ''}
              style={{
                background: 'var(--dockshift-card-bg)',
                color: 'var(--dockshift-text)',
                border: '1px solid var(--dockshift-border)',
              }}
            />
            {errors.email && <div className="field-error">{errors.email}</div>}
          </div>
          <div className="form-group">
            <label
              htmlFor="username"
              style={{ color: 'var(--dockshift-text)' }}
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Choose a username"
              className={errors.username ? 'error' : ''}
              style={{
                background: 'var(--dockshift-card-bg)',
                color: 'var(--dockshift-text)',
                border: '1px solid var(--dockshift-border)',
              }}
            />
            {errors.username && (
              <div className="field-error">{errors.username}</div>
            )}
          </div>
          <div className="form-row">
            <div className="form-group">
              <label
                htmlFor="password"
                style={{ color: 'var(--dockshift-text)' }}
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                className={errors.password ? 'error' : ''}
                style={{
                  background: 'var(--dockshift-card-bg)',
                  color: 'var(--dockshift-text)',
                  border: '1px solid var(--dockshift-border)',
                }}
              />
              {errors.password && (
                <div className="field-error">{errors.password}</div>
              )}
            </div>
            <div className="form-group">
              <label
                htmlFor="confirmPassword"
                style={{ color: 'var(--dockshift-text)' }}
              >
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                className={errors.confirmPassword ? 'error' : ''}
                style={{
                  background: 'var(--dockshift-card-bg)',
                  color: 'var(--dockshift-text)',
                  border: '1px solid var(--dockshift-border)',
                }}
              />
              {errors.confirmPassword && (
                <div className="field-error">{errors.confirmPassword}</div>
              )}
            </div>
          </div>
          <div className="terms-agreement">
            <input
              type="checkbox"
              id="acceptTerms"
              name="acceptTerms"
              checked={formData.acceptTerms}
              onChange={handleChange}
              className={errors.acceptTerms ? 'error' : ''}
            />
            <label
              htmlFor="acceptTerms"
              style={{ color: 'var(--dockshift-text)' }}
            >
              I agree to the <Link to="/terms">Terms and Conditions</Link> and{' '}
              <Link to="/privacy">Privacy Policy</Link>
            </label>
          </div>
          {errors.acceptTerms && (
            <div className="field-error">{errors.acceptTerms}</div>
          )}
          <button
            type="submit"
            className={`btn btn-primary auth-btn ${
              isSubmitting ? 'loading' : ''
            }`}
            disabled={isSubmitting}
            style={{ background: 'var(--dockshift-primary)', color: 'white' }}
          >
            {isSubmitting ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        <div className="auth-footer dockshift-theme">
          <p>
            Already have an account? <Link to="/login">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
