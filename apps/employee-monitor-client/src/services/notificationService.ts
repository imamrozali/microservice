import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3004/api';

export interface Notification {
  id: string;
  user_id: string;
  notification_type: string;
  title: string;
  message: string;
  metadata?: any;
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

export const notificationService = {
  async getAllNotifications(userId?: string, isRead?: boolean): Promise<Notification[]> {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    if (isRead !== undefined) params.append('isRead', isRead.toString());
    
    const response = await axios.get(`${API_URL}/notifications?${params.toString()}`);
    return response.data;
  },

  async getNotificationById(id: string): Promise<Notification> {
    const response = await axios.get(`${API_URL}/notifications/${id}`);
    return response.data;
  },

  async markAsRead(id: string): Promise<void> {
    await axios.put(`${API_URL}/notifications/${id}/read`);
  },

  async markAllAsRead(userId: string): Promise<void> {
    await axios.put(`${API_URL}/notifications/user/${userId}/read-all`);
  },

  async deleteNotification(id: string): Promise<void> {
    await axios.delete(`${API_URL}/notifications/${id}`);
  },
};
