import React from 'react';
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
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Choose an Avatar</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 rounded-full p-1 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="grid grid-cols-4 gap-6 mb-6">
          {avatarOptions.map((avatar, index) => (
            <div 
              key={index} 
              className={`relative aspect-square rounded-full overflow-hidden cursor-pointer ${
                selectedAvatar === avatar ? 'ring-4 ring-green-500 ring-offset-2' : 'hover:ring-2 hover:ring-gray-300 hover:ring-offset-1'
              }`}
              onClick={() => onSelectAvatar(avatar)}
            >
              <img 
                src={avatar} 
                alt={`Avatar option ${index + 1}`} 
                className="w-full h-full object-cover"
              />
              {selectedAvatar === avatar && (
                <div className="absolute inset-0 bg-green-500 bg-opacity-20 flex items-center justify-center">
                  <div className="bg-green-500 rounded-full p-1">
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
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-5 py-2 bg-green-600 border border-transparent rounded-full text-sm text-white hover:bg-green-700 transition-colors"
          >
            Select Avatar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvatarModal;