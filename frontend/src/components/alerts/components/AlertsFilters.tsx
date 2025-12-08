import React from 'react';
import { AlertSeverity, AlertType } from '../../../services/alertService';

interface AlertsFiltersProps {
  filter: {
    severity?: AlertSeverity;
    type?: AlertType;
    isResolved?: boolean;
  };
  onFilterChange: (filter: any) => void;
  onClearFilters: () => void;
}

const AlertsFilters: React.FC<AlertsFiltersProps> = ({
  filter,
  onFilterChange,
  onClearFilters
}) => {
  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
          <select
            value={filter.severity || ''}
            onChange={(e) => onFilterChange({ ...filter, severity: e.target.value as AlertSeverity || undefined })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">All Severities</option>
            <option value={AlertSeverity.CRITICAL}>Critical</option>
            <option value={AlertSeverity.WARNING}>Warning</option>
            <option value={AlertSeverity.INFO}>Info</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
          <select
            value={filter.type || ''}
            onChange={(e) => onFilterChange({ ...filter, type: e.target.value as AlertType || undefined })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">All Types</option>
            <option value={AlertType.SENSOR}>Sensor</option>
            <option value={AlertType.CAMERA}>Camera</option>
            <option value={AlertType.WORKER}>Worker</option>
            <option value={AlertType.SYSTEM}>System</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select
            value={filter.isResolved === undefined ? '' : String(filter.isResolved)}
            onChange={(e) => onFilterChange({ ...filter, isResolved: e.target.value === '' ? undefined : e.target.value === 'true' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">All Statuses</option>
            <option value="false">Active</option>
            <option value="true">Resolved</option>
          </select>
        </div>
      </div>
      <button
        onClick={onClearFilters}
        className="mt-4 text-sm text-primary-600 hover:text-primary-700 font-medium"
      >
        Clear Filters
      </button>
    </div>
  );
};

export default AlertsFilters;