import React from 'react';
import { ISensor, getSensorStatus } from '../../../services/sensorService';
import { Pencil, Trash2, TrendingUp } from 'lucide-react';

interface SensorTableProps {
  sensors: ISensor[];
  onEdit?: (sensor: ISensor) => void;
  onDelete?: (sensor: ISensor) => void;
  onViewHistory?: (sensor: ISensor) => void;
}

const SensorTable: React.FC<SensorTableProps> = ({ sensors, onEdit, onDelete, onViewHistory }) => {
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sensor
              </th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Device ID
              </th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Reading
              </th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Moisture
              </th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Temperature
              </th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                pH
              </th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sensors.map((sensor) => (
              <SensorRow
                key={sensor._id}
                sensor={sensor}
                onEdit={onEdit}
                onDelete={onDelete}
                onViewHistory={onViewHistory}
              />
            ))}
          </tbody>
        </table>
      </div>

      {sensors.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No sensors found
        </div>
      )}
    </div>
  );
};

interface SensorRowProps {
  sensor: ISensor;
  onEdit?: (sensor: ISensor) => void;
  onDelete?: (sensor: ISensor) => void;
  onViewHistory?: (sensor: ISensor) => void;
}

const SensorRow: React.FC<SensorRowProps> = ({ sensor, onEdit, onDelete, onViewHistory }) => {
  const status = getSensorStatus(sensor);

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'normal': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'alert': return 'bg-red-100 text-red-800';
      case 'offline': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'normal': return 'Normal';
      case 'warning': return 'Warning';
      case 'alert': return 'Alert';
      case 'offline': return 'Offline';
      default: return 'Unknown';
    }
  };

  const formatTimestamp = (timestamp?: Date | string) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="h-10 w-10 flex-shrink-0 bg-gradient-to-br from-green-400 to-green-600 rounded overflow-hidden">
            <div className="h-10 w-10 flex items-center justify-center text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{sensor.deviceName}</div>
            <div className="text-xs text-gray-500">
              {sensor.isActive ? 'Active' : 'Inactive'}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
        <span className="font-mono text-xs">{sensor.deviceId}</span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-center">
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(status)}`}>
          {getStatusLabel(status)}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
        {formatTimestamp(sensor.lastReading?.timestamp)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
        {sensor.lastReading ? `${sensor.lastReading.moisture.toFixed(1)}%` : '—'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
        {sensor.lastReading ? `${sensor.lastReading.temperature.toFixed(1)}°C` : '—'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
        {sensor.lastReading ? sensor.lastReading.ph.toFixed(2) : '—'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => onViewHistory?.(sensor)}
            className="text-blue-600 hover:text-blue-900 inline-flex items-center"
            title="View History"
          >
            <TrendingUp size={16} className="mr-1" />
            History
          </button>
          <button
            onClick={() => onEdit?.(sensor)}
            className="text-green-600 hover:text-green-900 inline-flex items-center"
          >
            <Pencil size={16} className="mr-1" />
            Edit
          </button>
          <button
            onClick={() => onDelete?.(sensor)}
            className="text-red-600 hover:text-red-900 inline-flex items-center"
          >
            <Trash2 size={16} className="mr-1" />
            Remove
          </button>
        </div>
      </td>
    </tr>
  );
};

export default SensorTable;