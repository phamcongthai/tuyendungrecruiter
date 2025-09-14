import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, Spin, Result, Button, Typography } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import { authAPI } from '../apis/auth.api';

const { Title, Text } = Typography;

const EmailVerification: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setStatus('error');
        setMessage('Token xác thực không hợp lệ');
        setLoading(false);
        return;
      }

      try {
        const response = await authAPI.verifyEmail(token);
        
        if (response && !response.success) {
          setStatus('error');
          setMessage(response.message || 'Xác thực thất bại');
        } else {
          setStatus('success');
          setMessage('Xác thực email thành công!');
        }
      } catch (error: any) {
        setStatus('error');
        setMessage(error.message || 'Có lỗi xảy ra trong quá trình xác thực');
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [searchParams]);

  const handleGoToLogin = () => {
    navigate('/login');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #f5fbff 0%, #f7f9fb 100%)'
        }}
      >
        <Card
          style={{
            width: '100%',
            maxWidth: 500,
            textAlign: 'center',
            borderRadius: 20,
            border: '1px solid #e6eef7',
            boxShadow: '0 10px 40px rgba(31,75,153,0.08)'
          }}
          bodyStyle={{ padding: 48 }}
        >
          <Spin
            size="large"
            indicator={<LoadingOutlined style={{ fontSize: 48, color: '#00b14f' }} spin />}
          />
          <Title level={3} style={{ marginTop: 24, color: '#111111' }}>
            Đang xác thực email...
          </Title>
          <Text type="secondary" style={{ fontSize: 16 }}>
            Vui lòng đợi trong giây lát
          </Text>
        </Card>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f5fbff 0%, #f7f9fb 100%)',
        padding: '20px'
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: 500,
          textAlign: 'center',
          borderRadius: 20,
          border: '1px solid #e6eef7',
          boxShadow: '0 10px 40px rgba(31,75,153,0.08)'
        }}
        bodyStyle={{ padding: 48 }}
      >
        {status === 'success' ? (
          <Result
            icon={<CheckCircleOutlined style={{ color: '#00b14f', fontSize: 64 }} />}
            title={
              <Title level={3} style={{ color: '#111111', margin: '16px 0 8px 0' }}>
                Xác thực thành công!
              </Title>
            }
            subTitle={
              <div>
                <Text style={{ fontSize: 16, color: '#6b7280' }}>
                  {message}
                </Text>
                <br />
                <Text style={{ fontSize: 14, color: '#9ca3af', marginTop: 8 }}>
                  Tài khoản của bạn đã được kích hoạt. Bạn có thể đăng nhập ngay bây giờ.
                </Text>
              </div>
            }
            extra={[
              <Button
                key="login"
                type="primary"
                size="large"
                onClick={handleGoToLogin}
                style={{
                  background: '#00b14f',
                  border: 'none',
                  borderRadius: 10,
                  fontWeight: 600,
                  height: 44,
                  marginRight: 12
                }}
              >
                Đăng nhập ngay
              </Button>,
              <Button
                key="home"
                size="large"
                onClick={handleGoHome}
                style={{
                  borderRadius: 10,
                  height: 44,
                  borderColor: '#00b14f',
                  color: '#00b14f'
                }}
              >
                Về trang chủ
              </Button>
            ]}
          />
        ) : (
          <Result
            icon={<CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: 64 }} />}
            title={
              <Title level={3} style={{ color: '#111111', margin: '16px 0 8px 0' }}>
                Xác thực thất bại
              </Title>
            }
            subTitle={
              <div>
                <Text style={{ fontSize: 16, color: '#6b7280' }}>
                  {message}
                </Text>
                <br />
                <Text style={{ fontSize: 14, color: '#9ca3af', marginTop: 8 }}>
                  Link xác thực có thể đã hết hạn hoặc không hợp lệ. Vui lòng thử lại.
                </Text>
              </div>
            }
            extra={[
              <Button
                key="home"
                type="primary"
                size="large"
                onClick={handleGoHome}
                style={{
                  background: '#00b14f',
                  border: 'none',
                  borderRadius: 10,
                  fontWeight: 600,
                  height: 44,
                  marginRight: 12
                }}
              >
                Về trang chủ
              </Button>,
              <Button
                key="register"
                size="large"
                onClick={() => navigate('/register')}
                style={{
                  borderRadius: 10,
                  height: 44,
                  borderColor: '#00b14f',
                  color: '#00b14f'
                }}
              >
                Đăng ký lại
              </Button>
            ]}
          />
        )}
      </Card>
    </div>
  );
};

export default EmailVerification;