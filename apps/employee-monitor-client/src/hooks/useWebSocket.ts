import { useEffect, useState } from 'react';
import { websocketService } from '../services/websocketService.js';

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
    const socket = websocketService.connect();

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    websocketService.onUserLogin((data: UserLoginEvent) => {
      setLastLoginEvent(data);
      
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('User Login Alert', {
          body: `${data.full_name} (${data.email}) logged in at ${new Date(data.timestamp).toLocaleTimeString()}`,
          icon: '/vite.svg',
        });
      }
    });

    return () => {
      websocketService.offUserLogin();
      websocketService.disconnect();
    };
  }, []);

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
