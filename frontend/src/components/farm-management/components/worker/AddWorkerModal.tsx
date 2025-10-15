import React, { useState, useEffect } from 'react';
import { X, User, Briefcase, Mail, Phone, Check, AlertCircle } from 'lucide-react';
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
    joinDate: new Date().toISOString().split('T')[0],
    status: 'active'
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Reset form when modal opens/closes or worker changes
  useEffect(() => {
    if (worker) {
      setFormData({
        name: worker.name,
        role: worker.role,
        email: worker.email || '',
        phone: worker.phone || '',
        joinDate: worker.joinDate || new Date().toISOString().split('T')[0],
        status: worker.status || 'active'
      });
    } else {
      setFormData({
        name: '',
        role: '',
        email: '',
        phone: '',
        joinDate: new Date().toISOString().split('T')[0],
        status: 'active'
      });
    }
    setErrors({});
    setIsSubmitting(false);
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
    
    if (formData.phone && !/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number format';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        await onSave(formData);
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is changed
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all">
        {/* Header */}
        <div className="bg-green-50 px-6 py-4 rounded-t-xl border-b border-green-100">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-green-800">
              {worker ? 'Edit Worker Details' : 'Add New Worker'}
            </h3>
            <button 
              onClick={onClose} 
              className="text-green-600 hover:text-green-800 bg-green-100 hover:bg-green-200 rounded-full p-2 transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
          <p className="text-green-600 text-sm mt-1">
            {worker ? 'Update information for this worker' : 'Enter details to add a new farm worker'}
          </p>
        </div>
        
        {/* Form */}
        <div className="px-6 py-5">
          <form onSubmit={handleSubmit}>
            <div className="space-y-5">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Enter worker's full name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`pl-10 block w-full rounded-lg border ${
                      errors.name ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' : 
                      'border-gray-300 focus:ring-green-500 focus:border-green-500'
                    } shadow-sm py-2.5 px-4`}
                  />
                  {errors.name && (
                    <div className="flex items-center mt-1 text-sm text-red-600">
                      <AlertCircle size={16} className="mr-1" />
                      {errors.name}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Role */}
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                    <Briefcase size={18} />
                  </div>
                  <input
                    type="text"
                    id="role"
                    name="role"
                    placeholder="e.g. Farm Manager, Field Worker, Technician"
                    value={formData.role}
                    onChange={handleChange}
                    className={`pl-10 block w-full rounded-lg border ${
                      errors.role ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' : 
                      'border-gray-300 focus:ring-green-500 focus:border-green-500'
                    } shadow-sm py-2.5 px-4`}
                  />
                  {errors.role && (
                    <div className="flex items-center mt-1 text-sm text-red-600">
                      <AlertCircle size={16} className="mr-1" />
                      {errors.role}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Contact Details Section */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Contact Information</h4>
                
                {/* Email */}
                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                      <Mail size={18} />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="worker@example.com"
                      value={formData.email || ''}
                      onChange={handleChange}
                      className={`pl-10 block w-full rounded-lg border ${
                        errors.email ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' : 
                        'border-gray-300 focus:ring-green-500 focus:border-green-500'
                      } shadow-sm py-2.5 px-4`}
                    />
                    {errors.email && (
                      <div className="flex items-center mt-1 text-sm text-red-600">
                        <AlertCircle size={16} className="mr-1" />
                        {errors.email}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                      <Phone size={18} />
                    </div>
                    <input
                      type="text"
                      id="phone"
                      name="phone"
                      placeholder="+601 2345 6789"
                      value={formData.phone || ''}
                      onChange={handleChange}
                      className={`pl-10 block w-full rounded-lg border ${
                        errors.phone ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' : 
                        'border-gray-300 focus:ring-green-500 focus:border-green-500'
                      } shadow-sm py-2.5 px-4`}
                    />
                    {errors.phone && (
                      <div className="flex items-center mt-1 text-sm text-red-600">
                        <AlertCircle size={16} className="mr-1" />
                        {errors.phone}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Additional Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Join Date */}
                <div>
                  <label htmlFor="joinDate" className="block text-sm font-medium text-gray-700 mb-1">Join Date</label>
                  <input
                    type="date"
                    id="joinDate"
                    name="joinDate"
                    value={formData.joinDate || ''}
                    onChange={handleChange}
                    className="block w-full rounded-lg border border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500 py-2.5 px-4"
                  />
                </div>
                
                {/* Status */}
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <div className="relative">
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="block w-full rounded-lg border border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500 py-2.5 px-4 appearance-none pr-10"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Status badges */}
            <div className="mt-5 flex items-center gap-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                formData.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {formData.status === 'active' ? (
                  <Check size={12} className="mr-1" />
                ) : (
                  <X size={12} className="mr-1" />
                )}
                {formData.status === 'active' ? 'Active' : 'Inactive'}
              </span>
              
              {formData.joinDate && (
                <span className="text-xs text-gray-500">
                  Joined: {new Date(formData.joinDate).toLocaleDateString()}
                </span>
              )}
            </div>
            
            {/* Required fields note */}
            <div className="mt-2 text-xs text-gray-500">
              * Required fields
            </div>
            
            {/* Action buttons */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-4 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${
                  isSubmitting 
                    ? 'bg-green-400 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
                } flex items-center`}
              >
                {isSubmitting && (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {worker ? (isSubmitting ? 'Updating...' : 'Update Worker') : (isSubmitting ? 'Adding...' : 'Add Worker')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddWorkerModal;