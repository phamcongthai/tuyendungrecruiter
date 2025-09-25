import React, { useEffect, useMemo, useState } from "react";
import { Row, Col, Card, Statistic, Typography, Spin, Empty } from "antd";
import { Column } from "@ant-design/plots";
import { dashboardAPI } from "../apis/dashboard.api";
import { profileAPI } from "../apis/profile.api";
import { fetchJobs } from "../apis/job.api";

interface CountByPeriodItem {
  month?: string;
  date?: string;
  label?: string;
  count?: number;
}

interface RecruiterDashboardResponse {
  totals?: {
    applications?: number;
    jobs?: number;
  };
  applicationsByMonth?: CountByPeriodItem[];
  jobsByMonth?: CountByPeriodItem[];
  // Allow flexible shapes from backend without breaking the UI
  [key: string]: any;
}

const normalizeSeries = (items?: CountByPeriodItem[]): { x: string; y: number }[] => {
  if (!Array.isArray(items)) return [];
  return items
    .map((it) => ({
      x: (it.month || it.label || it.date || "").toString(),
      y: Number(it.count ?? 0),
    }))
    .filter((d) => d.x);
};

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<RecruiterDashboardResponse | null>(null);
  const [jobsTotalByRecruiter, setJobsTotalByRecruiter] = useState<number | null>(null);
  const [applicationsTotalByRecruiter, setApplicationsTotalByRecruiter] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const [res, profileRes] = await Promise.all([
          dashboardAPI.getRecruiterDashboard(),
          profileAPI.getProfile().catch(() => null),
        ]);
        if (mounted) setData(res);

        // If we have recruiter profile, fetch total jobs by recruiterId
        const recruiterId = (profileRes && (profileRes as any).data?._id) || (profileRes && (profileRes as any).data?.accountId);
        if (recruiterId) {
          try {
            const jobs = await fetchJobs({ recruiterId, limit: 1000 });
            if (mounted) {
              setJobsTotalByRecruiter(jobs.total || 0);
              // Sum applicationCount across all jobs as total applications
              const sumApps = (jobs.data || []).reduce((sum: number, job: any) => sum + (job.applicationCount || 0), 0);
              setApplicationsTotalByRecruiter(sumApps);
            }
          } catch {
            // ignore jobs count failure
          }
        }
      } catch (e: any) {
        if (mounted) {
          setError(e?.message || "Không thể tải dữ liệu dashboard");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const applicationsSeries = useMemo(() => {
    return normalizeSeries(data?.applicationsByMonth);
  }, [data]);

  const jobsSeries = useMemo(() => {
    return normalizeSeries(data?.jobsByMonth);
  }, [data]);

  const totalApplications = (applicationsTotalByRecruiter ?? undefined) ?? (data?.totals?.applications ?? undefined);
  const totalJobs = (jobsTotalByRecruiter ?? undefined) ?? (data?.totals?.jobs ?? undefined);

  const applicationsConfig = useMemo(() => ({
    data: applicationsSeries,
    xField: "x",
    yField: "y",
    columnWidthRatio: 0.6,
    color: "#1677ff",
    xAxis: {
      label: {
        autoHide: true,
        autoRotate: false,
      },
    },
    yAxis: {
      label: {
        formatter: (v: any) => `${v}`,
      },
    },
    meta: {
      x: { alias: "Thời gian" },
      y: { alias: "Số ứng viên" },
    },
    tooltip: {
      formatter: (d: any) => ({ name: "Ứng viên", value: d.y }),
    },
  }), [applicationsSeries]);

  const jobsConfig = useMemo(() => ({
    data: jobsSeries,
    xField: "x",
    yField: "y",
    columnWidthRatio: 0.6,
    color: "#00b14f",
    xAxis: {
      label: {
        autoHide: true,
        autoRotate: false,
      },
    },
    yAxis: {
      label: {
        formatter: (v: any) => `${v}`,
      },
    },
    meta: {
      x: { alias: "Thời gian" },
      y: { alias: "Số tin" },
    },
    tooltip: {
      formatter: (d: any) => ({ name: "Tin đã đăng", value: d.y }),
    },
  }), [jobsSeries]);

  return (
    <div>
      <Typography.Title level={2} style={{ marginBottom: 16 }}>
        Bảng điều khiển
      </Typography.Title>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
          <Spin size="large" />
        </div>
      ) : error ? (
        <Card style={{ marginBottom: 16 }}>
          <Typography.Text type="danger">{error}</Typography.Text>
        </Card>
      ) : (
        <>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={12} lg={12} xl={12}>
              <Card hoverable>
                <Statistic
                  title="Tổng ứng viên đã ứng tuyển"
                  value={typeof totalApplications === "number" ? totalApplications : (applicationsSeries?.reduce((s, i) => s + (i.y || 0), 0) || 0)}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={12} lg={12} xl={12}>
              <Card hoverable>
                <Statistic
                  title="Tổng số tin đã đăng"
                  value={typeof totalJobs === "number" ? totalJobs : (jobsSeries?.reduce((s, i) => s + (i.y || 0), 0) || 0)}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: 8 }}>
            <Col xs={24} lg={12}>
              <Card title="Ứng viên đã ứng tuyển theo thời gian" hoverable>
                {applicationsSeries.length ? (
                  <Column {...applicationsConfig} />
                ) : (
                  <Empty description="Chưa có dữ liệu" />
                )}
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="Số tin đã đăng theo thời gian" hoverable>
                {jobsSeries.length ? (
                  <Column {...jobsConfig} />
                ) : (
                  <Empty description="Chưa có dữ liệu" />
                )}
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
};

export default Dashboard;
