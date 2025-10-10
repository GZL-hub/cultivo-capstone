import React, { useState } from 'react';
import AccountSettings from './account/AccountSettings';
import FarmSettings from './farm/FarmSettings';
import NotificationSettings from './NotificationSettings';

// Define the available tabs
type SettingsTab = 'account' | 'farm' | 'notifications';

const Settings: React.FC = () => {
  // State to track active tab
  const [activeTab, setActiveTab] = useState<SettingsTab>('account');

  // Function to handle tab changes
  const handleTabChange = (tab: SettingsTab) => {
    setActiveTab(tab);
  };

  // Render the correct settings component based on active tab
  const renderActiveSettings = () => {
    switch (activeTab) {
      case 'account':
        return <AccountSettings />;
      case 'farm':
        return <FarmSettings />;
      case 'notifications':
        return <NotificationSettings />;
      default:
        return <AccountSettings />;
    }
  };

  return (
    <div className="w-full h-full flex flex-col px-4 py-4 mb-4">      
      {/* Tabs Header */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px space-x-8">
            <button
              onClick={() => handleTabChange('account')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ease-out ${
                activeTab === 'account'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              aria-current={activeTab === 'account' ? 'page' : undefined}
            >
              Account Settings
            </button>
            
            <button
              onClick={() => handleTabChange('farm')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ease-out ${
                activeTab === 'farm'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              aria-current={activeTab === 'farm' ? 'page' : undefined}
            >
              Farm Settings
            </button>
            
            <button
              onClick={() => handleTabChange('notifications')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ease-out ${
                activeTab === 'notifications'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              aria-current={activeTab === 'notifications' ? 'page' : undefined}
            >
              Notification Preferences
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content with Dashboard-like layout and bottom margin */}
      <div className="flex-grow pb-8">
        {renderActiveSettings()}
      </div>
    </div>
  );
};

export default Settings;