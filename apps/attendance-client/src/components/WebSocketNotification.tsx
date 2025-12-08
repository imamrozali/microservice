import { useEffect, useState } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import dayjs from '../utils/dayjs';

interface UserLoginEvent {
  event: string;
  userId: number;
  email: string;
  full_name: string;
  timestamp: string;
  message: string;
  id?: string;
}

export const WebSocketNotification = () => {
  const { isConnected, lastLoginEvent, requestNotificationPermission } = useWebSocket();
  const [notifications, setNotifications] = useState<UserLoginEvent[]>([]);

  useEffect(() => {
    // Request notification permission on mount
    void requestNotificationPermission();
  }, [requestNotificationPermission]);

  useEffect(() => {
    if (lastLoginEvent) {
      // Create unique ID for notification
      const notificationWithId = {
        ...lastLoginEvent,
        id: `${lastLoginEvent.userId}-${lastLoginEvent.timestamp}`,
      };

      // Check if notification already exists
      const exists = notifications.some(
        (notif) => 
          notif.userId === lastLoginEvent.userId && 
          notif.timestamp === lastLoginEvent.timestamp
      );

      if (!exists) {
        // Add to stack
        setNotifications((prev) => [notificationWithId, ...prev]);

        // Auto remove after 5 seconds
        setTimeout(() => {
          setNotifications((prev) => prev.filter((n) => n.id !== notificationWithId.id));
        }, 5000);
      }
    }
  }, [lastLoginEvent, notifications]);

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {/* Connection Status */}
      <div className={`px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 ${
        isConnected ? 'bg-green-500' : 'bg-red-500'
      } text-white`}>
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-white animate-pulse' : 'bg-white'}`} />
        <span className="text-sm font-medium">
          {isConnected ? 'WebSocket Connected' : 'WebSocket Disconnected'}
        </span>
      </div>

      {/* Stacked Notifications */}
      <div className="space-y-2 max-h-[80vh] overflow-y-auto">
        {notifications.map((notification, index) => (
          <div 
            key={notification.id}
            className="bg-blue-500 text-white px-6 py-4 rounded-lg shadow-lg animate-slide-in"
            style={{
              animationDelay: `${index * 50}ms`,
            }}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-lg">🔔 User Login Alert</h3>
              <button
                onClick={() => removeNotification(notification.id!)}
                className="text-white hover:text-gray-200 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="space-y-1 text-sm">
              <p><strong>Name:</strong> {notification.full_name}</p>
              <p><strong>Email:</strong> {notification.email}</p>
              <p><strong>User ID:</strong> {notification.userId}</p>
              <p><strong>Time:</strong> {dayjs(notification.timestamp).format('DD/MM/YYYY HH:mm:ss')}</p>
              <p className="mt-2 text-blue-100">{notification.message}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Notification Counter */}
      {notifications.length > 0 && (
        <div className="bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg text-center text-sm">
          {notifications.length} active notification{notifications.length > 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};
