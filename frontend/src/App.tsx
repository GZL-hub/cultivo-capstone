import React, { useState, useEffect } from 'react';
import Login from './components/login/Login';

function App() {
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    if (isLoggedIn) {
      fetchMessage();
    }
  }, [isLoggedIn]);

  const fetchMessage = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/message');        
      const data = await response.json();
      setMessage(data.message);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch message');
      setLoading(false);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    try {
      // In a real app, you would make an API call here
      // For now, we'll simulate a successful login after a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate successful login
      setIsLoggedIn(true);
      setLoading(false);
    } catch (err) {
      setError('Login failed');
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} loading={loading} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-200 to-blue-200">
      <header className="bg-white rounded-lg shadow-lg p-8 text-center">
        <h1 className="text-3xl font-bold text-green-700 mb-4">Cultivo Capstone</h1>
        {loading && <p className="text-blue-500 animate-pulse">Loading message...</p>}
        {error && <p className="text-red-500 font-semibold">Error: {error}</p>}
        {message && <p className="text-gray-700 text-lg">Message from server: <span className="font-mono text-green-600">{message}</span></p>}
        <div className="mt-6">
          <button 
            onClick={() => setIsLoggedIn(false)}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
          >
            Log Out
          </button>
        </div>
      </header>
    </div>
  );
}

export default App;