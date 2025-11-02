import React, { useRef } from 'react';
import { Maximize, RefreshCw } from 'lucide-react';
import SharedVideoPlayer from './SharedVideoPlayer';

interface CameraGridItemProps {
  cameraId: number;
  cameraName?: string;
  status: string;
  error: string | null;
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onReconnect: () => void;
  getStatusColor: (status: string) => string;
}

const CameraGridItem: React.FC<CameraGridItemProps> = ({
  cameraId,
  cameraName,
  status,
  error,
  isHovered,
  onMouseEnter,
  onMouseLeave,
  onReconnect,
  getStatusColor,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error('Error attempting to enable fullscreen:', err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative bg-black rounded-lg overflow-hidden border-2 border-gray-300 hover:border-primary transition-colors shadow-sm"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Camera Label and Status */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/70 to-transparent p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-white font-semibold text-sm drop-shadow">
              {cameraName || `Camera ${cameraId}`}
            </span>
            <div className="flex items-center gap-1">
              <div
                className={`w-2 h-2 rounded-full ${getStatusColor(status)} ${
                  status === 'connecting' ? 'animate-pulse' : ''
                }`}
              />
              <span className="text-xs text-white drop-shadow capitalize">
                {status}
              </span>
            </div>
          </div>

          {/* Controls - Show on hover */}
          <div
            className={`flex items-center gap-2 transition-opacity ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Refresh Button - Only show when error */}
            {status === 'error' && (
              <button
                onClick={onReconnect}
                className="p-1 bg-red-500/80 hover:bg-red-500 rounded transition-colors"
                title="Refresh Stream"
              >
                <RefreshCw size={14} className="text-white" />
              </button>
            )}

            {/* Fullscreen Button - Always show on hover */}
            <button
              onClick={handleFullscreen}
              className="p-1 bg-white/20 hover:bg-white/30 rounded transition-colors"
              title="Fullscreen"
            >
              <Maximize size={14} className="text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Video Player */}
      <div className="w-full h-full flex items-center justify-center bg-gray-900">
        {status === 'error' ? (
          <div className="text-center p-4">
            <div className="text-red-500 text-sm mb-2">Connection Error</div>
            <div className="text-xs text-gray-400 mb-3">
              {error || 'Failed to connect'}
            </div>
            <button
              onClick={onReconnect}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg transition-colors flex items-center gap-2 mx-auto"
            >
              <RefreshCw size={16} />
              Retry Connection
            </button>
          </div>
        ) : status === 'connecting' || status === 'idle' ? (
          <div className="text-center p-4">
            <div className="text-white text-sm">Connecting...</div>
          </div>
        ) : (
          <SharedVideoPlayer className="object-cover" containerRef={containerRef} />
        )}
      </div>

      {/* Bottom Bar with Camera Info */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/70 to-transparent p-2">
        <div className="flex items-center justify-between text-xs text-white drop-shadow">
          <span>{cameraName ? `Stream ${cameraId}` : 'Farm Main Sector'}</span>
          {status === 'connected' && <span className="font-mono">LIVE</span>}
        </div>
      </div>
    </div>
  );
};

export default CameraGridItem;
