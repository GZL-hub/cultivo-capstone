import React from 'react';
import { Pause, Play } from 'lucide-react';
import { ConnectionStatus } from './WebRTCPlayer';

interface PlayerControlsProps {
  status: ConnectionStatus;
  isPaused: boolean;
  onTogglePause: () => void;
}

const PlayerControls: React.FC<PlayerControlsProps> = ({ 
  status, 
  isPaused, 
  onTogglePause 
}) => {
  return (
    <div className="flex items-center space-x-2">
      <div className="text-sm text-gray-600">
        Status: 
        {status === 'connecting' && (
          <span className="ml-1 text-yellow-600">Connecting...</span>
        )}
        {status === 'connected' && (
          <span className="ml-1 text-green-600">Live</span>
        )}
        {status === 'error' && (
          <span className="ml-1 text-red-600">Error</span>
        )}
      </div>
      <button 
        onClick={onTogglePause}
        className="p-2 bg-gray-200 rounded-full hover:bg-gray-300"
      >
        {isPaused ? <Play size={16} /> : <Pause size={16} />}
      </button>
    </div>
  );
};

export default PlayerControls;