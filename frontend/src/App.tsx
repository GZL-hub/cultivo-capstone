import React, { useState, useEffect } from 'react';
import './App.css';

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
    <div className="App">
      <header className="App-header">
        {loading && <p>Loading message TEST 1...</p>}
        {error && <p>Error TEST 1: {error}</p>}
        {message && <p>Message from server: {message}</p>}
      </header>
    </div>
  );
}

export default App;