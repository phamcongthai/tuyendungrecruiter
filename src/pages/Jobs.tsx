import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  Space, 
  Select, 
  message, 
  Row, 
  Col, 
  Typography, 
  Modal,
  Tooltip,
  Empty,
  Spin
} from 'antd';
import {
  PlusOutlined
} from '@ant-design/icons';
import type { JobData, JobFilters as JobFiltersType } from '../types/job.type';
import { fetchJobs, deleteJob, toggleJobStatus } from '../apis/job.api';
import { jobCategoriesAPI } from '../apis/job-categories.api';
import { formatCurrency } from '../utils/currency';
import JobCreateForm from '../components/JobCreateForm';
import JobEditForm from '../components/JobEditForm';
import JobDetail from '../components/JobDetail';
import JobList from '../components/JobList';
import dayjs from 'dayjs';
import './Jobs.css';

const { Option } = Select;
const { Title, Text } = Typography;

const Jobs: React.FC = () => {
  // State management
  const [jobs, setJobs] = useState<JobData[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [selectedJob, setSelectedJob] = useState<JobData | null>(null);
  const [jobCategories, setJobCategories] = useState<any[]>([]);
  
  // Modal states
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState<JobFiltersType>({
    page: 1,
    limit: 12,
    search: '',
  });

  // Load jobs data
  const loadJobs = async () => {
    try {
      setLoading(true);
      const response = await fetchJobs(filters);
      setJobs(response.data);
      setTotal(response.total);
    } catch (error: any) {
      message.error(error.message || 'Không thể tải danh sách tin tuyển dụng');
    } finally {
      setLoading(false);
    }
  };

  // Load job categories
  const loadJobCategories = async () => {
    try {
      const response = await jobCategoriesAPI.getActiveCategories();
      setJobCategories(response.data);
    } catch (error: any) {
      console.error('Failed to load job categories:', error);
    }
  };

  useEffect(() => {
    loadJobs();
    loadJobCategories();
  }, [filters]);

  // Handle search
  const handleSearch = (value: string) => {
    setFilters({
      ...filters,
      search: value,
      page: 1,
    });
  };

  // Handle filter change
  const handleFilterChange = (key: keyof JobFiltersType, value: any) => {
    setFilters({
      ...filters,
      [key]: value,
      page: 1,
    });
  };

  // Handle pagination
  const handleTableChange = (pagination: any) => {
    setFilters({
      ...filters,
      page: pagination.current,
      limit: pagination.pageSize,
    });
  };

  // Handle delete job
  const handleDeleteJob = async (id: string) => {
    try {
      await deleteJob(id);
      message.success('Xóa tin tuyển dụng thành công');
      loadJobs();
    } catch (error: any) {
      message.error(error.message || 'Không thể xóa tin tuyển dụng');
    }
  };

  // Handle toggle job status
  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await toggleJobStatus(id);
      message.success(`${currentStatus ? 'Tạm dừng' : 'Kích hoạt'} tin tuyển dụng thành công`);
      loadJobs();
    } catch (error: any) {
      message.error(error.message || 'Không thể cập nhật trạng thái');
    }
  };

  // Modal handlers
  const showCreateModal = () => setCreateModalVisible(true);
  const hideCreateModal = () => setCreateModalVisible(false);
  
  const showEditModal = (job: JobData) => {
    setSelectedJob(job);
    setEditModalVisible(true);
  };
  const hideEditModal = () => {
    setEditModalVisible(false);
    setSelectedJob(null);
  };

  const showDetailModal = (job: JobData) => {
    setSelectedJob(job);
    setDetailModalVisible(true);
  };
  const hideDetailModal = () => {
    setDetailModalVisible(false);
    setSelectedJob(null);
  };

  // Success handlers
  const handleCreateSuccess = () => {
    hideCreateModal();
    loadJobs();
    message.success('Tạo tin tuyển dụng thành công!');
  };

  const handleEditSuccess = () => {
    hideEditModal();
    loadJobs();
    message.success('Cập nhật tin tuyển dụng thành công!');
  };

  // Helper functions for job card rendering
  const getDeadlineInfo = (deadline: string | undefined) => {
    if (!deadline) return { text: 'Không có hạn', color: 'default', isExpired: false };
        
        const deadlineDate = new Date(deadline);
        const now = new Date();
        const diffTime = deadlineDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) {
      return { text: 'Đã hết hạn', color: 'red', isExpired: true };
    } else if (diffDays === 0) {
      return { text: 'Hết hạn hôm nay', color: 'orange', isExpired: false };
        } else if (diffDays <= 3) {
      return { text: `Còn ${diffDays} ngày`, color: 'orange', isExpired: false };
        } else if (diffDays <= 7) {
      return { text: `Còn ${diffDays} ngày`, color: 'blue', isExpired: false };
        } else {
      return { text: `Còn ${diffDays} ngày`, color: 'green', isExpired: false };
    }
  };

  const getSalaryDisplay = (job: JobData) => {
    if (!job.salaryMin && !job.salaryMax) {
      return 'Thỏa thuận';
    }
    
    if (job.salaryMin && job.salaryMax) {
      return `${formatCurrency(job.salaryMin)} - ${formatCurrency(job.salaryMax)}`;
    }
    
    if (job.salaryMin) {
      return `Từ ${formatCurrency(job.salaryMin)}`;
    }
    
    if (job.salaryMax) {
      return `Tối đa ${formatCurrency(job.salaryMax)}`;
    }
    
    return 'Thỏa thuận';
  };

  // Removed reset button and explicit handler to simplify UI


  return (
    <div style={{ width: '100%', height: '100%' }}>
      {/* Single Combined Card */}
      <Card className="jobs-main-card">
          {/* Header with title and create button */}
          <Row justify="space-between" align="middle" className="mb-4" gutter={[12, 12]}>
            <Col>
              <Title level={3} className="text-black" style={{ margin: 0 }}>
                Quản lý tin tuyển dụng
              </Title>
            </Col>
            <Col>
              <Space>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={showCreateModal}
                  size="large"
                  className="jobs-create-btn"
                >
                  Tạo tin mới
                </Button>
              </Space>
            </Col>
          </Row>

          {/* Results count */}
          <div className="mb-4 flex justify-between items-center">
            <Text className="text-gray-600">
              Tìm thấy <strong>{total}</strong> tin tuyển dụng
              {filters.search && ` cho "${filters.search}"`}
            </Text>
            {(filters.jobType || filters.workingMode || filters.jobCategoryId || filters.status) && (
              <Text className="text-blue-600 text-sm">
                Đang áp dụng bộ lọc
              </Text>
            )}
          </div>

          {/* Jobs Grid */}
          <div className="jobs-grid-container">
            {loading ? (
              <div className="text-center py-12 flex-1 flex items-center justify-center">
                <div>
                  <Spin size="large" />
                  <div className="mt-4 text-gray-500">Đang tải danh sách tin tuyển dụng...</div>
                </div>
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-12 flex-1 flex items-center justify-center">
                <Empty
                  description="Chưa có tin tuyển dụng nào"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                >
                  <Button type="primary" icon={<PlusOutlined />} onClick={showCreateModal} size="large">
                    Tạo tin tuyển dụng đầu tiên
                  </Button>
                </Empty>
              </div>
            ) : (
              <JobList
                onCreateJob={showCreateModal}
                onEditJob={showEditModal}
                onViewJob={showDetailModal}
                onDeleteJob={handleDeleteJob}
                filters={filters}
                onFiltersChange={setFilters}
              />
            )}
          </div>
        </Card>

        {/* Create Modal */}
        <Modal
          title="Tạo tin tuyển dụng mới"
          open={createModalVisible}
          onCancel={hideCreateModal}
          footer={null}
          width={900}
          className="create-job-modal"
        >
          <JobCreateForm
            onSuccess={handleCreateSuccess}
            onCancel={hideCreateModal}
          />
        </Modal>

        {/* Edit Modal */}
        <Modal
          title="Chỉnh sửa tin tuyển dụng"
          open={editModalVisible}
          onCancel={hideEditModal}
          footer={null}
          width={900}
          className="edit-job-modal"
        >
          {selectedJob && (
          <JobEditForm
            jobId={selectedJob._id!}
            onSuccess={handleEditSuccess}
              onCancel={hideEditModal}
            />
          )}
        </Modal>

        {/* Detail Modal */}
        <Modal
          title="Chi tiết tin tuyển dụng"
          open={detailModalVisible}
          onCancel={hideDetailModal}
          footer={null}
          width="80vw"
          className="detail-job-modal"
        >
          {selectedJob && (
          <JobDetail
            jobId={selectedJob._id!}
              onEdit={() => {
                hideDetailModal();
                showEditModal(selectedJob);
              }}
              onBack={hideDetailModal}
              onJobDeleted={() => {
                hideDetailModal();
                loadJobs();
              }}
            />
          )}
        </Modal>
    </div>
  );
};

export default Jobs;