import React, { useState } from 'react';
import { ISensor, updateSensor } from '../../../services/sensorService';
import { X, Save, Settings } from 'lucide-react';
import LoadingSpinner from '../../common/LoadingSpinner';

interface EditSensorModalProps {
  sensor: ISensor;
  onClose: () => void;
  onUpdate: () => void;
}

const EditSensorModal: React.FC<EditSensorModalProps> = ({ sensor, onClose, onUpdate }) => {
  const [editedName, setEditedName] = useState(sensor.deviceName);
  const [editedSettings, setEditedSettings] = useState(sensor.settings);
  const [isActive, setIsActive] = useState(sensor.isActive);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    try {
      // Validation
      if (!editedName.trim()) {
        setError('Device name is required');
        return;
      }

      if (editedSettings.moistureThreshold < 0 || editedSettings.moistureThreshold > 100) {
        setError('Moisture threshold must be between 0 and 100');
        return;
      }

      if (editedSettings.optimalPh.min >= editedSettings.optimalPh.max) {
        setError('pH minimum must be less than maximum');
        return;
      }

      if (editedSettings.optimalTemperature.min >= editedSettings.optimalTemperature.max) {
        setError('Temperature minimum must be less than maximum');
        return;
      }

      setSaving(true);
      setError(null);

      await updateSensor(sensor._id, {
        deviceName: editedName.trim(),
        settings: editedSettings,
        isActive
      });

      onUpdate();
      onClose();
    } catch (err: any) {
      console.error('Error updating sensor:', err);
      setError(err.response?.data?.error || 'Failed to update sensor');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[90] p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-green-50 to-green-100">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center mr-3">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Edit Sensor</h2>
              <p className="text-sm text-gray-600 mt-0.5">Update sensor configuration</p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            disabled={saving}
            className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                Basic Information
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Device Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="e.g., Field A - Sensor 1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Device ID
                  </label>
                  <input
                    type="text"
                    value={sensor.deviceId}
                    disabled
                    className="w-full p-3 border border-gray-200 rounded-lg bg-gray-100 text-gray-500 font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">Device ID cannot be changed</p>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                    Sensor is active
                  </label>
                </div>
              </div>
            </div>

            {/* Threshold Settings */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                Threshold Settings
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Moisture Threshold (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={editedSettings.moistureThreshold}
                    onChange={(e) => setEditedSettings({
                      ...editedSettings,
                      moistureThreshold: parseFloat(e.target.value)
                    })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Alert when moisture drops below this level</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Optimal pH Range
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">Minimum</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="14"
                        value={editedSettings.optimalPh.min}
                        onChange={(e) => setEditedSettings({
                          ...editedSettings,
                          optimalPh: { ...editedSettings.optimalPh, min: parseFloat(e.target.value) }
                        })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">Maximum</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="14"
                        value={editedSettings.optimalPh.max}
                        onChange={(e) => setEditedSettings({
                          ...editedSettings,
                          optimalPh: { ...editedSettings.optimalPh, max: parseFloat(e.target.value) }
                        })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Typical range: 6.0 - 7.5 for most crops</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Optimal Temperature Range (°C)
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">Minimum</label>
                      <input
                        type="number"
                        step="0.1"
                        value={editedSettings.optimalTemperature.min}
                        onChange={(e) => setEditedSettings({
                          ...editedSettings,
                          optimalTemperature: { ...editedSettings.optimalTemperature, min: parseFloat(e.target.value) }
                        })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">Maximum</label>
                      <input
                        type="number"
                        step="0.1"
                        value={editedSettings.optimalTemperature.max}
                        onChange={(e) => setEditedSettings({
                          ...editedSettings,
                          optimalTemperature: { ...editedSettings.optimalTemperature, max: parseFloat(e.target.value) }
                        })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Typical range: 20°C - 30°C for most crops</p>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={handleCancel}
            disabled={saving}
            className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center font-medium"
          >
            {saving ? (
              <>
                <LoadingSpinner size="sm" color="white" className="mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditSensorModal;
