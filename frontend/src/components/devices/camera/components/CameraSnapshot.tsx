import React, { useState } from 'react';
import { Video, AlertCircle } from 'lucide-react';

interface CameraSnapshotProps {
  streamUrl: string;
  cameraName: string;
  className?: string;
  onClick?: () => void;
}

const CameraSnapshot: React.FC<CameraSnapshotProps> = ({ streamUrl, cameraName, className = '', onClick }) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Generate snapshot URL from stream URL
  // For MediaMTX, we can try to generate a thumbnail URL
  const getSnapshotUrl = (url: string): string => {
    try {
      // If it's a WebRTC stream URL, try to generate a snapshot endpoint
      // This assumes your MediaMTX server has snapshot capability
      const urlObj = new URL(url);
      // Common patterns: replace /stream with /snapshot or add /snapshot
      const snapshotUrl = `${urlObj.protocol}//${urlObj.host}${urlObj.pathname.replace('/stream', '/snapshot')}`;
      return snapshotUrl;
    } catch {
      // If URL parsing fails, return a placeholder
      return '';
    }
  };

  const snapshotUrl = getSnapshotUrl(streamUrl);

  const handleImageLoad = () => {
    setIsLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setImageError(true);
  };

  if (!streamUrl || imageError || !snapshotUrl) {
    // Fallback: Show camera icon placeholder
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 ${className} ${onClick ? 'cursor-pointer hover:bg-gray-200' : ''}`}
        onClick={onClick}
      >
        <Video className="w-6 h-6 text-gray-400" />
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden bg-gray-100 ${className} ${onClick ? 'cursor-pointer hover:ring-2 hover:ring-primary transition-all' : ''}`}
      onClick={onClick}
      title={onClick ? `Click to view ${cameraName}` : undefined}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-pulse">
            <Video className="w-6 h-6 text-gray-400" />
          </div>
        </div>
      )}
      <img
        src={snapshotUrl}
        alt={`${cameraName} preview`}
        className={`w-full h-full object-cover ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
    </div>
  );
};

export default CameraSnapshot;
