import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, ArrowLeft, AlertCircle } from 'lucide-react';

interface LoginFormProps {
  onLogin: (email: string, password: string) => void;
  onRegister: (name: string, email: string, password: string) => void;
  loading?: boolean;
  error?: string | null;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, onRegister, loading = false, error = null }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentView, setCurrentView] = useState<"login" | "register" | "forgot">("login");
  const [formError, setFormError] = useState<string | null>(null);

  // Update local error state when prop changes
  useEffect(() => {
    setFormError(error);
  }, [error]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    
    if (currentView === "login") {
      // Validate login fields
      if (!email || !password) {
        setFormError('Please enter both email and password');
        return;
      }
      onLogin(email, password);
    } else if (currentView === "register") {
      // Validate registration fields
      if (!name) {
        setFormError('Please enter your name');
        return;
      }
      if (!email) {
        setFormError('Please enter your email');
        return;
      }
      if (!password) {
        setFormError('Please enter a password');
        return;
      }
      if (password !== confirmPassword) {
        setFormError('Passwords do not match');
        return;
      }
      if (password.length < 6) {
        setFormError('Password must be at least 6 characters');
        return;
      }
      
      onRegister(name, email, password);
    } else if (currentView === "forgot") {
      // Handle password reset - in a real app you would call an API
      if (!email) {
        setFormError('Please enter your email');
        return;
      }
      console.log("Reset password for:", email);
    }
  };

  const handleViewChange = (view: "login" | "register" | "forgot") => {
    setCurrentView(view);
    setFormError(null);  // Clear errors when changing views
  };

  return (
    <div className="w-full max-w-md space-y-8 font-figtree">
      <div className="lg:hidden text-center mb-8">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-3 bg-green-600">
          <div className="w-4 h-4 bg-white rounded-sm"></div>
        </div>
        <h1 className="text-xl font-semibold text-gray-900">Cultivo</h1>
      </div>

      <div className="space-y-6">
        <div className="space-y-2 text-center">
          {currentView === "forgot" && (
            <button
              type="button"
              onClick={() => handleViewChange("login")}
              className="absolute left-8 top-8 p-2 hover:bg-gray-100 rounded-full cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
          <h2 className="text-3xl text-gray-900 font-bold">
            {currentView === "login" && "Welcome Back"}
            {currentView === "register" && "Create Account"}
            {currentView === "forgot" && "Reset Password"}
          </h2>
          <p className="text-gray-500 font-noto-sans">
            {currentView === "login" && "Enter your email and password to access your farm dashboard."}
            {currentView === "register" && "Create a new account to get started with Cultivo."}
            {currentView === "forgot" && "Enter your email address and we'll send you a reset link."}
          </p>
        </div>

        {formError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {currentView === "register" && (
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-gray-900">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full h-12 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-green-600 font-noto-sans"
              />
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-900">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@farm.com"
              className="w-full h-12 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-green-600 font-noto-sans"
            />
          </div>

          {currentView !== "forgot" && (
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-900">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full h-12 px-3 py-2 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:border-green-600 font-noto-sans"
                />
                <button
                  type="button"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </button>
              </div>
            </div>
          )}

          {currentView === "register" && (
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-900">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className="w-full h-12 px-3 py-2 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:border-green-600 font-noto-sans"
                />
                <button
                  type="button"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent cursor-pointer"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </button>
              </div>
            </div>
          )}

          {currentView === "login" && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="remember" 
                  className="rounded border-gray-300 cursor-pointer" 
                />
                <label htmlFor="remember" className="text-sm text-gray-500 cursor-pointer font-noto-sans">
                  Remember Me
                </label>
              </div>
              <button
                type="button"
                className="text-sm text-green-600 hover:text-green-700 cursor-pointer font-noto-sans"
                onClick={() => handleViewChange("forgot")}
              >
                Forgot Your Password?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full h-12 text-sm font-medium text-white rounded-lg bg-green-600 hover:bg-green-700 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              <>
                {currentView === "login" && "Log In"}
                {currentView === "register" && "Create Account"}
                {currentView === "forgot" && "Send Reset Link"}
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-6 py-4 border-t border-gray-200 font-noto-sans">
          {currentView === "login" && (
            <div className="text-sm text-gray-600">
              <p className="mb-2">Don't have an account?</p>
              <button
                type="button"
                className="w-full h-11 text-sm font-medium text-green-700 border border-green-600 rounded-lg hover:bg-green-50"
                onClick={() => handleViewChange("register")}
              >
                Register Now
              </button>
            </div>
          )}
          {currentView === "register" && (
            <div className="text-sm text-gray-600">
              <p className="mb-2">Already have an account?</p>
              <button
                type="button"
                className="w-full h-11 text-sm font-medium text-green-700 border border-green-600 rounded-lg hover:bg-green-50"
                onClick={() => handleViewChange("login")}
              >
                Sign In
              </button>
            </div>
          )}
          {currentView === "forgot" && (
            <div className="text-sm text-gray-600">
              <p className="mb-2">Remember your password?</p>
              <button
                type="button"
                className="w-full h-11 text-sm font-medium text-green-700 border border-green-600 rounded-lg hover:bg-green-50"
                onClick={() => handleViewChange("login")}
              >
                Back to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginForm;