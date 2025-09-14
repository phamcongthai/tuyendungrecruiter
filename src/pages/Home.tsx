import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Typography, Card } from 'antd';
import { UserAddOutlined, LoginOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#f5f7fa', // Màu nền TopCV
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <Card 
      style={{ 
        width: '100%',
        maxWidth: '600px',
        borderRadius: '16px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        border: 'none',
        textAlign: 'center',
        background: '#fff'
      }}
      bodyStyle={{ padding: '60px 40px' }}
      >
      <Title level={1} style={{ 
        margin: '0 0 16px 0', 
        color: '#00b14f', // Xanh TopCV
        fontSize: '48px',
        fontWeight: '700'
      }}>
        TopCV
      </Title>
      
      <Text style={{ 
        fontSize: '20px', 
        color: '#212f3f', // Đậm hơn
        display: 'block',
        marginBottom: '40px'
      }}>
        Nền tảng tuyển dụng hàng đầu Việt Nam
      </Text>

      <div style={{ marginBottom: '40px' }}>
        <Text style={{ 
        fontSize: '16px', 
        color: '#00b14f',
        lineHeight: '1.6'
        }}>
        Tạo tài khoản nhà tuyển dụng để quản lý tuyển dụng hiệu quả
        </Text>
      </div>

      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <Button
        type="primary"
        size="large"
        icon={<UserAddOutlined />}
        onClick={() => navigate('/register')}
        style={{
          height: '56px',
          padding: '0 32px',
          fontSize: '18px',
          fontWeight: '600',
          borderRadius: '12px',
          background: '#00b14f',
          border: 'none',
          color: '#fff',
          boxShadow: '0 8px 24px rgba(0, 177, 79, 0.15)'
        }}
        >
        Đăng ký ngay
        </Button>
        
        <Button
        size="large"
        icon={<LoginOutlined />}
        onClick={() => navigate('/login')}
        style={{
          height: '56px',
          padding: '0 32px',
          fontSize: '18px',
          fontWeight: '600',
          borderRadius: '12px',
          background: '#fff',
          border: '2px solid #00b14f',
          color: '#00b14f'
        }}
        >
        Đăng nhập
        </Button>
      </div>

      <div style={{ marginTop: '40px', padding: '20px', background: '#eafaf1', borderRadius: '12px' }}>
        <Text style={{ fontSize: '14px', color: '#212f3f' }}>
        Bằng việc sử dụng TopCV, bạn đồng ý với{' '}
        <a href="#" style={{ color: '#00b14f' }}>Điều khoản sử dụng</a>
        {' '}và{' '}
        <a href="#" style={{ color: '#00b14f' }}>Chính sách bảo mật</a>
        </Text>
      </div>
      </Card>
    </div>
  );
};

export default Home;
