import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './styles/App.css';
import './styles/ModularDashboard.css';

// Import components
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import UnifiedDashboard from './components/UnifiedDashboard';
import Profile from './components/Profile';
import MajorHubs from './components/MajorHubs';
import RouteVisualizer from './components/RouteVisualizer';
import RouteOptimizationPage from './components/RouteOptimizationPage';
// Keeping imports but components will be hidden from navigation
import Inventories from './components/Inventories';
import Containers from './components/Containers';
import DashboardContainers from './components/DashboardContainers';
import NetworkDashboard from './components/NetworkDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';

// Import authentication context
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes - Unified Dashboard as main dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div className="app-container dockshift-theme">
                  <Header />
                  <div className="main-content-container">
                    <UnifiedDashboard />
                  </div>
                </div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <div className="app-container dockshift-theme">
                  <Header />
                  <div className="main-content-container">
                    <Profile />
                  </div>
                </div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/major-hubs"
            element={
              <ProtectedRoute>
                <div className="app-container dockshift-theme">
                  <Header />
                  <div className="main-content-container">
                    <MajorHubs />
                  </div>
                </div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/route-visualizer"
            element={
              <ProtectedRoute>
                <div className="app-container dockshift-theme">
                  <Header />
                  <div className="main-content-container">
                    <RouteVisualizer />
                  </div>
                </div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/route-optimization"
            element={
              <ProtectedRoute>
                <div className="app-container dockshift-theme">
                  <Header />
                  <div className="main-content-container">
                    <RouteOptimizationPage />
                  </div>
                </div>
              </ProtectedRoute>
            }
          />

          {/* Commented out the Inventory route to hide it from navigation
          <Route
            path="/inventory"
            element={
              <ProtectedRoute>
                <div className="app-container dockshift-theme">
                  <Header />
                  <div className="main-content-container">
                    <Inventories />
                  </div>
                </div>
              </ProtectedRoute>
            }
          />
          */}

          {/* Commented out the Containers route to hide it from navigation
          <Route
            path="/containers"
            element={
              <ProtectedRoute>
                <div className="app-container dockshift-theme">
                  <Header />
                  <div className="main-content-container">
                    <Containers />
                  </div>
                </div>
              </ProtectedRoute>
            }
          />
          */}

          {/* Commented out the DashboardContainers route to hide it from navigation  
          <Route
            path="/dashboard-containers"
            element={
              <ProtectedRoute>
                <div className="app-container dockshift-theme">
                  <Header />
                  <div className="main-content-container">
                    <DashboardContainers />
                  </div>
                </div>
              </ProtectedRoute>
            }
          />
          */}

          {/* Commented out the Network Dashboard route to hide it from navigation
          <Route
            path="/network"
            element={
              <ProtectedRoute>
                <div className="app-container dockshift-theme">
                  <Header />
                  <div className="main-content-container">
                    <NetworkDashboard />
                  </div>
                </div>
              </ProtectedRoute>
            }
          />
          */}

          {/* Fallback route - redirect to home */}
          <Route path="*" element={<Home />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
