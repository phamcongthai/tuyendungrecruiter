import React, { useEffect, useState } from 'react';
import { 
  Card, 
  Table, 
  Tag, 
  Typography, 
  message, 
  Empty, 
  Modal, 
  Button, 
  Avatar,
  Badge,
  Descriptions
} from 'antd';
import {
  EyeOutlined,
  TeamOutlined,
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  MinusCircleOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import CVViewer from '../components/CVViewer';
import { applicationsAPI } from '../apis/applications.api';
import { fetchJobs } from '../apis/job.api';
import type { JobData } from '../types/job.type';
import { JOB_TYPE_LABELS, WORKING_MODE_LABELS } from '../types/job.type';
import { formatCurrency } from '../utils/currency';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface JobWithApplications extends JobData {
  applicationCount: number;
}

interface ApplicationWithUser {
  _id: string;
  jobId: { _id: string; title?: string } | string;
  accountId: string;
  userId?: { _id: string; fullName?: string; email?: string; avatar?: string; desiredPosition?: string; summaryExperience?: string; skills?: string[]; cvData?: any } | string;
  userProfile?: {
    avatar?: string;
    dateOfBirth?: string;
    gender?: string;
    city?: string;
    desiredPosition?: string;
    summaryExperience?: string;
    skills?: string[];
    cvId?: string;
    cvFields?: Record<string, string>;
  } | null;
  account?: {
    fullName?: string;
    email?: string;
    phone?: string;
  } | null;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  note?: string;
  coverLetter?: string;
  createdAt: string;
}

const ApplicationsPage: React.FC = () => {
  // State for jobs table
  const [jobs, setJobs] = useState<JobWithApplications[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [jobsPage, setJobsPage] = useState(1);
  const [jobsLimit, setJobsLimit] = useState(10);
  const [jobsTotal, setJobsTotal] = useState(0);

  // State for applications table
  const [selectedJob, setSelectedJob] = useState<JobWithApplications | null>(null);
  const [applications, setApplications] = useState<ApplicationWithUser[]>([]);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [appsPage, setAppsPage] = useState(1);
  const [appsLimit, setAppsLimit] = useState(10);
  const [appsTotal, setAppsTotal] = useState(0);

  // State for applicant detail modal
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<ApplicationWithUser | null>(null);

  // State for CV viewer
  const [cvViewerVisible, setCvViewerVisible] = useState(false);
  const [selectedCvAccountId, setSelectedCvAccountId] = useState<string>('');
  const [selectedCvUserName, setSelectedCvUserName] = useState<string>('');


  // Load jobs for recruiter
  const loadJobs = async () => {
    try {
      setLoadingJobs(true);
      const response = await fetchJobs({ 
        page: jobsPage, 
        limit: jobsLimit,
        status: 'active'
      });
      
      console.log(JSON.stringify(response, null, 2));
      setJobs((response.data || []).map((job: any) => ({
        ...job,
        applicationCount: 0
      })));
      setJobsTotal(response.total || 0);
    } catch (error: any) {
      console.error('Error loading jobs:', error);
      message.error(error.message || 'Không thể tải danh sách tin tuyển dụng');
    } finally {
      setLoadingJobs(false);
    }
  };

  // Load applications for selected job
  const loadApplications = async () => {
    if (!selectedJob) return;
    
    try {
      setLoadingApplications(true);
      const response = await applicationsAPI.listByJob(
        selectedJob._id as string, 
        appsPage, 
        appsLimit
      );
      
      console.log(JSON.stringify(response, null, 2));
      
      setApplications(response.data || []);
      setAppsTotal(response.total || 0);
    } catch (error: any) {
      console.error('Error loading applications:', error);
      message.error(error.message || 'Không thể tải danh sách ứng viên');
    } finally {
      setLoadingApplications(false);
    }
  };

  // Load jobs on component mount and when pagination changes
  useEffect(() => {
    loadJobs();
  }, [jobsPage, jobsLimit]);

  // Load applications when job is selected
  useEffect(() => {
    if (selectedJob) {
      setAppsPage(1);
      loadApplications();
    }
  }, [selectedJob]);

  // Load applications when pagination changes
  useEffect(() => {
    if (selectedJob) {
      loadApplications();
    }
  }, [appsPage, appsLimit]);

  // Jobs table columns
  const jobsColumns = [
    {
      title: 'Tiêu đề công việc',
      dataIndex: 'title',
      key: 'title',
      render: (title: string, record: JobWithApplications) => (
        <div>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>{title}</div>
          <div style={{ fontSize: 12, color: '#666' }}>
            {record.company?.name || 'N/A'}
          </div>
        </div>
      ),
    },
    {
      title: 'Loại công việc',
      dataIndex: 'jobType',
      key: 'jobType',
      render: (jobType: string) => (
        <Tag color="blue">{JOB_TYPE_LABELS[jobType as keyof typeof JOB_TYPE_LABELS]}</Tag>
      ),
    },
    {
      title: 'Hình thức',
      dataIndex: 'workingMode',
      key: 'workingMode',
      render: (workingMode: string) => (
        <Tag color="green">{WORKING_MODE_LABELS[workingMode as keyof typeof WORKING_MODE_LABELS]}</Tag>
      ),
    },
    {
      title: 'Địa điểm',
      dataIndex: 'location',
      key: 'location',
      render: (location: string) => location || '—',
    },
    {
      title: 'Mức lương',
      key: 'salary',
      render: (_: any, record: JobWithApplications) => {
        if (record.salaryMin && record.salaryMax) {
          return `${formatCurrency(record.salaryMin)} - ${formatCurrency(record.salaryMax)}`;
        } else if (record.salaryMin) {
          return `Từ ${formatCurrency(record.salaryMin)}`;
        } else if (record.salaryMax) {
          return `Đến ${formatCurrency(record.salaryMax)}`;
        }
        return 'Thỏa thuận';
      },
    },
    {
      title: 'Số ứng viên',
      dataIndex: 'applicationCount',
      key: 'applicationCount',
      render: (_: number, record: JobWithApplications) => {
        const appCount = record.applicationCount || 0;
        return (
          <Badge 
            count={appCount} 
            showZero={true}
            style={{ backgroundColor: appCount > 0 ? '#52c41a' : '#d9d9d9' }}
          />
        );
      },
    },
    {
      title: 'Ngày đăng',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_: any, record: JobWithApplications) => (
        <Button
          type="primary"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => setSelectedJob(record)}
          disabled={record.applicationCount === 0}
        >
          Xem ứng viên
        </Button>
      ),
    },
  ];

  // Applications table columns
  const applicationsColumns = [
    {
      title: 'Ứng viên',
      dataIndex: 'userProfile',
      key: 'user',
      render: (_: any, record: ApplicationWithUser) => {
        // Backend populate account từ accountId, nên ưu tiên sử dụng record.account
        const fullName = record.account?.fullName || 
          (typeof record.userId === 'object' ? record.userId?.fullName : null) ||
          record.userProfile?.desiredPosition ||
          (typeof record.userId === 'string' ? record.userId : 'Ứng viên');
        
        const email = record.account?.email || 
          (typeof record.userId === 'object' ? record.userId?.email : null) ||
          'N/A';
        
        const profile = record.userProfile;
        const avatar = profile?.avatar;
        
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar 
              src={avatar} 
              icon={<UserOutlined />}
              size={40}
            />
            <div>
              <div style={{ fontWeight: 600 }}>{fullName}</div>
              <div style={{ fontSize: 12, color: '#666' }}>
                {email !== 'N/A' ? email : '—'}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      title: 'Vị trí mong muốn',
      key: 'desiredPosition',
      render: (_: any, record: ApplicationWithUser) => record.userProfile?.desiredPosition || '—',
    },
    {
      title: 'Kinh nghiệm',
      key: 'experience',
      render: (_: any, record: ApplicationWithUser) => record.userProfile?.summaryExperience || '—',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusConfig = {
          pending: { color: 'blue', icon: <ClockCircleOutlined />, text: 'Chờ xử lý' },
          accepted: { color: 'green', icon: <CheckCircleOutlined />, text: 'Đã chấp nhận' },
          rejected: { color: 'red', icon: <CloseCircleOutlined />, text: 'Đã từ chối' },
          withdrawn: { color: 'default', icon: <MinusCircleOutlined />, text: 'Đã rút hồ sơ' },
        };
        const config = statusConfig[status as keyof typeof statusConfig];
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: 'Ngày nộp',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_: any, record: ApplicationWithUser) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedApplication(record);
              setDetailModalVisible(true);
            }}
          >
            Chi tiết
          </Button>
          <Button
            type="link"
            icon={<FileTextOutlined />}
            onClick={() => {
              const accountId = record.accountId;
              const userName = record.account?.fullName || 'Ứng viên';
              handleViewCV(accountId, userName);
            }}
          >
            Xem CV
          </Button>
        </div>
      ),
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'green';
      case 'rejected': return 'red';
      case 'withdrawn': return 'default';
      default: return 'blue';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'accepted': return 'Đã chấp nhận';
      case 'rejected': return 'Đã từ chối';
      case 'withdrawn': return 'Đã rút hồ sơ';
      default: return 'Chờ xử lý';
    }
  };

  const handleViewCV = (accountId: string, userName: string) => {
    setSelectedCvAccountId(accountId);
    setSelectedCvUserName(userName);
    setCvViewerVisible(true);
  };


  return (
    <div style={{ width: '100%', height: '100%' }}>
      {/* Unified Single Section */}
      <Card style={{ border: 'none', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <Title level={4} style={{ margin: 0 }}>
              {selectedJob ? `Ứng viên cho: ${selectedJob.title}` : 'Tất cả ứng viên'}
            </Title>
            {selectedJob && (
              <Text type="secondary">
                {selectedJob.company?.name} • {appsTotal} ứng viên
              </Text>
            )}
          </div>
          {selectedJob && (
            <Button 
              onClick={() => setSelectedJob(null)}
              icon={<TeamOutlined />}
            >
              Quay lại danh sách công việc
            </Button>
          )}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minHeight: 0 }}>
          {!selectedJob ? (
            <Table
              rowKey="_id"
              columns={jobsColumns}
              dataSource={jobs}
              loading={loadingJobs}
              pagination={{
                current: jobsPage,
                pageSize: jobsLimit,
                total: jobsTotal,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} công việc`,
                onChange: (page, pageSize) => {
                  setJobsPage(page);
                  setJobsLimit(pageSize || 10);
                },
              }}
              locale={{ 
                emptyText: <Empty description="Chưa có công việc nào" />
              }}
            />
          ) : (
            <Table
              rowKey="_id"
              columns={applicationsColumns}
              dataSource={applications}
              loading={loadingApplications}
              pagination={{
                current: appsPage,
                pageSize: appsLimit,
                total: appsTotal,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} ứng viên`,
                onChange: (page, pageSize) => {
                  setAppsPage(page);
                  setAppsLimit(pageSize || 10);
                },
              }}
              locale={{ 
                emptyText: <Empty description="Chưa có ứng viên nào" />
              }}
            />
          )}
        </div>
      </Card>

      {/* Applicant Detail Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar 
              src={selectedApplication?.userProfile?.avatar}
              icon={<UserOutlined />}
              size={40}
            />
            <div>
              <div style={{ fontWeight: 600 }}>
                {selectedApplication?.account?.fullName || '—'}
              </div>
              <div style={{ fontSize: 12, color: '#666' }}>
                {selectedApplication?.account?.email || '—'}
              </div>
            </div>
          </div>
        }
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setSelectedApplication(null);
        }}
        width={1000}
        footer={[
          <Button key="close" onClick={() => {
            setDetailModalVisible(false);
            setSelectedApplication(null);
          }}>
            Đóng
          </Button>
        ]}
      >
        {selectedApplication && (
            <div>
            {/* Basic Information */}
            <Card title="Thông tin cơ bản" style={{ marginBottom: 16 }}>
              <Descriptions column={2} size="small">
                <Descriptions.Item label="Họ tên">
                  {selectedApplication.account?.fullName || '—'}
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                  {selectedApplication.account?.email || '—'}
                </Descriptions.Item>
                <Descriptions.Item label="Giới tính">
                  {(() => {
                    const gender = selectedApplication.userProfile?.gender;
                    return gender === 'male' ? 'Nam' : gender === 'female' ? 'Nữ' : (gender ? 'Khác' : '—');
                  })()}
                </Descriptions.Item>
                <Descriptions.Item label="Thành phố">
                  {selectedApplication.userProfile?.city || '—'}
                </Descriptions.Item>
                <Descriptions.Item label="Vị trí mong muốn">
                  {selectedApplication.userProfile?.desiredPosition || '—'}
                </Descriptions.Item>
                <Descriptions.Item label="Kinh nghiệm">
                  {selectedApplication.userProfile?.summaryExperience || '—'}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái ứng tuyển" span={2}>
                  <Tag color={getStatusColor(selectedApplication.status)}>
                    {getStatusText(selectedApplication.status)}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Ngày nộp hồ sơ" span={2}>
                  {dayjs(selectedApplication.createdAt).format('DD/MM/YYYY HH:mm')}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Skills */}
            {(() => {
              const skills = selectedApplication.userProfile?.skills || [];
              return (skills && skills.length > 0) ? (
                <Card title="Kỹ năng" style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {skills.map((skill: string, index: number) => (
                      <Tag key={index} color="blue">{skill}</Tag>
                    ))}
                  </div>
                </Card>
              ) : null;
            })()}


            {/* Cover Letter */}
            {selectedApplication.coverLetter && (
              <Card title="Thư xin việc" style={{ marginBottom: 16 }}>
                <Text>{selectedApplication.coverLetter}</Text>
              </Card>
            )}

            {/* Notes */}
            {selectedApplication.note && (
              <Card title="Ghi chú">
                <Text>{selectedApplication.note}</Text>
              </Card>
            )}
          </div>
        )}
      </Modal>

      {/* CV Viewer Modal */}
      <CVViewer
        open={cvViewerVisible}
        onClose={() => {
          setCvViewerVisible(false);
          setSelectedCvAccountId('');
          setSelectedCvUserName('');
        }}
        accountId={selectedCvAccountId}
        userName={selectedCvUserName}
      />

    </div>
  );
};

export default ApplicationsPage;


