import React, { useState } from 'react';
import { createSensor } from '../../../services/sensorService';
import { X, Plus, Loader, Cpu, Save } from 'lucide-react';

interface AddSensorModalProps {
  farmId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const AddSensorModal: React.FC<AddSensorModalProps> = ({ farmId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    deviceId: '',
    deviceName: '',
    blynkTemplateId: 'TMPL6cNqtLZQP',
    blynkAuthToken: '',
    moistureThreshold: 30,
    optimalPhMin: 6.0,
    optimalPhMax: 7.5,
    optimalTempMin: 20,
    optimalTempMax: 30
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    // Validation
    if (!formData.deviceId.trim()) {
      setError('Device ID is required');
      return;
    }

    if (!formData.deviceName.trim()) {
      setError('Device name is required');
      return;
    }

    if (!formData.blynkAuthToken.trim()) {
      setError('Blynk Auth Token is required');
      return;
    }

    if (formData.moistureThreshold < 0 || formData.moistureThreshold > 100) {
      setError('Moisture threshold must be between 0 and 100');
      return;
    }

    if (formData.optimalPhMin >= formData.optimalPhMax) {
      setError('pH minimum must be less than maximum');
      return;
    }

    if (formData.optimalTempMin >= formData.optimalTempMax) {
      setError('Temperature minimum must be less than maximum');
      return;
    }

    try {
      setLoading(true);

      await createSensor(farmId, {
        deviceId: formData.deviceId.trim(),
        deviceName: formData.deviceName.trim(),
        farmId: farmId,
        blynkTemplateId: formData.blynkTemplateId,
        blynkAuthToken: formData.blynkAuthToken.trim(),
        isActive: true,
        settings: {
          moistureThreshold: formData.moistureThreshold,
          optimalPh: {
            min: formData.optimalPhMin,
            max: formData.optimalPhMax
          },
          optimalTemperature: {
            min: formData.optimalTempMin,
            max: formData.optimalTempMax
          }
        }
      });

      onSuccess();
    } catch (err: any) {
      console.error('Error creating sensor:', err);
      setError(err.response?.data?.error || 'Failed to create sensor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[80] p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-green-50 to-green-100">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center mr-3">
              <Cpu className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Add New Sensor</h2>
              <p className="text-sm text-gray-600 mt-0.5">Register a new ESP32 soil sensor device</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Device Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                Device Information
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Device ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.deviceId}
                    onChange={(e) => setFormData({ ...formData, deviceId: e.target.value })}
                    placeholder="e.g., ESP32-SM01"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">Unique identifier for this sensor device</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Device Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.deviceName}
                    onChange={(e) => setFormData({ ...formData, deviceName: e.target.value })}
                    placeholder="e.g., Field A - Sensor 1"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Friendly name for easy identification</p>
                </div>
              </div>
            </div>

            {/* Blynk Configuration */}
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                <span className="w-2 h-2 bg-purple-600 rounded-full mr-2"></span>
                Blynk IoT Configuration
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Template ID
                  </label>
                  <input
                    type="text"
                    value={formData.blynkTemplateId}
                    onChange={(e) => setFormData({ ...formData, blynkTemplateId: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 font-mono text-sm bg-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">Default template ID from your Arduino code</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Auth Token <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.blynkAuthToken}
                    onChange={(e) => setFormData({ ...formData, blynkAuthToken: e.target.value })}
                    placeholder="Enter Blynk auth token"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 font-mono text-sm bg-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">Get this from your Blynk device settings</p>
                </div>
              </div>
            </div>

            {/* Sensor Settings */}
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
                    value={formData.moistureThreshold}
                    onChange={(e) => setFormData({ ...formData, moistureThreshold: parseFloat(e.target.value) })}
                    min="0"
                    max="100"
                    step="0.1"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
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
                        value={formData.optimalPhMin}
                        onChange={(e) => setFormData({ ...formData, optimalPhMin: parseFloat(e.target.value) })}
                        min="0"
                        max="14"
                        step="0.1"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">Maximum</label>
                      <input
                        type="number"
                        value={formData.optimalPhMax}
                        onChange={(e) => setFormData({ ...formData, optimalPhMax: parseFloat(e.target.value) })}
                        min="0"
                        max="14"
                        step="0.1"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
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
                        value={formData.optimalTempMin}
                        onChange={(e) => setFormData({ ...formData, optimalTempMin: parseFloat(e.target.value) })}
                        min="-20"
                        max="60"
                        step="0.1"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">Maximum</label>
                      <input
                        type="number"
                        value={formData.optimalTempMax}
                        onChange={(e) => setFormData({ ...formData, optimalTempMax: parseFloat(e.target.value) })}
                        min="-20"
                        max="60"
                        step="0.1"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
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
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center font-medium"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Adding Sensor...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Add Sensor
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddSensorModal;
