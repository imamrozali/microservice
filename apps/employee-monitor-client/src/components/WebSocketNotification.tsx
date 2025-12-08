import { useEffect, useState, useRef } from 'react';
import { useWebSocket } from '../hooks/useWebSocket.js';
import { authService } from '../services/authService.js';

interface UserLoginEvent {
  event: string;
  userId: number;
  email: string;
  full_name: string;
  timestamp: string;
  message: string;
  id?: string;
  isRead?: boolean;
}

export const WebSocketNotification = () => {
  const { isConnected, lastLoginEvent, requestNotificationPermission } = useWebSocket();
  const [notifications, setNotifications] = useState<UserLoginEvent[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsAdmin(authService.isAdmin());
    void requestNotificationPermission();
  }, [requestNotificationPermission]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  useEffect(() => {
    if (lastLoginEvent && isAdmin) {
      const notificationId = `${lastLoginEvent.userId}-${lastLoginEvent.timestamp}-${Date.now()}`;
      const notificationWithId = {
        ...lastLoginEvent,
        id: notificationId,
        isRead: false,
      };

      const exists = notifications.some(
        (notif) => 
          notif.userId === lastLoginEvent.userId && 
          notif.timestamp === lastLoginEvent.timestamp
      );

      if (!exists) {
        setNotifications((prev) => [notificationWithId, ...prev]);
      }
    }
  }, [lastLoginEvent, isAdmin, notifications]);

  const markAsRead = (id: string) => {
    setNotifications((prev) => 
      prev.map((notif) => 
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="fixed top-20 right-4 z-50" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <div className="relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="relative bg-white hover:bg-gray-50 text-gray-800 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 transition-all"
          type="button"
        >
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          <span className="text-2xl">🔔</span>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute top-full right-0 mt-2 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 max-h-[600px] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-blue-500 text-white px-4 py-3 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg">Notifications</h3>
                <p className="text-xs text-blue-100">
                  {unreadCount} unread, {notifications.length} total
                </p>
              </div>
              {notifications.length > 0 && (
                <button
                  onClick={clearAllNotifications}
                  className="text-xs bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded transition-colors"
                  type="button"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <span className="text-4xl">🔕</span>
                  <p className="mt-2">No notifications</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => {
                      if (notification.id && !notification.isRead) {
                        markAsRead(notification.id);
                      }
                    }}
                    className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                      !notification.isRead ? 'bg-blue-50' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Unread Indicator */}
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900 text-sm">
                            🔔 User Login Alert
                          </h4>
                          <span className="text-xs text-gray-400 whitespace-nowrap">
                            {new Date(notification.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-700 font-medium mb-1">
                          {notification.full_name}
                        </p>
                        
                        <p className="text-xs text-gray-500 mb-1">
                          {notification.email}
                        </p>
                        
                        <p className="text-xs text-gray-400">
                          {new Date(notification.timestamp).toLocaleDateString()} • ID: {notification.userId}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-4 py-2 text-center border-t border-gray-200">
              <span className={`text-xs ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                {isConnected ? '● Connected' : '● Disconnected'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
