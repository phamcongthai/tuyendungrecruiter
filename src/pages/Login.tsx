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
          localStorage.setItem('tokenRecruiter', (response as any).token);
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
        background: '#ffffff'
      }}
    >
      {/* Left: Login form (50%) */}
      <div
        style={{
          flex: '0 0 50%',
          maxWidth: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 24px',
          background: 'linear-gradient(135deg, #f5fbff 0%, #f7f9fb 100%)'
        }}
      >
        <div style={{ width: '100%', maxWidth: 480 }}>
          {/* Branding */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: '#00b14f',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 800
                }}
                aria-label="Hi word logo"
              >
                H
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#111111' }}>Hi word</div>
            </div>
          </div>

          <Card
            style={{
              width: '100%',
              borderRadius: 20,
              border: '1px solid #e6eef7',
              boxShadow: '0 10px 40px rgba(31,75,153,0.08)'
            }}
            bodyStyle={{ padding: 28 }}
          >
            <div style={{ textAlign: 'left', marginBottom: 8 }}>
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
                Dành cho nhà tuyển dụng
              </div>
            </div>
            <Title level={3} style={{ color: '#111111', textAlign: 'left', margin: 0 }}>
              Đăng nhập
            </Title>
            <div style={{ color: '#6b7280', marginTop: 6, marginBottom: 20 }}>
              Truy cập bảng điều khiển nhà tuyển dụng Hi word
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
                  height: 48,
                  background: '#00b14f',
                  border: 'none',
                  borderRadius: 12,
                  fontWeight: 700
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

      {/* Right: Banner image (50%) */}
      <div
        style={{
          flex: '0 0 50%',
          maxWidth: '50%',
          position: 'relative',
          backgroundImage: 'url(https://images.careerviet.vn/content/images/pv-nha-tuyen-dung-tai-sao-khong-careerbuilder.png)',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '100%'
        }}
        aria-label="Recruiter login banner"
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(120deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.0) 100%)'
          }}
        />
      </div>
    </div>
  );
};

export default Login;
