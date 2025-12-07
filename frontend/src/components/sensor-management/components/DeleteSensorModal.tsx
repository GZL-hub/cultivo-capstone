import React, { useState } from 'react';
import { ISensor } from '../../../services/sensorService';
import { AlertTriangle, X, Loader } from 'lucide-react';

interface DeleteSensorModalProps {
  sensor: ISensor;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

const DeleteSensorModal: React.FC<DeleteSensorModalProps> = ({ sensor, onClose, onConfirm }) => {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    try {
      setDeleting(true);
      setError(null);
      await onConfirm();
      onClose();
    } catch (err: any) {
      console.error('Error deleting sensor:', err);
      setError(err.response?.data?.error || 'Failed to delete sensor');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[90] p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mr-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Sensor</h3>
              <p className="text-sm text-gray-500 mt-1">This action cannot be undone</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={deleting}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 mb-4">
            Are you sure you want to delete{' '}
            <span className="font-semibold text-gray-900">"{sensor.deviceName}"</span>?
          </p>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-semibold mb-1">Warning:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>All historical sensor readings will be permanently deleted</li>
                  <li>This sensor will stop collecting data immediately</li>
                  <li>This action cannot be reversed</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-gray-600">Device ID:</div>
              <div className="font-mono text-gray-900">{sensor.deviceId}</div>

              <div className="text-gray-600">Status:</div>
              <div className="text-gray-900">
                {sensor.isActive ? (
                  <span className="text-green-600">Active</span>
                ) : (
                  <span className="text-gray-500">Inactive</span>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            disabled={deleting}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={deleting}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {deleting ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete Sensor'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteSensorModal;
