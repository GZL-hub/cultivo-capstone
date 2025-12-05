import React, { useState } from 'react';
import { X } from 'lucide-react';
import { createFarm } from '../../../../services/farmService';
import { toast } from 'react-hot-toast';

interface CreateFarmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFarmCreated: (farmId: string) => void;
  ownerId: string;
}

const CreateFarmModal: React.FC<CreateFarmModalProps> = ({
  isOpen,
  onClose,
  onFarmCreated,
  ownerId
}) => {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    operationDate: '',
    areaSize: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error('Farm name is required');
      return;
    }
    if (!formData.type.trim()) {
      toast.error('Farm type is required');
      return;
    }
    if (!formData.operationDate) {
      toast.error('Operation date is required');
      return;
    }
    if (!formData.areaSize.trim()) {
      toast.error('Area size is required');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create farm without boundary (will be drawn later)
      // Don't send farmBoundary at all to avoid geospatial validation errors
      const newFarm = await createFarm({
        name: formData.name,
        type: formData.type,
        operationDate: formData.operationDate,
        areaSize: formData.areaSize,
        owner: ownerId
      } as any);

      toast.success('Farm created successfully! Now you can draw your farm boundary.');
      onFarmCreated(newFarm._id);
      onClose();

      // Reset form
      setFormData({
        name: '',
        type: '',
        operationDate: '',
        areaSize: ''
      });
    } catch (error: any) {
      console.error('Error creating farm:', error);
      toast.error(error.response?.data?.error || 'Failed to create farm. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[80] p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Create New Farm</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSubmitting}
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Farm Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Farm Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="e.g., Green Valley Farm"
              disabled={isSubmitting}
            />
          </div>

          {/* Farm Type */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              Farm Type <span className="text-red-500">*</span>
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              disabled={isSubmitting}
            >
              <option value="">Select farm type</option>
              <option value="Rice Farm">Rice Farm</option>
              <option value="Vegetable Farm">Vegetable Farm</option>
              <option value="Fruit Orchard">Fruit Orchard</option>
              <option value="Tree Orchard">Tree Orchard</option>
              <option value="Mixed Crop Farm">Mixed Crop Farm</option>
              <option value="Livestock Farm">Livestock Farm</option>
              <option value="Aquaculture">Aquaculture</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Operation Date */}
          <div>
            <label htmlFor="operationDate" className="block text-sm font-medium text-gray-700 mb-1">
              Operation Since <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="operationDate" 
              name="operationDate"
              value={formData.operationDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              disabled={isSubmitting}
            />
          </div>

          {/* Area Size */}
          <div>
            <label htmlFor="areaSize" className="block text-sm font-medium text-gray-700 mb-1">
              Area Size <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="areaSize"
              name="areaSize"
              value={formData.areaSize}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="e.g., 2.5 hectares"
              disabled={isSubmitting}
            />
          </div>

          {/* Info Message */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-sm text-blue-800">
              After creating your farm, you'll be able to draw your farm boundary on the map.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Farm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateFarmModal;
