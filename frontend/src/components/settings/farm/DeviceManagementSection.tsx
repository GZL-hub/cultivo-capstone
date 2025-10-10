import React from 'react';
import { Link } from 'react-router-dom';

const DeviceManagementSection: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">Device Management</h2>
      <div className="space-y-4">
        <div className="border-b pb-4">
          <h3 className="text-sm font-medium text-gray-600 mb-1">Sensor Configuration</h3>
          <p className="text-sm text-gray-500">Manage sensors and their update frequency</p>
          <Link 
            to="/device-settings/sensors" 
            className="block mt-2 text-green-600 hover:text-green-800 text-sm"
          >
            Configure Sensors →
          </Link>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-sm font-medium text-gray-600 mb-1">Camera Settings</h3>
          <p className="text-sm text-gray-500">Configure CCTV cameras and recording options</p>
          <Link 
            to="/device-settings/cameras" 
            className="block mt-2 text-green-600 hover:text-green-800 text-sm"
          >
            Configure Cameras →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DeviceManagementSection;