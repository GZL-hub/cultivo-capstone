import React, { useState } from 'react';
import SidePanel from './SidePanel';
import LoginForm from './LoginForm';

interface LoginProps {
  onLogin: (email: string, password: string) => void;
  loading?: boolean;
}

const Login: React.FC<LoginProps> = ({ onLogin, loading = false }) => {
  return (
    <div className="min-h-screen flex font-sans">
      {/* Left side banner */}
      <SidePanel />

      {/* Right side login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <LoginForm onLogin={onLogin} loading={loading} />
      </div>
    </div>
  );
};

export default Login;