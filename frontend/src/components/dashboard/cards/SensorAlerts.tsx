import React from 'react';
import { ISensor, getSensorStatus } from '../../../services/sensorService';
import { CCTV } from '../../../services/cctvService';
import { AlertTriangle, AlertCircle, Droplets, FlaskConical, Thermometer, Camera, CheckCircle } from 'lucide-react';

interface SensorAlertsProps {
  sensors: ISensor[];
  cameras: CCTV[];
  onAlertClick?: (type: string) => void;
}

interface Alert {
  id: string;
  deviceName: string;
  type: 'alert' | 'warning' | 'offline';
  message: string;
  icon: any;
  timestamp?: Date;
}

const SensorAlerts: React.FC<SensorAlertsProps> = ({ sensors, cameras, onAlertClick }) => {
  // Generate alerts from sensor data
  const generateAlerts = (): Alert[] => {
    const alerts: Alert[] = [];

    // Check sensors
    sensors.forEach(sensor => {
      const status = getSensorStatus(sensor);

      if (status === 'offline') {
        alerts.push({
          id: `sensor-${sensor._id}`,
          deviceName: sensor.deviceName,
          type: 'offline',
          message: 'No data received (offline)',
          icon: AlertCircle,
          timestamp: sensor.lastReading?.timestamp ? new Date(sensor.lastReading.timestamp) : undefined
        });
      } else if (sensor.lastReading) {
        const { moisture, ph, temperature } = sensor.lastReading;
        const { moistureThreshold, optimalPh, optimalTemperature } = sensor.settings;

        // Critical moisture
        if (moisture < moistureThreshold) {
          alerts.push({
            id: `sensor-${sensor._id}-moisture`,
            deviceName: sensor.deviceName,
            type: 'alert',
            message: `Low soil moisture: ${moisture.toFixed(0)}% (min: ${moistureThreshold}%)`,
            icon: Droplets,
            timestamp: new Date(sensor.lastReading.timestamp)
          });
        }

        // Critical pH
        if (ph < optimalPh.min - 0.5 || ph > optimalPh.max + 0.5) {
          alerts.push({
            id: `sensor-${sensor._id}-ph`,
            deviceName: sensor.deviceName,
            type: 'alert',
            message: `pH out of range: ${ph.toFixed(1)} (optimal: ${optimalPh.min}-${optimalPh.max})`,
            icon: FlaskConical,
            timestamp: new Date(sensor.lastReading.timestamp)
          });
        }

        // Critical temperature
        if (temperature < optimalTemperature.min - 5 || temperature > optimalTemperature.max + 5) {
          alerts.push({
            id: `sensor-${sensor._id}-temp`,
            deviceName: sensor.deviceName,
            type: 'alert',
            message: `Temperature critical: ${temperature.toFixed(1)}°C (optimal: ${optimalTemperature.min}-${optimalTemperature.max}°C)`,
            icon: Thermometer,
            timestamp: new Date(sensor.lastReading.timestamp)
          });
        }

        // Warning pH
        if ((ph < optimalPh.min || ph > optimalPh.max) && !(ph < optimalPh.min - 0.5 || ph > optimalPh.max + 0.5)) {
          alerts.push({
            id: `sensor-${sensor._id}-ph-warn`,
            deviceName: sensor.deviceName,
            type: 'warning',
            message: `pH suboptimal: ${ph.toFixed(1)} (optimal: ${optimalPh.min}-${optimalPh.max})`,
            icon: FlaskConical,
            timestamp: new Date(sensor.lastReading.timestamp)
          });
        }

        // Warning temperature
        if ((temperature < optimalTemperature.min || temperature > optimalTemperature.max) &&
            !(temperature < optimalTemperature.min - 5 || temperature > optimalTemperature.max + 5)) {
          alerts.push({
            id: `sensor-${sensor._id}-temp-warn`,
            deviceName: sensor.deviceName,
            type: 'warning',
            message: `Temperature suboptimal: ${temperature.toFixed(1)}°C (optimal: ${optimalTemperature.min}-${optimalTemperature.max}°C)`,
            icon: Thermometer,
            timestamp: new Date(sensor.lastReading.timestamp)
          });
        }
      }
    });

    // Check cameras
    cameras.forEach(camera => {
      if (camera.status === 'offline') {
        alerts.push({
          id: `camera-${camera._id}`,
          deviceName: camera.name,
          type: 'offline',
          message: 'Camera offline - stream unavailable',
          icon: Camera
        });
      }
    });

    // Sort by priority: alert > warning > offline, then by timestamp
    return alerts.sort((a, b) => {
      const priority = { alert: 0, warning: 1, offline: 2 };
      if (priority[a.type] !== priority[b.type]) {
        return priority[a.type] - priority[b.type];
      }
      // Sort by timestamp if available
      if (a.timestamp && b.timestamp) {
        return b.timestamp.getTime() - a.timestamp.getTime();
      }
      return 0;
    });
  };

  const alerts = generateAlerts();

  const getAlertStyle = (type: 'alert' | 'warning' | 'offline') => {
    switch (type) {
      case 'alert':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          iconColor: 'text-red-600',
          textColor: 'text-red-800'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          iconColor: 'text-yellow-600',
          textColor: 'text-yellow-800'
        };
      case 'offline':
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          iconColor: 'text-gray-500',
          textColor: 'text-gray-700'
        };
    }
  };

  const formatTimestamp = (timestamp?: Date) => {
    if (!timestamp) return '';
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <AlertTriangle className="w-5 h-5 text-orange-600 mr-2" />
          <h3 className="text-base font-semibold text-gray-800">Alerts & Notifications</h3>
        </div>
        <div className="flex items-center space-x-1">
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
            alerts.filter(a => a.type === 'alert').length > 0
              ? 'bg-red-100 text-red-700'
              : 'bg-green-100 text-green-700'
          }`}>
            {alerts.filter(a => a.type === 'alert').length} Critical
          </span>
          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
            {alerts.filter(a => a.type === 'warning').length} Warning
          </span>
        </div>
      </div>

      {/* Alerts List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {alerts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-500 mb-2" />
            <p className="text-sm font-semibold text-gray-700">All Systems Normal</p>
            <p className="text-xs text-gray-500 mt-1">No alerts or warnings detected</p>
          </div>
        ) : (
          alerts.map(alert => {
            const style = getAlertStyle(alert.type);
            const Icon = alert.icon;

            return (
              <div
                key={alert.id}
                className={`${style.bg} ${style.border} border-l-4 rounded-md p-3 cursor-pointer hover:shadow-md transition-shadow`}
                onClick={() => onAlertClick?.(alert.type)}
              >
                <div className="flex items-start">
                  <Icon className={`w-4 h-4 ${style.iconColor} mr-2 mt-0.5 flex-shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold ${style.textColor} truncate`}>
                      {alert.deviceName}
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {alert.message}
                    </p>
                    {alert.timestamp && (
                      <p className="text-xs text-gray-400 mt-1">
                        {formatTimestamp(alert.timestamp)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Summary Footer */}
      {alerts.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            {alerts.length} total {alerts.length === 1 ? 'alert' : 'alerts'} •
            Last updated: {new Date().toLocaleTimeString()}
          </p>
        </div>
      )}
    </div>
  );
};

export default SensorAlerts;
