import React, { useState, useEffect } from 'react';

interface AddCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCamera: (camera: CameraData) => void;
  onEditCamera?: (camera: CameraData) => void;
  editMode?: boolean;
  initialData?: CameraData;
}

export interface CameraData {
  _id?: string;
  name: string;
  type: string;
  streamUrl: string;
  resolution?: string;
  location?: string;
}

const AddCameraModal: React.FC<AddCameraModalProps> = ({
  isOpen,
  onClose,
  onAddCamera,
  onEditCamera,
  editMode = false,
  initialData
}) => {
  const [formData, setFormData] = useState<CameraData>({
    name: '',
    type: 'Security Camera',
    streamUrl: '',
  });

  // Update form data when initialData changes or modal opens
  useEffect(() => {
    if (isOpen && editMode && initialData) {
      setFormData(initialData);
    } else if (isOpen && !editMode) {
      // Reset form for add mode
      setFormData({
        name: '',
        type: 'Security Camera',
        streamUrl: '',
      });
    }
  }, [isOpen, editMode, initialData]);

  const [isValidUrl, setIsValidUrl] = useState(true);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Validate stream URL when that field changes
    if (name === 'streamUrl') {
      try {
        const url = new URL(value);
        setIsValidUrl(url.protocol === 'http:' || url.protocol === 'https:');
      } catch (e) {
        setIsValidUrl(value === '' || value.startsWith('http://') || value.startsWith('https://'));
      }
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Ensure URL is valid before submitting
    if (!isValidUrl) return;

    if (editMode && onEditCamera) {
      onEditCamera(formData);
    } else {
      onAddCamera(formData);
    }

    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {editMode ? 'Edit Camera' : 'Add New Camera'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Camera Name</label>
            <input 
              type="text" 
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Greenhouse Camera 1"
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
              <option value="WebRTC Stream">WebRTC Stream</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Stream URL</label>
            <input
              type="text"
              name="streamUrl"
              value={formData.streamUrl}
              onChange={handleChange}
              placeholder="http://136.110.0.27:8889/livefeed/whep"
              className={`mt-1 block w-full border ${isValidUrl ? 'border-gray-300' : 'border-red-500'} rounded-md shadow-sm p-2`}
              required
            />
            {!isValidUrl && (
              <p className="text-sm text-red-500 mt-1">Please enter a valid HTTP/HTTPS URL</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Example: http://136.110.0.27:8889/livefeed/whep
            </p>
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
              disabled={!isValidUrl}
            >
              {editMode ? 'Save Changes' : 'Add Camera'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCameraModal;