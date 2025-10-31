import React, { useState, useEffect } from 'react';
import { Dropdown, Button, Tooltip } from 'antd';
import { 
  UserOutlined, 
  LogoutOutlined,
  SettingOutlined,
  DashboardOutlined,
  FileTextOutlined,
  PlusOutlined,
  MenuOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { authAPI } from '../apis/auth.api';
import { useUser } from '../contexts/UserContext';
import { profileAPI } from '../apis/profile.api';
import type { RecruiterProfile } from '../types/profile.type';
import NotificationIcon from './NotificationIcon';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [profileData, setProfileData] = useState<RecruiterProfile | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    // Toggle sidebar visibility
    const sidebar = document.querySelector('.modern-sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    if (sidebar && overlay) {
      sidebar.classList.toggle('mobile-open');
      overlay.classList.toggle('active');
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await profileAPI.getProfile();
        if (response.success && response.data) {
          setProfileData(response.data);
        }
      } catch (error) {
        // Silently handle error - profile may not exist yet
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  const handleMenuClick = ({ key }: { key: string }) => {
    switch (key) {
      case 'profile':
        navigate('/profile');
        break;
      case 'dashboard':
        navigate('/dashboard');
        break;
      case 'jobs':
        navigate('/jobs');
        break;
      case 'settings':
        navigate('/settings');
        break;
      case 'logout':
        handleLogout();
        break;
      default:
        break;
    }
  };

  const handleLogout = async () => {
    try {
      const result = await Swal.fire({
        title: 'Xác nhận đăng xuất',
        text: 'Bạn có chắc chắn muốn đăng xuất?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#00B14F',
        cancelButtonColor: '#94a3b8',
        confirmButtonText: 'Đăng xuất',
        cancelButtonText: 'Hủy',
        background: '#fff'
      });

      if (result.isConfirmed) {
        const res = await authAPI.logout();
        localStorage.removeItem('tokenRecruiter');
        Swal.fire({
          icon: 'success',
          title: 'Đăng xuất thành công',
          text: res?.message || 'Hẹn gặp lại bạn!',
          confirmButtonColor: '#00B14F',
          background: '#fff'
        });
        navigate('/login');
      }
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Có lỗi xảy ra',
        text: error.message || 'Vui lòng thử lại',
        confirmButtonColor: '#667eea',
        background: '#fff'
      });
    }
  };

  

  const getAvatarText = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  return (
    <header className="modern-header">
      {/* Mobile Menu Toggle */}
      <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
        <MenuOutlined style={{ fontSize: '18px' }} />
      </button>

      {/* Left side - Brand */}
      <div className="header-brand" onClick={() => navigate('/dashboard')}>
        <div className="brand-logo">
          HW
        </div>
        <div>
          <div className="brand-text">Hiwork</div>
        </div>
        <div className="header-subtitle">
          Nhà tuyển dụng
        </div>
      </div>

      {/* Right side - Actions */}
      <div className="header-actions">
        {/* Create Job Button */}
        <Button 
          className="create-job-btn"
          icon={<PlusOutlined />}
          onClick={() => navigate('/jobs/create')}
        >
          Đăng tin mới
        </Button>
        
        {/* Notifications */}
        <NotificationIcon />
        
        {/* User Profile */}
        <Dropdown 
          menu={{ 
            items: [
              { key: 'profile', label: 'Thông tin tài khoản', icon: <UserOutlined /> },
              { key: 'dashboard', label: 'Bảng điều khiển', icon: <DashboardOutlined /> },
              { key: 'jobs', label: 'Quản lý tin tuyển dụng', icon: <FileTextOutlined /> },
              { key: 'settings', label: 'Cài đặt', icon: <SettingOutlined /> },
              { type: 'divider' },
              { key: 'logout', label: 'Đăng xuất', icon: <LogoutOutlined />, danger: true },
            ],
            onClick: ({ key }) => handleMenuClick({ key } as any),
          }} 
          trigger={['click']} 
          placement="bottomRight"
        >
          <div className="user-profile">
            <div style={{ position: 'relative' }}>
              {profileData?.avatar ? (
                <img 
                  src={profileData.avatar} 
                  alt="Avatar"
                  className="user-avatar"
                  style={{ objectFit: 'cover' }}
                />
              ) : (
                <div className="user-avatar">
                  {getAvatarText(user?.fullName || 'User')}
                </div>
              )}
              {/* Verification Status Badge */}
              {user && (
                <Tooltip 
                  title={user.isVerified ? 'Tài khoản đã xác thực' : 'Tài khoản chưa xác thực'}
                  placement="left"
                >
                  <div
                    style={{
                      position: 'absolute',
                      bottom: -2,
                      right: -2,
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      background: user.isVerified ? '#52c41a' : '#faad14',
                      border: '2px solid white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '8px',
                      color: 'white'
                    }}
                  >
                    {user.isVerified ? (
                      <CheckCircleOutlined style={{ fontSize: '10px' }} />
                    ) : (
                      <ExclamationCircleOutlined style={{ fontSize: '10px' }} />
                    )}
                  </div>
                </Tooltip>
              )}
            </div>
            <div className="user-info">
              <h4>{user?.fullName || 'Nhà tuyển dụng'}</h4>
              <p>{profileData?.company?.name || user?.email || 'Quản lý tuyển dụng'}</p>
            </div>
          </div>
        </Dropdown>
      </div>
    </header>
  );
};

export default Header;