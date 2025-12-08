import React, { useState, useEffect } from 'react';
import { Bell, User, LogOut, ChevronRight } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import authService from '../../services/authService';
import { getUserById } from '../../services/userService';
import { getAlertStats, AlertStats } from '../../services/alertService';
import { getFarms } from '../../services/farmService';

interface HeaderProps {
  onLogout: () => void;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

interface BreadcrumbItem {
  label: string;
  href?: string;
}

const Header: React.FC<HeaderProps> = ({ onLogout }) => {
  const location = useLocation();
  const [user, setUser] = useState<UserData | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [alertStats, setAlertStats] = useState<AlertStats | null>(null);

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
    fetchAlertStats();

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

  // Fetch alert stats and refresh every 30 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchAlertStats();
    }, 30000); // 30 seconds

    return () => clearInterval(intervalId);
  }, []);

  const fetchAlertStats = async () => {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) return;

      const farmsData = await getFarms();
      if (farmsData.length === 0) return;

      const stats = await getAlertStats(farmsData[0]._id);
      setAlertStats(stats);
    } catch (error) {
      console.error('Failed to fetch alert stats:', error);
    }
  };

  // Get user initials from name
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Generate breadcrumbs based on current route
  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [{ label: 'Cultivo', href: '/' }];

    if (pathSegments.length === 0 || pathSegments[0] === '') {
      breadcrumbs.push({ label: 'Dashboard' });
    } else {
      pathSegments.forEach((segment, index) => {
        // Convert segment to title case and replace hyphens with spaces
        const label = segment
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        const href = index === pathSegments.length - 1
          ? undefined
          : '/' + pathSegments.slice(0, index + 1).join('/');
        breadcrumbs.push({ label, href });
      });
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="h-16 px-3 sm:px-6 flex items-center justify-between bg-white border-b border-gray-200">
      {/* Breadcrumbs */}
      <div className="font-medium text-sm hidden sm:flex items-center space-x-1 truncate max-w-[300px]">
        {breadcrumbs.map((item, index) => (
          <div key={item.label} className="flex items-center">
            {index > 0 && <ChevronRight className="h-4 w-4 text-gray-600 mx-1" />}
            {item.href ? (
              <Link
                to={item.href}
                className="text-gray-700 hover:text-gray-950 transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-950">{item.label}</span>
            )}
          </div>
        ))}
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-2 ml-auto sm:ml-0">

        {/* Notifications */}
        <Link
          to="/alerts"
          className="relative p-2 hover:bg-gray-200 rounded-lg transition-colors flex items-center justify-center"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5 text-gray-700" />
          {alertStats && alertStats.unread > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
              {alertStats.unread > 9 ? '9+' : alertStats.unread}
            </span>
          )}
        </Link>

        {/* User Profile */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2"
            aria-label="User menu"
          >
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <span className="text-sm font-semibold text-white">
                  {user ? getInitials(user.name) : <User size={18} />}
                </span>
              </div>
            )}
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-gray-900">
                {user?.name}
              </p>
              <p className="text-xs text-gray-600">{user?.email}</p>
            </div>
          </button>

          {/* Dropdown Menu */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
              <div className="px-4 py-2 border-b border-gray-200">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-600">{user?.email}</p>
              </div>
              <Link
                to="/settings"
                onClick={() => setShowUserMenu(false)}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Settings
              </Link>
            </div>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="p-2 hover:bg-gray-200 rounded-lg transition-colors flex items-center justify-center"
          aria-label="Logout"
          title="Logout"
        >
          <LogOut className="h-5 w-5 text-gray-700" />
        </button>
      </div>
    </header>
  );
};

export default Header;