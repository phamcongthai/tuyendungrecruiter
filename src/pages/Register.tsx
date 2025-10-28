import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  Typography, 
  Row,
  Col,
  Checkbox,
  Divider
} from 'antd';
import { 
  UserOutlined, 
  MailOutlined, 
  LockOutlined, 
  PhoneOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import { authAPI } from '../apis/auth.api';
import type { RegisterData } from '../apis/auth.api';
import Swal from 'sweetalert2';

const { Title, Text } = Typography;

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: RegisterData) => {
    setLoading(true);
    try {
      const account = await authAPI.register(values);

      // FE nhận account là object nếu thành công, BE trả lỗi => throw
      if (account) {
        Swal.fire({
          icon: 'success',
          title: 'Đăng ký thành công!',
          html: `
            <div style="text-align: left; margin-top: 16px;">
              <p style="margin-bottom: 12px;"><strong>Chúng tôi đã gửi email xác thực đến:</strong></p>
              <p style="color: #00b14f; font-weight: 600; margin-bottom: 16px;">${values.email}</p>
              <p style="font-size: 14px; color: #666; margin-bottom: 8px;">• Vui lòng kiểm tra hộp thư để xác thực tài khoản</p>
              <p style="font-size: 14px; color: #666; margin-bottom: 8px;">• Kiểm tra cả thư mục spam/junk nếu không thấy email</p>
              <p style="font-size: 14px; color: #666;">• Link xác thực có hiệu lực trong 1 giờ</p>
            </div>
          `,
          confirmButtonColor: '#00b14f',
          confirmButtonText: 'Đã hiểu',
          showCancelButton: true,
          cancelButtonText: 'Gửi lại email',
          cancelButtonColor: '#6c757d'
        }).then((result) => {
          if (result.isConfirmed) {
            navigate('/login');
          } else if (result.dismiss === Swal.DismissReason.cancel) {
            // Navigate to resend verification with email pre-filled
            navigate('/resend-verification', { state: { email: values.email } });
          }
        });
      }
    } catch (error: any) {
      // Bắt lỗi từ BE, có thể là validation, password không đủ phức tạp...
      Swal.fire({
        icon: 'error',
        title: 'Đăng ký thất bại',
        text: error.response?.data?.message || error.message || 'Vui lòng thử lại',
        confirmButtonColor: '#00b14f'
      });
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
      {/* Left: Register form (50%) */}
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
        <div style={{ width: '100%', maxWidth: 560 }}>
          {/* Branding */}
          <div style={{ marginBottom: 24 }}>
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/')}
              style={{ color: '#00b14f', padding: 0 }}
            />
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginLeft: 8 }}>
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
            <div style={{ marginBottom: 8 }}>
              <Title level={3} style={{ margin: 0, color: '#111111' }}>Đăng ký tài khoản</Title>
              <Text style={{ color: '#6b7280' }}>Tạo tài khoản nhà tuyển dụng Hi word</Text>
            </div>

            <Form
              form={form}
              name="register"
              onFinish={onFinish}
              layout="vertical"
              size="large"
              initialValues={{
                fullName: '',
                email: '',
                phone: '',
                password: '',
                confirmPassword: '',
                agreement: false
              }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="fullName"
                    label="Họ và tên"
                    rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }, { min: 2, message: 'Họ và tên phải có ít nhất 2 ký tự' }]}
                  >
                    <Input prefix={<UserOutlined style={{ color: '#00b14f' }} />} placeholder="Nhập họ và tên" style={{ borderRadius: 10, borderColor: '#e6eef7' }}/>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="phone"
                    label="Số điện thoại"
                    rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }, { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ' }]}
                  >
                    <Input prefix={<PhoneOutlined style={{ color: '#00b14f' }} />} placeholder="Nhập số điện thoại" style={{ borderRadius: 10, borderColor: '#e6eef7' }}/>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="email"
                label="Email"
                rules={[{ required: true, message: 'Vui lòng nhập email' }, { type: 'email', message: 'Email không hợp lệ' }]}
              >
                <Input prefix={<MailOutlined style={{ color: '#00b14f' }} />} placeholder="example@email.com" style={{ borderRadius: 10, borderColor: '#e6eef7' }}/>
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="password"
                    label="Mật khẩu"
                    rules={[
                      { required: true, message: 'Vui lòng nhập mật khẩu' },
                      { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự' },
                      {
                        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/,
                        message: 'Mật khẩu phải có chữ hoa, chữ thường, số và ký tự đặc biệt'
                      }
                    ]}
                  >
                    <Input.Password prefix={<LockOutlined style={{ color: '#00b14f' }} />} placeholder="Tạo mật khẩu" style={{ borderRadius: 10, borderColor: '#e6eef7' }}/>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="confirmPassword"
                    label="Xác nhận mật khẩu"
                    dependencies={['password']}
                    rules={[
                      { required: true, message: 'Vui lòng xác nhận mật khẩu' },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue('password') === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(new Error('Mật khẩu không khớp'));
                        }
                      })
                    ]}
                  >
                    <Input.Password prefix={<LockOutlined style={{ color: '#00b14f' }} />} placeholder="Nhập lại mật khẩu" style={{ borderRadius: 10, borderColor: '#e6eef7' }}/>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="agreement"
                valuePropName="checked"
                rules={[{ validator: (_, value) => value ? Promise.resolve() : Promise.reject(new Error('Vui lòng đồng ý với điều khoản sử dụng')) }]}
              >
                <Checkbox>
                  Tôi đã đọc và đồng ý với{' '}
                  <a href="#" onClick={(e) => e.preventDefault()}>Điều khoản sử dụng</a> và{' '}
                  <a href="#" onClick={(e) => e.preventDefault()}>Chính sách bảo mật</a>
                </Checkbox>
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  style={{ width: '100%', height: 48, borderRadius: 12, fontSize: 16, fontWeight: 700, background: '#00b14f', border: 'none' }}
                >
                  {loading ? 'Đang đăng ký...' : 'Đăng ký'}
                </Button>
              </Form.Item>
            </Form>

            <Divider style={{ margin: '10px 0 16px' }}>
              <Text type="secondary">Hoặc</Text>
            </Divider>

            <div style={{ textAlign: 'center', marginBottom: 12 }}>
              <Button style={{ width: '100%', height: 44, borderRadius: 10, background: '#fff', border: '1px solid #e6eef7', color: '#111', fontWeight: 600 }}>
                Tiếp tục với Google
              </Button>
            </div>

            <div style={{ textAlign: 'center' }}>
              <Text type="secondary">
                Bạn đã có tài khoản?{' '}
                <a href="#" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>Đăng nhập ngay</a>
              </Text>
            </div>
          </Card>
        </div>
      </div>

      {/* Right: Visual banner (50%) */}
      <div
        style={{
          flex: '0 0 50%',
          maxWidth: '50%',
          position: 'relative',
          backgroundImage: 'url(https://images.careerviet.vn/content/images/pv-nha-tuyen-dung-tai-sao-khong-careerbuilder.png)',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
        aria-label="Recruiter register banner"
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

export default Register;
