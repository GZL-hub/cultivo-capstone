import React from 'react';
import { AlertCircle } from 'lucide-react';
import { ConnectionStatus } from './WebRTCPlayer';

interface StatusIndicatorProps {
  status: ConnectionStatus;
  isPaused: boolean;
  errorDetails?: string | null;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status, isPaused, errorDetails }) => {
  if (isPaused) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-10">
        <div className="text-white text-center">
          <p className="font-bold">Feed Paused</p>
          <p className="text-sm mt-2">Click play to resume</p>
        </div>
      </div>
    );
  }
  
  if (status === 'connecting') {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-10">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
      </div>
    );
  }
  
  if (status === 'error') {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-10">
        <div className="text-white text-center p-4">
          <div className="flex justify-center mb-2">
            <AlertCircle size={32} className="text-red-400" />
          </div>
          <p className="font-bold">Connection Error</p>
          <p className="text-sm mt-2">Unable to connect to camera feed</p>
          {errorDetails && (
            <div className="mt-4 p-2 bg-gray-900 rounded text-xs text-left overflow-auto max-h-32">
              <p className="text-red-300">Error: {errorDetails}</p>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  return null;
};

export default StatusIndicator;