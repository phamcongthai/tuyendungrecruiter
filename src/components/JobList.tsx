import React, { useState, useEffect } from 'react';
import {
  Button,
  message,
  Table,
  Checkbox,
  Pagination,
  Tag,
  Badge,
  Popconfirm,
} from 'antd';
import {
  EditOutlined,
  EyeOutlined,
  EnvironmentOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import type { JobData, JobFilters as JobFiltersType } from '../types/job.type';
import { fetchJobs } from '../apis/job.api';
import { formatCurrency } from '../utils/currency';
import './JobList.css';

interface JobListProps {
  onEditJob: (job: JobData) => void;
  onViewJob: (job: JobData) => void;
  onDeleteJob: (jobId: string) => void;
  onPublishJob?: (jobId: string) => void;
  filters: JobFiltersType;
  onFiltersChange: (filters: JobFiltersType) => void;
}

const JobList: React.FC<JobListProps> = ({ 
  onEditJob, 
  onViewJob, 
  onDeleteJob, 
  onPublishJob,
  filters,
  onFiltersChange 
}) => {
  const [jobs, setJobs] = useState<JobData[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  // Load jobs data
  const loadJobs = async () => {
    try {
      setLoading(true);
      const response = await fetchJobs(filters);
      setJobs(response.data);
      setTotal(response.total);
    } catch (error: any) {
      message.error(error.message || 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, [filters]);

  // Handle pagination
  const handlePageChange = (page: number, pageSize: number) => {
    onFiltersChange({
      ...filters,
      page,
      limit: pageSize,
    });
  };

  // Format salary display
  const getSalaryDisplay = (job: JobData) => {
    if (job.salaryMin && job.salaryMax) {
      return `${formatCurrency(job.salaryMin)} - ${formatCurrency(job.salaryMax)}`;
    } else if (job.salaryMin) {
      return `Từ ${formatCurrency(job.salaryMin)}`;
    } else if (job.salaryMax) {
      return `Đến ${formatCurrency(job.salaryMax)}`;
    }
    return 'Thỏa thuận';
  };

  // Get deadline info
  const getDeadlineInfo = (job: JobData) => {
    const deadlineISO = job.deadline as any;
    if (!deadlineISO) return { text: '-', color: 'default' };
    const deadline = new Date(deadlineISO);
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { text: `Hết hạn ${Math.abs(diffDays)} ngày trước`, color: 'red' };
    } else if (diffDays === 0) {
      return { text: 'Hết hạn hôm nay', color: 'orange' };
    } else {
      return { text: `Còn ${diffDays} ngày`, color: 'green' };
    }
  };

  // Table columns
  const columns = [
    {
      title: '',
      dataIndex: 'select',
      key: 'select',
      width: 50,
      render: () => <Checkbox />,
    },
    {
      title: 'Tên công việc',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: JobData) => (
        <div className="job-title-cell">
          <div className="job-title-main">
            {text}
          </div>
          {record.company && (
            <div className="job-company">
              {record.company.name}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Địa điểm',
      dataIndex: 'location',
      key: 'location',
      render: (location: string) => (
        <div className="location-cell">
          <EnvironmentOutlined className="location-icon" />
          <span>{location || 'N/A'}</span>
        </div>
      ),
    },
    {
      title: 'Lương',
      dataIndex: 'salary',
      key: 'salary',
      render: (_: any, record: JobData) => (
        <div className="salary-cell">
          <DollarOutlined className="salary-icon" />
          <span>{getSalaryDisplay(record)}</span>
        </div>
      ),
    },
    {
      title: 'Hạn nộp',
      dataIndex: 'deadline',
      key: 'deadline',
      render: (_: any, record: JobData) => {
        const deadlineInfo = getDeadlineInfo(record);
        return (
          <div className="deadline-cell">
            <ClockCircleOutlined className="deadline-icon" />
            <Tag color={deadlineInfo.color}>
              {deadlineInfo.text}
            </Tag>
          </div>
        );
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const s = (status || 'draft') as string;
        const map: any = {
          draft: { text: 'Nháp', status: 'default' },
          active: { text: 'Hoạt động', status: 'success' },
          expired: { text: 'Hết hạn', status: 'error' },
        };
        const cfg = map[s] || map.draft;
        return <Badge status={cfg.status} text={cfg.text} />;
      },
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 150,
      render: (_: any, record: JobData) => (
        <div className="action-buttons">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => onViewJob(record)}
            className="action-btn view-btn"
            size="small"
            title="Xem chi tiết"
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => onEditJob(record)}
            className="action-btn edit-btn"
            size="small"
            title="Chỉnh sửa"
          />
          {filters.status === 'draft' && (
            <Button
              type="text"
              onClick={() => record._id && onPublishJob && onPublishJob(record._id)}
              className="action-btn"
              size="small"
            >
              Đăng tin
            </Button>
          )}
          <Popconfirm
            title="Xóa tin tuyển dụng"
            description="Bạn có chắc chắn muốn xóa tin tuyển dụng này?"
            onConfirm={() => record._id && onDeleteJob(record._id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="text"
              icon={<DeleteOutlined />}
              className="action-btn delete-btn"
              size="small"
              title="Xóa"
              danger
            />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="job-list-container">
      {/* Job Table */}
      <div className="job-table-container">
        <Table
          columns={columns}
          dataSource={jobs}
          rowKey="_id"
          loading={loading}
          pagination={false}
          className="job-table"
          scroll={{ x: 1000 }}
        />
      </div>

      {/* Pagination */}
      {jobs.length > 0 && (
        <div className="pagination-container">
          <Pagination
            current={filters.page}
            pageSize={filters.limit}
            total={total}
            onChange={handlePageChange}
            showSizeChanger={false}
            showQuickJumper={false}
            showTotal={(total, range) => `${range[0]}-${range[1]} của ${total} tin tuyển dụng`}
            className="job-pagination"
          />
        </div>
      )}
    </div>
  );
};

export default JobList;