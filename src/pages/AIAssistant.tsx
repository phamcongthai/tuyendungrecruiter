import React, { useEffect } from 'react';
import { Button, Typography, Card } from 'antd';

const { Title, Paragraph } = Typography;

const BG_URL = 'https://tuyendung.topcv.vn/images/introduction/landing-page-hero-mobile.png';

const AIAssistant: React.FC = () => {
  useEffect(() => {
    const el = document.querySelector('.content-wrapper') as HTMLElement | null;
    if (!el) return;
    const prevCssText = el.style.cssText;
    el.style.backgroundImage = `url(${BG_URL})`;
    el.style.backgroundRepeat = 'no-repeat';
    el.style.backgroundPosition = 'center center';
    el.style.backgroundSize = '100% 100%'; // fill width & height of content-wrapper
    el.style.minHeight = 'calc(100vh - 120px)';
    el.style.display = 'flex';
    el.style.alignItems = 'center';
    el.style.justifyContent = 'center';
    el.style.backgroundColor = '#f5f7fa';

    return () => {
      el.style.cssText = prevCssText;
    };
  }, []);

  return (
    <Card
      style={{
        background: 'rgba(255, 255, 255, 0.92)',
        borderRadius: 16,
        padding: 28,
        boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
        maxWidth: 560,
        textAlign: 'center',
      }}
      bodyStyle={{ padding: 0 }}
    >
      <div style={{ padding: 24 }}>
        <Title level={2} style={{ marginBottom: 8 }}>AI chấm điểm CV</Title>
        <Paragraph style={{ color: '#4b5563', marginBottom: 20 }}>
          Dùng trí tuệ nhân tạo để đánh giá nhanh hồ sơ ứng viên của bạn
        </Paragraph>
        <Button type="primary" size="large" href="#">
          Trải nghiệm ngay
        </Button>
      </div>
    </Card>
  );
};

export default AIAssistant;


