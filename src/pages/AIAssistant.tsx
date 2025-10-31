import React, { useEffect } from 'react';
import { Button, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

const BG_URL = 'https://tuyendung.topcv.vn/images/introduction/landing-page-hero.png';

const AIAssistant: React.FC = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const el = document.querySelector('.content-wrapper') as HTMLElement | null;
    if (!el) return;
    const prevCssText = el.style.cssText;
    el.style.backgroundImage = `url(${BG_URL})`;
    el.style.backgroundRepeat = 'no-repeat';
    el.style.backgroundPosition = 'center center';
    el.style.backgroundSize = '150% 155%'; // zoom background image by 1.2x
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
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.28)',
        backdropFilter: 'saturate(160%) blur(14px)',
        WebkitBackdropFilter: 'saturate(160%) blur(14px)',
        border: '1px solid rgba(255, 255, 255, 0.35)',
        borderRadius: 16,
        padding: 28,
        boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
        maxWidth: 560,
        textAlign: 'center',
      }}
    >
      <div style={{ padding: 24 }}>
        <Title level={2} style={{ marginBottom: 8 }}>AI chấm điểm CV</Title>
        <Paragraph style={{ color: '#ffffff', marginBottom: 20 }}>
          Dùng trí tuệ nhân tạo để đánh giá nhanh hồ sơ ứng viên của bạn
        </Paragraph>
        <Button type="primary" size="large" onClick={() => navigate('/ai/analysis')}>
          Trải nghiệm ngay
        </Button>
      </div>
    </div>
  );
};

export default AIAssistant;


