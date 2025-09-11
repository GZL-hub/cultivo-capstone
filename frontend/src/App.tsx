import React, { useState, useEffect } from 'react';

function App() {
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMessage = async () => {
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

    fetchMessage();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">API Test</h1>
        
        {loading && (
          <div className="flex justify-center">
            <div className="animate-pulse text-blue-500">Loading message...</div>
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
            <p>Error: {error}</p>
          </div>
        )}
        
        {message && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4">
            <p className="font-medium">Message from server:</p>
            <p>{message}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;