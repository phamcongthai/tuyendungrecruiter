import React, { useState } from 'react';
import { Button, message, Tooltip } from 'antd';
import { MailOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { authAPI } from '../apis/auth.api';
import { useUser } from '../contexts/UserContext';

interface VerificationButtonProps {
  userEmail: string;
  size?: 'small' | 'middle' | 'large';
  type?: 'primary' | 'default' | 'dashed' | 'link' | 'text';
  showTooltip?: boolean;
  onVerificationSent?: () => void;
}

const VerificationButton: React.FC<VerificationButtonProps> = ({
  userEmail,
  size = 'middle',
  type = 'primary',
  showTooltip = true,
  onVerificationSent
}) => {
  const [sending, setSending] = useState(false);
  const { user, refreshUser } = useUser();

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
      console.error('Resend verification error:', error);
      message.error(error.message || 'Có lỗi xảy ra khi gửi email xác thực');
    } finally {
      setSending(false);
    }
  };

  // If user is already verified, show verified status
  if (user?.isVerified) {
    return (
      <Tooltip title="Tài khoản đã được xác thực" placement="top">
        <Button
          size={size}
          type="default"
          icon={<CheckCircleOutlined />}
          disabled
          style={{
            color: '#52c41a',
            borderColor: '#52c41a',
            background: 'transparent'
          }}
        >
          Đã xác thực
        </Button>
      </Tooltip>
    );
  }

  const button = (
    <Button
      type={type}
      size={size}
      icon={<MailOutlined />}
      loading={sending}
      onClick={handleResendVerification}
      style={{
        background: type === 'primary' ? '#00b14f' : undefined,
        borderColor: type === 'primary' ? '#00b14f' : undefined,
      }}
    >
      {sending ? 'Đang gửi...' : 'Gửi email xác thực'}
    </Button>
  );

  if (showTooltip) {
    return (
      <Tooltip 
        title="Gửi email xác thực để kích hoạt tài khoản" 
        placement="top"
      >
        {button}
      </Tooltip>
    );
  }

  return button;
};

export default VerificationButton;