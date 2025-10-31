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
  Tabs,
  Radio,
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
import RichTextEditor from './RichTextEditor';

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
  const [activeTab, setActiveTab] = useState<string>('basic');
  // No need for companies state - backend handles company assignment
  const [jobData, setJobData] = useState<JobData | null>(null);
  const [isSalaryNegotiable, setIsSalaryNegotiable] = useState(false);
  const LEVEL_VI_OPTIONS = ['Thực tập sinh', 'Mới tốt nghiệp', 'Nhân viên', 'Chuyên viên', 'Trưởng nhóm', 'Trưởng phòng', 'Giám đốc'];
  const LEVEL_EN_OPTIONS = ['Intern', 'Fresher', 'Junior', 'Mid-level', 'Senior', 'Lead', 'Manager', 'Director'];
  const EDUCATION_OPTIONS = ['Không yêu cầu', 'Trung cấp', 'Cao đẳng', 'Đại học', 'Thạc sĩ', 'Tiến sĩ'];

  // Skills as tag list for modern UX
  const [skills, setSkills] = useState<string[]>([]);

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
      setSkills(job.skills?.length ? job.skills : []);

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
        isSalaryNegotiable: job.isSalaryNegotiable || false,
        expiresAt: job.deadline ? dayjs(job.deadline) : null,
        status: (job as any).status || 'draft',
        jobCategoryId: job.jobCategoryId,
        recruiterId: job.recruiterId,
        companyId: job.companyId,
        deleted: job.deleted || false,
        headcount: job.headcount || 1,
        levelVi: (job as any).levelVi || undefined,
        levelEn: (job as any).levelEn || undefined,
        education: (job as any).education || undefined,
        // companyId handled by backend
      });
      setIsSalaryNegotiable(!!job.isSalaryNegotiable);
    } catch (error: any) {
      message.error('Failed to load job data');
      throw error;
    }
  };

  // No need to load companies - backend handles this

  // No extra handlers needed with tags Select

  // Handle form submission
  const handleSubmit = async (values: JobEditFormData) => {
    try {
      setLoading(true);

      // Filter out empty values from skills array
      const filteredSkills = (skills || []).filter(skill => (skill || '').trim() !== '');

      const updateData: UpdateJobData = {
        ...values,
        skills: filteredSkills.length > 0 ? filteredSkills : undefined,
        deadline: (values as any).expiresAt
          ? ((values as any).expiresAt instanceof Date
              ? (values as any).expiresAt.toISOString()
              : new Date((values as any).expiresAt).toISOString())
          : undefined,
        status: (values as any).status,
        recruiterId: (values as any).recruiterId,
        companyId: (values as any).companyId,
        deleted: (values as any).deleted,
      };

      if (isSalaryNegotiable) {
        (updateData as any).isSalaryNegotiable = true;
        delete (updateData as any).salaryMin;
        delete (updateData as any).salaryMax;
      }

      await updateJob(jobId, updateData);
      message.success('Job updated successfully!');
      onSuccess();
    } catch (error: any) {
      message.error(error.message || 'Failed to update job');
    } finally {
      setLoading(false);
    }
  };

  // Skills field rendered with tags Select

  // Tabs content

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
        <Card className="mb-4" bodyStyle={{ paddingBottom: 12 }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Space align="center">
                <Button icon={<ArrowLeftOutlined />} onClick={onCancel}>
                  Quay lại
                </Button>
                <div>
                  <Title level={3} style={{ margin: 0 }}>Chỉnh sửa tin tuyển dụng</Title>
                  <Text type="secondary">Cập nhật thông tin tin tuyển dụng của bạn</Text>
                </div>
              </Space>
            </Col>
            <Col>
              <Space>
                <Button onClick={onCancel}>Hủy</Button>
                <Button type="primary" icon={<SaveOutlined />} loading={loading} onClick={() => form.submit()}>
                  Lưu thay đổi
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>

        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Card>
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={[
                { key: 'basic', label: (<span><FileTextOutlined className="mr-1" /> Thông tin cơ bản</span>), children: (
                  <Row gutter={24}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="title"
                        label={<Text strong>Tiêu đề tin tuyển dụng</Text>}
                        extra="VD: Senior Frontend Developer"
                        rules={[
                          { required: true, message: 'Vui lòng nhập tiêu đề tin tuyển dụng' },
                          { max: 100, message: 'Tiêu đề không được vượt quá 100 ký tự' },
                        ]}
                      >
                        <Input size="large" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item name="companyId" label={<Text strong>Công ty</Text>} extra="Backend sẽ tự gán nếu để trống">
                        <Input placeholder="ID công ty" size="large" />
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
                        <RichTextEditor
                          value={form.getFieldValue('description')}
                          onChange={(val) => form.setFieldsValue({ description: val })}
                          placeholder="Mô tả chi tiết về vị trí, trách nhiệm và yêu cầu ứng viên..."
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                )},
                { key: 'details', label: (<span><ToolOutlined className="mr-1" /> Chi tiết công việc</span>), children: (
                  <Row gutter={24}>
                    <Col xs={24} md={8}>
                      <Form.Item name="jobType" label={<Text strong>Loại công việc</Text>} rules={[{ required: true, message: 'Chọn loại công việc' }]}>
                        <Select placeholder="Chọn loại" size="large">
                          {Object.entries(JOB_TYPE_LABELS).map(([value, label]) => (
                            <Option key={value} value={value}>{label as React.ReactNode}</Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item name="workingMode" label={<Text strong>Hình thức làm việc</Text>} rules={[{ required: true, message: 'Chọn hình thức' }]}>
                        <Select placeholder="Chọn hình thức" size="large">
                          {Object.entries(WORKING_MODE_LABELS).map(([value, label]) => (
                            <Option key={value} value={value}>{label as React.ReactNode}</Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item name="location" label={<Text strong>Địa điểm làm việc</Text>}>
                        <Input placeholder="VD: Ho Chi Minh City" size="large" prefix={<EnvironmentOutlined className="text-gray-400" />} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item name="jobCategoryId" label={<Text strong>Danh mục công việc</Text>}>
                        <Select placeholder="Chọn danh mục" allowClear size="large">
                          {jobCategories?.map((category) => (
                            <Option key={category._id} value={category._id}>{category.title}</Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                )},
                { key: 'comp', label: (<span><DollarOutlined className="mr-1" /> Lương & Hạn nộp</span>), children: (
                  <Row gutter={24}>
                    <Col xs={24} md={8}>
                      <Form.Item name="currency" label={<Text strong>Đơn vị tiền tệ</Text>} rules={[{ required: true, message: 'Chọn đơn vị' }]}>
                        <Select placeholder="Chọn đơn vị" size="large">
                          <Option value="VND">🇻🇳 VND (Vietnamese Dong)</Option>
                          <Option value="USD">🇺🇸 USD (US Dollar)</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item label={<Text strong>Hình thức lương</Text>}>
                        <Radio.Group
                          value={isSalaryNegotiable ? 'negotiable' : 'range'}
                          onChange={(e) => {
                            const val = e.target.value === 'negotiable';
                            setIsSalaryNegotiable(val);
                            form.setFieldsValue({ isSalaryNegotiable: val, salaryMin: undefined, salaryMax: undefined });
                          }}
                        >
                          <Radio value="negotiable">Thỏa thuận</Radio>
                          <Radio value="range">Khoảng lương</Radio>
                        </Radio.Group>
                      </Form.Item>
                      <Form.Item name="isSalaryNegotiable" hidden>
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item name="headcount" label={<Text strong>Số lượng cần tuyển</Text>}>
                        <InputNumber className="w-full" size="large" min={1} />
                      </Form.Item>
                    </Col>
                    <Col xs={24}>
                      <Row gutter={24}>
                        <Col xs={24} md={12}>
                          <Form.Item name="salaryMin" label={<Text strong>Mức lương tối thiểu</Text>}>
                            <InputNumber disabled={isSalaryNegotiable} className="w-full" placeholder="VD: 15000000" formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={(value) => value!.replace(/\$\s?|(,*)/g, '')} size="large" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                          <Form.Item name="salaryMax" label={<Text strong>Mức lương tối đa</Text>}>
                            <InputNumber disabled={isSalaryNegotiable} className="w-full" placeholder="VD: 25000000" formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={(value) => value!.replace(/\$\s?|(,*)/g, '')} size="large" />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item name="expiresAt" label={<Text strong>Hạn nộp hồ sơ</Text>}>
                        <DatePicker className="w-full rounded-lg" placeholder="Chọn hạn nộp" disabledDate={(current) => current && current < dayjs().startOf('day')} size="large" format="DD/MM/YYYY" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item name="status" label={<Text strong>Trạng thái</Text>}>
                        <Select size="large">
                          <Option value="draft">Nháp</Option>
                          <Option value="active">Đã đăng</Option>
                          <Option value="expired">Hết hạn</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                )},
                { key: 'extra', label: (<span><TrophyOutlined className="mr-1" /> Thông tin bổ sung</span>), children: (
                  <Row gutter={24}>
                    <Col xs={24} md={12}>
                      <Form.Item name="requirements" label={<Text strong>Yêu cầu ứng viên</Text>}>
                        <RichTextEditor height={300} value={form.getFieldValue('requirements')} onChange={(val) => form.setFieldsValue({ requirements: val })} placeholder="Nhập các yêu cầu đối với ứng viên..." />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item name="benefits" label={<Text strong>Quyền lợi</Text>}>
                        <RichTextEditor height={300} value={form.getFieldValue('benefits')} onChange={(val) => form.setFieldsValue({ benefits: val })} placeholder="Nhập các quyền lợi khi làm việc..." />
                      </Form.Item>
                    </Col>
                    <Col xs={24}>
                      <Form.Item label={<Text strong>Kỹ năng cần thiết</Text>} extra="Nhập và nhấn Enter để thêm">
                        <Select
                          mode="tags"
                          value={skills}
                          onChange={(vals) => setSkills(vals as string[])}
                          placeholder="Nhập kỹ năng"
                          tokenSeparators={[',']}
                          size="large"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item name="levelVi" label={<Text strong>Cấp bậc (VI)</Text>}>
                        <Select placeholder="Chọn cấp bậc" allowClear size="large">
                          {LEVEL_VI_OPTIONS.map((l) => (
                            <Option key={l} value={l}>{l}</Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item name="levelEn" label={<Text strong>Job level (EN)</Text>}>
                        <Select placeholder="Select level" allowClear size="large">
                          {LEVEL_EN_OPTIONS.map((l) => (
                            <Option key={l} value={l}>{l}</Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item name="education" label={<Text strong>Học vấn</Text>}>
                        <Select placeholder="Chọn học vấn" allowClear size="large">
                          {EDUCATION_OPTIONS.map((e) => (
                            <Option key={e} value={e}>{e}</Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item name="recruiterId" label={<Text strong>ID Recruiter</Text>} extra="Thường không cần nhập thủ công">
                        <Input placeholder="ID của recruiter" size="large" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item name="deleted" label={<Text strong>Trạng thái xóa</Text>} valuePropName="checked">
                        <Switch checkedChildren="Đã xóa" unCheckedChildren="Chưa xóa" className="bg-red-500" />
                      </Form.Item>
                    </Col>
                  </Row>
                )},
              ]}
            />
          </Card>

          <div style={{ height: 16 }} />

          <Card>
            <Row justify="end">
              <Space>
                <Button onClick={onCancel}>Hủy</Button>
                <Button type="primary" icon={<SaveOutlined />} loading={loading} htmlType="submit">Cập nhật tin tuyển dụng</Button>
              </Space>
            </Row>
          </Card>
        </Form>
      </div>
    </div>
  );
};

export default JobEditForm;