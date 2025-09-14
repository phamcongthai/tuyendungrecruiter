import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { notificationsApi } from '../apis/notifications.api';
import type { Notification } from '../apis/notifications.api';
import { useUser } from './UserContext';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  isConnected: boolean;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [, setSocket] = useState<Socket | null>(null);
  const { user } = useUser();

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Khởi tạo Socket.IO connection
  useEffect(() => {
    if (user?.id) {
      const newSocket = io(`${import.meta.env.VITE_API_URL}/notifications`, {
        transports: ['websocket'],
        autoConnect: true,
      });

      newSocket.on('connect', async () => {
        console.log('Connected to notifications socket');
        setIsConnected(true);
        // Join room với recruiterId (user.id trong recruiter app là recruiterId)
        console.log('Joining room with recruiterId:', user.id);
        newSocket.emit('joinRoom', user.id);
        // Load thông báo ban đầu ngay khi kết nối thành công
        try {
          await refreshNotifications();
        } catch (e) {
          // noop
        }
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from notifications socket');
        setIsConnected(false);
      });

      newSocket.on('newNotification', (notification: Notification) => {
        console.log('Received new notification:', notification);
        // Cập nhật ngay lập tức danh sách để badge hiển thị realtime
        setNotifications(prev => [notification, ...prev]);
      });

      newSocket.on('joinedRoom', (data) => {
        console.log('Joined room:', data);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [user?.id]);

  // Tự động tải lần đầu theo user (đảm bảo badge có dữ liệu ngay khi vào trang)
  useEffect(() => {
    if (user?.id) {
      refreshNotifications();
    } else {
      setNotifications([]);
    }
  }, [user?.id]);

  // Fallback polling khi socket mất kết nối để vẫn cập nhật gần realtime
  useEffect(() => {
    if (!user?.id) return;
    if (isConnected) return; // socket realtime đã hoạt động
    const intervalId = setInterval(() => {
      refreshNotifications().catch(() => {});
    }, 30000); // 30s
    return () => clearInterval(intervalId);
  }, [isConnected, user?.id]);

  const refreshNotifications = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const data = await notificationsApi.getNotifications(user.id);
      setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
      // Nếu không có thông báo, set empty array
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await notificationsApi.updateNotification(notificationId, { isRead: true });
      setNotifications(prev =>
        prev.map(n =>
          n._id === notificationId ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user?.id) return;
    
    try {
      await notificationsApi.markAllAsRead(user.id);
      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await notificationsApi.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    isLoading,
    isConnected,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
