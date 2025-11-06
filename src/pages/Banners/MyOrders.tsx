import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Typography, Space, Image, message } from 'antd';
import { useSearchParams } from 'react-router-dom';
import { myBannerOrdersAPI, type MyBannerOrder } from '../../apis/banner-orders.api';

const { Title } = Typography;

const MyBannerOrdersPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<MyBannerOrder[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [searchParams, setSearchParams] = useSearchParams();

  const load = async (p = page, l = limit) => {
    setLoading(true);
    try {
      const res = await myBannerOrdersAPI.list(p, l);
      setItems(res.data || []);
      setTotal(res.total || 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const paymentStatus = searchParams.get('payment');
    const errorMsg = searchParams.get('message');

    if (paymentStatus === 'success') {
      message.success('Thanh toán thành công! Đơn hàng đã được tạo.');
      // Remove query params after showing message
      setSearchParams({});
      // Reload orders to show the new one
      load(1, limit);
    } else if (paymentStatus === 'failed') {
      message.error('Thanh toán thất bại. Vui lòng thử lại.');
      setSearchParams({});
      load(1, limit);
    } else if (paymentStatus === 'error') {
      message.error(errorMsg || 'Có lỗi xảy ra trong quá trình thanh toán.');
      setSearchParams({});
    } else {
      load(1, limit);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>Đơn gói banner của tôi</Title>
      </Card>
      <Card>
        <Table
          rowKey={(r) => r._id}
          loading={loading}
          dataSource={items}
          pagination={{ total, current: page, pageSize: limit, onChange: (cp, ps) => { setPage(cp); setLimit(ps); load(cp, ps); } }}
          columns={[
            { title: 'Tiêu đề', dataIndex: 'title' },
            { title: 'Ảnh', dataIndex: 'imageUrl', render: (v: string) => <Image width={80} src={v} /> },
            { title: 'Số tiền', dataIndex: 'amount', render: (v: number) => v?.toLocaleString('vi-VN') },
            { title: 'Trạng thái thanh toán', dataIndex: 'status', render: (v: string) => (
                <Tag color={v === 'PAID' ? 'green' : v === 'PENDING' ? 'orange' : 'red'}>{v}</Tag>
              )
            },
            { title: 'Banner', dataIndex: 'banner', render: (b: any) => b ? (
                <Space>
                  <Tag color={b.approved ? 'green' : 'orange'}>{b.approved ? 'Đã duyệt' : 'Chờ duyệt'}</Tag>
                  <Tag color={b.isActive ? 'blue' : 'default'}>{b.isActive ? 'Đang chạy' : 'Không hoạt động'}</Tag>
                </Space>
              ) : <Tag>Chưa tạo</Tag>
            },
            { title: 'Ngày tạo', dataIndex: 'createdAt', render: (v: string) => v ? new Date(v).toLocaleString('vi-VN') : '' },
          ]}
        />
      </Card>
    </div>
  );
};

export default MyBannerOrdersPage;


