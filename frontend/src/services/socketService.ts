import { io, Socket } from 'socket.io-client';

// Socket.IO connection singleton
class SocketService {
  private socket: Socket | null = null;
  private farmId: string | null = null;

  // Initialize Socket.IO connection
  connect(): Socket {
    if (!this.socket) {
      // Use environment variable or default to localhost for development
      const serverUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080';

      this.socket = io(serverUrl, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000,
      });

      // Connection event handlers
      this.socket.on('connect', () => {
        console.log('[Socket.IO] Connected to server');
        // Rejoin farm room if we were previously in one
        if (this.farmId) {
          this.joinFarm(this.farmId);
        }
      });

      this.socket.on('disconnect', (reason) => {
        console.log('[Socket.IO] Disconnected:', reason);
      });

      this.socket.on('connect_error', (error) => {
        console.error('[Socket.IO] Connection error:', error);
      });

      this.socket.on('reconnect', (attemptNumber) => {
        console.log('[Socket.IO] Reconnected after', attemptNumber, 'attempts');
      });
    }

    return this.socket;
  }

  // Join farm-specific room for targeted updates
  joinFarm(farmId: string): void {
    if (!this.socket) {
      this.connect();
    }

    if (this.farmId !== farmId) {
      // Leave previous farm room if exists
      if (this.farmId) {
        this.socket?.emit('leave-farm', this.farmId);
      }

      // Join new farm room
      this.farmId = farmId;
      this.socket?.emit('join-farm', farmId);
      console.log(`[Socket.IO] Joined farm room: ${farmId}`);
    }
  }

  // Leave current farm room
  leaveFarm(): void {
    if (this.farmId && this.socket) {
      this.socket.emit('leave-farm', this.farmId);
      console.log(`[Socket.IO] Left farm room: ${this.farmId}`);
      this.farmId = null;
    }
  }

  // Subscribe to sensor updates
  onSensorUpdate(callback: (data: any) => void): void {
    console.log('[Socket.IO Client] Subscribing to sensor-update events');
    this.socket?.on('sensor-update', callback);
  }

  // Subscribe to camera updates
  onCameraUpdate(callback: (data: any) => void): void {
    this.socket?.on('camera-update', callback);
  }

  // Unsubscribe from sensor updates
  offSensorUpdate(callback?: (data: any) => void): void {
    if (callback) {
      this.socket?.off('sensor-update', callback);
    } else {
      this.socket?.off('sensor-update');
    }
  }

  // Unsubscribe from camera updates
  offCameraUpdate(callback?: (data: any) => void): void {
    if (callback) {
      this.socket?.off('camera-update', callback);
    } else {
      this.socket?.off('camera-update');
    }
  }

  // Disconnect socket
  disconnect(): void {
    if (this.socket) {
      this.leaveFarm();
      this.socket.disconnect();
      this.socket = null;
      console.log('[Socket.IO] Disconnected from server');
    }
  }

  // Get socket instance
  getSocket(): Socket | null {
    return this.socket;
  }

  // Check if connected
  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

// Export singleton instance
export default new SocketService();
