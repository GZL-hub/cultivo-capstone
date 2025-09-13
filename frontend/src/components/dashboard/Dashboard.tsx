import React from 'react';

const Dashboard = () => {
  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
      <h1 className="text-2xl font-bold text-green-700 mb-4">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="bg-green-50 p-6 rounded-lg border border-green-100">
          <h2 className="text-lg font-semibold text-green-800 mb-3">Farm Status</h2>
          <p className="text-gray-600">All systems operational. Monitoring active.</p>
        </div>
        
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
          <h2 className="text-lg font-semibold text-blue-800 mb-3">Weather Forecast</h2>
          <p className="text-gray-600">Sunny, 24°C. Optimal for harvesting.</p>
        </div>

        <div className="bg-amber-50 p-6 rounded-lg border border-amber-100">
          <h2 className="text-lg font-semibold text-amber-800 mb-3">Crop Health</h2>
          <p className="text-gray-600">92% healthy. 3 areas require attention.</p>
        </div>
        
        <div className="bg-purple-50 p-6 rounded-lg border border-purple-100">
          <h2 className="text-lg font-semibold text-purple-800 mb-3">Resource Usage</h2>
          <p className="text-gray-600">Water usage 12% below average.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;