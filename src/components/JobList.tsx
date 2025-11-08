import React, { useState, useEffect } from 'react';
import {
  Button,
  message,
  Table,
  Pagination,
  Tag,
  Popconfirm,
  Modal,
  Select,
  Spin,
} from 'antd';
import type { JobData, JobFilters as JobFiltersType } from '../types/job.type';
import { fetchActiveJobPackages, type JobPackage } from '../apis/job-packages.api';
import { createJobFeaturePayment } from '../apis/payments.api';
import { authAPI } from '../apis/auth.api';
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
  const [promoteVisible, setPromoteVisible] = useState(false);
  const [loadingPackages, setLoadingPackages] = useState(false);
  const [packages, setPackages] = useState<JobPackage[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState<string | undefined>(undefined);
  const [promoteJob, setPromoteJob] = useState<JobData | null>(null);
  const [creatingPayment, setCreatingPayment] = useState(false);

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

  // Prefetch active packages for tooltip display of purchased package info
  useEffect(() => {
    (async () => {
      try {
        const res = await fetchActiveJobPackages();
        setPackages(res.data || []);
      } catch {}
    })();
  }, []);

  const getFeaturedPackageLabel = (pkgId?: string | null) => {
    if (!pkgId) return 'Đã mua gói nổi bật';
    const p = packages.find((x) => x._id === pkgId);
    if (!p) return 'Đã mua gói nổi bật';
    return `${p.packageName} • ${formatCurrency(p.price)} • ${p.durationDays} ngày`;
  };

  const openPromoteModal = async (job: JobData) => {
    setPromoteJob(job);
    setPromoteVisible(true);
    setSelectedPackageId(undefined);
    setLoadingPackages(true);
    try {
      const res = await fetchActiveJobPackages();
      setPackages(res.data || []);
    } catch (e: any) {
      message.error(e?.message || 'Không tải được danh sách gói nổi bật');
      setPackages([]);
    } finally {
      setLoadingPackages(false);
    }
  };

  const closePromoteModal = () => {
    setPromoteVisible(false);
    setPromoteJob(null);
    setSelectedPackageId(undefined);
  };

  const handleConfirmPromote = async () => {
    if (!promoteJob || !promoteJob._id) return;
    if (!selectedPackageId) {
      message.warning('Vui lòng chọn gói nổi bật');
      return;
    }
    try {
      setCreatingPayment(true);
      const me: any = await authAPI.checkAuth();
      const accountId: string | undefined = me?.id || me?.data?.id;
      if (!accountId) {
        message.error('Không lấy được tài khoản. Vui lòng đăng nhập lại.');
        return;
      }
      const res = await createJobFeaturePayment({ packageId: selectedPackageId, jobId: promoteJob._id, accountId });
      if (res?.paymentUrl) {
        window.location.href = res.paymentUrl;
      } else {
        message.error('Không tạo được liên kết thanh toán');
      }
    } catch (e: any) {
      message.error(e?.message || 'Không thể tạo thanh toán cho tin nổi bật');
    } finally {
      setCreatingPayment(false);
    }
  };

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
      title: 'Tên công việc',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: JobData) => (
        <div className="job-title-cell">
          <div className="job-title-main" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>{text}</span>
            {record.isFeatured && (
              <Tag color="gold" className="featured-tag">Nổi bật</Tag>
            )}
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
      render: (location: string) => (<span>{location || '-'}</span>),
    },
    {
      title: 'Lương',
      dataIndex: 'salary',
      key: 'salary',
      render: (_: any, record: JobData) => (<span>{getSalaryDisplay(record)}</span>),
    },
    {
      title: 'Hạn nộp',
      dataIndex: 'deadline',
      key: 'deadline',
      render: (_: any, record: JobData) => {
        const deadlineInfo = getDeadlineInfo(record);
        return <span>{deadlineInfo.text}</span>;
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const s = (status || 'draft') as string;
        const map: any = {
          draft: { text: 'Nháp', color: undefined },
          active: { text: 'Hoạt động', color: 'green' },
          expired: { text: 'Hết hạn', color: 'red' },
        };
        const cfg = map[s] || map.draft;
        return <Tag color={cfg.color}>{cfg.text}</Tag>;
      },
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 220,
      render: (_: any, record: JobData) => (
        <div className="action-buttons">
          <Button type="link" onClick={() => onViewJob(record)} size="small">Xem</Button>
          <Button type="link" onClick={() => onEditJob(record)} size="small">Sửa</Button>
          {filters.status === 'draft' && (
            <Button type="link" onClick={() => record._id && onPublishJob && onPublishJob(record._id)} size="small">Đăng tin</Button>
          )}
          {record.status === 'active' && !record.isFeatured && (
            <Button type="link" onClick={() => openPromoteModal(record)} size="small">Nổi bật</Button>
          )}
          {record.status === 'active' && record.isFeatured && (
            <Tag color="gold">Đã mua</Tag>
          )}
          <Popconfirm
            title="Xóa tin tuyển dụng"
            description="Bạn có chắc chắn muốn xóa tin tuyển dụng này?"
            onConfirm={() => record._id && onDeleteJob(record._id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button type="link" danger size="small">Xóa</Button>
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

      {/* Modal: Promote to Featured */}
      <Modal
        title="Đăng tin nổi bật"
        open={promoteVisible}
        onCancel={closePromoteModal}
        onOk={handleConfirmPromote}
        okText="Thanh toán"
        okButtonProps={{ disabled: !selectedPackageId, loading: creatingPayment }}
        destroyOnClose
      >
        {loadingPackages ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 120 }}>
            <Spin />
          </div>
        ) : packages.length === 0 ? (
          <div>Hiện chưa có gói nổi bật nào. Vui lòng liên hệ quản trị viên.</div>
        ) : (
          <>
            <div style={{ marginBottom: 8 }}>Chọn gói nổi bật:</div>
            <Select
              style={{ width: '100%' }}
              placeholder="Chọn gói nổi bật"
              value={selectedPackageId}
              onChange={setSelectedPackageId as any}
              options={packages.map((p) => ({
                label: `${p.packageName} - ${formatCurrency(p.price)} - ${p.durationDays} ngày`,
                value: p._id,
              }))}
            />
          </>
        )}
      </Modal>
    </div>
  );
};

export default JobList;