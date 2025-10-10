import React, { useEffect } from 'react';
import { Routes, Route, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';

/**
 * Device management component that serves as a container for device subpages
 * Since we don't want a main device page, this component automatically 
 * redirects to sensors from the root path
 */
const Devices: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isRoot = location.pathname === '/device-settings';
  
  // If we're at the root device path, redirect to sensors
  useEffect(() => {
    if (isRoot) {
      navigate('/device-settings/sensors', { replace: true });
    }
  }, [isRoot, navigate]);

  // Show the outlet for child routes (sensors or cameras)
  return <Outlet />;
};

export default Devices;