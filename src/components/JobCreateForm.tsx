import React, { useState } from 'react';
import { Form, Input, Select, InputNumber, DatePicker, Button, Row, Col, Typography, message, Space, Card } from 'antd';
import { SaveOutlined, CloseOutlined, PlusOutlined, EnvironmentOutlined } from '@ant-design/icons';
import type { CreateJobData } from '../types/job.type';
import { JobType, WorkingMode, JOB_TYPE_LABELS, WORKING_MODE_LABELS } from '../types/job.type';
import { createJob } from '../apis/job.api';
import { jobCategoriesAPI } from '../apis/job-categories.api';
import dayjs from 'dayjs';
import './JobCreateForm.css';

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

interface JobCreateFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const JobCreateForm: React.FC<JobCreateFormProps> = ({ onSuccess, onCancel }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [jobCategories, setJobCategories] = useState<any[]>([]);
  const [skills, setSkills] = useState<string[]>(['']);

  React.useEffect(() => {
    const loadJobCategories = async () => {
      try {
        const response = await jobCategoriesAPI.getActiveCategories();
        setJobCategories(response.data);
      } catch (error: any) {
        // ignore
      }
    };
    loadJobCategories();
  }, []);

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      const filteredSkills = skills.filter((s) => s.trim() !== '');
      const payload: CreateJobData = {
        ...values,
        skills: filteredSkills.length ? filteredSkills : undefined,
        deadline: values.expiresAt ? dayjs(values.expiresAt).toISOString() : undefined,
        status: values.status || 'draft',
      };
      await createJob(payload);
      message.success('Tạo tin tuyển dụng thành công!');
      onSuccess();
    } catch (error: any) {
      message.error(error.message || 'Không thể tạo tin tuyển dụng');
    } finally {
      setLoading(false);
    }
  };

    return (
    <div className="job-create-form bg-gray-50 p-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <Title level={3} className="text-gray-800 mb-1">Tạo tin tuyển dụng mới</Title>
          <Text className="text-gray-600">Điền thông tin chi tiết theo schema Job</Text>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            status: 'draft',
            jobType: JobType.FULLTIME,
            workingMode: WorkingMode.ONSITE,
            currency: 'VND',
          }}
        >
          <Card bordered={false} className="mb-4">
            <Row gutter={16}>
              <Col xs={24}>
                <Form.Item
                  name="title"
                  label={<Text strong>Tiêu đề tin tuyển dụng</Text>}
                  rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
                >
                  <Input placeholder="VD: Senior Frontend Developer" size="large" />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item
                  name="description"
                  label={<Text strong>Mô tả công việc</Text>}
                  rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
                >
                  <TextArea rows={6} placeholder="Mô tả chi tiết về vị trí, nhiệm vụ..." />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <Card bordered={false} className="mb-4">
            <Row gutter={16}>
              <Col xs={24} md={8}>
                <Form.Item name="jobType" label={<Text strong>Loại công việc</Text>} rules={[{ required: true }]}>
                  <Select placeholder="Chọn loại" size="large">
                    {Object.entries(JOB_TYPE_LABELS).map(([value, label]) => (
                      <Option key={value} value={value}>{label as React.ReactNode}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="workingMode" label={<Text strong>Hình thức</Text>} rules={[{ required: true }]}>
                  <Select placeholder="Chọn hình thức" size="large">
                    {Object.entries(WORKING_MODE_LABELS).map(([value, label]) => (
                      <Option key={value} value={value}>{label as React.ReactNode}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="location" label={<Text strong>Địa điểm</Text>}>
                  <Input placeholder="VD: Hà Nội" size="large" prefix={<EnvironmentOutlined />} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="jobCategoryId" label={<Text strong>Danh mục</Text>}>
                  <Select placeholder="Chọn danh mục" size="large" allowClear>
                    {jobCategories?.map((c) => (
                      <Option key={c._id} value={c._id}>{c.title}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <Card bordered={false} className="mb-4">
            <Row gutter={16}>
              <Col xs={24} md={8}>
                <Form.Item name="currency" label={<Text strong>Tiền tệ</Text>} rules={[{ required: true }]}>
                  <Select size="large">
                    <Option value="VND">VND</Option>
                    <Option value="USD">USD</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="salaryMin" label={<Text strong>Lương tối thiểu</Text>}>
                  <InputNumber className="w-full" size="large" formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={(v) => v!.replace(/\$\s?|(,*)/g, '')} />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="salaryMax" label={<Text strong>Lương tối đa</Text>}>
                  <InputNumber className="w-full" size="large" formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={(v) => v!.replace(/\$\s?|(,*)/g, '')} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="expiresAt" label={<Text strong>Hạn nộp hồ sơ</Text>}>
                  <DatePicker className="w-full" size="large" format="DD/MM/YYYY" placeholder="Chọn ngày" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="status" label={<Text strong>Trạng thái</Text>} initialValue={'draft'}>
                  <Select size="large">
                    <Option value="draft">Nháp</Option>
                    <Option value="active">Đăng ngay</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <Card bordered={false} className="mb-4">
            <Row gutter={16}>
              <Col xs={24} md={8}>
                <Form.Item name="requirements" label={<Text strong>Yêu cầu</Text>}>
                  <TextArea rows={6} placeholder="Yêu cầu ứng viên..." />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="benefits" label={<Text strong>Quyền lợi</Text>}>
                  <TextArea rows={6} placeholder="Quyền lợi khi làm việc..." />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label={<Text strong>Kỹ năng</Text>}>
                  <Space direction="vertical" className="w-full">
                    {skills.map((value, index) => (
                      <Space key={index} className="w-full">
                        <Input value={value} onChange={(e) => {
                          const arr = [...skills];
                          arr[index] = e.target.value;
                          setSkills(arr);
                        }} placeholder={`Kỹ năng ${index + 1}`} size="large" />
                        {skills.length > 1 && (
                          <Button type="link" danger icon={<CloseOutlined />} onClick={() => setSkills(skills.filter((_, i) => i !== index))} />
                        )}
                      </Space>
                    ))}
                    <Button type="dashed" icon={<PlusOutlined />} onClick={() => setSkills([...skills, ''])}>Thêm kỹ năng</Button>
                  </Space>
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <Card bordered={false}>
            <Row justify="end" gutter={12}>
              <Col>
                <Button onClick={onCancel} size="large">Hủy</Button>
              </Col>
              <Col>
                <Button type="primary" onClick={() => form.submit()} icon={<SaveOutlined />} loading={loading} size="large">Lưu</Button>
              </Col>
            </Row>
          </Card>
        </Form>
      </div>
    </div>
  );
};

export default JobCreateForm;