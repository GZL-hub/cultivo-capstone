import React, { useState } from 'react';
import { createSensor } from '../../../services/sensorService';
import { X, Plus, Loader } from 'lucide-react';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.deviceId || !formData.deviceName || !formData.blynkAuthToken) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);

      await createSensor(farmId, {
        deviceId: formData.deviceId,
        deviceName: formData.deviceName,
        farmId: farmId,
        blynkTemplateId: formData.blynkTemplateId,
        blynkAuthToken: formData.blynkAuthToken,
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Add New Sensor</h2>
            <p className="text-sm text-gray-600 mt-1">Register a new ESP32 soil sensor device</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Device Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Device Information</h3>

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
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Unique identifier for this sensor</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Device Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.deviceName}
                    onChange={(e) => setFormData({ ...formData, deviceName: e.target.value })}
                    placeholder="e.g., Field A Soil Sensor"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Friendly name for easy identification</p>
                </div>
              </div>
            </div>

            {/* Blynk Configuration */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Blynk IoT Configuration</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Template ID
                  </label>
                  <input
                    type="text"
                    value={formData.blynkTemplateId}
                    onChange={(e) => setFormData({ ...formData, blynkTemplateId: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Default template from your Arduino code</p>
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
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Get this from your Blynk device settings</p>
                </div>
              </div>
            </div>

            {/* Sensor Settings */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Sensor Settings</h3>

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
                    step="1"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Pump activates when moisture falls below this value</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Optimal pH (Min)
                    </label>
                    <input
                      type="number"
                      value={formData.optimalPhMin}
                      onChange={(e) => setFormData({ ...formData, optimalPhMin: parseFloat(e.target.value) })}
                      min="0"
                      max="14"
                      step="0.1"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Optimal pH (Max)
                    </label>
                    <input
                      type="number"
                      value={formData.optimalPhMax}
                      onChange={(e) => setFormData({ ...formData, optimalPhMax: parseFloat(e.target.value) })}
                      min="0"
                      max="14"
                      step="0.1"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Optimal Temp (Min °C)
                    </label>
                    <input
                      type="number"
                      value={formData.optimalTempMin}
                      onChange={(e) => setFormData({ ...formData, optimalTempMin: parseFloat(e.target.value) })}
                      min="-20"
                      max="60"
                      step="1"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Optimal Temp (Max °C)
                    </label>
                    <input
                      type="number"
                      value={formData.optimalTempMax}
                      onChange={(e) => setFormData({ ...formData, optimalTempMax: parseFloat(e.target.value) })}
                      min="-20"
                      max="60"
                      step="1"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="w-5 h-5 mr-2" />
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
