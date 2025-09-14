import { apiClient } from './apiClient';

export interface Notification {
  _id: string;
  userId: string;
  message: string;
  type: 'application_submitted' | 'system' | 'message' | 'other';
  isRead: boolean;
  readAt?: string;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNotificationDto {
  userId: string;
  message: string;
  type?: 'application_submitted' | 'system' | 'message' | 'other';
}

export interface UpdateNotificationDto {
  isRead?: boolean;
  message?: string;
}

export const notificationsApi = {
  // Lấy tất cả thông báo của recruiter hiện tại
  getNotifications: async (recruiterId: string): Promise<Notification[]> => {
    const response = await apiClient.get(`/notifications?userId=${recruiterId}`);
    return response.data;
  },

  // Lấy thông báo theo ID
  getNotificationById: async (id: string): Promise<Notification> => {
    const response = await apiClient.get(`/notifications/${id}`);
    return response.data;
  },

  // Tạo thông báo mới
  createNotification: async (data: CreateNotificationDto): Promise<Notification> => {
    const response = await apiClient.post('/notifications', data);
    return response.data;
  },

  // Cập nhật thông báo (chủ yếu để đánh dấu đã đọc)
  updateNotification: async (id: string, data: UpdateNotificationDto): Promise<Notification> => {
    const response = await apiClient.patch(`/notifications/${id}`, data);
    return response.data;
  },

  // Đánh dấu tất cả thông báo là đã đọc
  markAllAsRead: async (recruiterId: string): Promise<void> => {
    const notifications = await notificationsApi.getNotifications(recruiterId);
    const unreadNotifications = notifications.filter(n => !n.isRead);
    
    await Promise.all(
      unreadNotifications.map(notification =>
        notificationsApi.updateNotification(notification._id, { isRead: true })
      )
    );
  },

  // Xóa thông báo
  deleteNotification: async (id: string): Promise<void> => {
    await apiClient.delete(`/notifications/${id}`);
  },
};
