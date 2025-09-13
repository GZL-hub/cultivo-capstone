import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, onLogout }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar 
        collapsed={collapsed} 
        mobileOpen={mobileOpen} 
        setMobileOpen={setMobileOpen} 
      />
      
      <div 
        className={`flex flex-col flex-1 transition-all duration-300 ${collapsed ? 'ml-0' : 'ml-0 md:ml-64'}`}
      >
        <Header 
          onMenuClick={() => setMobileOpen(true)} 
          onToggleCollapse={() => setCollapsed(!collapsed)}
          collapsed={collapsed}
          onLogout={onLogout}
        />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;