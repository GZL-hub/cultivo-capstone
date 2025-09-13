import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BarChart3, 
  BellRing, 
  Cpu, 
  Settings, 
  X,
  Tractor
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  to: string;
  active?: boolean;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, to, active, onClick }) => {
  return (
    <Link to={to} className="w-full">
      <button
        onClick={onClick}
        className={`flex items-center w-full p-3 rounded-lg transition-colors ${
          active
            ? 'bg-green-600 text-white hover:bg-green-700'
            : 'text-gray-500 hover:bg-green-50 hover:text-green-600'
        }`}
      >
        <span className="mr-3">{icon}</span>
        <span className="font-medium">{label}</span>
      </button>
    </Link>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ collapsed, mobileOpen, setMobileOpen }) => {
  const location = useLocation();
  const pathname = location.pathname;

  const handleNavClick = () => {
    // On mobile, close the sidebar when an item is clicked
    if (window.innerWidth < 768) {
      setMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setMobileOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed top-0 left-0 z-30 h-full bg-white border-r border-gray-200 transition-all duration-300 
          w-64
          ${collapsed ? '-translate-x-full' : 'translate-x-0'} 
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:${collapsed ? '-translate-x-full' : 'translate-x-0'}
        `}
      >
        {/* Close button - mobile only */}
        <button 
          className="absolute top-4 right-4 md:hidden text-gray-500"
          onClick={() => setMobileOpen(false)}
        >
          <X size={20} />
        </button>

        {/* Logo */}
        <div className="flex items-center p-4 px-6">
          <img 
            src="/Cultivo2.png" 
            alt="Cultivo Logo" 
            className="h-8" 
          />
          <span className="ml-3 text-lg font-semibold text-green-800">Cultivo</span>
        </div>

        {/* Navigation */}
        <nav className="mt-8 px-4">
          <ul className="space-y-2">
            <NavItem 
              icon={<LayoutDashboard size={20} />} 
              label="Dashboard" 
              to="/"
              active={pathname === '/'}
              onClick={handleNavClick}
            />
            <NavItem 
              icon={<BarChart3 size={20} />} 
              label="Analytics" 
              to="/analytics"
              active={pathname === '/analytics'}
              onClick={handleNavClick}
            />
            <NavItem 
              icon={<BellRing size={20} />} 
              label="Alerts" 
              to="/alerts"
              active={pathname === '/alerts'}
              onClick={handleNavClick}
            />
            <NavItem 
              icon={<Cpu size={20} />} 
              label="Devices" 
              to="/devices"
              active={pathname === '/devices'}
              onClick={handleNavClick}
            />
            <NavItem 
              icon={<Tractor size={20} />} 
              label="Farm Management" 
              to="/farm"
              active={pathname === '/farm'}
              onClick={handleNavClick}
            />
          </ul>
        </nav>

        {/* Bottom Settings Item */}
        <div className="absolute bottom-4 w-full px-4">
          <NavItem 
            icon={<Settings size={20} />} 
            label="Settings" 
            to="/settings"
            active={pathname === '/settings'}
            onClick={handleNavClick}
          />
        </div>
      </aside>
    </>
  );
};

export default Sidebar;