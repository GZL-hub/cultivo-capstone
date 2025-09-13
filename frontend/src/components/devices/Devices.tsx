import React from 'react';

const Devices = () => {
  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
      <h1 className="text-2xl font-bold text-green-700 mb-4">Devices</h1>
      <p className="text-gray-600">Manage your connected IoT devices and sensors.</p>
      
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 border rounded-lg bg-white">
          <h3 className="font-medium text-green-800">Soil Moisture Sensor</h3>
          <p className="text-sm text-gray-500">Status: Online</p>
          <p className="text-sm text-gray-500">Battery: 87%</p>
        </div>
        
        <div className="p-4 border rounded-lg bg-white">
          <h3 className="font-medium text-green-800">Weather Station</h3>
          <p className="text-sm text-gray-500">Status: Online</p>
          <p className="text-sm text-gray-500">Battery: 92%</p>
        </div>
      </div>
    </div>
  );
};

export default Devices;