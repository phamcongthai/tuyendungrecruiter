import React, { useState } from 'react';
import { Alert, Button, message } from 'antd';
import { MailOutlined, WarningOutlined } from '@ant-design/icons';
import { authAPI } from '../apis/auth.api';
import { useUser } from '../contexts/UserContext';

interface EmailVerificationBannerProps {
  userEmail: string;
  onVerificationSent?: () => void;
}

const EmailVerificationBanner: React.FC<EmailVerificationBannerProps> = ({ 
  userEmail, 
  onVerificationSent 
}) => {
  const [sending, setSending] = useState(false);
  const { refreshUser } = useUser();

  const handleResendVerification = async () => {
    setSending(true);
    try {
      const response = await authAPI.resendVerification(userEmail);
      
      if (response.success) {
        message.success('Email xác thực đã được gửi! Vui lòng kiểm tra hộp thư của bạn.');
        onVerificationSent?.();
        // Refresh user data after sending verification
        await refreshUser();
      } else {
        message.error(response.message || 'Không thể gửi email xác thực. Vui lòng thử lại.');
      }
    } catch (error: any) {
      message.error(error.message || 'Có lỗi xảy ra khi gửi email xác thực');
    } finally {
      setSending(false);
    }
  };

  return (
    <Alert
      message={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <WarningOutlined style={{ color: '#faad14' }} />
            <span style={{ fontWeight: 600 }}>
              Tài khoản chưa được xác thực
            </span>
          </div>
          <Button
            type="primary"
            size="small"
            icon={<MailOutlined />}
            loading={sending}
            onClick={handleResendVerification}
            style={{
              background: '#00b14f',
              borderColor: '#00b14f',
              borderRadius: 6
            }}
          >
            {sending ? 'Đang gửi...' : 'Gửi email xác thực'}
          </Button>
        </div>
      }
      description={
        <div style={{ marginTop: 8 }}>
          <p style={{ margin: 0, color: '#666' }}>
            Để đảm bảo tính bảo mật và sử dụng đầy đủ các tính năng, vui lòng xác thực email của bạn.
          </p>
          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#999' }}>
            Email: <strong>{userEmail}</strong>
          </p>
        </div>
      }
      type="warning"
      showIcon={false}
      style={{
        marginBottom: 16,
        borderRadius: 8,
        border: '1px solid #ffd666',
        background: '#fffbe6'
      }}
    />
  );
};

export default EmailVerificationBanner;