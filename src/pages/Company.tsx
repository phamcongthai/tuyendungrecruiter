import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Table,
  message,
  Spin,
  Row,
  Col,
  Space,
  Typography,
  Modal,
  Tag,
  Tooltip,
  Select,
  Image,
  Popconfirm
} from 'antd';
import {
  BankOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  EyeOutlined,
  PhoneOutlined,
  MailOutlined,
  GlobalOutlined,
  TeamOutlined,
  CameraOutlined,
  SaveOutlined
} from '@ant-design/icons';
import { companyAPI } from '../apis/company.api';
import type { CompanyProfile } from '../types/profile.type';
import { useUser } from '../contexts/UserContext';
import Swal from 'sweetalert2';

const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;

const Company: React.FC = () => {
  const [form] = Form.useForm();
  useUser();
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<CompanyProfile[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<CompanyProfile[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [editingCompany, setEditingCompany] = useState<CompanyProfile | null>(null);
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [searchText, setSearchText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Company size options
  const sizeOptions = [
    { value: '1-10', label: '1-10 nhân viên' },
    { value: '11-50', label: '11-50 nhân viên' },
    { value: '51-200', label: '51-200 nhân viên' },
    { value: '201-500', label: '201-500 nhân viên' },
    { value: '500+', label: '500+ nhân viên' }
  ];

  // Industries options
  const industriesOptions = [
    'Công nghệ thông tin',
    'Tài chính - Ngân hàng',
    'Giáo dục',
    'Y tế',
    'Bán lẻ',
    'Sản xuất',
    'Bất động sản',
    'Du lịch - Khách sạn',
    'Logistics',
    'Truyền thông',
    'Tư vấn',
    'Khác'
  ];

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    // Filter companies based on search text
    if (searchText) {
      const filtered = companies.filter(company =>
        company.name.toLowerCase().includes(searchText.toLowerCase()) ||
        company.email?.toLowerCase().includes(searchText.toLowerCase()) ||
        company.industries?.some(industry => 
          industry.toLowerCase().includes(searchText.toLowerCase())
        )
      );
      setFilteredCompanies(filtered);
    } else {
      setFilteredCompanies(companies);
    }
  }, [searchText, companies]);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const response = await companyAPI.getMyCompanies();
      if (response.success && Array.isArray(response.data)) {
        setCompanies(response.data);
        setFilteredCompanies(response.data);
      } else {
        setCompanies([]);
        setFilteredCompanies([]);
      }
    } catch (error) {
      message.error('Không thể tải danh sách công ty của bạn');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingCompany(null);
    setLogoUrl('');
    setSelectedFile(null);
    setPreviewUrl('');
    form.resetFields();
    setShowModal(true);
  };

  const handleEdit = (company: CompanyProfile) => {
    setEditingCompany(company);
    setLogoUrl(company.logo || '');
    setSelectedFile(null);
    setPreviewUrl('');
    form.setFieldsValue({
      name: company.name,
      description: company.description,
      website: company.website,
      email: company.email,
      phone: company.phone,
      address: company.address,
      industries: company.industries,
      size: company.size,
      taxCode: company.taxCode,
      foundedYear: company.foundedYear
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const result = await Swal.fire({
        title: 'Xác nhận xóa',
        text: 'Bạn có chắc chắn muốn xóa công ty này?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#00B14F',
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy'
      });

      if (result.isConfirmed) {
        const response = await companyAPI.deleteCompany(id);
        if (response.success) {
          message.success('Xóa công ty thành công');
          fetchCompanies();
        } else {
          message.error(response.message || 'Xóa công ty thất bại');
        }
      }
    } catch (error) {
      console.error('Error deleting company:', error);
      message.error('Có lỗi xảy ra khi xóa công ty');
    }
  };

  const triggerFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        message.error('Kích thước file không được vượt quá 5MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        message.error('Vui lòng chọn file ảnh');
        return;
      }

      setSelectedFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setPreviewUrl(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };


  const handleSubmit = async (values: any) => {
    setModalLoading(true);
    try {
      let response;
      let companyId = editingCompany?._id;

      // First create or update the company without logo
      const companyData: any = {
        ...values,
      };
      
      // Only include logo if we have a valid URL
      if (logoUrl && logoUrl.trim()) {
        companyData.logo = logoUrl;
      }

      if (editingCompany) {
        // Update existing company
        if (editingCompany?._id) {
          response = await companyAPI.updateCompany(editingCompany._id, companyData);
          companyId = editingCompany._id;
        } else {
          throw new Error('Company ID is undefined');
        }
      } else {
        // Create new company
        response = await companyAPI.createCompany(companyData);
        if (response.success && response.data?._id) {
          companyId = response.data._id;
        } else {
          throw new Error('Failed to create company or no ID returned');
        }
      }

      if (!response.success) {
        throw new Error(response.message || 'Failed to save company');
      }

      // Upload logo if there's a selected file and we have a company ID
      if (selectedFile && companyId) {
        try {
          const uploadResponse = await companyAPI.uploadLogo(companyId, selectedFile);
          if (uploadResponse.success && uploadResponse.data?.logo) {
            const newLogoUrl = uploadResponse.data.logo;
            message.success('Logo đã được tải lên thành công!');
            // Update the logo URL state with the uploaded logo
            setLogoUrl(newLogoUrl);
            // Update the response data with the complete company information
            response.data = uploadResponse.data;
          } else {
            message.warning('Công ty đã được lưu nhưng không thể tải logo lên');
          }
        } catch (uploadError: any) {
          message.warning('Công ty đã được lưu nhưng không thể tải logo lên');
        }
      }

      // Show success message
      if (editingCompany) {
        await Swal.fire({
          icon: 'success',
          title: 'Cập nhật thành công!',
          text: 'Thông tin công ty đã được cập nhật thành công.',
          confirmButtonColor: '#00B14F',
          confirmButtonText: 'Đồng ý',
          timer: 3000,
          timerProgressBar: true
        });
      } else {
        await Swal.fire({
          icon: 'success',
          title: 'Tạo công ty thành công!',
          text: 'Công ty mới đã được tạo thành công.',
          confirmButtonColor: '#00B14F',
          confirmButtonText: 'Đồng ý',
          timer: 3000,
          timerProgressBar: true
        });
      }

      setShowModal(false);
      form.resetFields();
      setSelectedFile(null);
      setPreviewUrl('');
      setLogoUrl('');
      setEditingCompany(null);
      await fetchCompanies();

    } catch (error: any) {
      await Swal.fire({
        icon: 'error',
        title: 'Có lỗi xảy ra!',
        text: error.message || 'Không thể lưu thông tin công ty. Vui lòng kiểm tra kết nối mạng và thử lại.',
        confirmButtonColor: '#00B14F',
        confirmButtonText: 'Thử lại'
      });
    } finally {
      setModalLoading(false);
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    form.resetFields();
    setSelectedFile(null);
    setPreviewUrl('');
    setEditingCompany(null);
    setLogoUrl('');
  };

  const columns = [
    {
      title: 'Logo',
      dataIndex: 'logo',
      key: 'logo',
      width: 80,
      render: (logo: string, record: CompanyProfile) => (
        <div style={{ textAlign: 'center' }}>
          {logo ? (
            <Image
              src={logo}
              alt={record.name}
              width={40}
              height={40}
              style={{ borderRadius: '8px', objectFit: 'cover' }}
              preview={{
                mask: <EyeOutlined style={{ fontSize: '16px' }} />
              }}
            />
          ) : (
            <div
              style={{
                width: 40,
                height: 40,
                backgroundColor: '#f0f0f0',
                border: '1px solid #d9d9d9',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto'
              }}
            >
              <BankOutlined style={{ color: '#999' }} />
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Tên công ty',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: CompanyProfile, b: CompanyProfile) => a.name.localeCompare(b.name),
      render: (name: string, record: CompanyProfile) => (
        <div>
          <Text strong style={{ color: '#05182C' }}>{name}</Text>
          {record.website && (
            <div>
              <a 
                href={record.website} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ fontSize: '12px', color: '#00B14F' }}
              >
                <GlobalOutlined /> {record.website}
              </a>
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Liên hệ',
      key: 'contact',
      render: (record: CompanyProfile) => (
        <div>
          {record.email && (
            <div style={{ marginBottom: '4px' }}>
              <MailOutlined style={{ color: '#64748b', marginRight: '4px' }} />
              <Text style={{ fontSize: '12px' }}>{record.email}</Text>
            </div>
          )}
          {record.phone && (
            <div>
              <PhoneOutlined style={{ color: '#64748b', marginRight: '4px' }} />
              <Text style={{ fontSize: '12px' }}>{record.phone}</Text>
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Quy mô',
      dataIndex: 'size',
      key: 'size',
      width: 120,
      render: (size: string) => size && (
        <Tag icon={<TeamOutlined />} color="blue">
          {size}
        </Tag>
      )
    },
    {
      title: 'Ngành nghề',
      dataIndex: 'industries',
      key: 'industries',
      render: (industries: string[]) => (
        <div>
          {industries?.slice(0, 2).map((industry, index) => (
            <Tag key={index} style={{ marginBottom: '2px' }}>
              {industry}
            </Tag>
          ))}
          {industries?.length > 2 && (
            <Tooltip title={industries.slice(2).join(', ')}>
              <Tag>+{industries.length - 2}</Tag>
            </Tooltip>
          )}
        </div>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Hoạt động' : 'Tạm dừng'}
        </Tag>
      )
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 120,
      render: (record: CompanyProfile) => (
        <Space size="small">
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              style={{ color: '#00B14F' }}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Popconfirm
              title="Bạn có chắc chắn muốn xóa công ty này?"
              onConfirm={() => record._id && handleDelete(record._id)}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <Button
                type="text"
                icon={<DeleteOutlined />}
                danger
                disabled={!record._id}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Spin spinning={loading}>
        {/* Unified Single Section */}
        <Card style={{ border: 'none', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <Title level={3} style={{ margin: 0, color: '#05182C' }}>Quản lý công ty</Title>
              <Text style={{ color: '#64748b' }}>Theo dõi và chỉnh sửa các công ty của bạn</Text>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', maxWidth: 560 }}>
              <Search
                placeholder="Tìm kiếm theo tên, email, ngành nghề..."
                allowClear
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ flex: 1 }}
              />
              <Button 
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreate}
                style={{ background: '#00B14F', borderColor: '#00B14F', borderRadius: 8 }}
              >
                Tạo công ty
              </Button>
            </div>
          </div>
          <div style={{ marginBottom: 12, color: '#64748b' }}>
            Tổng: <Text strong>{filteredCompanies.length}</Text> công ty
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <Table
              columns={columns}
              dataSource={filteredCompanies}
              rowKey="_id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} công ty`
              }}
              scroll={{ x: 1000 }}
              style={{ height: '100%' }}
            />
          </div>
        </Card>

        {/* Company Modal */}
        <Modal
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BankOutlined style={{ color: '#00B14F' }} />
              {editingCompany ? 'Chỉnh sửa công ty' : 'Tạo công ty mới'}
            </div>
          }
          open={showModal}
          onCancel={handleCancel}
          footer={null}
          width={800}
          style={{ top: 20 }}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Row gutter={[24, 16]}>
              {/* Logo Section */}
              <Col xs={24} md={8}>
                <Form.Item label="Logo công ty">
                  <div style={{ textAlign: 'center' }}>
                    <div
                      onClick={triggerFileSelect}
                      style={{
                        width: 120,
                        height: 120,
                        margin: '0 auto 16px',
                        cursor: 'pointer',
                        position: 'relative'
                      }}
                    >
                      {(previewUrl || logoUrl) ? (
                        <div style={{ position: 'relative' }}>
                          <Image
                            src={previewUrl || logoUrl}
                            alt="Company Logo"
                            width={120}
                            height={120}
                            style={{ 
                              borderRadius: '8px',
                              objectFit: 'cover',
                              border: previewUrl ? '3px solid #fbbf24' : '3px solid #00B14F'
                            }}
                            preview={false}
                          />
                          <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0, 0, 0, 0.5)',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: 0,
                            transition: 'opacity 0.3s ease'
                          }}
                          className="logo-overlay"
                          >
                            <CameraOutlined style={{ fontSize: '20px', color: 'white' }} />
                          </div>
                        </div>
                      ) : (
                        <div style={{
                          width: 120,
                          height: 120,
                          backgroundColor: '#f0f0f0',
                          border: '2px dashed #d9d9d9',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexDirection: 'column',
                          gap: '4px',
                          color: '#999'
                        }}>
                          <CameraOutlined style={{ fontSize: '24px' }} />
                          <Text style={{ fontSize: '10px', textAlign: 'center' }}>
                            Nhấp để chọn logo
                          </Text>
                        </div>
                      )}
                    </div>

                    <Button 
                      type="default"
                      icon={<CameraOutlined />}
                      onClick={triggerFileSelect}
                      size="small"
                    >
                      {logoUrl ? 'Thay đổi logo' : 'Chọn logo'}
                    </Button>
                    
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      ref={fileInputRef}
                      style={{ display: 'none' }}
                    />
                    
                    <div style={{ fontSize: '10px', color: '#64748b', marginTop: '8px' }}>
                      JPG, PNG, WEBP ≤ 5MB
                    </div>
                  </div>
                </Form.Item>
              </Col>

              {/* Company Information */}
              <Col xs={24} md={16}>
                <Row gutter={[16, 0]}>
                  <Col xs={24}>
                    <Form.Item
                      label="Tên công ty"
                      name="name"
                      rules={[
                        { required: true, message: 'Vui lòng nhập tên công ty' }
                      ]}
                    >
                      <Input placeholder="Nhập tên công ty" />
                    </Form.Item>
                  </Col>
                  
                  <Col xs={24}>
                    <Form.Item
                      label="Mô tả công ty"
                      name="description"
                    >
                      <Input.TextArea rows={3} placeholder="Mô tả về công ty..." />
                    </Form.Item>
                  </Col>
                  
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Website"
                      name="website"
                      rules={[
                        { type: 'url', message: 'Website không đúng định dạng' }
                      ]}
                    >
                      <Input placeholder="https://example.com" />
                    </Form.Item>
                  </Col>
                  
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Email"
                      name="email"
                      rules={[
                        { type: 'email', message: 'Email không đúng định dạng' }
                      ]}
                    >
                      <Input placeholder="contact@company.com" />
                    </Form.Item>
                  </Col>
                </Row>
              </Col>
            </Row>

            <Row gutter={[16, 0]}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Số điện thoại"
                  name="phone"
                >
                  <Input placeholder="0123456789" />
                </Form.Item>
              </Col>
              
              <Col xs={24} md={12}>
                <Form.Item
                  label="Quy mô nhân sự"
                  name="size"
                >
                  <Select placeholder="Chọn quy mô">
                    {sizeOptions.map(option => (
                      <Option key={option.value} value={option.value}>
                        {option.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              
              <Col xs={24} md={12}>
                <Form.Item
                  label="Mã số thuế"
                  name="taxCode"
                >
                  <Input placeholder="Mã số thuế" />
                </Form.Item>
              </Col>
              
              <Col xs={24} md={12}>
                <Form.Item
                  label="Năm thành lập"
                  name="foundedYear"
                >
                  <Input type="number" placeholder="2020" />
                </Form.Item>
              </Col>
              
              <Col xs={24}>
                <Form.Item
                  label="Ngành nghề"
                  name="industries"
                >
                  <Select
                    mode="multiple"
                    placeholder="Chọn ngành nghề"
                    allowClear
                  >
                    {industriesOptions.map(industry => (
                      <Option key={industry} value={industry}>
                        {industry}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              
              <Col xs={24}>
                <Form.Item
                  label="Địa chỉ"
                  name="address"
                >
                  <Input.TextArea rows={2} placeholder="Địa chỉ công ty" />
                </Form.Item>
              </Col>
            </Row>
            
            <div style={{ textAlign: 'right', marginTop: '24px' }}>
              <Space>
                <Button onClick={handleCancel}>
                  Hủy
                </Button>
                <Button 
                  type="primary" 
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={modalLoading}
                >
                  {editingCompany ? 'Cập nhật' : 'Tạo công ty'}
                </Button>
              </Space>
            </div>
          </Form>
        </Modal>
      </Spin>

      <style>{`
        .logo-overlay:hover {
          opacity: 1 !important;
        }
      `}</style>
    </div>
  );
};

export default Company;