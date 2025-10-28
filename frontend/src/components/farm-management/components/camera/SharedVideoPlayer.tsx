import React, { useEffect, useRef, useState } from 'react';
import { useSharedStream } from './SharedStreamProvider';

interface SharedVideoPlayerProps {
  className?: string;
  containerRef?: React.RefObject<HTMLDivElement | null>;
  onError?: (error: string) => void;
}

const SharedVideoPlayer: React.FC<SharedVideoPlayerProps> = ({
  className = '',
  containerRef,
  onError,
}) => {
  const { stream, status, error } = useSharedStream();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (videoRef.current && stream) {
      // Attach shared stream to video element
      videoRef.current.srcObject = stream;
      console.log('[SharedVideoPlayer] Stream attached');
    }
  }, [stream]);

  useEffect(() => {
    if (error && onError) {
      onError(error);
    }
  }, [error, onError]);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    console.error('[SharedVideoPlayer] Video element error:', e);
    const videoError = (e.target as HTMLVideoElement).error;
    if (videoError && onError) {
      onError(`Video error: ${videoError.message}`);
    }
  };

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      className={`w-full h-full ${className}`}
      onError={handleVideoError}
      style={{ objectFit: 'cover' }}
      preload="none"
    />
  );
};

export default SharedVideoPlayer;
