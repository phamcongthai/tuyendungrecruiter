import React from 'react';
import { 
  DashboardOutlined, 
  FileTextOutlined, 
  UserOutlined, 
  BarChartOutlined,
  SettingOutlined,
  TeamOutlined,
  BankOutlined,
  RobotOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  interface MenuItem {
    key: string;
    icon: React.ReactNode;
    label: string;
    badge?: string;
  }

  const menuSections: { title: string; items: MenuItem[] }[] = [
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
        },
        {
          key: '/ai',
          icon: <RobotOutlined />,
          label: 'Trợ lý AI',
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