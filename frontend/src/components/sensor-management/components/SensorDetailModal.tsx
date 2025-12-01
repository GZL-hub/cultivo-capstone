import React, { useState, useEffect } from 'react';
import { ISensor } from '../../../services/sensorService';
import { getSensorReadings, getSensorStats, updateSensor, deleteSensor } from '../../../services/sensorService';
import NPKChart from './NPKChart';
import SensorHistoryChart from './SensorHistoryChart';
import {
  X,
  Droplets,
  Thermometer,
  FlaskConical,
  Activity,
  Trash2,
  Settings,
  TrendingUp,
  Save,
  Edit
} from 'lucide-react';

interface SensorDetailModalProps {
  sensor: ISensor;
  onClose: () => void;
  onUpdate: () => void;
}

type TabType = 'current' | 'history' | 'npk' | 'settings';

const SensorDetailModal: React.FC<SensorDetailModalProps> = ({ sensor, onClose, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<TabType>('current');
  const [isEditing, setIsEditing] = useState(false);
  const [editedSettings, setEditedSettings] = useState(sensor.settings);
  const [editedName, setEditedName] = useState(sensor.deviceName);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateSensor(sensor._id, {
        deviceName: editedName,
        settings: editedSettings
      });
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating sensor:', error);
      alert('Failed to update sensor');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${sensor.deviceName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteSensor(sensor._id);
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error deleting sensor:', error);
      alert('Failed to delete sensor');
    }
  };

  const getStatusColor = () => {
    if (!sensor.lastReading) return 'text-gray-500';

    const { moisture, ph, temperature } = sensor.lastReading;
    const { moistureThreshold, optimalPh, optimalTemperature } = sensor.settings;

    if (moisture < moistureThreshold) return 'text-red-600';
    if (ph < optimalPh.min - 0.5 || ph > optimalPh.max + 0.5) return 'text-red-600';
    if (temperature < optimalTemperature.min - 5 || temperature > optimalTemperature.max + 5) return 'text-red-600';
    if (ph < optimalPh.min || ph > optimalPh.max) return 'text-yellow-600';
    if (temperature < optimalTemperature.min || temperature > optimalTemperature.max) return 'text-yellow-600';

    return 'text-green-600';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b">
          <div className="flex-1">
            {isEditing ? (
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="text-2xl font-bold text-gray-800 border-b-2 border-blue-500 focus:outline-none w-full"
              />
            ) : (
              <h2 className="text-2xl font-bold text-gray-800">{sensor.deviceName}</h2>
            )}
            <p className="text-sm text-gray-500 mt-1">{sensor.deviceId}</p>
            {sensor.lastReading && (
              <p className={`text-sm font-semibold mt-1 ${getStatusColor()}`}>
                Status: {getStatusColor() === 'text-green-600' ? 'Normal' :
                         getStatusColor() === 'text-yellow-600' ? 'Warning' : 'Alert'}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                >
                  <Save className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditedSettings(sensor.settings);
                    setEditedName(sensor.deviceName);
                  }}
                  className="p-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('current')}
            className={`flex-1 px-4 py-3 font-semibold transition ${
              activeTab === 'current'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Activity className="w-4 h-4 inline mr-2" />
            Current Data
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 px-4 py-3 font-semibold transition ${
              activeTab === 'history'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <TrendingUp className="w-4 h-4 inline mr-2" />
            History
          </button>
          <button
            onClick={() => setActiveTab('npk')}
            className={`flex-1 px-4 py-3 font-semibold transition ${
              activeTab === 'npk'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <FlaskConical className="w-4 h-4 inline mr-2" />
            NPK Levels
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 px-4 py-3 font-semibold transition ${
              activeTab === 'settings'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Settings className="w-4 h-4 inline mr-2" />
            Settings
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'current' && sensor.lastReading && (
            <div className="space-y-6">
              {/* Current Readings Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Moisture */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <Droplets className="w-8 h-8 text-blue-600 mb-2" />
                  <p className="text-sm text-gray-600">Moisture</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {sensor.lastReading.moisture.toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Threshold: {sensor.settings.moistureThreshold}%
                  </p>
                </div>

                {/* Temperature */}
                <div className="bg-orange-50 p-4 rounded-lg">
                  <Thermometer className="w-8 h-8 text-orange-600 mb-2" />
                  <p className="text-sm text-gray-600">Temperature</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {sensor.lastReading.temperature.toFixed(1)}°C
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Optimal: {sensor.settings.optimalTemperature.min}-{sensor.settings.optimalTemperature.max}°C
                  </p>
                </div>

                {/* pH */}
                <div className="bg-purple-50 p-4 rounded-lg">
                  <FlaskConical className="w-8 h-8 text-purple-600 mb-2" />
                  <p className="text-sm text-gray-600">pH Level</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {sensor.lastReading.ph.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Optimal: {sensor.settings.optimalPh.min}-{sensor.settings.optimalPh.max}
                  </p>
                </div>

                {/* EC */}
                <div className="bg-teal-50 p-4 rounded-lg">
                  <Activity className="w-8 h-8 text-teal-600 mb-2" />
                  <p className="text-sm text-gray-600">EC</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {sensor.lastReading.ec}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">µS/cm</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <SensorHistoryChart sensorId={sensor._id} />
          )}

          {activeTab === 'npk' && sensor.lastReading && (
            <NPKChart sensor={sensor} />
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Moisture Threshold (%)
                </label>
                <input
                  type="number"
                  value={editedSettings.moistureThreshold}
                  onChange={(e) => setEditedSettings({
                    ...editedSettings,
                    moistureThreshold: parseFloat(e.target.value)
                  })}
                  disabled={!isEditing}
                  className="w-full p-2 border rounded-lg disabled:bg-gray-100"
                />
                <p className="text-xs text-gray-500 mt-1">Alert threshold for low moisture conditions</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Optimal pH Range
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-600">Min</label>
                    <input
                      type="number"
                      step="0.1"
                      value={editedSettings.optimalPh.min}
                      onChange={(e) => setEditedSettings({
                        ...editedSettings,
                        optimalPh: { ...editedSettings.optimalPh, min: parseFloat(e.target.value) }
                      })}
                      disabled={!isEditing}
                      className="w-full p-2 border rounded-lg disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">Max</label>
                    <input
                      type="number"
                      step="0.1"
                      value={editedSettings.optimalPh.max}
                      onChange={(e) => setEditedSettings({
                        ...editedSettings,
                        optimalPh: { ...editedSettings.optimalPh, max: parseFloat(e.target.value) }
                      })}
                      disabled={!isEditing}
                      className="w-full p-2 border rounded-lg disabled:bg-gray-100"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Optimal Temperature Range (°C)
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-600">Min</label>
                    <input
                      type="number"
                      value={editedSettings.optimalTemperature.min}
                      onChange={(e) => setEditedSettings({
                        ...editedSettings,
                        optimalTemperature: { ...editedSettings.optimalTemperature, min: parseFloat(e.target.value) }
                      })}
                      disabled={!isEditing}
                      className="w-full p-2 border rounded-lg disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">Max</label>
                    <input
                      type="number"
                      value={editedSettings.optimalTemperature.max}
                      onChange={(e) => setEditedSettings({
                        ...editedSettings,
                        optimalTemperature: { ...editedSettings.optimalTemperature, max: parseFloat(e.target.value) }
                      })}
                      disabled={!isEditing}
                      className="w-full p-2 border rounded-lg disabled:bg-gray-100"
                    />
                  </div>
                </div>
              </div>

              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Edit Settings
                </button>
              )}
            </div>
          )}

          {activeTab === 'current' && !sensor.lastReading && (
            <div className="text-center text-gray-500 py-12">
              <Activity className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p>No sensor data available yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SensorDetailModal;
