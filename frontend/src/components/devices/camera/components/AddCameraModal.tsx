import React, { useState } from 'react';

interface AddCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddCameraModal: React.FC<AddCameraModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'Security Camera',
    resolution: '1080p',
    location: '',
    storage: 'Local (128GB)'
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
        <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Camera</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Camera Name</label>
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
              <option value="Security Camera">Security Camera</option>
              <option value="Monitoring Camera">Monitoring Camera</option>
              <option value="Time-Lapse Camera">Time-Lapse Camera</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Resolution</label>
            <select 
              name="resolution"
              value={formData.resolution}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            >
              <option value="720p">720p</option>
              <option value="1080p">1080p</option>
              <option value="4K">4K</option>
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
            <label className="block text-sm font-medium text-gray-700">Storage</label>
            <select 
              name="storage"
              value={formData.storage}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            >
              <option value="Local (128GB)">Local (128GB)</option>
              <option value="Local (500GB)">Local (500GB)</option>
              <option value="Cloud (14 days retention)">Cloud (14 days retention)</option>
              <option value="Cloud (30 days retention)">Cloud (30 days retention)</option>
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
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Add Camera
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCameraModal;