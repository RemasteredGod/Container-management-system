import React, { createContext, useState, useEffect, useContext } from 'react';

// Create the authentication context
export const AuthContext = createContext();

// Custom hook for using the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// API URL
const API_URL = 'http://localhost:5000/api';

// Authentication provider component
export const AuthProvider = ({ children }) => {
  // State for the authenticated user
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for stored user on component mount
  useEffect(() => {
    const checkUser = async () => {
      const storedUser = localStorage.getItem('currentUser');

      if (storedUser) {
        try {
          // Validate with the backend
          const response = await fetch(`${API_URL}/user`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          });

          if (response.ok) {
            // User is still authenticated
            const userData = await response.json();
            setCurrentUser(userData);
          } else {
            // Session expired or invalid, remove from storage
            localStorage.removeItem('currentUser');
          }
        } catch (error) {
          console.error('Failed to validate stored user:', error);
          localStorage.removeItem('currentUser');
        }
      }

      setLoading(false);
    };

    checkUser();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();

      if (data.success && data.user) {
        setCurrentUser(data.user);
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        return data.user;
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const data = await response.json();

      if (data.success) {
        return data;
      } else {
        throw new Error(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await fetch(`${API_URL}/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      // Clear current user state
      setCurrentUser(null);
      // Remove from localStorage
      localStorage.removeItem('currentUser');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear the user from local state even if the API call fails
      setCurrentUser(null);
      localStorage.removeItem('currentUser');
    }
  };

  // Context value
  const value = {
    currentUser,
    login,
    register,
    logout,
    isAuthenticated: !!currentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
