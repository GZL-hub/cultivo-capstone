import React from 'react';
import { Bell, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { AlertStats } from '../../../services/alertService';

interface AlertsStatsProps {
  stats: AlertStats;
}

const AlertsStats: React.FC<AlertsStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-600 font-medium">Total Alerts</p>
            <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
          </div>
          <Bell className="w-8 h-8 text-blue-500 opacity-50" />
        </div>
      </div>
      <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border border-red-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-red-600 font-medium">Critical</p>
            <p className="text-2xl font-bold text-red-900">{stats.bySeverity.critical || 0}</p>
          </div>
          <AlertTriangle className="w-8 h-8 text-red-500 opacity-50" />
        </div>
      </div>
      <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-yellow-600 font-medium">Warnings</p>
            <p className="text-2xl font-bold text-yellow-900">{stats.bySeverity.warning || 0}</p>
          </div>
          <AlertCircle className="w-8 h-8 text-yellow-500 opacity-50" />
        </div>
      </div>
      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-green-600 font-medium">Unread</p>
            <p className="text-2xl font-bold text-green-900">{stats.unread}</p>
          </div>
          <Info className="w-8 h-8 text-green-500 opacity-50" />
        </div>
      </div>
    </div>
  );
};

export default AlertsStats;