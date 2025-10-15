import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Worker } from '../../../../services/workerService';

interface AddWorkerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (worker: Partial<Worker>) => void;
  worker?: Worker; // For editing
}

const AddWorkerModal: React.FC<AddWorkerModalProps> = ({ isOpen, onClose, onSave, worker }) => {
  const [formData, setFormData] = useState<Partial<Worker>>({
    name: '',
    role: '',
    email: '',
    phone: '',
    status: 'active'
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Reset form when modal opens/closes or worker changes
  useEffect(() => {
    if (worker) {
      setFormData({
        name: worker.name,
        role: worker.role,
        email: worker.email || '',
        phone: worker.phone || '',
        status: worker.status || 'active'
      });
    } else {
      setFormData({
        name: '',
        role: '',
        email: '',
        phone: '',
        status: 'active'
      });
    }
    setErrors({});
  }, [isOpen, worker]);
  
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name?.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.role?.trim()) {
      newErrors.role = 'Role is required';
    }
    
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {worker ? 'Edit Worker' : 'Add New Worker'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 ${
                  errors.name ? 'border-red-300' : ''
                }`}
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>
            
            {/* Role */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
              <input
                type="text"
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 ${
                  errors.role ? 'border-red-300' : ''
                }`}
              />
              {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role}</p>}
            </div>
            
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email || ''}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 ${
                  errors.email ? 'border-red-300' : ''
                }`}
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>
            
            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                type="text"
                id="phone"
                name="phone"
                value={formData.phone || ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>
            
            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
            >
              {worker ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddWorkerModal;