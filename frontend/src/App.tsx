import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/login/Login';
import Layout from './components/layout/Layout';
import Dashboard from './components/dashboard/Dashboard';
import Analytics from './components/analytics/Analytics';
import Alerts from './components/alerts/Alerts';
import Devices from './components/devices/Devices';
import FarmManagement from './components/farm-management/FarmManagement';
import FarmOverview from './components/farm-management/components/FarmOverview';
import FarmMap from './components/farm-management/components/FarmMap';
import FarmCCTV from './components/farm-management/components/FarmCCTV';
import Settings from './components/settings/Settings';

// Dummy Data
import { farm, weather, workers } from './components/farm-management/farmDummyData';
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsLoggedIn(true);
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <Router>
      {!isLoggedIn ? (
        <Login onLogin={handleLogin} loading={loading} />
      ) : (
        <Layout onLogout={handleLogout}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/devices" element={<Devices />} />
            {/* Farm Management Nested Routes */}
            <Route path="/farm" element={<FarmManagement />}>
              <Route
                path="overview"
                element={<FarmOverview farm={farm} workers={workers} weather={weather} />}
              />
              <Route
                path="map"
                element={<FarmMap coordinates={farm.coordinates} />}
              />
              <Route path="cctv" element={<FarmCCTV />} />
              <Route index element={<Navigate to="overview" replace />} />
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