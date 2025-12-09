import React, { useState, useEffect } from 'react';
import { Grid2X2, Grid3X3, LayoutGrid } from 'lucide-react';
import { SharedStreamProvider, useSharedStream } from './SharedStreamProvider';
import CameraGridItem from './CameraGridItem';
import { useFarmManagement } from '../../FarmManagement';
import { getCCTVs, CCTV } from '../../../../services/cctvService';
import LoadingSpinner from '../../../common/LoadingSpinner';
import EmptyState, { Camera } from '../../../common/EmptyState';

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
        <LoadingSpinner size="lg" text="Loading cameras..." />
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
        <EmptyState
          icon={Camera}
          title="No Cameras Registered"
          description="No CCTV cameras have been registered for this farm yet. Go to Device Settings → Cameras to add your first camera."
        />
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
