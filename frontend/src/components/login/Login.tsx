import React from 'react';
import SidePanel from './SidePanel';
import LoginForm from './LoginForm';

interface LoginProps {
  onLogin: (email: string, password: string) => void;
  onRegister: (name: string, email: string, password: string) => void;
  loading?: boolean;
  error?: string | null;
}

const Login: React.FC<LoginProps> = ({ onLogin, onRegister, loading = false, error = null }) => {
  return (
    <div className="min-h-screen flex font-sans">
      {/* Left side banner */}
      <SidePanel />

      {/* Right side login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <LoginForm 
          onLogin={onLogin} 
          onRegister={onRegister}
          loading={loading}
          error={error}
        />
      </div>
    </div>
  );
};

export default Login;