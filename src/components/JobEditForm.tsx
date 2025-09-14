import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Select,
  InputNumber,
  DatePicker,
  Switch,
  Button,
  Card,
  Row,
  Col,
  Typography,
  message,
  Space,
  Spin,
  Steps,
} from 'antd';
import {
  SaveOutlined,
  CloseOutlined,
  PlusOutlined,
  DollarOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  TrophyOutlined,
  ToolOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import type { JobData, UpdateJobData, JobEditFormData } from '../types/job.type';
import { 
  JOB_TYPE_LABELS, 
  WORKING_MODE_LABELS
} from '../types/job.type';
import { updateJob, fetchJobById } from '../apis/job.api';
import { jobCategoriesAPI } from '../apis/job-categories.api';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

interface JobEditFormProps {
  jobId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const JobEditForm: React.FC<JobEditFormProps> = ({
  jobId,
  onSuccess,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [jobCategories, setJobCategories] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  // No need for companies state - backend handles company assignment
  const [jobData, setJobData] = useState<JobData | null>(null);

  // Array state for dynamic fields
  const [skills, setSkills] = useState<string[]>(['']);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, [jobId]);

  // Load job categories
  useEffect(() => {
    const loadJobCategories = async () => {
      try {
        const response = await jobCategoriesAPI.getActiveCategories();
        setJobCategories(response.data);
      } catch (error: any) {
        console.error('Failed to load job categories:', error);
      }
    };
    loadJobCategories();
  }, []);

  const loadInitialData = async () => {
    try {
      setInitialLoading(true);
      await loadJobData();
    } catch (error: any) {
      message.error('Failed to load job data');
    } finally {
      setInitialLoading(false);
    }
  };

  const loadJobData = async () => {
    try {
      const response = await fetchJobById(jobId);
      const job = response.data!;
      setJobData(job);

      // Set array states
      setSkills(job.skills?.length ? job.skills : ['']);

      // Set form values
      form.setFieldsValue({
        title: job.title,
        description: job.description,
        requirements: job.requirements || '',
        benefits: job.benefits || '',
        jobType: job.jobType,
        workingMode: job.workingMode,
        location: job.location,
        currency: job.currency || 'VND',
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        deadline: job.deadline ? dayjs(job.deadline) : null,
        isActive: job.isActive,
        jobCategoryId: job.jobCategoryId,
        recruiterId: job.recruiterId,
        companyId: job.companyId,
        deleted: job.deleted || false,
        // companyId handled by backend
      });
    } catch (error: any) {
      message.error('Failed to load job data');
      throw error;
    }
  };

  // No need to load companies - backend handles this

  // Handle array field changes for skills only
  const handleArrayFieldChange = (
    index: number,
    value: string
  ) => {
    const newArray = [...skills];
    newArray[index] = value;
    setSkills(newArray);
  };

  // Add new item to skills array
  const addArrayItem = () => {
    setSkills([...skills, '']);
  };

  // Remove item from skills array
  const removeArrayItem = (
    index: number
  ) => {
    if (skills.length > 1) {
      const newArray = skills.filter((_, i) => i !== index);
      setSkills(newArray);
    }
  };

  // Handle form submission
  const handleSubmit = async (values: JobEditFormData) => {
    try {
      setLoading(true);

      // Filter out empty values from skills array
      const filteredSkills = skills.filter(skill => skill.trim() !== '');

      const updateData: UpdateJobData = {
        ...values,
        skills: filteredSkills.length > 0 ? filteredSkills : undefined,
        deadline: values.deadline
          ? (values.deadline instanceof Date
              ? values.deadline.toISOString()
              : new Date(values.deadline).toISOString())
          : undefined,
        recruiterId: values.recruiterId,
        companyId: values.companyId,
        deleted: values.deleted,
      };

      await updateJob(jobId, updateData);
      message.success('Job updated successfully!');
      onSuccess();
    } catch (error: any) {
      message.error(error.message || 'Failed to update job');
    } finally {
      setLoading(false);
    }
  };

  // Render array field for skills only
  const renderArrayField = (
    label: string,
    placeholder: string
  ) => {
    return (
      <Form.Item label={<Text strong>{label}</Text>}>
        <Space direction="vertical" className="w-full">
          {skills.map((value, index) => (
            <Space key={index} className="w-full">
              <Input
                value={value}
                onChange={(e) => handleArrayFieldChange(index, e.target.value)}
                placeholder={`${placeholder} ${index + 1}`}
                className="flex-1 rounded-lg"
                size="large"
              />
              {skills.length > 1 && (
                <Button
                  type="link"
                  danger
                  icon={<CloseOutlined />}
                  onClick={() => removeArrayItem(index)}
                />
              )}
            </Space>
          ))}
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={() => addArrayItem()}
            className="w-full rounded-lg"
            size="large"
          >
            Add {label.slice(0, -1)}
          </Button>
        </Space>
      </Form.Item>
    );
  };

  const steps = [
    {
      title: 'Thông tin cơ bản',
      icon: <FileTextOutlined />,
    },
    {
      title: 'Chi tiết công việc',
      icon: <ToolOutlined />,
    },
    {
      title: 'Mức lương & Thời hạn',
      icon: <DollarOutlined />,
    },
    {
      title: 'Thông tin bổ sung',
      icon: <TrophyOutlined />,
    },
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Card className="">
            <Row gutter={24}>
              <Col xs={24}>
                <Title level={4} className="mb-6 text-gray-800">
                  <FileTextOutlined className="mr-2 text-blue-500" />
                  Thông tin cơ bản
                </Title>
              </Col>
              
              <Col xs={24} md={12}>
                <Form.Item
                  name="title"
                  label={<Text strong>Tiêu đề tin tuyển dụng</Text>}
                  rules={[
                    { required: true, message: 'Vui lòng nhập tiêu đề tin tuyển dụng' },
                    { max: 100, message: 'Tiêu đề không được vượt quá 100 ký tự' },
                  ]}
                >
                  <Input 
                    placeholder="VD: Senior Frontend Developer" 
                    size="large"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item 
                  name="companyId"
                  label={<Text strong>Công ty</Text>}
                >
                  <Input 
                    placeholder="ID công ty"
                    size="large"
                  />
                </Form.Item>
              </Col>

              <Col xs={24}>
                <Form.Item
                  name="description"
                  label={<Text strong>Mô tả công việc</Text>}
                  rules={[
                    { required: true, message: 'Vui lòng nhập mô tả công việc' },
                    { min: 50, message: 'Mô tả công việc phải có ít nhất 50 ký tự' },
                  ]}
                >
                  <TextArea
                    rows={6}
                    placeholder="Mô tả chi tiết về vị trí công việc, trách nhiệm và yêu cầu ứng viên..."
                    showCount
                    maxLength={2000}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        );

      case 1:
        return (
          <Card className="">
            <Row gutter={24}>
              <Col xs={24}>
                <Title level={4} className="mb-6 text-gray-800">
                  <ToolOutlined className="mr-2 text-green-500" />
                  Chi tiết công việc
                </Title>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item
                  name="jobType"
                  label={<Text strong>Loại công việc</Text>}
                  rules={[{ required: true, message: 'Please select job type' }]}
                >
                  <Select placeholder="Select job type" size="large">
                    {Object.entries(JOB_TYPE_LABELS).map(([value, label]) => (
                      <Option key={value} value={value}>
                        {label as React.ReactNode}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item
                  name="workingMode"
                  label={<Text strong>Hình thức làm việc</Text>}
                  rules={[{ required: true, message: 'Please select working mode' }]}
                >
                  <Select placeholder="Select working mode" size="large">
                    {Object.entries(WORKING_MODE_LABELS).map(([value, label]) => (
                      <Option key={value} value={value}>
                        {label as React.ReactNode}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item 
                  name="location" 
                  label={<Text strong>Địa điểm làm việc</Text>}
                >
                  <Input 
                    placeholder="e.g. Ho Chi Minh City" 
                    size="large"
                    prefix={<EnvironmentOutlined className="text-gray-400" />}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item 
                  name="jobCategoryId" 
                  label={<Text strong>Danh mục công việc</Text>}
                >
                  <Select placeholder="Select category" allowClear size="large">
                    {jobCategories?.map((category) => (
                      <Option key={category._id} value={category._id}>
                        {category.title}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Card>
        );

      case 2:
        return (
          <Card className="">
            <Row gutter={24}>
              <Col xs={24}>
                <Title level={4} className="mb-6 text-gray-800">
                  <DollarOutlined className="mr-2 text-yellow-500" />
                  Mức lương & Thời hạn
                </Title>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item
                  name="currency"
                  label={<Text strong>Đơn vị tiền tệ</Text>}
                  rules={[{ required: true, message: 'Please select currency' }]}
                >
                  <Select placeholder="Select currency" size="large">
                    <Option value="VND">🇻🇳 VND (Vietnamese Dong)</Option>
                    <Option value="USD">🇺🇸 USD (US Dollar)</Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item
                  name="salaryMin"
                  label={<Text strong>Mức lương tối thiểu</Text>}
                  rules={[
                    { type: 'number', min: 0, message: 'Salary must be positive' },
                  ]}
                >
                  <InputNumber
                    className="w-full"
                    placeholder="e.g. 15000000"
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                    size="large"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item
                  name="salaryMax"
                  label={<Text strong>Mức lương tối đa</Text>}
                  rules={[
                    { type: 'number', min: 0, message: 'Salary must be positive' },
                  ]}
                >
                  <InputNumber
                    className="w-full"
                    placeholder="e.g. 25000000"
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                    size="large"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item 
                  name="deadline" 
                  label={<Text strong>Hạn nộp hồ sơ</Text>}
                >
                  <DatePicker
                    className="w-full rounded-lg"
                    placeholder="Select deadline"
                    disabledDate={(current) => current && current < dayjs().startOf('day')}
                    size="large"
                    format="DD/MM/YYYY"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item 
                  name="isActive" 
                  label={<Text strong>Trạng thái</Text>} 
                  valuePropName="checked"
                >
                  <Switch
                    checkedChildren="Active"
                    unCheckedChildren="Inactive"
                    className="bg-green-500"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        );

      case 3:
        return (
          <Card className="">
            <Row gutter={24}>
              <Col xs={24}>
                <Title level={4} className="mb-6 text-gray-800">
                  <TrophyOutlined className="mr-2 text-purple-500" />
                  Thông tin bổ sung
                </Title>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item
                  name="requirements"
                  label={<Text strong>Yêu cầu ứng viên</Text>}
                >
                  <TextArea
                    rows={6}
                    placeholder="Nhập các yêu cầu đối với ứng viên..."
                    showCount
                    maxLength={1000}
                    className="rounded-lg"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item
                  name="benefits"
                  label={<Text strong>Quyền lợi</Text>}
                >
                  <TextArea
                    rows={6}
                    placeholder="Nhập các quyền lợi khi làm việc..."
                    showCount
                    maxLength={1000}
                    className="rounded-lg"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                {renderArrayField('Kỹ năng cần thiết', 'Nhập kỹ năng')}
              </Col>

              <Col xs={24} md={8}>
                <Form.Item 
                  name="recruiterId" 
                  label={<Text strong>ID Recruiter</Text>}
                >
                  <Input 
                    placeholder="ID của recruiter"
                    size="large"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item 
                  name="deleted" 
                  label={<Text strong>Trạng thái xóa</Text>} 
                  valuePropName="checked"
                >
                  <Switch
                    checkedChildren="Đã xóa"
                    unCheckedChildren="Chưa xóa"
                    className="bg-red-500"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        );

      default:
        return null;
    }
  };

  const nextStep = () => {
    form.validateFields().then(() => {
      setCurrentStep(currentStep + 1);
    });
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (!jobData) {
    return (
      <div className="text-center text-red-500">
        Failed to load job data. Please try again.
      </div>
    );
  }

  return (
    <div className="job-edit-form min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={onCancel}
              className="mr-4"
            >
              Quay lại
            </Button>
            <Title level={2} className="text-gray-800 mb-0">
              Chỉnh sửa tin tuyển dụng
            </Title>
          </div>
          <Text className="text-gray-600">
            Cập nhật thông tin tin tuyển dụng của bạn
          </Text>
        </div>

        {/* Steps */}
        <Card className="mb-6">
          <Steps
            current={currentStep}
            items={steps}
            className="mb-8"
          />
        </Card>

        {/* Form */}
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="space-y-6"
        >
          {renderStepContent()}

          {/* Navigation */}
          <Card className="">
            <Row justify="space-between" align="middle">
              <Col>
                {currentStep > 0 && (
                  <Button 
                    onClick={prevStep} 
                    size="large"
                  >
                    Quay lại
                  </Button>
                )}
              </Col>
              <Col>
                <Space>
                  <Button 
                    onClick={onCancel} 
                    size="large"
                  >
                    Hủy
                  </Button>
                  {currentStep < steps.length - 1 ? (
                    <Button 
                      type="primary" 
                      onClick={nextStep} 
                      size="large"
                    >
                      Tiếp theo
                    </Button>
                  ) : (
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      icon={<SaveOutlined />}
                      size="large"
                    >
                      Cập nhật tin tuyển dụng
                    </Button>
                  )}
                </Space>
              </Col>
            </Row>
          </Card>
        </Form>
      </div>
    </div>
  );
};

export default JobEditForm;