import React from 'react';
import { Menu, Bell, User, Search, PanelLeft, LogOut } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
  onToggleCollapse: () => void;
  collapsed: boolean;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, onToggleCollapse, collapsed, onLogout }) => {
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
          className="hidden md:flex text-gray-700 hover:text-green-600 hover:bg-green-50 p-2 rounded-md items-center justify-center mr-2 transition-colors" 
          onClick={onToggleCollapse}
        >
          <PanelLeft size={20} />
        </button>

        {/* Title */}
        <h1 className="text-xl font-semibold text-gray-800">Dashboard</h1>
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
            className="py-2 pl-10 pr-4 w-64 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        
        <button className="text-gray-500">
          <Bell size={20} />
        </button>
        <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center text-white">
          <User size={16} />
        </div>
        <button 
          className="text-gray-500 hover:text-red-500 transition-colors" 
          title="Log out"
          onClick={onLogout}
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
};

export default Header;