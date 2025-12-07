import React, { useState } from 'react';
import { ISensor } from '../../../services/sensorService';
import { updateSensor } from '../../../services/sensorService';
import SensorHistoryChart from './SensorHistoryChart';
import {
  X,
  TrendingUp,
  Save,
  Edit,
  Settings
} from 'lucide-react';

interface SensorDetailModalProps {
  sensor: ISensor;
  onClose: () => void;
  onUpdate: () => void;
}

type TabType = 'history' | 'settings';

const SensorDetailModal: React.FC<SensorDetailModalProps> = ({ sensor, onClose, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<TabType>('history');
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[80] p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b">
          <div className="flex-1">
            {isEditing ? (
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="text-2xl font-bold text-gray-800 border-b-2 border-green-500 focus:outline-none w-full"
              />
            ) : (
              <h2 className="text-2xl font-bold text-gray-800">{sensor.deviceName}</h2>
            )}
            <p className="text-sm text-gray-500 mt-1">{sensor.deviceId}</p>
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
                  className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Edit className="w-5 h-5" />
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
            onClick={() => setActiveTab('history')}
            className={`flex-1 px-4 py-3 font-semibold transition ${
              activeTab === 'history'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <TrendingUp className="w-4 h-4 inline mr-2" />
            History
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 px-4 py-3 font-semibold transition ${
              activeTab === 'settings'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Settings className="w-4 h-4 inline mr-2" />
            Settings
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'history' && (
            <SensorHistoryChart sensorId={sensor._id} />
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
                  className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Edit Settings
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SensorDetailModal;
