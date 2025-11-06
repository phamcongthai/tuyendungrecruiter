import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Button, Typography, Modal, Form, Input, message, Image } from 'antd';
import { bannerPackagesAPI, paymentsAPI } from '../../apis/banner-packages.api';
import { authAPI } from '../../apis/auth.api';
import { companyAPI } from '../../apis/company.api';
import BannerPackageCard from '../../components/BannerPackageCard';

const { Title, Text } = Typography;

const BannerPackagesPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [packages, setPackages] = useState<any[]>([]);
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState<any | null>(null);
  const [form] = Form.useForm();
  const [accountId, setAccountId] = useState<string>('');
  const [companySlug, setCompanySlug] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    (async () => {
      try {
        const me = await authAPI.checkAuth();
        const id = me?.id || me?.data?.id;
        if (id) setAccountId(id);
      } catch {}
      try {
        const my = await companyAPI.getMyCompanies();
        const first = my?.data?.[0];
        if (first?.slug) setCompanySlug(first.slug);
      } catch {}
      await loadPackages();
    })();
  }, []);

  const loadPackages = async () => {
    try {
      setLoading(true);
      const res = await bannerPackagesAPI.listActive();
      const items = res?.data || res || [];
      setPackages(items);
    } catch (e: any) {
      message.error(e?.message || 'Tải gói banner thất bại');
    } finally {
      setLoading(false);
    }
  };

  const onBuy = (pkg: any) => {
    setSelected(pkg);
    setVisible(true);
    form.resetFields();
    // Set default redirect to public company page if available
    if (companySlug) {
      form.setFieldsValue({ redirectUrl: `/companies/${companySlug}` });
    }
    setPreviewUrl('');
  };

  const onSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (!selected) return;
      const payload = {
        packageId: selected._id,
        accountId,
        title: values.title,
        imageUrl: values.imageUrl,
        redirectUrl: values.redirectUrl || (companySlug ? `/companies/${companySlug}` : undefined),
        altText: values.altText,
      };
      const res = await paymentsAPI.createVNPayOrder(payload);
      if (res?.paymentUrl) {
        // Navigate to VNPay in current tab (will redirect back after payment)
        window.location.href = res.paymentUrl;
      }
    } catch (e: any) {
      if (e?.errorFields) return; // form errors
      message.error(e?.message || 'Tạo đơn thanh toán thất bại');
    }
  };

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>Gói quảng cáo Banner</Title>
      </Card>
      <Row gutter={[16, 16]}>
        {packages.map((pkg) => (
          <Col xs={24} sm={12} md={8} lg={6} key={pkg._id}>
            <BannerPackageCard pkg={pkg} loading={loading} onBuy={() => onBuy(pkg)} />
          </Col>
        ))}
      </Row>

      <Modal
        title="Thông tin banner"
        open={visible}
        onCancel={() => setVisible(false)}
        onOk={onSubmit}
        okText="Thanh toán VNPay"
      >
        <Form 
          layout="vertical" 
          form={form}
          onValuesChange={(changed) => {
            if (changed.imageUrl !== undefined) {
              setPreviewUrl(changed.imageUrl || '');
            }
          }}
        >
          <Form.Item name="title" label="Tiêu đề" rules={[{ required: true, message: 'Nhập tiêu đề' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="imageUrl" label="Ảnh banner (URL)" rules={[{ required: true, message: 'Nhập URL ảnh' }]}>
            <Input />
          </Form.Item>
          { (form.getFieldValue('imageUrl') || previewUrl) && (
            <div style={{ marginBottom: 16 }}>
              <Image src={form.getFieldValue('imageUrl') || previewUrl} width="100%" style={{ maxHeight: 200, objectFit: 'contain' }} />
            </div>
          )}
          <Form.Item name="redirectUrl" label="Link chuyển hướng">
            <Input placeholder={companySlug ? `/companies/${companySlug}` : undefined} />
          </Form.Item>
          <Form.Item name="altText" label="Alt text">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BannerPackagesPage;


