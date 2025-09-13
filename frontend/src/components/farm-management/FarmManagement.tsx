import React from 'react';

const FarmManagement = () => {
  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
      <h1 className="text-2xl font-bold text-green-700 mb-4">Farm Management</h1>
      <p className="text-gray-600">Manage your farm operations and resources.</p>
      
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 border rounded-lg bg-green-50">
          <h3 className="font-medium text-green-800">Crops</h3>
          <p className="text-sm text-gray-500">Manage your crop planning and rotation</p>
        </div>
        
        <div className="p-4 border rounded-lg bg-blue-50">
          <h3 className="font-medium text-blue-800">Irrigation</h3>
          <p className="text-sm text-gray-500">Control water resources and schedules</p>
        </div>
        
        <div className="p-4 border rounded-lg bg-amber-50">
          <h3 className="font-medium text-amber-800">Inventory</h3>
          <p className="text-sm text-gray-500">Track supplies and equipment</p>
        </div>
      </div>
    </div>
  );
};

export default FarmManagement;