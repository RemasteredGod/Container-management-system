import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const Header = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  // Add scroll event listener to apply box shadow when scrolled
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Handle user logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Toggle user dropdown menu
  const toggleUserDropdown = () => {
    setUserDropdownOpen(!userDropdownOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        userDropdownOpen &&
        !event.target.closest('.user-profile-container')
      ) {
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userDropdownOpen]);

  return (
    <header
      className={`main-header sticky-header dockshift-header ${
        scrolled ? 'scrolled' : ''
      }`}
    >
      <div className="header-content">
        <div className="logo-area">
          <Link to="/" className="logo-link">
            <div className="dockshift-header-logo">
              <img src="/images/Component 1.png" alt="DockShift" />
            </div>
          </Link>
          <div className="brand-group">
            <Link to="/" className="logo-text-link">
              <span className="brand-title">DockShift</span>
            </Link>
            <span className="brand-tagline">Management System</span>
          </div>
        </div>

        <div className="header-actions">
          {currentUser ? (
            <>
              {/* Notifications area - only shown when logged in */}
              <div className="notification-container">
                <button
                  className="notification-bell"
                  aria-label="Notifications"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                  </svg>
                  <span className="notification-badge">3</span>
                </button>

                <div className="notification-dropdown">
                  <div className="notification-header">
                    <h3>Notifications</h3>
                    <button className="notification-clear-btn">
                      Clear All
                    </button>
                  </div>
                  <div className="notification-list">
                    <div className="notification-item new">
                      <div className="notification-icon">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect
                            x="3"
                            y="3"
                            width="18"
                            height="18"
                            rx="2"
                            ry="2"
                          ></rect>
                          <line x1="3" y1="9" x2="21" y2="9"></line>
                          <line x1="9" y1="21" x2="9" y2="9"></line>
                        </svg>
                      </div>
                      <div className="notification-content">
                        <p>Container C1042 has arrived at the yard</p>
                        <span className="notification-time">5 mins ago</span>
                      </div>
                    </div>
                    <div className="notification-item new">
                      <div className="notification-icon">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                        </svg>
                      </div>
                      <div className="notification-content">
                        <p>Security alert: Unauthorized access attempt</p>
                        <span className="notification-time">42 mins ago</span>
                      </div>
                    </div>
                    <div className="notification-item">
                      <div className="notification-icon">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9"></path>
                          <path d="M18 9V4a1 1 0 0 0-1-1h-3"></path>
                          <path d="M13 14l-4-4 4-4"></path>
                          <path d="M9 14v-4h4"></path>
                        </svg>
                      </div>
                      <div className="notification-content">
                        <p>Shipment #SH-7832 successfully delivered</p>
                        <span className="notification-time">Yesterday</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* User profile dropdown - only shown when logged in */}
              <div className="user-profile-container">
                <button
                  className="user-profile-button"
                  onClick={toggleUserDropdown}
                  aria-label="User menu"
                  aria-expanded={userDropdownOpen}
                >
                  <div className="user-avatar">
                    {currentUser.firstName
                      ? currentUser.firstName.charAt(0)
                      : 'U'}
                  </div>
                  <span className="user-name">
                    {currentUser.firstName || currentUser.username}
                  </span>
                  <svg
                    className={`dropdown-arrow ${
                      userDropdownOpen ? 'open' : ''
                    }`}
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>

                <div
                  className={`user-dropdown ${userDropdownOpen ? 'open' : ''}`}
                >
                  <div className="user-dropdown-header">
                    <div className="user-avatar large">
                      {currentUser.firstName
                        ? currentUser.firstName.charAt(0)
                        : 'U'}
                    </div>
                    <div className="user-info">
                      <h4>
                        {currentUser.firstName} {currentUser.lastName}
                      </h4>
                      <p>{currentUser.email}</p>
                    </div>
                  </div>

                  <div className="user-dropdown-content">
                    <Link to="/dashboard" className="user-dropdown-item">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="3" y="3" width="7" height="7"></rect>
                        <rect x="14" y="3" width="7" height="7"></rect>
                        <rect x="14" y="14" width="7" height="7"></rect>
                        <rect x="3" y="14" width="7" height="7"></rect>
                      </svg>
                      Management System
                    </Link>
                    <Link to="/profile" className="user-dropdown-item">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      My Profile
                    </Link>
                    <Link to="/major-hubs" className="user-dropdown-item">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="2" y1="12" x2="22" y2="12"></line>
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10a15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                      </svg>
                      Major Hubs
                    </Link>
                    <Link to="/route-visualizer" className="user-dropdown-item">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polygon points="23 7 16 12 23 17 23 7"></polygon>
                        <rect
                          x="1"
                          y="5"
                          width="15"
                          height="14"
                          rx="2"
                          ry="2"
                        ></rect>
                      </svg>
                      Route Visualizer
                    </Link>
                    <div className="dropdown-divider"></div>
                    <button
                      onClick={handleLogout}
                      className="user-dropdown-item"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Login/Register buttons - only shown when logged out */
            <div className="auth-buttons">
              <Link
                to="/login"
                className="btn btn-outline dockshift-btn-outline"
              >
                Log In
              </Link>
              <Link to="/register" className="btn btn-danger">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
