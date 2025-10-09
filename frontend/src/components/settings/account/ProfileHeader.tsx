import React from 'react';
import { Mail, Phone, Clock, Edit, Check } from 'lucide-react';

interface ProfileHeaderProps {
  userData: {
    name: string;
    email: string;
    phone: string;
    role: string;
    avatarUrl: string;
  };
  onAvatarClick: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ userData, onAvatarClick }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col md:flex-row items-center md:items-start">
        {/* Avatar */}
        <div className="mb-4 md:mb-0 md:mr-6 flex flex-col items-center">
          <div className="relative">
            <img 
              src={userData.avatarUrl} 
              alt="Profile" 
              className="w-24 h-24 rounded-full object-cover border-2 border-green-500"
            />
            <button 
              className="absolute bottom-0 right-0 bg-green-500 text-white rounded-full p-1.5 shadow-md hover:bg-green-600 transition-colors"
              aria-label="Change avatar"
              onClick={onAvatarClick}
            >
              <Edit size={16} />
            </button>
          </div>
          <button 
            onClick={onAvatarClick}
            className="mt-2 text-xs text-green-600 hover:text-green-800 transition-colors"
          >
            Change avatar
          </button>
        </div>

        {/* User Info */}
        <div className="flex-grow text-center md:text-left">
          {/* Name with verification badge */}
          <div className="flex items-center justify-center md:justify-start">
            <h2 className="text-xl font-bold text-gray-800">{userData.name}</h2>
            <span className="ml-2 inline-flex items-center text-green-500">
              <Check size={20} />
            </span>
          </div>

          {/* Contact details with icons */}
          <div className="mt-2 space-y-1.5">
            <div className="flex items-center justify-center md:justify-start text-gray-600">
              <Mail size={16} className="mr-2 text-gray-400" />
              <span className="text-sm">{userData.email}</span>
            </div>
            
            <div className="flex items-center justify-center md:justify-start text-gray-600">
              <Phone size={16} className="mr-2 text-gray-400" />
              <span className="text-sm">{userData.phone}</span>
            </div>
          </div>

          {/* Role badge and membership info */}
          <div className="mt-3 flex flex-wrap items-center justify-center md:justify-start gap-2">
            <div className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-100">
              {userData.role}
            </div>
            
            <div className="text-xs text-gray-500 flex items-center">
              <Clock size={14} className="mr-1 text-gray-400" />
              Member since {new Date().getFullYear()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;