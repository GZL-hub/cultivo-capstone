import React from 'react';
import { NavLink } from 'react-router-dom';
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
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

function NavItem({
  to,
  icon: Icon,
  children,
}: {
  to: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
          isActive
            ? 'bg-primary-100 text-primary font-semibold'
            : 'text-text/70 hover:text-primary hover:bg-primary-50'
        }`
      }
    >
      <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
      {children}
    </NavLink>
  );
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
  return (
    <nav
      className={`
        fixed inset-y-0 left-0 z-30 bg-white shadow-lg border-r border-gray-200 transition-all duration-300
        ${collapsed ? '-translate-x-full w-64' : 'translate-x-0 w-64'}
      `}
      style={{ willChange: 'transform' }}
    >
      <div className="h-full flex flex-col">
        {/* Logo */}
        <div className="h-16 px-6 flex items-center border-b border-gray-200">
          <img src="/Cultivo2.png" alt="Cultivo Logo" className="h-10 w-10" />
          {!collapsed && (
            <span className="ml-3 text-lg font-semibold text-primary">
              Cultivo
            </span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-2">
          <div className="space-y-6">
            <div>
              <div className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Overview
              </div>
              <div className="space-y-1">
                <NavItem to="/" icon={Home}>Dashboard</NavItem>
                <NavItem to="/alerts" icon={Bell}>Alerts</NavItem>
              </div>
            </div>

            <div>
              <div className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Device Management
              </div>
              <div className="space-y-1">
                <NavItem to="/device-settings/cameras" icon={VideoIcon}>Camera Management</NavItem>
                <NavItem to="/device-settings/sensors" icon={Activity}>Sensor Management</NavItem>
              </div>
            </div>

            <div>
              <div className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Analytics
              </div>
              <div className="space-y-1">
                <NavItem to="/analytics/farm" icon={BarChart2}>Farm Analytics</NavItem>
                <NavItem to="/analytics/weather" icon={CloudSun}>Weather Analytics</NavItem>
              </div>
            </div>

            <div>
              <div className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Farm Management
              </div>
              <div className="space-y-1">
                <NavItem to="/farm/overview" icon={LayoutDashboard}>Farm Overview</NavItem>
                <NavItem to="/farm/map" icon={Map}>Farm Map</NavItem>
                <NavItem to="/farm/cctv" icon={Camera}>Farm CCTV</NavItem>
                <NavItem to="/farm/workers" icon={Users}>Workers</NavItem>                
              </div>
            </div>
          </div>
        </div>

        <div className="px-2 py-4 border-t border-gray-200">
          <div className="space-y-1">
            <NavItem to="/settings" icon={Settings}>Settings</NavItem>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;