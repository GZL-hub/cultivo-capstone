import React, { useState } from 'react';

interface AddSensorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddSensorModal: React.FC<AddSensorModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'Soil Moisture',
    location: '',
    updateFrequency: '15 minutes'
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would handle form submission here
    console.log('Form submitted:', formData);
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Sensor</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Sensor Name</label>
            <input 
              type="text" 
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" 
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <select 
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            >
              <option value="Soil Moisture">Soil Moisture</option>
              <option value="Weather">Weather</option>
              <option value="pH Level">pH Level</option>
              <option value="Light Intensity">Light Intensity</option>
              <option value="Water Flow">Water Flow</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <input 
              type="text" 
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" 
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Update Frequency</label>
            <select 
              name="updateFrequency"
              value={formData.updateFrequency}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            >
              <option value="5 minutes">Every 5 minutes</option>
              <option value="10 minutes">Every 10 minutes</option>
              <option value="15 minutes">Every 15 minutes</option>
              <option value="30 minutes">Every 30 minutes</option>
              <option value="1 hour">Every hour</option>
            </select>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button 
              type="button"
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-primary/90"
            >
              Add Sensor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSensorModal;