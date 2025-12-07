import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  BarChart2,
  Bell,
  Settings,
  Map,
  Camera,
  LayoutDashboard,
  CloudSun,
  Activity,
  VideoIcon,
  Users,
  Menu,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

interface NavItemProps {
  to: string;
  icon: React.ElementType;
  children: React.ReactNode;
  onClick?: () => void;
  isCollapsed?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavigation = () => {
    setIsMobileMenuOpen(false);
  };

  const NavItem: React.FC<NavItemProps> = ({ to, icon: Icon, children, onClick, isCollapsed: isItemCollapsed = collapsed }) => {
    const isActive = location.pathname === to;

    return (
      <NavLink
        to={to}
        onClick={() => {
          onClick?.();
          handleNavigation();
        }}
        className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
          isActive
            ? 'bg-primary-100 text-primary font-semibold'
            : 'text-text/70 hover:text-primary hover:bg-primary-50'
        } ${isItemCollapsed ? 'justify-center' : ''}`}
        title={isItemCollapsed ? children?.toString() : undefined}
      >
        <Icon className={`h-5 w-5 flex-shrink-0 ${isItemCollapsed ? '' : 'mr-3'}`} />
        {!isItemCollapsed && <span className="whitespace-nowrap">{children}</span>}
      </NavLink>
    );
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        type="button"
        className="lg:hidden fixed top-4 left-4 z-[70] p-2 rounded-lg bg-white shadow-md"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <Menu className="h-5 w-5 text-gray-700" />
      </button>

      {/* Sidebar */}
      <nav
        className={`
          fixed inset-y-0 left-0 z-[70] bg-white transform transition-all duration-300 ease-in-out
          lg:translate-x-0 lg:static border-r border-gray-200 overflow-hidden
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          ${collapsed ? 'w-16 lg:w-16' : 'w-64 lg:w-64'}
        `}
      >
        <div className="h-full flex flex-col">
          {/* Logo & Collapse Button */}
          <div className={`h-16 flex items-center justify-between border-b border-gray-200 transition-all duration-300 ${collapsed ? 'px-2' : 'px-4'}`}>
            {!collapsed ? (
              <>
                <NavLink to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity min-w-0">
                  <img src="/Cultivo2.png" alt="Cultivo Logo" className="h-10 w-10 flex-shrink-0" />
                  <div className="min-w-0">
                    <span className="text-lg font-bold text-black block whitespace-nowrap italic">cultivo</span>
                  </div>
                </NavLink>
                <button
                  onClick={() => setCollapsed(!collapsed)}
                  className="p-2 rounded-md text-gray-600 hover:text-gray-950 hover:bg-gray-200 transition-colors flex-shrink-0"
                  title="Collapse sidebar"
                  aria-label="Collapse sidebar"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              </>
            ) : (
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="p-2 rounded-md text-gray-600 hover:text-gray-950 hover:bg-gray-200 transition-colors mx-auto"
                title="Expand sidebar"
                aria-label="Expand sidebar"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto py-2 px-2">
            <div className="space-y-8">
              {/* Overview Section */}
              <div>
                {!collapsed && (
                  <div className="px-3 mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500 whitespace-nowrap">
                    Overview
                  </div>
                )}
                <div className="space-y-2">
                  <NavItem to="/" icon={Home}>
                    Dashboard
                  </NavItem>
                  <NavItem to="/sensor-monitoring" icon={Activity}>
                    Sensor Monitoring
                  </NavItem>
                  <NavItem to="/alerts" icon={Bell}>
                    Alerts
                  </NavItem>
                </div>
              </div>

              {/* Device Management Section */}
              <div>
                {!collapsed && (
                  <div className="px-3 mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500 whitespace-nowrap">
                    Device Management
                  </div>
                )}
                <div className="space-y-2">
                  <NavItem to="/device-settings/cameras" icon={VideoIcon}>
                    Camera Management
                  </NavItem>
                  <NavItem to="/device-settings/sensors" icon={Activity}>
                    Sensor Management
                  </NavItem>
                </div>
              </div>

              {/* Analytics Section */}
              <div>
                {!collapsed && (
                  <div className="px-3 mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500 whitespace-nowrap">
                    Analytics
                  </div>
                )}
                <div className="space-y-2">
                  <NavItem to="/analytics/farm" icon={BarChart2}>
                    Farm Analytics
                  </NavItem>
                  <NavItem to="/analytics/weather" icon={CloudSun}>
                    Weather Analytics
                  </NavItem>
                </div>
              </div>

              {/* Farm Management Section */}
              <div>
                {!collapsed && (
                  <div className="px-3 mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500 whitespace-nowrap">
                    Farm Management
                  </div>
                )}
                <div className="space-y-2">
                  <NavItem to="/farm/overview" icon={LayoutDashboard}>
                    Farm Overview
                  </NavItem>
                  <NavItem to="/farm/map" icon={Map}>
                    Farm Map
                  </NavItem>
                  <NavItem to="/farm/cctv" icon={Camera}>
                    Farm CCTV
                  </NavItem>
                  <NavItem to="/farm/workers" icon={Users}>
                    Workers
                  </NavItem>
                </div>
              </div>
            </div>
          </div>

          {/* Settings Section */}
          <div className="px-4 py-4 border-t border-gray-200">
            <div className="space-y-1">
              <NavItem to="/settings" icon={Settings}>
                Settings
              </NavItem>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[65] lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;