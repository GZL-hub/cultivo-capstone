import React, { useState } from 'react';
import ProfileHeader from './ProfileHeader';
import PersonalInfoForm from './PersonalInfoForm';
import PasswordChangeForm from './PasswordChangeForm';
import AvatarModal from './AvatarModal';

// Predefined avatar options
const avatarOptions = [
  'https://images.unsplash.com/photo-1520262494112-9fe481d36ec3?w=150',
  'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150',
  'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  'https://images.unsplash.com/photo-1507101105822-7472b28e22ac?w=150',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
];

const AccountSettings: React.FC = () => {
  // Mock user data - would come from your auth context or API in real implementation
  const [userData, setUserData] = useState({
    name: 'Alex Johnson',
    email: 'alex@cultivofarming.com',
    phone: '555-123-4567',
    role: 'Farm Manager',
    avatarUrl: avatarOptions[0]
  });

  // State for avatar selection modal
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(userData.avatarUrl);

  // Avatar selection handlers
  const handleOpenAvatarModal = () => {
    setSelectedAvatar(userData.avatarUrl);
    setShowAvatarModal(true);
  };

  const handleSaveAvatar = () => {
    setUserData(prev => ({ ...prev, avatarUrl: selectedAvatar }));
    setShowAvatarModal(false);
  };

  // Handle profile update
  const handleUpdateProfile = (updatedData: typeof userData) => {
    setUserData(updatedData);
  };

  return (
    <div className="space-y-6">
      {/* User Profile Header */}
      <ProfileHeader 
        userData={userData}
        onAvatarClick={handleOpenAvatarModal}
      />

      {/* Personal Information Form */}
      <PersonalInfoForm 
        userData={userData} 
        onSave={handleUpdateProfile}
      />

      {/* Change Password */}
      <PasswordChangeForm />

      {/* Avatar Selection Modal */}
      {showAvatarModal && (
        <AvatarModal
          avatarOptions={avatarOptions}
          selectedAvatar={selectedAvatar}
          onSelectAvatar={setSelectedAvatar}
          onSave={handleSaveAvatar}
          onClose={() => setShowAvatarModal(false)}
        />
      )}
    </div>
  );
};

export default AccountSettings;