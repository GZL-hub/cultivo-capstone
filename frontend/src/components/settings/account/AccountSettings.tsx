import React, { useState, useEffect } from 'react';
import ProfileHeader from './ProfileHeader';
import PersonalInfoForm from './PersonalInfoForm';
import PasswordChangeForm from './PasswordChangeForm';
import AvatarModal from './AvatarModal';
import { getUserById, updateUserProfile, updateUserAvatar, changePassword, IUser } from '../../../services/userService';
import authService from '../../../services/authService';

// Predefined avatar options
const avatarOptions = [
  'https://images.unsplash.com/photo-1758551051834-61f10a361b73?w=150',
  'https://images.unsplash.com/photo-1751517298236-b9150faa3dfd?w=150',
  'https://images.unsplash.com/photo-1758811572950-5a1d284986a5?w=150',
  'https://images.unsplash.com/photo-1745670993824-0570f723778c?w=150',
  'https://images.unsplash.com/photo-1759503408358-b9083a7c27f0?w=150',
  'https://images.unsplash.com/photo-1759697421584-c7a0c6558beb?w=150',
  'https://images.unsplash.com/photo-1759508949812-973dcd259b6e?w=150',
  'https://images.unsplash.com/photo-1759400333614-6d27a2666266?w=150',
];

const AccountSettings: React.FC = () => {
  // Get current user from localStorage
  const currentUser = authService.getCurrentUser();
  const userId = currentUser?.id || "";
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<IUser | null>(null);

  // State for avatar selection modal
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string>('');

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const data = await getUserById(userId);
        setUserData(data);
        setSelectedAvatar(data.avatarUrl);
      } catch (error: any) {
        setError(error.response?.data?.error || 'Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  // Avatar selection handlers
  const handleOpenAvatarModal = () => {
    setShowAvatarModal(true);
  };

  const handleSaveAvatar = async () => {
    if (!userData) return;

    try {
      await updateUserAvatar(userId, selectedAvatar);
      setUserData({
        ...userData,
        avatarUrl: selectedAvatar
      });

      // Update localStorage
      authService.updateCurrentUser({ avatarUrl: selectedAvatar });

      // Dispatch custom event to notify Header of avatar change
      window.dispatchEvent(
        new CustomEvent('avatarUpdated', {
          detail: { avatarUrl: selectedAvatar }
        })
      );

      setShowAvatarModal(false);
    } catch (error: any) {
      console.error('Failed to update avatar:', error);
      // You could add error handling/notification here
    }
  };

  // Handle profile update
  const handleUpdateProfile = async (updatedData: Partial<IUser>) => {
    if (!userData) return;

    try {
      const updatedUser = await updateUserProfile(userId, updatedData);
      setUserData(updatedUser);

      // Update localStorage
      authService.updateCurrentUser({
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role
      });

      // Dispatch custom event to notify Header of profile changes
      window.dispatchEvent(
        new CustomEvent('avatarUpdated', {
          detail: {
            name: updatedUser.name,
            email: updatedUser.email
          }
        })
      );
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      // You could add error handling/notification here
    }
  };

  // Handle password change
  const handlePasswordChange = async (currentPassword: string, newPassword: string) => {
    try {
      await changePassword(userId, { currentPassword, newPassword });
      return { success: true, message: 'Password updated successfully' };
    } catch (error: any) {
      return { 
        success: false, 
        message: error.response?.data?.error || 'Failed to update password' 
      };
    }
  };

  if (loading) return <div className="text-center p-6">Loading user data...</div>;
  
  if (error) return <div className="text-center p-6 text-red-600">Error: {error}</div>;
  
  if (!userData) return <div className="text-center p-6">No user data found</div>;

  return (
    <div className="space-y-6">
      {/* User Profile Header */}
      <ProfileHeader 
        userData={{
          name: userData.name,
          email: userData.email,
          phone: userData.phone || '',
          role: userData.role || 'User',
          avatarUrl: userData.avatarUrl
        }}
        onAvatarClick={handleOpenAvatarModal}
      />

      {/* Personal Information Form */}
      <PersonalInfoForm 
        userData={{
          name: userData.name,
          email: userData.email,
          phone: userData.phone || '',
          role: userData.role || 'User'
        }}
        onSave={handleUpdateProfile}
      />

      {/* Change Password */}
      <PasswordChangeForm onChangePassword={handlePasswordChange} />

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