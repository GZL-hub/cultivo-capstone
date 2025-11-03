import React, { useState, useEffect } from 'react';
import { Menu, Bell, User, Search, PanelLeft, LogOut } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import authService from '../../services/authService';
import { getUserById } from '../../services/userService';

interface HeaderProps {
  onMenuClick: () => void;
  onToggleCollapse: () => void;
  collapsed: boolean;
  onLogout: () => void;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

const routeTitles: { [key: string]: string } = {
  '/': 'Dashboard',
  '/analytics': 'Analytics',
  '/analytics/farm': 'Farm Analytics',
  '/analytics/weather': 'Weather Analytics',
  '/alerts': 'Alerts',
  '/device-settings': 'Device Management',
  '/device-settings/sensors': 'Sensor Management',
  '/device-settings/cameras': 'Camera Management',
  '/farm': 'Farm Management',
  '/farm/overview': 'Farm Overview',
  '/farm/map': 'Farm Map',
  '/farm/cctv': 'Farm CCTV',
  '/farm/workers' : "Worker Management",
  '/settings': 'Settings'
};

const Header: React.FC<HeaderProps> = ({
  onMenuClick,
  onToggleCollapse,
  collapsed,
  onLogout,
}) => {
  const location = useLocation();
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        try {
          // Fetch full user profile including avatarUrl
          const fullUserData = await getUserById(currentUser.id);
          const userData = {
            id: fullUserData._id,
            name: fullUserData.name,
            email: fullUserData.email,
            avatarUrl: fullUserData.avatarUrl
          };
          setUser(userData);
          // Update localStorage with avatarUrl
          authService.updateCurrentUser({ avatarUrl: fullUserData.avatarUrl });
        } catch (error) {
          console.error('Failed to fetch user data:', error);
          // Fallback to localStorage data
          setUser(currentUser);
        }
      }
    };

    fetchUserData();

    // Listen for avatar and profile update events
    const handleAvatarUpdate = (event: CustomEvent) => {
      const { avatarUrl, name, email } = event.detail;
      setUser(prev => {
        if (!prev) return null;
        return {
          ...prev,
          ...(avatarUrl && { avatarUrl }),
          ...(name && { name }),
          ...(email && { email })
        };
      });
    };

    window.addEventListener('avatarUpdated' as any, handleAvatarUpdate as any);

    return () => {
      window.removeEventListener('avatarUpdated' as any, handleAvatarUpdate as any);
    };
  }, []);

  // Get user initials from name
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Find the best matching title for the current path
  const title =
    routeTitles[location.pathname] ||
    Object.entries(routeTitles).find(([path]) =>
      location.pathname.startsWith(path)
    )?.[1] ||
    'Dashboard';

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center">
        {/* Mobile menu button */}
        <button
          className="text-gray-500 mr-4 md:hidden"
          onClick={onMenuClick}
        >
          <Menu size={24} />
        </button>

        {/* Collapse toggle button - hidden on mobile */}
        <button
          className="hidden md:flex text-gray-700 hover:text-primary hover:bg-primary/10 p-2 rounded-md items-center justify-center mr-2 transition-colors"
          onClick={onToggleCollapse}
        >
          <PanelLeft size={20} />
        </button>

        {/* Dynamic Title */}
        <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
      </div>

      <div className="flex items-center space-x-4">
        {/* Search bar */}
        <div className="relative hidden md:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search..."
            className="py-2 pl-10 pr-4 w-64 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Notifications */}
        <button className="text-gray-500 hover:text-gray-700 transition-colors">
          <Bell size={20} />
        </button>

        {/* Account Information */}
        <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
          {/* User Info - Hidden on mobile */}
          {user && (
            <div className="hidden lg:flex flex-col items-end">
              <span className="text-sm font-medium text-gray-800 leading-tight">
                {user.name}
              </span>
              <span className="text-xs text-gray-500 leading-tight">
                {user.email}
              </span>
            </div>
          )}

          {/* Avatar */}
          <div className="relative group">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="h-9 w-9 rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-medium text-sm shadow-sm">
                {user ? getInitials(user.name) : <User size={18} />}
              </div>
            )}
          </div>

          {/* Logout Button */}
          <button
            className="text-gray-400 hover:text-red-500 transition-colors"
            title="Log out"
            onClick={onLogout}
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;