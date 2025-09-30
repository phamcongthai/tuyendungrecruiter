import React, { useState } from 'react';
import { BellOutlined } from '@ant-design/icons';
import { Badge, Button, Tooltip, Dropdown } from 'antd';
import { useNotifications } from '../contexts/NotificationContext';
import NotificationDropdown from './NotificationDropdown';

const NotificationIcon: React.FC = () => {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const { unreadCount, isConnected, refreshNotifications } = useNotifications();

  const handleDropdownVisibleChange = async (visible: boolean) => {
    setIsDropdownVisible(visible);
    
    if (visible) {
      // Truy vấn thông báo khi mở dropdown
      await refreshNotifications();
    }
  };

  const handleRefresh = () => {
    // Refresh notifications khi user click refresh trong dropdown
    refreshNotifications();
  };

  return (
    <Tooltip title={isConnected ? "Thông báo" : "Đang kết nối..."}>
      <Dropdown
        dropdownRender={() => <NotificationDropdown onRefresh={handleRefresh} />}
        trigger={['click']}
        placement="bottomRight"
        open={isDropdownVisible}
        onOpenChange={handleDropdownVisibleChange}
        overlayClassName="notification-dropdown"
      >
        <Button
          type="text"
          className="notification-icon-btn"
          icon={
            <Badge 
              count={unreadCount} 
              size="small"
              style={{ 
                backgroundColor: '#ff4d4f',
                fontSize: '10px',
                minWidth: '16px',
                height: '16px',
                lineHeight: '16px',
                padding: '0 4px'
              }}
            >
              <BellOutlined 
                style={{ 
                  fontSize: '18px', 
                  color: isConnected ? '#00B14F' : '#d9d9d9' 
                }} 
              />
            </Badge>
          }
        />
      </Dropdown>
    </Tooltip>
  );
};

export default NotificationIcon;
