import React, { useState } from 'react';
import WebRTCPlayer, { ConnectionStatus } from './WebRTCPlayer';
import StatusIndicator from './StatusIndicator';
import PlayerControls from './PlayerControls';
import TroubleshootingTips from './TroubleshootingTips';

const FarmCCTV: React.FC = () => {
  const [isPaused, setIsPaused] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  // The hardcoded stream URL for testing
  const streamUrl = 'https://136.110.0.27:8889/livefeed/whep';
  
  const handleStatusChange = (status: ConnectionStatus, error?: string) => {
    setConnectionStatus(status);
    if (error) {
      setErrorDetails(error);
    }
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  return (
    <div className="w-full h-full flex flex-col p-4 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Camera Test</h2>
        <PlayerControls 
          status={connectionStatus}
          isPaused={isPaused}
          onTogglePause={togglePause}
        />
      </div>

      <div className="relative bg-black h-[400px] w-full">
        <StatusIndicator 
          status={connectionStatus}
          isPaused={isPaused}
          errorDetails={errorDetails}
        />
        
        <WebRTCPlayer
          streamUrl={streamUrl}
          isPaused={isPaused}
          onStatusChange={handleStatusChange}
        />
      </div>
      
      {connectionStatus === 'error' && <TroubleshootingTips />}
    </div>
  );
};

export default FarmCCTV;