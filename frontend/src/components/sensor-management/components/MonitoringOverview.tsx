import React, { useState, useEffect } from 'react';
import { ISensor } from '../../../services/sensorService';
import {
  Droplets,
  Thermometer,
  FlaskConical,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface MonitoringOverviewProps {
  sensors: ISensor[];
}

const MonitoringOverview: React.FC<MonitoringOverviewProps> = ({ sensors }) => {
  const activeSensors = sensors.filter(s => s.lastReading);

  const calculateAverages = () => {
    if (activeSensors.length === 0) {
      return {
        moisture: 0,
        temperature: 0,
        ph: 0,
        ec: 0
      };
    }

    return {
      moisture: activeSensors.reduce((acc, s) => acc + s.lastReading!.moisture, 0) / activeSensors.length,
      temperature: activeSensors.reduce((acc, s) => acc + s.lastReading!.temperature, 0) / activeSensors.length,
      ph: activeSensors.reduce((acc, s) => acc + s.lastReading!.ph, 0) / activeSensors.length,
      ec: activeSensors.reduce((acc, s) => acc + s.lastReading!.ec, 0) / activeSensors.length
    };
  };

  const getHealthStatus = () => {
    const normal = sensors.filter(s => {
      if (!s.lastReading || !s.isActive) return false;
      const { moisture, ph, temperature } = s.lastReading;
      const { moistureThreshold, optimalPh, optimalTemperature } = s.settings;

      return moisture >= moistureThreshold &&
             ph >= optimalPh.min && ph <= optimalPh.max &&
             temperature >= optimalTemperature.min && temperature <= optimalTemperature.max;
    }).length;

    const warning = sensors.filter(s => {
      if (!s.lastReading || !s.isActive) return false;
      const { moisture, ph, temperature } = s.lastReading;
      const { moistureThreshold, optimalPh, optimalTemperature } = s.settings;

      return (ph < optimalPh.min || ph > optimalPh.max) ||
             (temperature < optimalTemperature.min || temperature > optimalTemperature.max);
    }).length;

    const alert = sensors.filter(s => {
      if (!s.lastReading || !s.isActive) return false;
      const { moisture, ph, temperature } = s.lastReading;
      const { moistureThreshold, optimalPh, optimalTemperature } = s.settings;

      return moisture < moistureThreshold ||
             ph < optimalPh.min - 0.5 || ph > optimalPh.max + 0.5 ||
             temperature < optimalTemperature.min - 5 || temperature > optimalTemperature.max + 5;
    }).length;

    const offline = sensors.filter(s => !s.isActive || !s.lastReading).length;

    return { normal, warning, alert, offline };
  };

  const averages = calculateAverages();
  const health = getHealthStatus();

  const getMoistureStatus = (moisture: number) => {
    if (moisture < 30) return { color: 'text-red-600', icon: TrendingDown, label: 'Low' };
    if (moisture < 50) return { color: 'text-yellow-600', icon: Minus, label: 'Moderate' };
    return { color: 'text-green-600', icon: TrendingUp, label: 'Good' };
  };

  const getPhStatus = (ph: number) => {
    if (ph < 6.0 || ph > 7.5) return { color: 'text-yellow-600', icon: AlertTriangle, label: 'Watch' };
    return { color: 'text-green-600', icon: CheckCircle, label: 'Optimal' };
  };

  const getTempStatus = (temp: number) => {
    if (temp < 20 || temp > 30) return { color: 'text-yellow-600', icon: AlertTriangle, label: 'Suboptimal' };
    return { color: 'text-green-600', icon: CheckCircle, label: 'Optimal' };
  };

  const moistureStatus = getMoistureStatus(averages.moisture);
  const phStatus = getPhStatus(averages.ph);
  const tempStatus = getTempStatus(averages.temperature);

  return (
    <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Farm Monitoring Overview</h2>
          <p className="text-sm text-gray-600 mt-1">Real-time soil condition analysis</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-semibold text-gray-600">Live Data</span>
        </div>
      </div>

      {/* Primary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Moisture */}
        <div className="bg-white/90 backdrop-blur-sm p-5 rounded-lg border-2 border-blue-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <Droplets className="w-6 h-6 text-blue-600 mr-2" />
              <span className="text-sm font-semibold text-gray-700">Average Moisture</span>
            </div>
            <moistureStatus.icon className={`w-5 h-5 ${moistureStatus.color}`} />
          </div>
          <div className="flex items-baseline justify-between">
            <p className="text-3xl font-bold text-blue-700">
              {activeSensors.length > 0 ? averages.moisture.toFixed(1) : '—'}
              <span className="text-lg text-gray-500">%</span>
            </p>
            <span className={`text-sm font-semibold ${moistureStatus.color}`}>
              {moistureStatus.label}
            </span>
          </div>
          <div className="mt-3 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                averages.moisture < 30 ? 'bg-red-500' :
                averages.moisture < 50 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(averages.moisture, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">{activeSensors.length} sensors reporting</p>
        </div>

        {/* Temperature */}
        <div className="bg-white/90 backdrop-blur-sm p-5 rounded-lg border-2 border-orange-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <Thermometer className="w-6 h-6 text-orange-600 mr-2" />
              <span className="text-sm font-semibold text-gray-700">Average Temperature</span>
            </div>
            <tempStatus.icon className={`w-5 h-5 ${tempStatus.color}`} />
          </div>
          <div className="flex items-baseline justify-between">
            <p className="text-3xl font-bold text-orange-700">
              {activeSensors.length > 0 ? averages.temperature.toFixed(1) : '—'}
              <span className="text-lg text-gray-500">°C</span>
            </p>
            <span className={`text-sm font-semibold ${tempStatus.color}`}>
              {tempStatus.label}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-gray-600">
            <span>Range: 20-30°C ideal</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">Soil temperature monitoring</p>
        </div>

        {/* pH Level */}
        <div className="bg-white/90 backdrop-blur-sm p-5 rounded-lg border-2 border-purple-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <FlaskConical className="w-6 h-6 text-purple-600 mr-2" />
              <span className="text-sm font-semibold text-gray-700">Average pH Level</span>
            </div>
            <phStatus.icon className={`w-5 h-5 ${phStatus.color}`} />
          </div>
          <div className="flex items-baseline justify-between">
            <p className="text-3xl font-bold text-purple-700">
              {activeSensors.length > 0 ? averages.ph.toFixed(2) : '—'}
            </p>
            <span className={`text-sm font-semibold ${phStatus.color}`}>
              {phStatus.label}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-gray-600">
            <span>Acidic</span>
            <span className="font-semibold">Neutral</span>
            <span>Alkaline</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">Soil acidity measurement</p>
        </div>
      </div>

      {/* System Health & Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* System Health */}
        <div className="bg-white/90 backdrop-blur-sm p-5 rounded-lg border border-gray-200">
          <div className="flex items-center mb-3">
            <Activity className="w-5 h-5 text-green-600 mr-2" />
            <h3 className="text-sm font-semibold text-gray-700">System Health Status</h3>
          </div>

          <div className="space-y-3">
            {/* Health bars */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                <span className="text-sm text-gray-600">Normal</span>
              </div>
              <span className="text-sm font-bold text-green-600">{health.normal}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2" />
                <span className="text-sm text-gray-600">Warning</span>
              </div>
              <span className="text-sm font-bold text-yellow-600">{health.warning}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
                <span className="text-sm text-gray-600">Alert</span>
              </div>
              <span className="text-sm font-bold text-red-600">{health.alert}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Minus className="w-4 h-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600">Offline</span>
              </div>
              <span className="text-sm font-bold text-gray-400">{health.offline}</span>
            </div>

            {/* Overall status bar */}
            <div className="pt-3 border-t">
              <div className="flex justify-between text-xs text-gray-600 mb-2">
                <span>Overall Health</span>
                <span className="font-semibold">
                  {sensors.length > 0 ? Math.round((health.normal / sensors.length) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500"
                  style={{ width: `${sensors.length > 0 ? (health.normal / sensors.length) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* EC & Additional Info */}
        <div className="bg-white/90 backdrop-blur-sm p-5 rounded-lg border border-gray-200">
          <div className="flex items-center mb-3">
            <Activity className="w-5 h-5 text-teal-600 mr-2" />
            <h3 className="text-sm font-semibold text-gray-700">Additional Metrics</h3>
          </div>

          <div className="space-y-4">
            {/* EC Level */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Electrical Conductivity</span>
                <span className="text-lg font-bold text-teal-700">
                  {activeSensors.length > 0 ? averages.ec.toFixed(0) : '—'} µS/cm
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Indicates nutrient and salt concentration in soil
              </p>
            </div>

            {/* Total Sensors */}
            <div className="pt-3 border-t">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Total Sensors</span>
                <span className="text-lg font-bold text-gray-700">{sensors.length}</span>
              </div>
              <p className="text-xs text-gray-500">
                {activeSensors.length} active, {sensors.length - activeSensors.length} inactive
              </p>
            </div>

            {/* Last Update */}
            <div className="pt-3 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Update</span>
                <span className="text-xs font-semibold text-gray-500">
                  {activeSensors.length > 0 ? 'Real-time' : 'No data'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonitoringOverview;
