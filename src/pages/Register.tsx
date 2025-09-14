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
    <div style={{ 
      minHeight: '100vh', 
      background: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <Card 
        style={{ 
          width: '100%',
          maxWidth: '500px',
          borderRadius: '16px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          border: 'none',
          background: '#f5f7fa'
        }}
        bodyStyle={{ padding: '40px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/')}
            style={{ position: 'absolute', left: '20px', top: '20px', color: '#00b14f' }}
          />
          <Title level={2} style={{ margin: '0 0 8px 0', color: '#00b14f' }}>Đăng ký tài khoản</Title>
          <Text type="secondary" style={{ fontSize: '16px', color: '#212f3f' }}>Tạo tài khoản nhà tuyển dụng mới</Text>
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
                <Input prefix={<UserOutlined style={{ color: '#00b14f' }} />} placeholder="Nhập họ và tên" style={{ borderRadius: '8px', borderColor: '#00b14f' }}/>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="Số điện thoại"
                rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }, { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ' }]}
              >
                <Input prefix={<PhoneOutlined style={{ color: '#00b14f' }} />} placeholder="Nhập số điện thoại" style={{ borderRadius: '8px', borderColor: '#00b14f' }}/>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, message: 'Vui lòng nhập email' }, { type: 'email', message: 'Email không hợp lệ' }]}
          >
            <Input prefix={<MailOutlined style={{ color: '#00b14f' }} />} placeholder="example@email.com" style={{ borderRadius: '8px', borderColor: '#00b14f' }}/>
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
                <Input.Password prefix={<LockOutlined style={{ color: '#00b14f' }} />} placeholder="Tạo mật khẩu" style={{ borderRadius: '8px', borderColor: '#00b14f' }}/>
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
                <Input.Password prefix={<LockOutlined style={{ color: '#00b14f' }} />} placeholder="Nhập lại mật khẩu" style={{ borderRadius: '8px', borderColor: '#00b14f' }}/>
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
            <Button type="primary" htmlType="submit" loading={loading} style={{ width: '100%', height: '48px', borderRadius: '8px', fontSize: '16px', fontWeight: '600', background: '#00b14f', border: 'none' }}>
              {loading ? 'Đang đăng ký...' : 'Đăng ký'}
            </Button>
          </Form.Item>
        </Form>

        <Divider>
          <Text type="secondary">Hoặc</Text>
        </Divider>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <Button style={{ width: '100%', height: '48px', borderRadius: '8px', background: '#fff', border: '1px solid #00b14f', color: '#00b14f', fontWeight: '500' }}>
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
  );
};

export default Register;
