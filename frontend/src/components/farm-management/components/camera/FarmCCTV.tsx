import React, { useState } from 'react';
import WebRTCPlayer, { ConnectionStatus } from './WebRTCPlayer';
import { Grid2X2, Grid3X3, LayoutGrid } from 'lucide-react';

type GridSize = '2x2' | '3x3' | '4x4';

interface CameraStatus {
  id: number;
  status: ConnectionStatus;
  error?: string;
}

const FarmCCTV: React.FC = () => {
  const [gridSize, setGridSize] = useState<GridSize>('2x2');
  const [cameraStatuses, setCameraStatuses] = useState<Map<number, CameraStatus>>(new Map());

  // The hardcoded stream URL for testing
  const streamUrl = 'https://136.110.0.27:8889/livefeed/whep';

  const handleStatusChange = (cameraId: number, status: ConnectionStatus, error?: string) => {
    setCameraStatuses(prev => {
      const newMap = new Map(prev);
      newMap.set(cameraId, { id: cameraId, status, error });
      return newMap;
    });
  };

  const getGridConfig = (size: GridSize) => {
    switch (size) {
      case '2x2':
        return { cameras: 4, cols: 'grid-cols-2', rows: 'grid-rows-2' };
      case '3x3':
        return { cameras: 9, cols: 'grid-cols-3', rows: 'grid-rows-3' };
      case '4x4':
        return { cameras: 16, cols: 'grid-cols-4', rows: 'grid-rows-4' };
    }
  };

  const gridConfig = getGridConfig(gridSize);

  const getStatusColor = (status: ConnectionStatus) => {
    switch (status) {
      case 'connected':
        return 'bg-green-500';
      case 'connecting':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const GridButton = ({
    size,
    icon: Icon,
    label
  }: {
    size: GridSize;
    icon: React.ElementType;
    label: string;
  }) => (
    <button
      onClick={() => setGridSize(size)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
        gridSize === size
          ? 'bg-primary text-white shadow-md'
          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
      }`}
      title={label}
    >
      <Icon size={18} />
      <span className="text-sm font-medium">{size}</span>
    </button>
  );

  return (
    <div className="w-full h-full flex flex-col p-4 bg-background">
      {/* Header with Grid Controls */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 mr-2">Grid Layout:</span>
          <GridButton size="2x2" icon={Grid2X2} label="2x2 Grid" />
          <GridButton size="3x3" icon={Grid3X3} label="3x3 Grid" />
          <GridButton size="4x4" icon={LayoutGrid} label="4x4 Grid" />
        </div>
      </div>

      {/* Camera Grid */}
      <div
        className={`grid ${gridConfig.cols} ${gridConfig.rows} gap-2 flex-1 auto-rows-fr`}
        style={{ minHeight: 0 }}
      >
        {Array.from({ length: gridConfig.cameras }, (_, index) => {
          const cameraId = index + 1;
          const cameraStatus = cameraStatuses.get(cameraId);

          return (
            <div
              key={cameraId}
              className="relative bg-black rounded-lg overflow-hidden border-2 border-gray-300 hover:border-primary transition-colors shadow-sm"
            >
              {/* Camera Label and Status */}
              <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/70 to-transparent p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold text-sm drop-shadow">
                      Camera {cameraId}
                    </span>
                    <div className="flex items-center gap-1">
                      <div
                        className={`w-2 h-2 rounded-full ${getStatusColor(
                          cameraStatus?.status || 'connecting'
                        )} ${
                          cameraStatus?.status === 'connecting' ? 'animate-pulse' : ''
                        }`}
                      />
                      <span className="text-xs text-white drop-shadow capitalize">
                        {cameraStatus?.status || 'connecting'}
                      </span>
                    </div>
                  </div>
                  {/* Timestamp */}
                  <span className="text-xs text-white/90 font-mono drop-shadow">
                    {new Date().toLocaleTimeString()}
                  </span>
                </div>
              </div>

              {/* Video Player */}
              <div className="w-full h-full flex items-center justify-center bg-gray-900">
                {cameraStatus?.status === 'error' ? (
                  <div className="text-center p-4">
                    <div className="text-red-500 text-sm mb-2">Connection Error</div>
                    <div className="text-xs text-gray-400">
                      {cameraStatus.error || 'Failed to connect'}
                    </div>
                  </div>
                ) : (
                  <WebRTCPlayer
                    streamUrl={streamUrl}
                    onStatusChange={(status, error) =>
                      handleStatusChange(cameraId, status, error)
                    }
                    className="object-cover"
                  />
                )}
              </div>

              {/* Bottom Bar with Camera Info */}
              <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/70 to-transparent p-2">
                <div className="flex items-center justify-between text-xs text-white drop-shadow">
                  <span>Farm Main Sector</span>
                  <span className="font-mono">REC</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FarmCCTV;