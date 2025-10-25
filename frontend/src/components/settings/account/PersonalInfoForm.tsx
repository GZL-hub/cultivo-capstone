import React, { useState, useEffect } from 'react';
import { Edit, Check } from 'lucide-react';

interface PersonalInfoFormProps {
  userData: {
    name: string;
    email: string;
    phone: string;
    role: string;
  };
  onSave: (userData: any) => void;
}

const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({ userData, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...userData });
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Update form data when userData prop changes
    setFormData({ ...userData });
  }, [userData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      await onSave(formData);
      setIsEditing(false);
      setIsSaving(false);
      setShowSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    } catch (error) {
      setIsSaving(false);
      console.error("Error saving profile:", error);
      // You could add error handling here
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({ ...userData });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-700">Personal Information</h2>
        {!isEditing && !showSuccess && (
          <button 
            onClick={() => setIsEditing(true)}
            className="text-sm px-3 py-1.5 bg-primary/10 text-green-600 rounded-md hover:bg-green-100 transition-colors flex items-center"
          >
            <Edit size={16} className="mr-1" />
            Edit
          </button>
        )}
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="mb-4 bg-primary/10 border border-primary-200 text-green-800 rounded-md p-3 flex items-center">
          <Check className="mr-2" size={18} />
          <span>Profile information updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              disabled={!isEditing || isSaving}
              className={`mt-1 block w-full px-3 py-2 border ${isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'} rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary-500`}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              disabled={!isEditing || isSaving}
              className={`mt-1 block w-full px-3 py-2 border ${isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'} rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary-500`}
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              disabled={!isEditing || isSaving}
              className={`mt-1 block w-full px-3 py-2 border ${isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'} rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary-500`}
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
            <input
              type="text"
              id="role"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              disabled={!isEditing || isSaving}
              className={`mt-1 block w-full px-3 py-2 border ${isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'} rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary-500`}
            />
          </div>
        </div>

        {isEditing && (
          <div className="flex justify-end mt-4 space-x-3">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSaving}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-green-600 border border-transparent rounded-md text-sm text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default PersonalInfoForm;