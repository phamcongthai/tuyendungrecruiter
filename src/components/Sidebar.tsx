import React from 'react';
import { 
  DashboardOutlined, 
  FileTextOutlined, 
  UserOutlined, 
  BarChartOutlined,
  SettingOutlined,
  BellOutlined,
  TeamOutlined,
  StarOutlined,
  BankOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuSections = [
    {
      title: 'Tổng quan',
      items: [
        {
          key: '/dashboard',
          icon: <DashboardOutlined />,
          label: 'Bảng điều khiển',
        },
        {
          key: '/profile',
          icon: <UserOutlined />,
          label: 'Hồ sơ của tôi',
        },
        {
          key: '/company',
          icon: <BankOutlined />,
          label: 'Quản lý công ty',
        }
      ]
    },
    {
      title: 'Quản lý tuyển dụng',
      items: [
        {
          key: '/jobs',
          icon: <FileTextOutlined />,
          label: 'Tin tuyển dụng',
        },
      ]
    },
    {
      title: 'Ứng viên',
      items: [
        {
          key: '/applications',
          icon: <TeamOutlined />,
          label: 'Tất cả ứng viên',
        },
        {
          key: '/applications/pending',
          icon: <StarOutlined />,
          label: 'Chờ xử lý',
          badge: '5'
        },
        {
          key: '/applications/reviewed',
          icon: <UserOutlined />,
          label: 'Đã xem',
        }
      ]
    },
    {
      title: 'Báo cáo & Cài đặt',
      items: [
        {
          key: '/analytics',
          icon: <BarChartOutlined />,
          label: 'Thống kê',
        },
        {
          key: '/notifications',
          icon: <BellOutlined />,
          label: 'Thông báo',
          badge: '3'
        },
        {
          key: '/settings',
          icon: <SettingOutlined />,
          label: 'Cài đặt',
        }
      ]
    }
  ];

  const handleMenuClick = (key: string) => {
    navigate(key);
  };

  const isActive = (key: string) => {
    return location.pathname === key;
  };

  return (
    <aside className="modern-sidebar">
      {/* Sidebar Menu */}
      <nav className="sidebar-menu">
        {menuSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="menu-section">
            <div className="menu-section-title">{section.title}</div>
            {section.items.map((item) => (
              <a
                key={item.key}
                className={`menu-item ${isActive(item.key) ? 'active' : ''}`}
                onClick={() => handleMenuClick(item.key)}
              >
                <span className="menu-icon">{item.icon}</span>
                <span className="menu-text">{item.label}</span>
                {item.badge && (
                  <span className="menu-badge">{item.badge}</span>
                )}
              </a>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;