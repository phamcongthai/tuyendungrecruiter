import { apiClient } from './apiClient';

export interface Notification {
  _id: string;
  userId: string;
  message: string;
  type:
    | 'NEW_APPLICATION'
    | 'APPLICATION_VIEWED'
    | 'APPLICATION_PASSED'
    | 'APPLICATION_REJECTED'
    | 'INTERVIEW_INVITED'
    | 'INTERVIEW_RESULT'
    | 'OFFER_SENT'
    | 'OFFER_RESPONSE'
    | 'HIRED'
    | 'SYSTEM'
    | 'MESSAGE'
    | 'OTHER'
    | 'application_submitted' // backward compat
    | 'system' // backward compat
    | 'message' // backward compat
    | 'other'; // backward compat
  isRead: boolean;
  readAt?: string;
  deleted: boolean;
  applicationId?: string;
  jobId?: string;
  applicantId?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNotificationDto {
  userId: string;
  message: string;
  type?: Notification['type'];
}

export interface UpdateNotificationDto {
  isRead?: boolean;
  message?: string;
}

export const notificationsApi = {
  // Lấy tất cả thông báo của recruiter hiện tại
  getNotifications: async (recruiterId: string): Promise<Notification[]> => {
    const response = await apiClient.get(`/notifications?userId=${recruiterId}&audience=recruiter`);
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
