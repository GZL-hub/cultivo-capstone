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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-200 to-blue-200">
      <header className="bg-white rounded-lg shadow-lg p-8 text-center">
        <h1 className="text-3xl font-bold text-green-700 mb-4">Cultivo Capstone</h1>
        {loading && <p className="text-blue-500 animate-pulse">Loading message TEST 1...</p>}
        {error && <p className="text-red-500 font-semibold">Error TEST 1: {error}</p>}
        {message && <p className="text-gray-700 text-lg">Message from server: <span className="font-mono text-green-600">{message}</span></p>}
        <div className="mt-6">
          <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">Tailwind CSS Test</span>
        </div>
      </header>
    </div>
  );
}

export default App;