import React from 'react';
import { Typography, Image, Tag, Space, Button } from 'antd';

const { Title, Text } = Typography;

type BannerPackage = {
  _id: string;
  name: string;
  position: string;
  price: number;
  durationDays: number;
  maxBannerSlots: number;
  previewImage?: string;
  priority?: number;
};

export const BannerPackageCard: React.FC<{
  pkg: BannerPackage;
  loading?: boolean;
  onBuy: () => void;
  accentColor?: string;
}> = ({ pkg, loading, onBuy, accentColor = '#1890ff' }) => {
  return (
    <div
      style={{
        border: `2px solid ${accentColor}`,
        borderRadius: 12,
        boxShadow: `0 10px 26px ${accentColor}22`,
        overflow: 'hidden',
        background: 'linear-gradient(180deg, #f8fbff 0%, #ffffff 65%)',
        opacity: loading ? 0.6 : 1,
      }}
    >
      <div style={{ height: 6, background: accentColor }} />
      <div style={{ padding: 14 }}>
        {pkg.previewImage && (
          <Image src={pkg.previewImage} width="100%" style={{ marginBottom: 8, borderRadius: 8, border: `1px solid ${accentColor}33` }} />
        )}

        <Title level={4} style={{ marginBottom: 8, color: accentColor }}>{pkg.name}</Title>

        <Space direction="vertical" size={6} style={{ width: '100%' }}>
          <Text>
            Vị trí: <Tag color={accentColor} style={{ borderRadius: 12 }}>{pkg.position}</Tag>
          </Text>
          <Text style={{ fontSize: 18, color: accentColor, fontWeight: 700 }}>
            {pkg.price?.toLocaleString('vi-VN')} VND
          </Text>
          <Space size={8} wrap>
            <Tag color="green">{pkg.durationDays} ngày</Tag>
            <Tag color="geekblue">{pkg.maxBannerSlots} slots</Tag>
            {pkg.priority ? <Tag color="gold">Ưu tiên {pkg.priority}</Tag> : null}
          </Space>
        </Space>

        <div style={{ marginTop: 12 }}>
          <Button
            type="primary"
            block
            onClick={onBuy}
            style={{
              background: accentColor,
              border: 'none',
              boxShadow: `0 6px 16px ${accentColor}40`,
            }}
          >
            Mua gói
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BannerPackageCard;


