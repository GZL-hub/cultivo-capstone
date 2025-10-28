import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'error';

interface StreamContextValue {
  stream: MediaStream | null;
  status: ConnectionStatus;
  error: string | null;
  reconnect: () => void;
}

const StreamContext = createContext<StreamContextValue | null>(null);

interface SharedStreamProviderProps {
  streamUrl: string;
  enabled?: boolean;
  children: React.ReactNode;
}

export const SharedStreamProvider: React.FC<SharedStreamProviderProps> = ({
  streamUrl,
  enabled = true,
  children,
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);

  const connect = async () => {
    // Clean up existing connection
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }

    if (!enabled) {
      setStatus('idle');
      setStream(null);
      return;
    }

    setStatus('connecting');
    setError(null);

    try {
      // Create WebRTC connection with STUN servers
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ],
        iceCandidatePoolSize: 10,
      });

      pcRef.current = pc;

      // Handle ICE connection state changes
      pc.oniceconnectionstatechange = () => {
        console.log('[SharedStream] ICE connection state:', pc.iceConnectionState);

        if (pc.iceConnectionState === 'failed' ||
            pc.iceConnectionState === 'disconnected') {
          setStatus('error');
          setError(`ICE connection ${pc.iceConnectionState}`);

          // Auto-reconnect after delay
          scheduleReconnect();
        } else if (pc.iceConnectionState === 'closed') {
          setStatus('idle');
          setStream(null);
        }
      };

      // Handle connection state changes
      pc.onconnectionstatechange = () => {
        console.log('[SharedStream] Connection state:', pc.connectionState);

        if (pc.connectionState === 'failed' ||
            pc.connectionState === 'disconnected') {
          setStatus('error');
          setError(`Connection ${pc.connectionState}`);
          scheduleReconnect();
        }
      };

      // Handle received tracks
      pc.ontrack = (event) => {
        console.log('[SharedStream] Track received:', event.track.kind);

        if (event.streams && event.streams[0]) {
          setStream(event.streams[0]);
          setStatus('connected');
          setError(null);
          reconnectAttemptsRef.current = 0; // Reset reconnect counter on success

          console.log('[SharedStream] Stream ready, tracks:',
            event.streams[0].getTracks().map(t => t.kind));
        }
      };

      // Request video only
      pc.addTransceiver('video', { direction: 'recvonly' });

      // Create and send offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Wait for ICE gathering
      await new Promise<void>((resolve) => {
        if (pc.iceGatheringState === 'complete') {
          resolve();
        } else {
          const checkState = () => {
            if (pc.iceGatheringState === 'complete') {
              pc.removeEventListener('icegatheringstatechange', checkState);
              resolve();
            }
          };
          pc.addEventListener('icegatheringstatechange', checkState);

          // Timeout after 5 seconds
          setTimeout(() => resolve(), 5000);
        }
      });

      console.log('[SharedStream] Sending offer to server...');

      // Send offer to server
      const response = await fetch(streamUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/sdp' },
        body: pc.localDescription!.sdp,
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      // Set remote description from answer
      const sdp = await response.text();
      await pc.setRemoteDescription(
        new RTCSessionDescription({ type: 'answer', sdp })
      );

      console.log('[SharedStream] Connection established');

    } catch (err) {
      console.error('[SharedStream] Connection failed:', err);
      setStatus('error');
      setError(err instanceof Error ? err.message : String(err));
      scheduleReconnect();
    }
  };

  const scheduleReconnect = () => {
    // Clear existing timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    // Exponential backoff: 2s, 4s, 8s, 16s, max 30s
    reconnectAttemptsRef.current++;
    const delay = Math.min(2000 * Math.pow(2, reconnectAttemptsRef.current - 1), 30000);

    console.log(`[SharedStream] Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current})`);

    reconnectTimeoutRef.current = setTimeout(() => {
      connect();
    }, delay);
  };

  const reconnect = () => {
    reconnectAttemptsRef.current = 0;
    connect();
  };

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (pcRef.current) {
        pcRef.current.close();
      }
    };
  }, [streamUrl, enabled]);

  const value: StreamContextValue = {
    stream,
    status,
    error,
    reconnect,
  };

  return (
    <StreamContext.Provider value={value}>
      {children}
    </StreamContext.Provider>
  );
};

export const useSharedStream = () => {
  const context = useContext(StreamContext);
  if (!context) {
    throw new Error('useSharedStream must be used within SharedStreamProvider');
  }
  return context;
};
