import React, { useState } from 'react';
import { Check, Eye, EyeOff } from 'lucide-react';

interface PasswordChangeFormProps {
  onChangePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
}

const PasswordChangeForm: React.FC<PasswordChangeFormProps> = ({ onChangePassword }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [logoutEverywhere, setLogoutEverywhere] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | ''; message: string }>({ type: '', message: '' });
  const [loading, setLoading] = useState(false);
  
  // Password visibility toggles
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Auto-hide success message after 3 seconds
  React.useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (status.type === 'success') {
      timeoutId = setTimeout(() => {
        setStatus({ type: '', message: '' });
      }, 3000);
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setStatus({ type: 'error', message: 'All fields are required' });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setStatus({ type: 'error', message: 'New passwords do not match' });
      return;
    }
    
    if (newPassword.length < 8) {
      setStatus({ type: 'error', message: 'Password must be at least 8 characters long' });
      return;
    }
    
    setLoading(true);
    try {
      const result = await onChangePassword(currentPassword, newPassword);
      
      if (result.success) {
        setStatus({ type: 'success', message: result.message || 'Password updated successfully!' });
        // Reset form
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setLogoutEverywhere(false);
      } else {
        setStatus({ type: 'error', message: result.message });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'An unexpected error occurred' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">Change Password</h2>
      
      {status.message && (
        <div className={`mb-4 p-3 rounded-md flex items-center ${status.type === 'success' 
          ? 'bg-primary/10 border border-primary-200 text-green-800' 
          : 'bg-red-50 border border-red-200 text-red-800'}`}
        >
          {status.type === 'success' && <Check className="mr-2" size={18} />}
          {status.type === 'error' && <div className="w-5 h-5 mr-2 text-red-600 flex items-center justify-center rounded-full border-2 border-red-600">!</div>}
          <span>{status.message}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label htmlFor="current-password" className="block text-sm font-medium text-gray-700">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                id="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={loading}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary-500 pr-10"
              />
              <button 
                type="button" 
                onClick={() => setShowCurrentPassword(!showCurrentPassword)} 
                className="absolute inset-y-0 right-0 flex items-center pr-3 mt-1"
                tabIndex={-1}
              >
                {showCurrentPassword ? 
                  <EyeOff size={18} className="text-gray-400 hover:text-gray-600" /> : 
                  <Eye size={18} className="text-gray-400 hover:text-gray-600" />
                }
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                id="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary-500 pr-10"
              />
              <button 
                type="button" 
                onClick={() => setShowNewPassword(!showNewPassword)} 
                className="absolute inset-y-0 right-0 flex items-center pr-3 mt-1"
                tabIndex={-1}
              >
                {showNewPassword ? 
                  <EyeOff size={18} className="text-gray-400 hover:text-gray-600" /> : 
                  <Eye size={18} className="text-gray-400 hover:text-gray-600" />
                }
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary-500 pr-10"
              />
              <button 
                type="button" 
                onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                className="absolute inset-y-0 right-0 flex items-center pr-3 mt-1"
                tabIndex={-1}
              >
                {showConfirmPassword ? 
                  <EyeOff size={18} className="text-gray-400 hover:text-gray-600" /> : 
                  <Eye size={18} className="text-gray-400 hover:text-gray-600" />
                }
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 bg-green-600 border border-transparent rounded-md text-sm text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PasswordChangeForm;