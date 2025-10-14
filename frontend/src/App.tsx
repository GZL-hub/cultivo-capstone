import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useJsApiLoader } from '@react-google-maps/api';
import Login from './components/login/Login';
import Layout from './components/layout/Layout';
import Dashboard from './components/dashboard/Dashboard';
import Analytics from './components/analytics/Analytics';
import FarmAnalytics from './components/analytics/FarmAnalytics';
import WeatherAnalytics from './components/analytics/weather/WeatherAnalytics';
import Alerts from './components/alerts/Alerts';

// Import the device management components
import Device from './components/devices/Devices';
import SensorDevices from './components/devices/sensor/SensorDevices';
import CameraDevices from './components/devices/camera/CameraDevices';
// Import the farm management components
import FarmManagement from './components/farm-management/FarmManagement';
import FarmOverview from './components/farm-management/components/farm-overview/FarmOverview';
import WorkerManagement from './components/farm-management/components/worker/WorkerManagement';
import FarmMap from './components/farm-management/components/farm-map/FarmMap';
import FarmCCTV from './components/farm-management/components/FarmCCTV';
// Settings
import Settings from './components/settings/Settings';
import authService from './services/authService';

// Only import the worker and weather dummy data - not the farm data
import { workers } from './components/farm-management/farmDummyData';

// Define libraries outside the component to prevent re-creation
const libraries: ('places' | 'drawing')[] = ['places', 'drawing'];

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>('');

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "",
    libraries: libraries,
  });

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = () => {
      if (authService.isAuthenticated()) {
        setIsLoggedIn(true);
        // Get the user ID from the auth service
        const userData = authService.getCurrentUser();
        if (userData && userData.id) {
          setUserId(userData.id);
        }
      }
    };
    
    checkAuth();
  }, []);

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.login(email, password);
      
      if (response.success) {
        setIsLoggedIn(true);
        // Set user ID after successful login
        const userData = authService.getCurrentUser();
        if (userData && userData.id) {
          setUserId(userData.id);
        }
      } else {
        setError(response.message || 'Login failed');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (name: string, email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.register({ name, email, password });
      
      if (response.success) {
        setIsLoggedIn(true);
      } else {
        setError(response.message || 'Registration failed');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    setIsLoggedIn(false);
  };

  if (loadError) {
    return <div>Error loading maps. Please check the API key and network connection.</div>;
  }

  return (
    <Router>
      {!isLoggedIn ? (
        <Login 
          onLogin={handleLogin} 
          onRegister={handleRegister}
          loading={loading}
          error={error}
        />
      ) : !isLoaded ? (
        <div>Loading...</div> // Show a loading screen while the map script loads
      ) : (
        <Layout onLogout={handleLogout}>
          <Routes>
            <Route path="/" element={<Dashboard isLoaded={isLoaded} />} />
            
            {/* Analytics Nested Routes */}
            <Route path="/analytics" element={<Analytics />}>
              <Route path="farm" element={<FarmAnalytics />} />
              <Route path="weather" element={<WeatherAnalytics />} />
              <Route index element={<Navigate to="farm" replace />} />
            </Route>
            
            <Route path="/alerts" element={<Alerts />} />
            
            {/* Devices Nested Routes */}
            <Route path="/device-settings" element={<Device />}>
              <Route path="sensors" element={<SensorDevices />} />
              <Route path="cameras" element={<CameraDevices />} />
              <Route index element={<Device />} />
            </Route>
            
            {/* Farm Management Nested Routes */}
            <Route path="/farm" element={<FarmManagement />}>
              <Route
                path="overview"
                element={<FarmOverview workers={workers} ownerId={userId} />}
              />
              <Route
                path="map"
                element={<FarmMap ownerId={userId}/>}
              />
              <Route path="cctv" element={<FarmCCTV />} />
              <Route index element={<Navigate to="overview" replace />} />
              <Route path="/farm/workers" element={<WorkerManagement />} />
            </Route>
            
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      )}
    </Router>
  );
}

export default App;