import React, { useState, useEffect } from 'react';
import { Grid2X2, Grid3X3, LayoutGrid } from 'lucide-react';
import { SharedStreamProvider, useSharedStream } from './SharedStreamProvider';
import CameraGridItem from './CameraGridItem';
import { useFarmManagement } from '../../FarmManagement';
import { getCCTVs, CCTV } from '../../../../services/cctvService';

type GridSize = '2x2' | '3x3' | '4x4';

const FarmCCTV: React.FC = () => {
  const [gridSize, setGridSize] = useState<GridSize>('2x2');
  const [cameras, setCameras] = useState<CCTV[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCameraIndex, setSelectedCameraIndex] = useState<number>(0);

  const { farmId } = useFarmManagement();

  // Fetch cameras from backend
  useEffect(() => {
    const fetchCameras = async () => {
      if (!farmId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const cctvData = await getCCTVs(farmId);
        setCameras(cctvData);
      } catch (error) {
        console.error('Error loading cameras:', error);
        setError('Failed to load cameras');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCameras();
  }, [farmId]);

  // Use the selected camera's stream URL
  const streamUrl = cameras.length > 0 && cameras[selectedCameraIndex]?.streamUrl
    ? cameras[selectedCameraIndex].streamUrl
    : '';

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

  // Show loading state
  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading cameras...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-background">
        <div className="bg-red-50 text-red-600 p-6 rounded-md border border-red-200">
          <p className="font-medium">Error Loading Cameras</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  // Show empty state if no cameras
  if (cameras.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-background">
        <div className="text-center p-6 bg-white rounded-lg border border-gray-300 shadow-sm max-w-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Cameras Registered</h3>
          <p className="text-sm text-gray-500 mb-4">
            No CCTV cameras have been registered for this farm yet.
          </p>
          <p className="text-xs text-gray-400">
            Go to Device Settings → Cameras to add your first camera.
          </p>
        </div>
      </div>
    );
  }

  return (
    <SharedStreamProvider streamUrl={streamUrl} enabled={true}>
      <FarmCCTVContent
        gridSize={gridSize}
        setGridSize={setGridSize}
        getStatusColor={getStatusColor}
        GridButton={GridButton}
        cameras={cameras}
        selectedCameraIndex={selectedCameraIndex}
        setSelectedCameraIndex={setSelectedCameraIndex}
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
  cameras: CCTV[];
  selectedCameraIndex: number;
  setSelectedCameraIndex: (index: number) => void;
}> = ({ gridSize, setGridSize, getStatusColor, GridButton, cameras, selectedCameraIndex, setSelectedCameraIndex }) => {
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

  // Calculate how many grid cells to display
  // If we have fewer cameras than grid cells, only show that many
  const displayCameras = Math.min(gridConfig.cameras, cameras.length);

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
        {Array.from({ length: displayCameras }, (_, index) => {
          const camera = cameras[index];
          const isHovered = hoveredCamera === index;

          return (
            <CameraGridItem
              key={camera._id || index}
              cameraId={index + 1}
              cameraName={camera.name}
              status={status}
              error={error}
              isHovered={isHovered}
              onMouseEnter={() => setHoveredCamera(index)}
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
