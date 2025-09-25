import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Tag,
  Button,
  Divider,
  Avatar,
  Empty,
  Spin,
  message,
  Popconfirm,
  Badge,
  Statistic,
  Progress,
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  ToolOutlined,
  FileTextOutlined,
  BankOutlined,
  UserOutlined,
  EyeOutlined,
  ShareAltOutlined,
  BookOutlined,
} from '@ant-design/icons';
import type { JobData } from '../types/job.type';
import { 
  JOB_TYPE_LABELS, 
  WORKING_MODE_LABELS 
} from '../types/job.type';
import { fetchJobById, deleteJob, toggleJobStatus } from '../apis/job.api';
import { formatCurrency } from '../utils/currency';
import dayjs from 'dayjs';
import { applicationsAPI } from '../apis/applications.api';
import type { ApplicationItem } from '../apis/applications.api';

const { Title, Text, Paragraph } = Typography;

interface JobDetailProps {
  jobId: string;
  onEdit: (job: JobData) => void;
  onBack: () => void;
  onJobDeleted: () => void;
}

const JobDetail: React.FC<JobDetailProps> = ({
  jobId,
  onEdit,
  onBack,
  onJobDeleted,
}) => {
  const [job, setJob] = useState<JobData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [appsTotal, setAppsTotal] = useState(0);
  const [appsLoading, setAppsLoading] = useState(false);

  useEffect(() => {
    loadJobDetail();
    loadApplications();
  }, [jobId]);

  const loadJobDetail = async () => {
    try {
      setLoading(true);
      const response = await fetchJobById(jobId);
      setJob(response.data!);
    } catch (error: any) {
      message.error('Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  const loadApplications = async () => {
    try {
      setAppsLoading(true);
      const res = await applicationsAPI.listByJob(jobId, 1, 10);
      setApplications(res.data || []);
      setAppsTotal(res.total || 0);
    } catch (error: any) {
      console.error('Error loading applications:', error);
      message.error('Không thể tải danh sách ứng viên');
    } finally {
      setAppsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setActionLoading(true);
      await deleteJob(jobId);
      message.success('Job deleted successfully');
      onJobDeleted();
      onBack();
    } catch (error: any) {
      message.error(error.message || 'Failed to delete job');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!job) return;

    try {
      setActionLoading(true);
      const response = await toggleJobStatus(jobId);
      setJob(response.data!);
      message.success('Cập nhật trạng thái công việc thành công');
    } catch (error: any) {
      message.error(error.message || 'Failed to update job status');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center">
        <Empty
          description="Job not found"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </div>
    );
  }

  const deadlineISO = job.deadline;
  const isExpired = deadlineISO && new Date(deadlineISO) < new Date();
  const daysUntilDeadline = deadlineISO 
    ? Math.ceil((new Date(deadlineISO).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="job-detail bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-8">
        <div className="w-[80vw] mx-auto px-6">
          <div className="flex items-center mb-6">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={onBack}
              className="mr-4 bg-white/20 border-white/30 text-white hover:bg-white/30"
              size="large"
            >
              Quay lại danh sách
            </Button>
            <div className="flex-1">
              <Title level={2} className="text-white mb-2">
                {job.title}
              </Title>
              <div className="flex items-center gap-4 text-blue-100">
                {job.company?.name && (
                  <span className="flex items-center gap-2">
                    <BankOutlined />
                    {job.company.name}
                  </span>
                )}
                {job.location && (
                  <span className="flex items-center gap-2">
                    <EnvironmentOutlined />
                    {job.location}
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-3">
              <Badge 
                status={((job as any).status === 'active') ? 'success' : ((job as any).status === 'expired' ? 'error' : 'default')} 
                text={((job as any).status === 'active') ? 'Đang tuyển' : ((job as any).status === 'expired' ? 'Hết hạn' : 'Nháp/Tạm dừng')}
                className="text-white"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="w-[80vw] mx-auto px-6 py-8">
        <Row gutter={32}>
          {/* Main Content */}
          <Col xs={24} lg={16}>
                         {/* Job Overview Card */}
             <div className="mb-6 bg-white p-6 rounded-lg">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <Title level={4} className="text-gray-800 mb-0">
                    <FileTextOutlined className="mr-2 text-blue-500" />
                    Mô tả công việc
                  </Title>
                  <div className="flex gap-2">
                    <Button 
                      icon={<ShareAltOutlined />} 
                      size="small"
                      className="text-gray-600"
                    >
                      Chia sẻ
                    </Button>
                    <Button 
                      icon={<BookOutlined />} 
                      size="small"
                      className="text-gray-600"
                    >
                      Lưu
                    </Button>
                  </div>
                </div>
                <Paragraph className="text-gray-700 leading-relaxed text-base">
                  {job.description}
                </Paragraph>
              </div>

              {/* Job Tags */}
              <div className="flex flex-wrap gap-3 mb-6">
                <Tag color="blue" className="rounded-full px-4 py-1 text-sm font-medium">
                  {JOB_TYPE_LABELS[job.jobType]}
                </Tag>
                <Tag color="green" className="rounded-full px-4 py-1 text-sm font-medium">
                  {WORKING_MODE_LABELS[job.workingMode]}
                </Tag>
                {job.jobCategory && (
                  <Tag color="purple" className="rounded-full px-4 py-1 text-sm font-medium">
                    {job.jobCategory.title}
                  </Tag>
                )}
                {isExpired && (
                  <Tag color="red" className="rounded-full px-4 py-1 text-sm font-medium">
                    Hết hạn
                  </Tag>
                )}
              </div>

              {/* Company Info */}
              {job.company && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-100">
                  <div className="flex items-center">
                    {job.company.logo && (
                      <Avatar src={job.company.logo} size={80} className="mr-6" />
                    )}
                    <div className="flex-1">
                      <Title level={4} className="text-gray-800 mb-2">
                        <BankOutlined className="mr-2 text-blue-500" />
                        {job.company.name}
                      </Title>
                      {job.location && (
                        <Text className="text-gray-600 flex items-center gap-2">
                          <EnvironmentOutlined />
                          {job.location}
                        </Text>
                      )}
                    </div>
                    <Button type="primary" className="bg-blue-500 border-blue-500">
                      Xem công ty
                    </Button>
                  </div>
                </div>
                             )}
             </div>

            {/* Requirements, Benefits, Skills */}
            <div className="space-y-6 bg-gray-50 p-6 rounded-lg">
              {/* Requirements */}
              {job.requirements && (
                <div>
                  <Title level={5} className="text-gray-800 mb-4">
                    <FileTextOutlined className="mr-2 text-green-500" />
                    Yêu cầu ứng viên
                  </Title>
                  <Paragraph className="text-gray-700 whitespace-pre-line leading-relaxed text-base">
                    {job.requirements}
                  </Paragraph>
                </div>
              )}

              {/* Benefits */}
              {job.benefits && (
                <div>
                  <Title level={5} className="text-gray-800 mb-4">
                    <TrophyOutlined className="mr-2 text-yellow-500" />
                    Quyền lợi
                  </Title>
                  <Paragraph className="text-gray-700 whitespace-pre-line leading-relaxed text-base">
                    {job.benefits}
                  </Paragraph>
                </div>
              )}

              {/* Skills */}
              {job.skills && job.skills.length > 0 && (
                <div>
                  <Title level={5} className="text-gray-800 mb-4">
                    <ToolOutlined className="mr-2 text-purple-500" />
                    Kỹ năng cần thiết
                  </Title>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill: string, index: number) => (
                      <Tag 
                        key={index} 
                        color="processing" 
                        className="rounded-full px-3 py-1 text-sm font-medium"
                      >
                        {skill}
                      </Tag>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Empty state for additional info */}
            {(!job.requirements || job.requirements.trim() === '') &&
             (!job.benefits || job.benefits.trim() === '') &&
             (!job.skills || job.skills.length === 0) && (
              <Card className="shadow-sm border-0 mt-6">
                <Empty
                  description="Chưa có thông tin bổ sung cho công việc này"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              </Card>
            )}
          </Col>

          {/* Sidebar */}
          <Col xs={24} lg={8}>
            <div className="space-y-6">
                                            {/* Action Buttons */}
               <div className="bg-white p-6 rounded-lg">
                 <div className="space-y-4">
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={() => onEdit(job)}
                    className="w-full h-12 bg-blue-500 border-blue-500 hover:bg-blue-600"
                    size="large"
                  >
                    Chỉnh sửa tin tuyển dụng
                  </Button>
                  <div className="flex gap-3">
                    <Button
                      type="default"
                      icon={(job as any).status === 'active' ? <CloseCircleOutlined /> : <CheckCircleOutlined />}
                      onClick={handleToggleStatus}
                      loading={actionLoading}
                      className="flex-1"
                    >
                      {(job as any).status === 'active' ? 'Tạm dừng' : 'Kích hoạt'}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Salary Card */}
              {(job.salaryMin || job.salaryMax) && (
                <div className="bg-white p-6 rounded-lg">
                  <div className="text-center">
                    <Title level={5} className="text-gray-800 mb-4">
                      <DollarOutlined className="mr-2 text-green-500" />
                      Mức lương
                    </Title>
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-100">
                      <Statistic
                        value={job.salaryMin && job.salaryMax 
                          ? `${formatCurrency(job.salaryMin)} - ${formatCurrency(job.salaryMax)}`
                          : job.salaryMin 
                          ? `Từ ${formatCurrency(job.salaryMin)}`
                          : job.salaryMax
                          ? `Đến ${formatCurrency(job.salaryMax)}`
                          : 'Thỏa thuận'
                        }
                        valueStyle={{ 
                          color: '#059669', 
                          fontSize: '20px',
                          fontWeight: 'bold'
                        }}
                        suffix={
                          <span className="text-sm text-gray-500 ml-1">
                            {job.currency}
                          </span>
                        }
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Deadline Card */}
              {deadlineISO && (
                <div className="bg-white p-6 rounded-lg">
                  <Title level={5} className="text-gray-800 mb-4">
                    <CalendarOutlined className="mr-2 text-blue-500" />
                    Hạn nộp hồ sơ
                  </Title>
                  <div className="space-y-4">
                    <div className="text-center">
                      <Text className="text-xl font-bold text-gray-800">
                        {dayjs(deadlineISO).format('DD/MM/YYYY')}
                      </Text>
                    </div>
                    {daysUntilDeadline !== null && (
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span>Thời gian còn lại</span>
                          <span className="font-medium">
                            {daysUntilDeadline < 0 
                              ? `${Math.abs(daysUntilDeadline)} ngày trước`
                              : `${daysUntilDeadline} ngày`
                            }
                          </span>
                        </div>
                        <Progress 
                          percent={daysUntilDeadline < 0 ? 100 : Math.max(0, 100 - (daysUntilDeadline * 3.33))}
                          status={daysUntilDeadline < 0 ? 'exception' : daysUntilDeadline <= 7 ? 'active' : 'normal'}
                          strokeColor={daysUntilDeadline < 0 ? '#ff4d4f' : daysUntilDeadline <= 7 ? '#faad14' : '#52c41a'}
                        />
                        <Tag 
                          color={daysUntilDeadline < 0 ? 'red' : daysUntilDeadline <= 7 ? 'orange' : 'green'}
                          className="w-full text-center rounded-full"
                        >
                          <ClockCircleOutlined className="mr-1" />
                          {daysUntilDeadline < 0 
                            ? `Hết hạn ${Math.abs(daysUntilDeadline)} ngày trước`
                            : daysUntilDeadline === 0
                            ? 'Hết hạn hôm nay'
                            : `${daysUntilDeadline} ngày còn lại`
                          }
                        </Tag>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Job Info Card */}
              <div className="bg-white p-6 rounded-lg">
                <Title level={5} className="text-gray-800 mb-4">
                  <UserOutlined className="mr-2 text-purple-500" />
                  Thông tin công việc
                </Title>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Loại công việc</span>
                    <Tag color="blue" className="rounded-full">
                      {JOB_TYPE_LABELS[job.jobType]}
                    </Tag>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Hình thức làm việc</span>
                    <Tag color="green" className="rounded-full">
                      {WORKING_MODE_LABELS[job.workingMode]}
                    </Tag>
                  </div>

                  {job.location && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Địa điểm</span>
                      <span className="text-gray-800 font-medium">
                        <EnvironmentOutlined className="mr-1" />
                        {job.location}
                      </span>
                    </div>
                  )}

                  <Divider className="my-4" />

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ngày tạo</span>
                      <span className="text-gray-800 font-medium">
                        {dayjs(job.createdAt).format('DD/MM/YYYY')}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cập nhật lần cuối</span>
                      <span className="text-gray-800 font-medium">
                        {dayjs(job.updatedAt).format('DD/MM/YYYY')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white p-6 rounded-lg">
                <Title level={5} className="text-gray-800 mb-4">
                  <EyeOutlined className="mr-2 text-blue-500" />
                  Thống kê
                </Title>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-gray-600">Lượt xem</span>
                    <span className="font-bold text-blue-600">1,234</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-gray-600">Đơn ứng tuyển</span>
                    <span className="font-bold text-green-600">{appsTotal}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                    <span className="text-gray-600">Lượt lưu</span>
                    <span className="font-bold text-purple-600">23</span>
                  </div>
                </div>
              </div>

              {/* Applications List */}
              <div className="bg-white p-6 rounded-lg">
                <Title level={5} className="text-gray-800 mb-4">
                  <UserOutlined className="mr-2 text-purple-500" />
                  Ứng viên đã ứng tuyển
                </Title>
                {appsLoading ? (
                  <div className="text-center py-6">
                    <Spin />
                  </div>
                ) : applications.length === 0 ? (
                  <Empty description="Chưa có ứng viên ứng tuyển" />
                ) : (
                  <div className="space-y-3">
                    {applications.map((app) => {
                      // Backend populate account từ accountId, nên ưu tiên sử dụng app.account
                      const userName = app.account?.fullName || 
                        (typeof app.userId === 'object' ? app.userId?.fullName : null) ||
                        app.userProfile?.desiredPosition ||
                        (typeof app.userId === 'string' ? app.userId : 'Ứng viên');
                      
                      const userEmail = app.account?.email || 
                        (typeof app.userId === 'object' ? app.userId?.email : null) ||
                        'N/A';
                      
                      return (
                        <div key={app._id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100">
                          <div className="flex items-center gap-3">
                            <Avatar icon={<UserOutlined />} />
                            <div>
                              <div className="font-medium">{userName}</div>
                              <div className="text-sm text-gray-500">
                                {userEmail !== 'N/A' && `${userEmail} • `}
                                Trạng thái: <span className={`font-medium ${
                                  app.status === 'accepted' ? 'text-green-600' :
                                  app.status === 'rejected' ? 'text-red-600' :
                                  app.status === 'withdrawn' ? 'text-gray-600' :
                                  'text-yellow-600'
                                }`}>
                                  {app.status === 'pending' ? 'Chờ xét duyệt' :
                                   app.status === 'accepted' ? 'Đã chấp nhận' :
                                   app.status === 'rejected' ? 'Đã từ chối' :
                                   'Đã rút đơn'}
                                </span>
                              </div>
                              {app.note && (
                                <div className="text-xs text-gray-400 mt-1">
                                  Ghi chú: {app.note}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {app.status === 'pending' && (
                              <>
                                <Button 
                                  size="small" 
                                  type="primary"
                                  onClick={() => applicationsAPI.updateStatus(app._id, 'accepted').then(loadApplications)}
                                >
                                  Chấp nhận
                                </Button>
                                <Button 
                                  size="small" 
                                  danger 
                                  onClick={() => applicationsAPI.updateStatus(app._id, 'rejected').then(loadApplications)}
                                >
                                  Từ chối
                                </Button>
                              </>
                            )}
                            {app.status === 'accepted' && (
                              <Tag color="green">Đã chấp nhận</Tag>
                            )}
                            {app.status === 'rejected' && (
                              <Tag color="red">Đã từ chối</Tag>
                            )}
                            {app.status === 'withdrawn' && (
                              <Tag color="default">Đã rút đơn</Tag>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="bg-white p-6 rounded-lg">
                <Title level={5} className="text-gray-800 mb-4">
                  <DeleteOutlined className="mr-2 text-red-500" />
                  Hành động
                </Title>
                <div className="space-y-3">
                  <Popconfirm
                    title="Xóa tin tuyển dụng"
                    description="Bạn có chắc chắn muốn xóa tin tuyển dụng này? Hành động này không thể hoàn tác."
                    onConfirm={handleDelete}
                    okText="Có"
                    cancelText="Không"
                    okType="danger"
                  >
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      loading={actionLoading}
                      className="w-full"
                      size="large"
                    >
                      Xóa tin tuyển dụng
                    </Button>
                  </Popconfirm>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </div>

      <style>{`
        .job-detail .ant-card {
          border-radius: 12px;
        }
        .job-detail .ant-card-head {
          border-bottom: 1px solid #f0f0f0;
        }
        .job-detail .ant-statistic-content {
          font-size: 20px;
        }
        .job-detail .ant-progress-text {
          font-size: 12px;
        }
        
        /* Reduced spacing for job detail cards */
        .job-detail .space-y-6 > * + * {
          margin-top: 16px;
        }
        
        .job-detail .space-y-4 > * + * {
          margin-top: 12px;
        }
        
        .job-detail .space-y-3 > * + * {
          margin-top: 8px;
        }
        
        .job-detail .space-y-2 > * + * {
          margin-top: 6px;
        }
        
        /* Reduced card padding */
        .job-detail .bg-white.p-6 {
          padding: 20px;
        }
        
        /* Reduced spacing for flex items */
        .job-detail .flex.justify-between {
          padding: 4px 0;
        }
        
        /* Reduced spacing for progress and tags */
        .job-detail .ant-progress {
          margin: 8px 0;
        }
        
        .job-detail .ant-tag {
          margin: 4px 0;
          padding: 4px 8px;
        }
        
        /* Reduced spacing for statistics */
        .job-detail .bg-blue-50,
        .job-detail .bg-green-50,
        .job-detail .bg-purple-50 {
          margin: 4px 0;
          padding: 8px 12px;
        }
      `}</style>
    </div>
  );
};

export default JobDetail;
