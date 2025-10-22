import React, { useEffect, useRef, useState } from 'react';

export type ConnectionStatus = 'connecting' | 'connected' | 'error';

interface WebRTCPlayerProps {
  streamUrl: string;
  isPaused?: boolean;
  onStatusChange?: (status: ConnectionStatus, error?: string) => void;
  className?: string;
}

const WebRTCPlayer: React.FC<WebRTCPlayerProps> = ({
  streamUrl,
  isPaused = false,
  onStatusChange,
  className = '',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Store callback in ref to prevent dependency changes from causing reconnections
  const onStatusChangeRef = useRef(onStatusChange);
  useEffect(() => {
    onStatusChangeRef.current = onStatusChange;
  }, [onStatusChange]);

  useEffect(() => {
    // Skip WebRTC connection if paused
    if (isPaused) {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject = null;
      }
      onStatusChangeRef.current?.('connecting');
      return;
    }

    // Create WebRTC connection with STUN servers
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' }
      ],
      iceCandidatePoolSize: 10
    });
    
    onStatusChangeRef.current?.('connecting');
    setIsPlaying(false);

    // Log ICE connection state changes to help with debugging
    pc.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', pc.iceConnectionState);
      if (pc.iceConnectionState === 'failed' || 
          pc.iceConnectionState === 'disconnected' ||
          pc.iceConnectionState === 'closed') {
        onStatusChangeRef.current?.('error', `ICE connection ${pc.iceConnectionState}`);
      }
    };

    // Handle ICE candidate events
    pc.onicecandidate = (event) => {
      console.log('ICE candidate:', event.candidate);
    };

    pc.ontrack = (event) => {
      console.log('Track received:', event.track.kind);
      if (videoRef.current) {
        videoRef.current.srcObject = event.streams[0];
        
        // Listen for video data to actually start flowing
        const checkVideoFlowing = () => {
          if (videoRef.current && videoRef.current.videoWidth > 0) {
            console.log('Video is flowing! Size:', videoRef.current.videoWidth, 'x', videoRef.current.videoHeight);
            onStatusChangeRef.current?.('connected');
            setIsPlaying(true);
          } else {
            // Keep checking until video flows or timeout occurs
            setTimeout(checkVideoFlowing, 500);
          }
        };
        
        checkVideoFlowing();
        
        // Set a timeout in case video never flows
        // Increased from 10000 to 30000 (30 seconds) to accommodate slower streams
        setTimeout(() => {
          if (!isPlaying) {
            console.error('Video not flowing after timeout');
            onStatusChangeRef.current?.('error', 'Video stream received but no data is flowing');
          }
        }, 30000);
      }
    };

    pc.onconnectionstatechange = () => {
      console.log('Connection state:', pc.connectionState);
      if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
        onStatusChangeRef.current?.('error', `Connection ${pc.connectionState}`);
      }
    };

    const connect = async () => {
      try {
        // Video only - skip audio since server is ignoring it
        pc.addTransceiver('video', { direction: 'recvonly' });

        // Create an offer
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        // Wait for ICE gathering to complete
        const offerPromise = new Promise<RTCSessionDescriptionInit>((resolve) => {
          if (pc.iceGatheringState === 'complete') {
            resolve(pc.localDescription as RTCSessionDescriptionInit);
          } else {
            const checkState = () => {
              if (pc.iceGatheringState === 'complete') {
                pc.removeEventListener('icegatheringstatechange', checkState);
                resolve(pc.localDescription as RTCSessionDescriptionInit);
              }
            };
            pc.addEventListener('icegatheringstatechange', checkState);
          }
        });

        // Wait up to 5 seconds for ICE gathering
        const timeoutPromise = new Promise<RTCSessionDescriptionInit>((_, reject) => {
          setTimeout(() => reject(new Error('ICE gathering timed out')), 5000);
        });

        // Get the final offer with ICE candidates
        const finalOffer = await Promise.race([offerPromise, timeoutPromise])
          .catch(() => pc.localDescription as RTCSessionDescriptionInit);

        console.log("Sending offer to server...");
        
        // Send the offer to the server
        const response = await fetch(streamUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/sdp',
          },
          body: finalOffer.sdp,
        });

        if (!response.ok) {
          throw new Error(`Server returned ${response.status}`);
        }

        // Get the server's answer
        const sdp = await response.text();
        await pc.setRemoteDescription(
          new RTCSessionDescription({ type: 'answer', sdp })
        );
        
        console.log("Remote description set successfully");
      } catch (error) {
        console.error('WebRTC connection failed:', error);
        onStatusChangeRef.current?.('error', error instanceof Error ? error.message : String(error));
      }
    };

    connect();

    // Clean up when component unmounts or paused state changes
    return () => {
      pc.close();
    };
  }, [isPaused, streamUrl]); // onStatusChange removed from dependencies

  // Handle video playing events
  const handleVideoPlay = () => {
    console.log('Video play event triggered');
    setIsPlaying(true);
  };
  
  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    console.error('Video error:', e);
    onStatusChangeRef.current?.('error', `Video element error: ${(e.target as HTMLVideoElement).error?.message || 'Unknown error'}`);
  };

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      className={`w-full h-full ${className}`}
      onPlay={handleVideoPlay}
      onError={handleVideoError}
    />
  );
};

export default WebRTCPlayer;