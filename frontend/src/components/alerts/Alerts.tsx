import React from 'react';

const Alerts = () => {
  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
      <h1 className="text-2xl font-bold text-primary-700 mb-4">Alerts</h1>
      <p className="text-gray-600">Manage your farm alerts and notifications.</p>
      
      <div className="mt-6 bg-yellow-50 p-4 rounded-lg border border-yellow-100">
        <h2 className="text-lg font-semibold text-yellow-800">No active alerts</h2>
        <p className="text-gray-600">Your farm systems are operating normally.</p>
      </div>
    </div>
  );
};

export default Alerts;