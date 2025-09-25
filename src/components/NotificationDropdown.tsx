import React from 'react';
import { useNavigate } from 'react-router-dom';
import { List, Avatar, Typography, Button, Space, Empty, Spin, Tooltip } from 'antd';
import { 
  CheckCircleOutlined, 
  DeleteOutlined, 
  ReloadOutlined,
  FileTextOutlined,
  SettingOutlined,
  MessageOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { useNotifications } from '../contexts/NotificationContext';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const { Text, Paragraph } = Typography;

interface NotificationDropdownProps {
  onRefresh?: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ onRefresh }) => {
  const navigate = useNavigate();
  const { 
    notifications, 
    isLoading, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    refreshNotifications 
  } = useNotifications();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'application_submitted':
        return <FileTextOutlined style={{ color: '#52c41a' }} />;
      case 'system':
        return <SettingOutlined style={{ color: '#1890ff' }} />;
      case 'message':
        return <MessageOutlined style={{ color: '#722ed1' }} />;
      default:
        return <InfoCircleOutlined style={{ color: '#faad14' }} />;
    }
  };

  const getNotificationTypeText = (type: string) => {
    switch (type) {
      case 'application_submitted':
        return 'Đơn ứng tuyển';
      case 'system':
        return 'Hệ thống';
      case 'message':
        return 'Tin nhắn';
      default:
        return 'Khác';
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead(notificationId);
  };

  const handleDelete = async (notificationId: string) => {
    await deleteNotification(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleRefresh = async () => {
    await refreshNotifications();
    if (onRefresh) {
      onRefresh();
    }
  };

  const sortedNotifications = React.useMemo(() => {
    return [...notifications].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [notifications]);

  const dropdownContent = (
    <div 
      className="notification-dropdown-content"
      style={{ 
        width: '360px', 
        maxHeight: '480px', 
        overflow: 'hidden',
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
      }}>
      {/* Header */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', borderRadius: '8px 8px 0 0' }}>
        <span style={{ fontWeight: 700, fontSize: 14 }}>Thông báo {unreadCount > 0 ? `(${unreadCount})` : ''}</span>
        {unreadCount > 0 ? (
          <Button type="link" size="small" onClick={handleMarkAllAsRead} style={{ padding: 0 }}>
            Đánh dấu tất cả đã đọc
          </Button>
        ) : (
          <Button type="link" size="small" onClick={handleRefresh} style={{ padding: 0 }}>
            Làm mới
          </Button>
        )}
      </div>

      {/* Content */}
      <div style={{ 
        maxHeight: '400px', 
        overflowY: 'auto',
        padding: '8px 0'
      }}>
        {isLoading ? (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '200px' 
          }}>
            <Spin size="large" />
          </div>
        ) : sortedNotifications.length === 0 ? (
          <Empty 
            description="Không có thông báo nào"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            style={{ margin: '40px 0' }}
          >
            <p style={{ color: '#999', fontSize: '14px' }}>
              Bạn chưa có thông báo nào. Thông báo mới sẽ xuất hiện ở đây.
            </p>
          </Empty>
        ) : (
          <List
            dataSource={sortedNotifications}
            renderItem={(notification) => (
              <List.Item
                key={notification._id}
                style={{
                  padding: '10px 14px',
                  backgroundColor: '#fff',
                  borderLeft: notification.isRead ? '3px solid transparent' : '3px solid #52c41a',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  borderBottom: '1px solid #f5f5f5'
                }}
                onClick={async () => {
                  // Nếu là thông báo đơn ứng tuyển, điều hướng tới trang ứng viên
                  if (notification.type === 'application_submitted') {
                    try {
                      if (!notification.isRead) {
                        await handleMarkAsRead(notification._id);
                      }
                    } catch {}
                    navigate('/applications');
                    return;
                  }
                }}
                actions={[
                  !notification.isRead && (
                    <Tooltip title="Đánh dấu đã đọc" key="read">
                      <Button
                        type="text"
                        icon={<CheckCircleOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(notification._id);
                        }}
                        size="small"
                      />
                    </Tooltip>
                  ),
                  <Tooltip title="Xóa" key="del">
                    <Button
                      type="text"
                      icon={<DeleteOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(notification._id);
                      }}
                      size="small"
                      danger
                    />
                  </Tooltip>
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar 
                      icon={getNotificationIcon(notification.type)} 
                      style={{ 
                        backgroundColor: notification.isRead ? '#f0f0f0' : '#52c41a' 
                      }}
                    />
                  }
                  title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text 
                        strong={!notification.isRead}
                        style={{ 
                          color: notification.isRead ? '#666' : '#000',
                          fontSize: '14px'
                        }}
                      >
                        {getNotificationTypeText(notification.type)}
                      </Text>
                      <Text 
                        type="secondary" 
                        style={{ fontSize: '12px' }}
                      >
                        {dayjs(notification.createdAt).fromNow()}
                      </Text>
                    </div>
                  }
                  description={
                    <Paragraph
                      style={{ 
                        margin: 0,
                        color: '#444',
                        fontSize: '13px',
                        lineHeight: '1.4'
                      }}
                      ellipsis={{ rows: 2, expandable: false }}
                    >
                      {notification.message}
                    </Paragraph>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </div>
    </div>
  );

  return dropdownContent;
};

export default NotificationDropdown;
