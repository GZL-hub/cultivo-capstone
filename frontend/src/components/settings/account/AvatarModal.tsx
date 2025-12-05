import React, { useState } from 'react';
import { Check, X } from 'lucide-react';

interface AvatarModalProps {
  avatarOptions: string[];
  selectedAvatar: string;
  onSelectAvatar: (avatar: string) => void;
  onSave: () => void;
  onClose: () => void;
}

const AvatarModal: React.FC<AvatarModalProps> = ({
  avatarOptions,
  selectedAvatar,
  onSelectAvatar,
  onSave,
  onClose
}) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = () => {
    // Show loading state first
    setIsLoading(true);
    
    // Simulate a delay for the loading state to be visible
    setTimeout(() => {
      // Call the actual save function
      onSave();
      
      // Hide loading state and show success message
      setIsLoading(false);
      setShowSuccess(true);
      
      // Hide success message and close modal after longer delay
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 3500); // Extended to 3.5 seconds
    }, 1500); // Show loading state for 1.5 seconds
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-[80] flex items-center justify-center" style={{ margin: 0, padding: 0 }}>
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Choose an Avatar</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 rounded-full p-1 hover:bg-gray-100"
            disabled={isLoading || showSuccess}
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Success notification */}
        {showSuccess && (
          <div className="bg-primary/10 border border-primary-200 text-green-800 rounded-md p-3 mb-4 flex items-center">
            <Check className="mr-2" size={18} />
            <span>Avatar successfully updated!</span>
          </div>
        )}
        
        <div className="grid grid-cols-4 gap-6 mb-6">
          {avatarOptions.map((avatar, index) => (
            <div 
              key={index} 
              className={`relative aspect-square rounded-full overflow-hidden cursor-pointer ${
                selectedAvatar === avatar ? 'ring-4 ring-primary ring-offset-2' : 'hover:ring-2 hover:ring-gray-300 hover:ring-offset-1'
              }`}
              onClick={() => !isLoading && !showSuccess && onSelectAvatar(avatar)}
            >
              <img 
                src={avatar} 
                alt={`Avatar option ${index + 1}`} 
                className="w-full h-full object-cover"
              />
              {selectedAvatar === avatar && (
                <div className="absolute inset-0 bg-accent bg-opacity-20 flex items-center justify-center">
                  <div className="bg-accent rounded-full p-1">
                    <Check className="text-white" size={16} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="flex justify-end space-x-3 mt-8">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-full text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            disabled={isLoading || showSuccess}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className={`px-5 py-2 border border-transparent rounded-full text-sm text-white transition-colors ${
              isLoading 
                ? 'bg-blue-500 cursor-wait' 
                : showSuccess 
                  ? 'bg-accent cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-primary/90'
            }`}
            disabled={isLoading || showSuccess}
          >
            {isLoading ? 'Saving...' : showSuccess ? 'Saved!' : 'Select Avatar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvatarModal;