import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { updateFarm, IFarm } from '../../../services/farmService';

interface FarmConfigSectionProps {
  farmData: IFarm;
  onFarmUpdate: (updatedFarm: IFarm) => void;
}

const FarmConfigSection: React.FC<FarmConfigSectionProps> = ({ farmData, onFarmUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: farmData.name,
    type: farmData.type,
    operationDate: farmData.operationDate,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      setError(null);
      // Use the updateFarm service function
      const updatedData = await updateFarm(farmData._id, formData);
      onFarmUpdate(updatedData);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to format dates
  const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    try {
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(new Date(dateString));
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-700">Farm Configuration</h2>
        {!isEditing ? (
          <button
            className="px-3 py-1 bg-accent text-white rounded hover:bg-green-600 text-sm"
            onClick={() => setIsEditing(true)}
          >
            Edit Details
          </button>
        ) : (
          <button
            className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
            onClick={() => {
              setIsEditing(false);
              // Reset form data to original values
              setFormData({
                name: farmData.name,
                type: farmData.type,
                operationDate: farmData.operationDate,
              });
            }}
          >
            Cancel
          </button>
        )}
      </div>

      {error && (
        <div className="text-red-500 text-sm mb-4 p-2 bg-red-50 rounded">{error}</div>
      )}

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Farm Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:ring-primary focus:border-primary-500"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="type" className="block text-sm font-medium text-gray-700">
              Farm Type
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:ring-primary focus:border-primary-500"
              required
            >
              <option value="">Select farm type</option>
              <option value="Tree Orchard">Tree Orchard</option>
              <option value="Vegetable Farm">Vegetable Farm</option>
              <option value="Mixed Crop">Mixed Crop</option>
              <option value="Livestock">Livestock</option>
              <option value="Aquaculture">Aquaculture</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="operationDate" className="block text-sm font-medium text-gray-700">
              Operation Date
            </label>
            <input
              type="text"
              id="operationDate"
              name="operationDate"
              placeholder="e.g., March 15, 2022"
              value={formData.operationDate}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:ring-primary focus:border-primary-500"
            />
          </div>
          
          <div className="pt-4">
            <button
              type="submit"
              className="px-4 py-2 bg-accent text-white rounded hover:bg-green-600"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="border-b pb-4">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Farm Details</h3>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="text-xs text-gray-500">Name:</div>
              <div className="text-sm">{farmData.name}</div>
              
              <div className="text-xs text-gray-500">Type:</div>
              <div className="text-sm">{farmData.type}</div>
              
              <div className="text-xs text-gray-500">Operation Since:</div>
              <div className="text-sm">{farmData.operationDate}</div>
              
              <div className="text-xs text-gray-500">Last Updated:</div>
              <div className="text-sm">
                {farmData.updatedAt ? formatDate(farmData.updatedAt) : 'N/A'}
              </div>
            </div>
          </div>
          
          <div className="border-b pb-4">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Boundary Settings</h3>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="text-xs text-gray-500">Area Size:</div>
              <div className="text-sm">{farmData.areaSize}</div>
            </div>
            <Link 
              to="/farm/map" 
              className="block mt-2 text-green-600 hover:text-green-800 text-sm"
            >
              Edit farm boundaries in Map Editor →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmConfigSection;