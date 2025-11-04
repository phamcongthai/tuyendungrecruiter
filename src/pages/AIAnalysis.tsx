import React, { useEffect, useMemo, useState } from 'react';
import { Card, Typography, Select, Button, Space, Row, Col, message, Empty, Table, Tag, Progress, Spin, Divider } from 'antd';
import { BulbOutlined, RobotOutlined, ThunderboltOutlined, ExperimentOutlined } from '@ant-design/icons';
import { fetchJobs } from '../apis/job.api';
import type { JobData, JobFilters } from '../types/job.type';
import { applicationsAPI, type ApplicationItem } from '../apis/applications.api';
import { aiAPI } from '../apis/ai.api';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

interface ScoredApplication extends ApplicationItem {
  aiScore: number;
  aiSummary: string;
}

const AIAnalysis: React.FC = () => {
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [jobs, setJobs] = useState<JobData[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | undefined>();

  const [loadingApps, setLoadingApps] = useState(false);
  const [applications, setApplications] = useState<ApplicationItem[]>([]);

  const [analyzing, setAnalyzing] = useState(false);
  const [scoredApps, setScoredApps] = useState<ScoredApplication[] | null>(null);

  const loadJobs = async () => {
    try {
      setLoadingJobs(true);
      const res = await fetchJobs({ page: 1, limit: 50, status: 'active' } as JobFilters);
      setJobs(res.data || []);
    } catch (err: any) {
      message.error(err.message || 'Không thể tải danh sách tin tuyển dụng');
    } finally {
      setLoadingJobs(false);
    }
  };

  const loadApplications = async (jobId: string) => {
    try {
      setLoadingApps(true);
      const res = await applicationsAPI.listByJob(jobId, 1, 100);
      setApplications(res.data || []);
    } catch (err: any) {
      setApplications([]);
    } finally {
      setLoadingApps(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    if (selectedJobId) {
      loadApplications(selectedJobId);
      setScoredApps(null);
    } else {
      setApplications([]);
      setScoredApps(null);
    }
  }, [selectedJobId]);

  const handleAnalyze = async () => {
    if (!selectedJobId) {
      message.warning('Vui lòng chọn 1 tin tuyển dụng để phân tích');
      return;
    }
    try {
      setAnalyzing(true);
      const res = await aiAPI.rankApplicants(selectedJobId);
      const mapSummary = (score: number) =>
        score > 85 ? 'Phù hợp rất cao với JD.' : score > 70 ? 'Phù hợp, nên shortlist.' : 'Phù hợp trung bình, cần xem thêm.';
      const scored: ScoredApplication[] = res.results.map((r) => {
        const base: any = applications.find((a) => a._id === r.applicationId) || { _id: r.applicationId };
        return {
          ...(base as any),
          account: r.account || (base as any).account,
          aiScore: r.score,
          aiSummary: mapSummary(r.score),
        } as ScoredApplication;
      });
      setScoredApps(scored);
      if (scored.length === 0) {
        message.info('Chưa có ứng viên nào ứng tuyển cho tin này.');
      }
    } catch (err: any) {
      message.error('Không thể phân tích. Vui lòng thử lại.');
    } finally {
      setAnalyzing(false);
    }
  };

  const columns = useMemo(
    () => [
      {
        title: 'Ứng viên',
        dataIndex: 'account',
        key: 'candidate',
        render: (_: any, record: ScoredApplication) => {
          const name = record.account?.fullName ||
            (typeof record.userId === 'object' ? record.userId?.fullName : undefined) ||
            'Ứng viên';
          const email = record.account?.email ||
            (typeof record.userId === 'object' ? record.userId?.email : undefined) ||
            '';
          return (
            <div>
              <div style={{ fontWeight: 600 }}>{name}</div>
              {email && <div style={{ color: '#6b7280', fontSize: 12 }}>{email}</div>}
            </div>
          );
        },
      },
      {
        title: 'Điểm AI',
        dataIndex: 'aiScore',
        key: 'score',
        width: 220,
        render: (score: number) => (
          <div style={{ minWidth: 180 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Tag color={score >= 85 ? 'green' : score >= 70 ? 'blue' : 'orange'} style={{ margin: 0 }}>
                {score}
              </Tag>
              <span style={{ color: '#6b7280', fontSize: 12 }}>trên 100</span>
            </div>
            <Progress percent={score} size="small" showInfo={false} status={score < 60 ? 'exception' : score < 75 ? 'active' : 'normal'} />
          </div>
        ),
      },
      {
        title: 'Nhận xét',
        dataIndex: 'aiSummary',
        key: 'summary',
        render: (summary: string) => <span style={{ color: '#374151' }}>{summary}</span>,
      },
    ],
    []
  );

  return (
    <div>
      <Card className="mb-4">
        <Row justify="space-between" align="middle">
          <Col>
            <Space align="center">
              <RobotOutlined style={{ fontSize: 24, color: '#1677ff' }} />
              <div>
                <Title level={3} style={{ margin: 0 }}>Phân tích CV bằng AI</Title>
                <Text type="secondary">Đánh giá độ phù hợp của ứng viên với tin tuyển dụng</Text>
              </div>
            </Space>
          </Col>
        </Row>
      </Card>

      <Row gutter={16}>
        <Col xs={24} lg={10}>
          <Card>
            <Title level={5} style={{ marginTop: 0 }}>
              <ExperimentOutlined className="mr-2" /> Chọn tin tuyển dụng
            </Title>
            <Paragraph style={{ color: '#6b7280' }}>
              Hãy chọn 1 tin tuyển dụng bạn đã đăng để hệ thống phân tích các hồ sơ ứng viên tương ứng.
            </Paragraph>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <Text strong>Danh sách tin đang đăng</Text>
                <div style={{ height: 8 }} />
                <Select
                  showSearch
                  placeholder="Chọn tin tuyển dụng"
                  size="large"
                  loading={loadingJobs}
                  value={selectedJobId}
                  onChange={setSelectedJobId}
                  filterOption={(input, option) => {
                    const label = (option?.label ?? '') as string;
                    return label.toLowerCase().includes(input.toLowerCase());
                  }}
                  style={{ width: '100%' }}
                >
                  {jobs.map((j) => (
                    <Option key={j._id!} value={j._id!}>{j.title}</Option>
                  ))}
                </Select>
              </div>
              <Button
                type="primary"
                size="large"
                icon={<ThunderboltOutlined />}
                disabled={!selectedJobId || loadingApps}
                loading={analyzing}
                onClick={handleAnalyze}
              >
                Phân tích ngay
              </Button>
              {loadingApps && (
                <div style={{ color: '#6b7280', fontSize: 12 }}>Đang tải danh sách ứng viên...</div>
              )}
              {!loadingApps && selectedJobId && applications.length === 0 && (
                <Empty description="Chưa có ứng viên ứng tuyển cho tin này" />
              )}
              <Divider />
              <Space style={{ color: '#6b7280' }}>
                <BulbOutlined />
                <span>Kết quả được tính theo AI từ CV và JD.</span>
              </Space>
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={14}>
          <Card>
            <Title level={5} style={{ marginTop: 0 }}>Kết quả phân tích</Title>
            {!selectedJobId ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <Text type="secondary">Hãy chọn 1 tin tuyển dụng và bấm "Phân tích ngay" để xem kết quả.</Text>
              </div>
            ) : analyzing ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <Spin tip="Đang phân tích..." />
              </div>
            ) : !scoredApps ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                {applications.length > 0 ? (
                  <Text type="secondary">Sẵn sàng phân tích {applications.length} hồ sơ ứng viên.</Text>
                ) : (
                  <Text type="secondary">Không có hồ sơ để phân tích.</Text>
                )}
              </div>
            ) : scoredApps.length === 0 ? (
              <Empty description="Không có kết quả phân tích" />
            ) : (
              <Table<ScoredApplication>
                rowKey={(r) => r._id}
                columns={columns as any}
                dataSource={scoredApps}
                pagination={{ pageSize: 10 }}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AIAnalysis;



