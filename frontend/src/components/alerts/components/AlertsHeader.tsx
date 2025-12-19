import React from 'react';
import { Bell, Filter, Plus } from 'lucide-react';

interface AlertsHeaderProps {
  farmName: string;
  alertCount: number;
  showFilters: boolean;
  onToggleFilters: () => void;
  onCreateAlert: () => void;
}

const AlertsHeader: React.FC<AlertsHeaderProps> = ({
  farmName,
  alertCount,
  showFilters,
  onToggleFilters,
  onCreateAlert
}) => {
  return (
    <div className="bg-white shadow-sm border-b border-gray-200 z-10">
      <div className="w-full px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Bell className="w-8 h-8 text-primary-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                Alerts & Notifications ({alertCount})
              </h1>
              <p className="text-sm text-gray-500">
                {farmName ? `Monitor and manage alerts for ${farmName}` : 'Monitor and manage farm alerts'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onCreateAlert}
              className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Alert
            </button>
            <button
              onClick={onToggleFilters}
              className={`flex items-center px-4 py-2 rounded-lg border transition-colors ${
                showFilters
                  ? 'bg-primary-50 border-primary-300 text-primary-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertsHeader;