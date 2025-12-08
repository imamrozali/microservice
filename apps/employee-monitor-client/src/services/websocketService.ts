import { io, Socket } from 'socket.io-client';

interface UserLoginEvent {
  event: string;
  userId: number;
  email: string;
  full_name: string;
  timestamp: string;
  message: string;
}

class WebSocketService {
  private socket: Socket | null = null;
  private readonly AUTH_SERVICE_URL = import.meta.env.VITE_AUTH_SERVICE_URL || 'http://localhost:3001';

  connect() {
    if (this.socket?.connected) {
      console.log('WebSocket already connected');
      return this.socket;
    }

    this.socket = io(`${this.AUTH_SERVICE_URL}/auth`, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected:', this.socket?.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('WebSocket disconnected manually');
    }
  }

  onUserLogin(callback: (data: UserLoginEvent) => void) {
    if (!this.socket) {
      console.warn('WebSocket not connected. Call connect() first.');
      return;
    }

    this.socket.on('user-login', (data) => {
      console.log('📨 Received user-login event:', data);
      callback(data);
    });
  }

  offUserLogin() {
    if (this.socket) {
      this.socket.off('user-login');
    }
  }

  getSocket() {
    return this.socket;
  }

  isConnected() {
    return this.socket?.connected || false;
  }
}

export const websocketService = new WebSocketService();
