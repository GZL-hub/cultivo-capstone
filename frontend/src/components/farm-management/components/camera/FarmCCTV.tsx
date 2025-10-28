import React, { useState } from 'react';
import { Grid2X2, Grid3X3, LayoutGrid } from 'lucide-react';
import { SharedStreamProvider, useSharedStream } from './SharedStreamProvider';
import CameraGridItem from './CameraGridItem';

type GridSize = '2x2' | '3x3' | '4x4';

const FarmCCTV: React.FC = () => {
  const [gridSize, setGridSize] = useState<GridSize>('2x2');

  // The hardcoded stream URL for testing
  const streamUrl = 'https://136.110.0.27:8889/livefeed/whep';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-500';
      case 'connecting':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      case 'idle':
        return 'bg-gray-500';
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
    <SharedStreamProvider streamUrl={streamUrl} enabled={true}>
      <FarmCCTVContent
        gridSize={gridSize}
        setGridSize={setGridSize}
        getStatusColor={getStatusColor}
        GridButton={GridButton}
      />
    </SharedStreamProvider>
  );
};

// Separate component to use the shared stream context
const FarmCCTVContent: React.FC<{
  gridSize: GridSize;
  setGridSize: (size: GridSize) => void;
  getStatusColor: (status: string) => string;
  GridButton: React.FC<{ size: GridSize; icon: React.ElementType; label: string }>;
}> = ({ gridSize, setGridSize, getStatusColor, GridButton }) => {
  const { status, error, reconnect } = useSharedStream();
  const [hoveredCamera, setHoveredCamera] = useState<number | null>(null);

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

  return (
    <div className="w-full h-full flex flex-col p-4 bg-background">
      {/* Header with Grid Controls and Connection Status */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 mr-2">Grid Layout:</span>
          <GridButton size="2x2" icon={Grid2X2} label="2x2 Grid" />
          <GridButton size="3x3" icon={Grid3X3} label="3x3 Grid" />
          <GridButton size="4x4" icon={LayoutGrid} label="4x4 Grid" />
        </div>

        {/* Global Stream Status */}
        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-300">
          <div
            className={`w-3 h-3 rounded-full ${getStatusColor(status)} ${
              status === 'connecting' ? 'animate-pulse' : ''
            }`}
          />
          <span className="text-sm font-medium capitalize">{status}</span>
          {status === 'error' && (
            <button
              onClick={reconnect}
              className="ml-2 text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Retry
            </button>
          )}
        </div>
      </div>

      {/* Camera Grid */}
      <div
        className={`grid ${gridConfig.cols} ${gridConfig.rows} gap-2 flex-1 auto-rows-fr`}
        style={{ minHeight: 0 }}
      >
        {Array.from({ length: gridConfig.cameras }, (_, index) => {
          const cameraId = index + 1;
          const isHovered = hoveredCamera === cameraId;

          return (
            <CameraGridItem
              key={cameraId}
              cameraId={cameraId}
              status={status}
              error={error}
              isHovered={isHovered}
              onMouseEnter={() => setHoveredCamera(cameraId)}
              onMouseLeave={() => setHoveredCamera(null)}
              onReconnect={reconnect}
              getStatusColor={getStatusColor}
            />
          );
        })}
      </div>
    </div>
  );
};

export default FarmCCTV;
