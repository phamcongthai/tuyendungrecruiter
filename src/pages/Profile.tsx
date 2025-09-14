import React, { useState, useEffect, useRef } from 'react';
import { 
  Card, 
  Form, 
  Button, 
  Select, 
  message, 
  Spin,
  Row,
  Col,
  Space,
  Typography,
  Image
} from 'antd';
import { 
  UserOutlined, 
  SaveOutlined,
  EditOutlined,
  CameraOutlined,
  EyeOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { profileAPI } from '../apis/profile.api';
import type { 
  RecruiterProfile
} from '../types/profile.type';
import { useUser } from '../contexts/UserContext';

// Custom styles for avatar hover effect
const avatarStyles = `
  .avatar-upload-container {
    position: relative;
    display: inline-block;
    cursor: pointer;
  }
  
  .avatar-upload-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  .avatar-upload-container:hover .avatar-upload-overlay {
    opacity: 1;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.innerText = avatarStyles;
  document.head.appendChild(styleSheet);
}

const { Title } = Typography;
const { Option } = Select;

const Profile: React.FC = () => {
  const [form] = Form.useForm();
  const { user, refreshUser } = useUser();
  const [loading, setLoading] = useState(false);
  
  const [profileData, setProfileData] = useState<RecruiterProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Danh sách tỉnh thành và quận huyện (có thể mở rộng)
  const provinces = [
    'Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ',
    'An Giang', 'Bà Rịa - Vũng Tàu', 'Bắc Giang', 'Bắc Kạn', 'Bạc Liêu',
    'Bắc Ninh', 'Bến Tre', 'Bình Định', 'Bình Dương', 'Bình Phước',
    'Bình Thuận', 'Cà Mau', 'Cao Bằng', 'Đắk Lắk', 'Đắk Nông',
    'Điện Biên', 'Đồng Nai', 'Đồng Tháp', 'Gia Lai', 'Hà Giang',
    'Hà Nam', 'Hà Tĩnh', 'Hải Dương', 'Hậu Giang', 'Hòa Bình',
    'Hưng Yên', 'Khánh Hòa', 'Kiên Giang', 'Kon Tum', 'Lai Châu',
    'Lâm Đồng', 'Lạng Sơn', 'Lào Cai', 'Long An', 'Nam Định',
    'Nghệ An', 'Ninh Bình', 'Ninh Thuận', 'Phú Thọ', 'Phú Yên',
    'Quảng Bình', 'Quảng Nam', 'Quảng Ngãi', 'Quảng Ninh', 'Quảng Trị',
    'Sóc Trăng', 'Sơn La', 'Tây Ninh', 'Thái Bình', 'Thái Nguyên',
    'Thanh Hóa', 'Thừa Thiên Huế', 'Tiền Giang', 'Trà Vinh', 'Tuyên Quang',
    'Vĩnh Long', 'Vĩnh Phúc', 'Yên Bái'
  ];

  const districts = [
    'Quận 1', 'Quận 2', 'Quận 3', 'Quận 4', 'Quận 5', 'Quận 6', 'Quận 7', 'Quận 8', 'Quận 9', 'Quận 10',
    'Quận 11', 'Quận 12', 'Quận Bình Thạnh', 'Quận Gò Vấp', 'Quận Phú Nhuận', 'Quận Tân Bình',
    'Quận Tân Phú', 'Quận Thủ Đức', 'Huyện Bình Chánh', 'Huyện Cần Giờ', 'Huyện Củ Chi', 'Huyện Hóc Môn', 'Huyện Nhà Bè',
    'Ba Đình', 'Hoàn Kiếm', 'Tây Hồ', 'Long Biên', 'Cầu Giấy', 'Đống Đa', 'Hai Bà Trưng',
    'Hoàng Mai', 'Thanh Xuân', 'Hà Đông', 'Sơn Tây', 'Ba Vì', 'Chương Mỹ', 'Đan Phượng',
    'Hoài Đức', 'Mê Linh', 'Mỹ Đức', 'Phú Xuyên', 'Phúc Thọ', 'Quốc Oai', 'Sóc Sơn',
    'Thạch Thất', 'Thanh Oai', 'Thanh Trì', 'Thường Tín', 'Ứng Hòa'
  ];

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await profileAPI.getProfile();
      if (response.success && response.data) {
        setProfileData(response.data);
        setAvatarUrl(response.data.avatar || '');
        const formValues = {
          gender: response.data.gender || undefined,
          province: response.data.province || undefined,
          district: response.data.district || undefined,
        };
        form.setFieldsValue(formValues);
        setIsEditing(false);
      } else {
        setProfileData(null);
        setAvatarUrl('');
        form.resetFields();
        setIsEditing(true);
      }
    } catch (error) {
      setProfileData(null);
      setAvatarUrl('');
      form.resetFields();
      setIsEditing(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      // Upload avatar first if there's a selected file
      let finalAvatarUrl = avatarUrl;
      if (selectedFile) {
        const uploadResponse = await profileAPI.uploadAvatar(selectedFile);
        if (uploadResponse.success && uploadResponse.data?.avatar) {
          finalAvatarUrl = uploadResponse.data.avatar;
          setAvatarUrl(finalAvatarUrl);
        }
      }

      // Prepare profile data
      const profilePayload = {
        gender: values.gender,
        province: values.province || null,
        district: values.district || null,
        avatar: finalAvatarUrl
      };

      const response = await profileAPI.updateProfile(profilePayload);
      if (response.success) {
        message.success('Cập nhật thông tin thành công!');
        setIsEditing(false);
        setSelectedFile(null);
        setPreviewUrl('');
        await fetchProfile();
        await refreshUser();
      } else {
        message.error(response.message || 'Có lỗi xảy ra khi lưu thông tin');
      }
    } catch (error) {
      message.error('Không thể lưu thông tin profile');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('Vui lòng chọn file ảnh!');
        return;
      }
      
      // Validate file size (5MB)
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error('Ảnh phải nhỏ hơn 5MB!');
        return;
      }

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      setSelectedFile(file);
    }
  };

  const handleRemovePreview = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleUploadAvatar = async () => {
    if (!selectedFile) return;
    setUploadLoading(true);
    try {
      const response = await profileAPI.uploadAvatar(selectedFile);
      if (response.success && response.data?.avatar) {
        setAvatarUrl(response.data.avatar);
        setSelectedFile(null);
        setPreviewUrl('');
        message.success('Cập nhật ảnh đại diện thành công!');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        await fetchProfile();
        await refreshUser();
      } else {
        message.error(response.message || 'Upload ảnh thất bại!');
      }
    } catch (error) {
      message.error('Upload ảnh thất bại!');
    } finally {
      setUploadLoading(false);
    }
  };

  if (loading && !profileData) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', minHeight: 'calc(100vh - 70px - 90px)' }}>
      <Card style={{ border: 'none', boxShadow: 'none', height: '100%', padding: '32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Title level={2}>
            <UserOutlined style={{ marginRight: '8px', color: '#00B14F' }} />
            Thông tin tài khoản
          </Title>
          <p style={{ color: '#64748b', fontSize: '16px' }}>
            {profileData 
              ? 'Quản lý thông tin cá nhân'
              : 'Cập nhật thông tin để bắt đầu tuyển dụng'
            }
          </p>
          {profileData && (
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              background: '#f0f9f4', 
              color: '#166534', 
              padding: '4px 12px', 
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 600
            }}>
              ✓ Hồ sơ đã tạo
            </div>
          )}
          {!profileData && (
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              background: '#fef3c7', 
              color: '#92400e', 
              padding: '4px 12px', 
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 600
            }}>
              ⚠ Hồ sơ chưa hoàn thành
            </div>
          )}
        </div>

        <Card 
          style={{ 
            border: 'none', 
            boxShadow: 'none', 
            background: '#f8fafc',
            borderRadius: '16px',
            padding: '24px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <Title level={4} style={{ margin: 0, color: '#05182C' }}>
              Thông tin cá nhân
            </Title>
            {!isEditing && profileData && (
              <Button 
                type="primary" 
                icon={<EditOutlined />}
                onClick={() => setIsEditing(true)}
              >
                Chỉnh sửa
              </Button>
            )}
            {!profileData && (
              <small style={{ color: '#64748b', fontWeight: 'normal' }}>
                Vui lòng điền thông tin bên dưới
              </small>
            )}
          </div>

          {/* Unified Avatar + Info */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <div 
              className="avatar-upload-container"
              style={{ marginBottom: '6px' }}
              onClick={triggerFileSelect}
            >
              {(previewUrl || avatarUrl) ? (
                <div style={{ position: 'relative' }}>
                  <Image
                    src={previewUrl || avatarUrl}
                    alt={previewUrl ? "Preview" : "Current Avatar"}
                    width={150}
                    height={150}
                    style={{ 
                      borderRadius: '50%', 
                      objectFit: 'cover',
                      border: previewUrl ? '4px solid #fbbf24' : '4px solid #00B14F'
                    }}
                    preview={!previewUrl ? {
                      mask: <EyeOutlined style={{ fontSize: '20px' }} />
                    } : false}
                  />
                  <div className="avatar-upload-overlay">
                    <CameraOutlined style={{ fontSize: '24px', color: 'white' }} />
                  </div>
                  {previewUrl && (
                    <>
                      <div style={{
                        position: 'absolute',
                        top: -10,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: '#fbbf24',
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 600
                      }}>
                        Xem trước
                      </div>
                      <Button
                        type="text"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemovePreview();
                        }}
                        style={{
                          position: 'absolute',
                          top: -5,
                          right: -5,
                          borderRadius: '50%',
                          width: 28,
                          height: 28,
                          padding: 0,
                          background: '#fff',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                          zIndex: 10
                        }}
                      />
                    </>
                  )}
                </div>
              ) : (
                <div style={{
                  width: 150,
                  height: 150,
                  borderRadius: '50%',
                  backgroundColor: '#e2e8f0',
                  border: '2px dashed #cbd5e1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  gap: '8px',
                  color: '#64748b',
                  transition: 'all 0.3s'
                }}>
                  <CameraOutlined style={{ fontSize: '32px' }} />
                  <small style={{ fontSize: '12px', textAlign: 'center' }}>
                    Nhấp để chọn ảnh
                  </small>
                </div>
              )}
            </div>
            <Space direction="vertical" style={{ width: '100%', maxWidth: 420 }}>
              <Button 
                type="primary"
                icon={<CameraOutlined />}
                onClick={triggerFileSelect}
                block
                style={{ marginBottom: '8px' }}
              >
                {avatarUrl ? 'Thay đổi ảnh' : 'Chọn ảnh'}
              </Button>
              {selectedFile && (
                <Button 
                  type="default"
                  icon={<SaveOutlined />}
                  onClick={handleUploadAvatar}
                  loading={uploadLoading}
                  block
                  style={{ background: '#00B14F', color: 'white', border: 'none' }}
                >
                  Lưu ảnh đại diện
                </Button>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                ref={fileInputRef}
                style={{ display: 'none' }}
              />
              <small style={{ color: '#64748b', display: 'block', marginTop: '4px' }}>
                Định dạng: JPG, PNG, WEBP · Tối đa: 5MB · Khuyến nghị: 300x300px
              </small>
            </Space>
          </div>

          {/* Account info (read-only) */}
          <Row gutter={[16, 16]} style={{ marginBottom: '8px' }}>
            <Col xs={24} md={12}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontWeight: 600, color: '#374151', display: 'block', marginBottom: '6px' }}>
                  Họ và tên
                </label>
                <div style={{ 
                  padding: '10px 12px', 
                  background: '#fff', 
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  color: '#374151'
                }}>
                  {user?.fullName || 'Chưa cập nhật'}
                </div>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontWeight: 600, color: '#374151', display: 'block', marginBottom: '6px' }}>
                  Email
                </label>
                <div style={{ 
                  padding: '10px 12px', 
                  background: '#fff', 
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  color: '#374151'
                }}>
                  {user?.email || 'Chưa cập nhật'}
                </div>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div>
                <label style={{ fontWeight: 600, color: '#374151', display: 'block', marginBottom: '6px' }}>
                  Số điện thoại
                </label>
                <div style={{ 
                  padding: '10px 12px', 
                  background: '#fff', 
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  color: '#374151'
                }}>
                  {(user as any)?.phone || 'Chưa cập nhật'}
                </div>
              </div>
            </Col>
          </Row>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            disabled={!isEditing}
          >
            <Row gutter={[16, 0]}>
              <Col xs={24} md={8}>
                <Form.Item
                  name="gender"
                  label={<span style={{ fontWeight: 600, color: '#374151' }}>Giới tính</span>}
                  rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}
                >
                  <Select 
                    placeholder="Chọn giới tính"
                    style={{ borderRadius: '8px' }}
                  >
                    <Option value="male">Nam</Option>
                    <Option value="female">Nữ</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  name="province"
                  label={<span style={{ fontWeight: 600, color: '#374151' }}>Tỉnh/Thành phố</span>}
                >
                  <Select 
                    placeholder="Chọn tỉnh/thành phố"
                    showSearch
                    allowClear
                    style={{ borderRadius: '8px' }}
                    filterOption={(input, option) =>
                      option?.children?.toString().toLowerCase().includes(input.toLowerCase()) || false
                    }
                  >
                    {provinces.map(province => (
                      <Option key={province} value={province}>{province}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  name="district"
                  label={<span style={{ fontWeight: 600, color: '#374151' }}>Quận/Huyện</span>}
                >
                  <Select 
                    placeholder="Chọn quận/huyện"
                    showSearch
                    allowClear
                    style={{ borderRadius: '8px' }}
                    filterOption={(input, option) =>
                      option?.children?.toString().toLowerCase().includes(input.toLowerCase()) || false
                    }
                  >
                    {districts.map(district => (
                      <Option key={district} value={district}>{district}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            {isEditing && (
              <div style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <Button 
                  onClick={() => {
                    if (profileData) {
                      setIsEditing(false);
                      form.setFieldsValue({
                        gender: profileData.gender || undefined,
                        province: profileData.province || undefined,
                        district: profileData.district || undefined,
                      });
                    } else {
                      form.resetFields();
                    }
                    setSelectedFile(null);
                    setPreviewUrl('');
                  }}
                  style={{ borderRadius: '8px' }}
                >
                  {profileData ? 'Hủy bỏ' : 'Xóa form'}
                </Button>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading}
                  icon={<SaveOutlined />}
                  style={{ borderRadius: '8px' }}
                >
                  {profileData ? 'Lưu thay đổi' : 'Lưu thông tin'}
                </Button>
              </div>
            )}
          </Form>
        </Card>
      </Card>
    </div>
  );
};

export default Profile;