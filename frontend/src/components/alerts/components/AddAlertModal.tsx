import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { AlertType, AlertSeverity } from '../../../services/alertService';

interface AddAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (alertData: {
    type: AlertType;
    severity: AlertSeverity;
    title: string;
    message: string;
    sourceId?: string;
    sourceName?: string;
  }) => Promise<void>;
}

const AddAlertModal: React.FC<AddAlertModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    type: AlertType.SENSOR,
    severity: AlertSeverity.INFO,
    title: '',
    message: '',
    sourceName: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    if (!formData.message.trim()) {
      setError('Message is required');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        type: formData.type,
        severity: formData.severity,
        title: formData.title.trim(),
        message: formData.message.trim(),
        sourceName: formData.sourceName.trim() || undefined
      });

      // Reset form and close modal
      setFormData({
        type: AlertType.SENSOR,
        severity: AlertSeverity.INFO,
        title: '',
        message: '',
        sourceName: ''
      });
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create alert');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Create New Alert</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Alert Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alert Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as AlertType })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            >
              <option value={AlertType.SENSOR}>Sensor</option>
              <option value={AlertType.CAMERA}>Camera</option>
              <option value={AlertType.SYSTEM}>System</option>
              <option value={AlertType.WORKER}>Worker</option>
            </select>
          </div>

          {/* Severity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Severity <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.severity}
              onChange={(e) => setFormData({ ...formData, severity: e.target.value as AlertSeverity })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            >
              <option value={AlertSeverity.INFO}>Info</option>
              <option value={AlertSeverity.WARNING}>Warning</option>
              <option value={AlertSeverity.CRITICAL}>Critical</option>
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Brief description of the alert"
              required
              maxLength={100}
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Detailed description of the alert"
              rows={4}
              required
              maxLength={500}
            />
          </div>

          {/* Source Name (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Source Name (Optional)
            </label>
            <input
              type="text"
              value={formData.sourceName}
              onChange={(e) => setFormData({ ...formData, sourceName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="e.g., Sensor A, Camera 1, etc."
              maxLength={50}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Alert'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAlertModal;
