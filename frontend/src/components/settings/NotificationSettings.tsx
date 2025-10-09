import React from 'react';

const NotificationSettings: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
      <div className="md:col-span-6 bg-white rounded-lg shadow-md p-4">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Alert Settings</h2>
        <div className="space-y-4">
          <div className="border-b pb-4">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Alert Preferences</h3>
            <p className="text-sm text-gray-500">Choose which events trigger notifications</p>
          </div>
          <div className="border-b pb-4">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Delivery Methods</h3>
            <p className="text-sm text-gray-500">Set up email, SMS or push notifications</p>
          </div>
        </div>
      </div>
      
      <div className="md:col-span-6 bg-white rounded-lg shadow-md p-4">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Schedule Settings</h2>
        <div className="space-y-4">
          <div className="border-b pb-4">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Quiet Hours</h3>
            <p className="text-sm text-gray-500">Set times when notifications are silenced</p>
          </div>
          <div className="border-b pb-4">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Report Scheduling</h3>
            <p className="text-sm text-gray-500">Configure automated report delivery</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;