import { Users, Calendar, LogOut, Home, Menu, X, Bell, ExternalLink } from 'lucide-react';
import { Link, useLocation, useNavigate } from '@tanstack/react-router';
import { authService } from '../services/authService.js';
import { useState, useEffect, useRef } from 'react';
import { notificationService, type Notification } from '../services/notificationService.js';
import { io } from 'socket.io-client';

const NOTIFICATION_SERVICE_URL = import.meta.env.VITE_NOTIFICATION_SERVICE_URL || 'http://localhost:3004';

export const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(authService.getUser());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const isAdmin = authService.isAdmin();

  // Listen for storage changes to update user data
  useEffect(() => {
    const handleStorageChange = () => {
      setUser(authService.getUser());
    };

    // Listen to custom event for profile updates
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('profileUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('profileUpdated', handleStorageChange);
    };
  }, []);

  const handleLogout = async () => {
    await authService.logout();
    window.location.href = '/login';
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/employees', label: 'Employees', icon: Users },
    { path: '/attendance', label: 'Attendance', icon: Calendar },
  ];

  // Load notifications from API
  const loadNotifications = async () => {
    try {
      const allNotifications = await notificationService.getAllNotifications();
      setTotalCount(allNotifications.length);
      // Show only first 10 notifications
      setNotifications(allNotifications.slice(0, 10));
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  // Initial load and WebSocket connection
  useEffect(() => {
    if (isAdmin) {
      loadNotifications();

      // Connect to WebSocket for real-time updates
      const socketConnection = io(NOTIFICATION_SERVICE_URL, {
        transports: ['websocket'],
      });

      socketConnection.on('connect', () => {
        console.log('Connected to notification service');
        setIsSocketConnected(true);
      });

      socketConnection.on('disconnect', () => {
        console.log('Disconnected from notification service');
        setIsSocketConnected(false);
      });

      socketConnection.on('new-notification', (notification: Notification) => {
        console.log('New notification received:', notification);
        setNotifications((prev) => [notification, ...prev.slice(0, 9)]);
        setTotalCount((prev) => prev + 1);
      });

      socketConnection.on('notification-read', ({ id }: { id: string }) => {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
        );
        // Reload to update unread count
        loadNotifications();
      });

      return () => {
        socketConnection.disconnect();
      };
    }
    return undefined;
  }, [isAdmin]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };

    if (isNotificationOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotificationOpen]);

  const markAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === id ? { ...notif, is_read: true } : notif
        )
      );
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleShowMore = () => {
    setIsNotificationOpen(false);
    navigate({ to: '/notifications' });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'login':
        return '👤';
      case 'profile_update':
        return '✏️';
      case 'photo_update':
        return '📷';
      case 'password_change':
        return '🔒';
      case 'clock_in':
        return '⏰';
      case 'clock_out':
        return '🏠';
      default:
        return '🔔';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Desktop Navigation */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg mr-3">
                EM
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                <span className="hidden sm:inline">Employee Monitor</span>
                <span className="sm:hidden">EM</span>
              </h1>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:ml-8 md:flex md:space-x-4 lg:space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all ${isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    <span className="hidden lg:inline">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Notification Bell and User Info (Desktop) */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Notification Bell */}
            {isAdmin && (
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                  type="button"
                >
                  <Bell className="w-6 h-6" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                  <div className={`absolute bottom-1 right-1 w-2 h-2 rounded-full ${isSocketConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                </button>

                {/* Notification Dropdown */}
                {isNotificationOpen && (
                  <div className="absolute top-full right-0 mt-2 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 max-h-[600px] overflow-hidden flex flex-col z-50">
                    {/* Header */}
                    <div className="bg-blue-500 text-white px-4 py-3">
                      <h3 className="font-bold text-lg">Notifications</h3>
                      <p className="text-xs text-blue-100">
                        {unreadCount} unread, {totalCount} total
                      </p>
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
                              if (!notification.is_read) {
                                markAsRead(notification.id);
                              }
                            }}
                            className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${!notification.is_read ? 'bg-blue-50' : 'bg-white'
                              }`}
                          >
                            <div className="flex items-start gap-3">
                              {!notification.is_read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                              )}

                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                  <h4 className="font-semibold text-gray-900 text-sm flex items-center gap-1">
                                    <span>{getNotificationIcon(notification.notification_type)}</span>
                                    <span>{notification.title}</span>
                                  </h4>
                                  <span className="text-xs text-gray-400 whitespace-nowrap">
                                    {formatTime(notification.created_at)}
                                  </span>
                                </div>

                                <p className="text-sm text-gray-600">
                                  {notification.message}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Footer with Show More button */}
                    <div className="bg-gray-50 px-4 py-2 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs ${isSocketConnected ? 'text-green-600' : 'text-red-600'}`}>
                          {isSocketConnected ? '● Connected' : '● Disconnected'}
                        </span>
                        {totalCount > 10 && (
                          <button
                            onClick={handleShowMore}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 transition-colors"
                            type="button"
                          >
                            Show More
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user?.full_name}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <img
                src={user?.photo_url || `https://ui-avatars.com/api/?name=${user?.full_name || user?.email}&size=128&background=3b82f6&color=fff`}
                alt="Profile"
                className="w-12 h-12 rounded-full border-2 border-white shadow-lg object-cover"
              />
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all shadow-sm"
            >
              <LogOut className="w-4 h-4 mr-2" />
              <span className="hidden lg:inline">Logout</span>
            </button>
          </div>

          {/* Mobile Menu and Notification Button */}
          <div className="flex items-center gap-2 md:hidden">
            {/* Mobile Notification Bell */}
            {isAdmin && (
              <div className="relative">
                <button
                  onClick={() => {
                    setIsNotificationOpen(!isNotificationOpen);
                    setIsMobileMenuOpen(false);
                  }}
                  className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                  type="button"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
              </div>
            )}

            <button
              onClick={() => {
                setIsMobileMenuOpen(!isMobileMenuOpen);
                setIsNotificationOpen(false);
              }}
              className="inline-flex items-center justify-center p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              type="button"
            >
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Notification Dropdown */}
      {isNotificationOpen && isAdmin && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="max-h-[70vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-blue-500 text-white px-4 py-3">
              <h3 className="font-bold">Notifications</h3>
              <p className="text-xs text-blue-100">
                {unreadCount} unread, {totalCount} total
              </p>
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
                      if (!notification.is_read) {
                        markAsRead(notification.id);
                      }
                    }}
                    className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${!notification.is_read ? 'bg-blue-50' : 'bg-white'
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      {!notification.is_read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900 text-sm flex items-center gap-1">
                            <span>{getNotificationIcon(notification.notification_type)}</span>
                            <span>{notification.title}</span>
                          </h4>
                          <span className="text-xs text-gray-400 whitespace-nowrap">
                            {formatTime(notification.created_at)}
                          </span>
                        </div>

                        <p className="text-sm text-gray-600">
                          {notification.message}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer with Show More button */}
            <div className="bg-gray-50 px-4 py-2 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className={`text-xs ${isSocketConnected ? 'text-green-600' : 'text-red-600'}`}>
                  {isSocketConnected ? '● Connected' : '● Disconnected'}
                </span>
                {totalCount > 10 && (
                  <button
                    onClick={handleShowMore}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 transition-colors"
                    type="button"
                  >
                    Show More
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center px-3 py-3 rounded-lg text-base font-medium transition-all ${isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Mobile User Info */}
          <div className="border-t border-gray-200 px-4 py-4">
            <div className="flex items-center mb-3">
              <img
                src={user?.photo_url || `https://ui-avatars.com/api/?name=${user?.full_name || user?.email}&size=128&background=3b82f6&color=fff`}
                alt="Profile"
                className="w-12 h-12 rounded-full border-2 border-white shadow-lg object-cover"
              />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  {user?.full_name}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};
