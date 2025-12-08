import { useEffect, useState } from 'react';
import { websocketService } from '../services/websocket.service';
import dayjs from 'dayjs';

interface UserLoginEvent {
  event: string;
  userId: number;
  email: string;
  full_name: string;
  timestamp: string;
  message: string;
}

export const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastLoginEvent, setLastLoginEvent] = useState<UserLoginEvent | null>(null);

  useEffect(() => {
    // Connect to WebSocket
    const socket = websocketService.connect();

    // Update connection status
    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Listen for user login events
    websocketService.onUserLogin((data: UserLoginEvent) => {
      setLastLoginEvent(data);
      
      // Optional: Show notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('User Login Alert', {
          body: `${data.full_name} (${data.email}) logged in at ${dayjs(data.timestamp).format('HH:mm:ss')}`,
          icon: '/vite.svg',
        });
      }
    });

    // Cleanup on unmount
    return () => {
      websocketService.offUserLogin();
      websocketService.disconnect();
    };
  }, []);

  // Request notification permission
  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  return {
    isConnected,
    lastLoginEvent,
    requestNotificationPermission,
  };
};
