import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Divider } from 'antd';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import Swal from 'sweetalert2';
import { authAPI } from '../apis/auth.api';
import { useNavigate, Link } from 'react-router-dom';

const { Title } = Typography;

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      const response = await authAPI.login(values);

      if (response && (response as any).user) {
        const user = (response as any).user;
        const roles: string[] = user.roles || [];
        if (!roles.includes('Recruiter')) {
          Swal.fire({
            icon: 'error',
            title: 'Đăng nhập thất bại',
            text: 'Tài khoản của bạn không có quyền truy cập bảng điều khiển nhà tuyển dụng',
            confirmButtonColor: '#00b14f'
          });
          return; // dừng lại, không navigate
        }

        // Lưu token nếu BE trả về kèm theo (ngoài cookie)
        if ((response as any).token) {
          localStorage.setItem('token', (response as any).token);
        }

        Swal.fire({
          icon: 'success',
          title: (response as any).message || 'Đăng nhập thành công!',
          confirmButtonColor: '#00b14f'
        });
        navigate('/dashboard');
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Đăng nhập thất bại',
          text: (response as any)?.message || 'Thông tin đăng nhập không chính xác',
          confirmButtonColor: '#00b14f'
        });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Vui lòng thử lại';
      
      // Check if it's an unverified account error
      if (errorMessage.includes('chưa được xác thực') || errorMessage.includes('not verified')) {
        Swal.fire({
          icon: 'warning',
          title: 'Tài khoản chưa xác thực',
          html: `
            <div style="text-align: left; margin-top: 16px;">
              <p>Tài khoản của bạn chưa được xác thực email.</p>
              <p>Vui lòng kiểm tra email để xác thực hoặc gửi lại email xác thực.</p>
            </div>
          `,
          confirmButtonColor: '#00b14f',
          confirmButtonText: 'Gửi lại email xác thực',
          showCancelButton: true,
          cancelButtonText: 'Đã hiểu',
          cancelButtonColor: '#6c757d'
        }).then((result) => {
          if (result.isConfirmed) {
            navigate('/resend-verification', { state: { email: values.email } });
          }
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Có lỗi xảy ra',
          text: errorMessage,
          confirmButtonColor: '#00b14f'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'stretch',
        background: 'linear-gradient(135deg, #f5fbff 0%, #f7f9fb 100%)'
      }}
    >
      <div
        style={{
          flex: 1,
          display: 'none',
          background: 'linear-gradient(180deg, #1f4b99 0%, #00b14f 100%)',
          position: 'relative'
        }}
        className="login-hero"
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.1,
            background:
              'radial-gradient(1000px 600px at 20% 20%, #ffffff 0%, rgba(255,255,255,0) 70%)'
          }}
        />
      </div>

      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 16px'
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
          bodyStyle={{ padding: 28 }}
        >
          <div style={{ textAlign: 'center', marginBottom: 8 }}>
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
                fontSize: 12
              }}
            >
              Nhà tuyển dụng
            </div>
          </div>
          <Title level={3} style={{ color: '#111111', textAlign: 'center', margin: 0 }}>
            Đăng nhập
          </Title>
          <div
            style={{ textAlign: 'center', color: '#6b7280', marginTop: 6, marginBottom: 20 }}
          >
            Truy cập bảng điều khiển nhà tuyển dụng
          </div>

          <Form layout="vertical" onFinish={onFinish}>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Vui lòng nhập email' },
                { type: 'email', message: 'Email không hợp lệ' }
              ]}
            >
              <Input
                prefix={<MailOutlined style={{ color: '#111111' }} />}
                placeholder="Email"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#111111' }} />}
                placeholder="Mật khẩu"
                size="large"
              />
            </Form.Item>

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
                fontWeight: 600
              }}
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>

            <Divider style={{ margin: '20px 0' }} />
            <div style={{ textAlign: 'center', color: '#6b7280' }}>
              Chưa có tài khoản?{' '}
              <Link to="/register" style={{ color: '#111111', fontWeight: 600 }}>
                Đăng ký ngay
              </Link>
            </div>
            <div style={{ textAlign: 'center', color: '#6b7280', marginTop: 8, fontSize: 14 }}>
              Chưa nhận được email xác thực?{' '}
              <Link to="/resend-verification" style={{ color: '#00b14f', fontWeight: 500 }}>
                Gửi lại
              </Link>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default Login;
