import React from 'react';
import { ISensor } from '../../../services/sensorService';
import {
  Droplets,
  Thermometer,
  FlaskConical,
  Activity,
  Loader
} from 'lucide-react';

interface SensorCardProps {
  sensor: ISensor;
  status: 'normal' | 'warning' | 'alert' | 'offline';
  onClick: () => void;
}

const SensorCard: React.FC<SensorCardProps> = ({ sensor, status, onClick }) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'alert':
        return 'border-red-500 bg-red-50';
      case 'warning':
        return 'border-yellow-500 bg-yellow-50';
      case 'offline':
        return 'border-gray-400 bg-gray-50';
      default:
        return 'border-green-500 bg-green-50';
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'alert':
        return <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-700 rounded">Alert</span>;
      case 'warning':
        return <span className="px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-700 rounded">Warning</span>;
      case 'offline':
        return <span className="px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-700 rounded">Offline</span>;
      default:
        return <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded">Normal</span>;
    }
  };

  const formatTimestamp = (timestamp: string | Date) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  // Check if sensor is online (data received within last 5 minutes)
  const isOnline = () => {
    if (!sensor.isActive || !sensor.lastReading?.timestamp) return false;
    const lastUpdate = new Date(sensor.lastReading.timestamp);
    const now = new Date();
    const minutesAgo = (now.getTime() - lastUpdate.getTime()) / 60000;
    return minutesAgo < 5;
  };

  const online = isOnline();

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg shadow hover:shadow-lg transition-all cursor-pointer border-l-4 ${getStatusStyles()} p-4`}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-gray-800 truncate">{sensor.deviceName}</h3>
            {/* Online/Offline Indicator */}
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full ${online ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} title={online ? 'Online' : 'Offline'} />
            </div>
          </div>
          <p className="text-xs text-gray-500 truncate">{sensor.deviceId}</p>
        </div>
        {getStatusBadge()}
      </div>

      {/* Readings */}
      {sensor.lastReading ? (
        <div className="space-y-2">
          {/* Moisture */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Droplets className="w-4 h-4 text-blue-600 mr-2" />
              <span className="text-sm text-gray-600">Moisture</span>
            </div>
            <span className={`text-sm font-semibold ${
              sensor.lastReading.moisture < sensor.settings.moistureThreshold
                ? 'text-red-600'
                : 'text-gray-800'
            }`}>
              {sensor.lastReading.moisture.toFixed(1)}%
            </span>
          </div>

          {/* Temperature */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Thermometer className="w-4 h-4 text-orange-600 mr-2" />
              <span className="text-sm text-gray-600">Temp</span>
            </div>
            <span className="text-sm font-semibold text-gray-800">
              {sensor.lastReading.temperature.toFixed(1)}°C
            </span>
          </div>

          {/* pH Level */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FlaskConical className="w-4 h-4 text-purple-600 mr-2" />
              <span className="text-sm text-gray-600">pH</span>
            </div>
            <span className={`text-sm font-semibold ${
              sensor.lastReading.ph < sensor.settings.optimalPh.min ||
              sensor.lastReading.ph > sensor.settings.optimalPh.max
                ? 'text-yellow-600'
                : 'text-gray-800'
            }`}>
              {sensor.lastReading.ph.toFixed(2)}
            </span>
          </div>

          {/* EC Level */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Activity className="w-4 h-4 text-teal-600 mr-2" />
              <span className="text-sm text-gray-600">EC</span>
            </div>
            <span className="text-sm font-semibold text-gray-800">
              {sensor.lastReading.ec} µS/cm
            </span>
          </div>

          {/* NPK Summary */}
          <div className="pt-2 mt-2 border-t border-gray-200">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">N-P-K</span>
              <span className="font-mono text-gray-800">
                {sensor.lastReading.nitrogen}-
                {sensor.lastReading.phosphorus}-
                {sensor.lastReading.potassium} mg/kg
              </span>
            </div>
          </div>

          {/* Last Update */}
          <div className={`text-xs text-center mt-2 font-medium ${online ? 'text-green-600' : 'text-gray-500'}`}>
            Updated {formatTimestamp(sensor.lastReading.timestamp)}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-6 text-gray-400">
          <Loader className="w-8 h-8 mb-2" />
          <p className="text-sm">No data yet</p>
        </div>
      )}
    </div>
  );
};

export default SensorCard;
