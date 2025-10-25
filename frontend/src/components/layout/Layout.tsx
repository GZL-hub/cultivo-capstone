import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, onLogout }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div
        className={`flex flex-col flex-1 transition-all duration-300 ${
          collapsed ? 'ml-0' : 'ml-64'
        }`}
      >
        <Header
          onMenuClick={() => {}} // No mobile
          onToggleCollapse={() => setCollapsed(!collapsed)}
          collapsed={collapsed}
          onLogout={onLogout}
        />
        <main className="flex-1 overflow-y-auto bg-background">{children}</main>
      </div>
    </div>
  );
};

export default Layout;