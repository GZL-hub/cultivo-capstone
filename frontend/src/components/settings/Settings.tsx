import React from 'react';

const Settings = () => {
  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
      <h1 className="text-2xl font-bold text-green-700 mb-4">Settings</h1>
      <p className="text-gray-600">Configure your account and application preferences.</p>
      
      <div className="mt-6 space-y-4">
        <div className="p-4 border rounded-lg">
          <h3 className="font-medium text-gray-800">Account Settings</h3>
          <p className="text-sm text-gray-500">Manage your profile and authentication details</p>
        </div>
        
        <div className="p-4 border rounded-lg">
          <h3 className="font-medium text-gray-800">Notification Preferences</h3>
          <p className="text-sm text-gray-500">Control how and when you receive alerts</p>
        </div>
        
        <div className="p-4 border rounded-lg">
          <h3 className="font-medium text-gray-800">System Settings</h3>
          <p className="text-sm text-gray-500">Configure application behavior and appearance</p>
        </div>
      </div>
    </div>
  );
};

export default Settings;