import React from 'react';

const FarmSettings: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
      <div className="md:col-span-6 bg-white rounded-lg shadow-md p-4">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Farm Configuration</h2>
        <div className="space-y-4">
          <div className="border-b pb-4">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Farm Details</h3>
            <p className="text-sm text-gray-500">Update farm name, type, and location</p>
          </div>
          <div className="border-b pb-4">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Boundary Settings</h3>
            <p className="text-sm text-gray-500">Edit farm boundaries and plot areas</p>
          </div>
        </div>
      </div>
      
      <div className="md:col-span-6 bg-white rounded-lg shadow-md p-4">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Device Management</h2>
        <div className="space-y-4">
          <div className="border-b pb-4">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Sensor Configuration</h3>
            <p className="text-sm text-gray-500">Manage sensors and their update frequency</p>
          </div>
          <div className="border-b pb-4">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Camera Settings</h3>
            <p className="text-sm text-gray-500">Configure CCTV cameras and recording options</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmSettings;