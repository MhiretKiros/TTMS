// src/app/contexts/NotificationContext.tsx
'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import axios from 'axios';

export interface NotificationItem {
  id: string;
  message: string;
  link: string;
  read: boolean;
  role: string;
  createdAt: string;
}

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  isLoading: boolean;
  addNotification: (message: string, link: string, role: string) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/notifications/unread`);
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/notifications/count`);
      setUnreadCount(response.data.count || 0);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const refreshNotifications = async () => {
    await Promise.all([fetchNotifications(), fetchUnreadCount()]);
  };

  useEffect(() => {
    refreshNotifications();
    
    // Set up polling for real-time updates
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const addNotification = async (message: string, link: string, role: string) => {
    try {
      await axios.post(`${API_BASE_URL}/api/notifications`, { message, link, role });
      await refreshNotifications();
    } catch (error) {
      console.error('Failed to add notification:', error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await axios.post(`${API_BASE_URL}/api/notifications/mark-as-read/${id}`);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount(prev => prev - 1);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
      setUnreadCount(prev => 
        prev - (notifications.find(n => n.id === id)?.read ? 0 : 1
      ));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/notifications/mark-all-read`);
      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        addNotification,
        markAsRead,
        deleteNotification,
        markAllAsRead,
        fetchNotifications,
        fetchUnreadCount,
        refreshNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};