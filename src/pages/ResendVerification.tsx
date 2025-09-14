import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, Alert, Divider } from 'antd';
import { MailOutlined, ArrowLeftOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { authAPI } from '../apis/auth.api';
import Swal from 'sweetalert2';

const { Title, Text } = Typography;

interface ResendVerificationProps {
  defaultEmail?: string;
}

const ResendVerification: React.FC<ResendVerificationProps> = ({ defaultEmail }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [sentEmail, setSentEmail] = useState('');

  // Get email from navigation state if available
  const initialEmail = defaultEmail || (location.state as any)?.email || '';

  const onFinish = async (values: { email: string }) => {
    setLoading(true);
    try {
      const response = await authAPI.resendVerification(values.email);
      
      if (response && !response.success) {
        Swal.fire({
          icon: 'error',
          title: 'Gửi email thất bại',
          text: response.message || 'Có lỗi xảy ra khi gửi email',
          confirmButtonColor: '#00b14f'
        });
      } else {
        setSuccess(true);
        setSentEmail(values.email);
        Swal.fire({
          icon: 'success',
          title: 'Gửi email thành công',
          text: response.message || 'Đã gửi lại email xác thực. Vui lòng kiểm tra hộp thư.',
          confirmButtonColor: '#00b14f'
        });
      }
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Có lỗi xảy ra',
        text: error.message || 'Vui lòng thử lại sau',
        confirmButtonColor: '#00b14f'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoToLogin = () => {
    navigate('/login');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  if (success) {
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
            maxWidth: 480,
            textAlign: 'center',
            borderRadius: 20,
            border: '1px solid #e6eef7',
            boxShadow: '0 10px 40px rgba(31,75,153,0.08)'
          }}
          bodyStyle={{ padding: 40 }}
        >
          <CheckCircleOutlined
            style={{
              fontSize: 64,
              color: '#00b14f',
              marginBottom: 24
            }}
          />
          
          <Title level={3} style={{ color: '#111111', marginBottom: 16 }}>
            Email đã được gửi!
          </Title>
          
          <Text style={{ fontSize: 16, color: '#6b7280', display: 'block', marginBottom: 8 }}>
            Chúng tôi đã gửi lại email xác thực đến:
          </Text>
          
          <Text strong style={{ fontSize: 16, color: '#00b14f', display: 'block', marginBottom: 24 }}>
            {sentEmail}
          </Text>
          
          <Alert
            message="Lưu ý"
            description="Vui lòng kiểm tra cả thư mục spam/junk nếu không thấy email trong hộp thư chính."
            type="info"
            showIcon
            style={{ 
              marginBottom: 24,
              borderRadius: 10,
              borderColor: '#00b14f20',
              backgroundColor: '#f6ffed'
            }}
          />
          
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Button
              type="primary"
              size="large"
              onClick={handleGoToLogin}
              style={{
                background: '#00b14f',
                border: 'none',
                borderRadius: 10,
                fontWeight: 600,
                height: 44
              }}
            >
              Đến trang đăng nhập
            </Button>
            
            <Button
              size="large"
              onClick={() => setSuccess(false)}
              style={{
                borderRadius: 10,
                height: 44,
                borderColor: '#00b14f',
                color: '#00b14f'
              }}
            >
              Gửi lại
            </Button>
          </div>
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
          maxWidth: 440,
          borderRadius: 20,
          border: '1px solid #e6eef7',
          boxShadow: '0 10px 40px rgba(31,75,153,0.08)'
        }}
        bodyStyle={{ padding: 32 }}
      >
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={handleGoBack}
          style={{
            position: 'absolute',
            left: '20px',
            top: '20px',
            color: '#00b14f'
          }}
        />
        
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 14px',
              borderRadius: 999,
              background: '#eafaf1',
              color: '#111111',
              fontWeight: 600,
              fontSize: 12,
              marginBottom: 16
            }}
          >
            Xác thực email
          </div>
          
          <Title level={3} style={{ color: '#111111', margin: '0 0 8px 0' }}>
            Gửi lại email xác thực
          </Title>
          
          <Text style={{ color: '#6b7280', fontSize: 14 }}>
            Nhập email để nhận lại link xác thực
          </Text>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ email: initialEmail }}
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' }
            ]}
          >
            <Input
              prefix={<MailOutlined style={{ color: '#00b14f' }} />}
              placeholder="Nhập email của bạn"
              size="large"
              style={{ borderRadius: 10 }}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{
                height: 44,
                background: '#00b14f',
                border: 'none',
                borderRadius: 10,
                fontWeight: 600,
                marginBottom: 16
              }}
            >
              {loading ? 'Đang gửi...' : 'Gửi lại email xác thực'}
            </Button>
          </Form.Item>
        </Form>

        <Divider style={{ margin: '20px 0' }} />
        
        <div style={{ textAlign: 'center', color: '#6b7280' }}>
          Đã xác thực email?{' '}
          <a 
            href="#" 
            onClick={(e) => { 
              e.preventDefault(); 
              handleGoToLogin(); 
            }}
            style={{ color: '#00b14f', fontWeight: 600 }}
          >
            Đăng nhập ngay
          </a>
        </div>
      </Card>
    </div>
  );
};

export default ResendVerification;