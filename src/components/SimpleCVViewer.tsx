import React from 'react';
import { Card } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';

interface SimpleCVViewerProps {
  userProfile?: {
    avatar?: string;
    desiredPosition?: string;
    summaryExperience?: string;
    skills?: string[];
    cvId?: string;
    cvFields?: Record<string, string>;
  } | null;
  account?: {
    fullName?: string;
    email?: string;
    phone?: string;
  } | null;
}

const SimpleCVViewer: React.FC<SimpleCVViewerProps> = ({ userProfile, account }) => {

  // Tạo dữ liệu CV từ thông tin có sẵn
  const cvData = {
    fullName: account?.fullName || 'Tên ứng viên',
    email: account?.email || '',
    phone: account?.phone || '',
    desiredPosition: userProfile?.desiredPosition || 'Vị trí mong muốn',
    summary: userProfile?.summaryExperience || 'Mô tả kinh nghiệm...',
    skills: userProfile?.skills?.join(', ') || 'Kỹ năng chính...',
    experience: userProfile?.summaryExperience || 'Kinh nghiệm làm việc...',
    avatar: userProfile?.avatar
  };

  // Nếu có cvFields từ database, sử dụng dữ liệu đó
  const finalData = userProfile?.cvFields ? {
    ...cvData,
    ...userProfile.cvFields
  } : cvData;

  return (
    <Card 
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FileTextOutlined />
          <span>CV Ứng viên</span>
        </div>
      }
      style={{ marginBottom: 16 }}
    >
      <div style={{ 
        padding: '20px', 
        fontFamily: 'Arial, sans-serif', 
        maxWidth: '100%', 
        margin: '0 auto',
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '8px'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px', paddingBottom: '20px', borderBottom: '2px solid #00b14f' }}>
          {finalData.avatar && (
            <img 
              src={finalData.avatar} 
              alt="Avatar" 
              style={{ 
                width: '100px', 
                height: '100px', 
                borderRadius: '50%', 
                objectFit: 'cover',
                marginBottom: '15px',
                border: '3px solid #00b14f'
              }} 
            />
          )}
          <h1 style={{ color: '#333', marginBottom: '10px', fontSize: '28px' }}>
            {finalData.fullName}
          </h1>
          <p style={{ color: '#00b14f', fontSize: '18px', fontWeight: '600', marginBottom: '5px' }}>
            {finalData.desiredPosition}
          </p>
          <div style={{ color: '#666', fontSize: '14px' }}>
            <p style={{ margin: '2px 0' }}>📧 {finalData.email}</p>
            <p style={{ margin: '2px 0' }}>📱 {finalData.phone}</p>
          </div>
        </div>
        
        {/* Giới thiệu bản thân */}
        <div style={{ marginBottom: '25px' }}>
          <h2 style={{ 
            color: '#333', 
            borderBottom: '2px solid #00b14f', 
            paddingBottom: '5px',
            fontSize: '20px',
            marginBottom: '15px'
          }}>
            Giới thiệu bản thân
          </h2>
          <p style={{ 
            lineHeight: '1.6', 
            color: '#555',
            fontSize: '16px',
            textAlign: 'justify'
          }}>
            {finalData.summary}
          </p>
        </div>
        
        {/* Kỹ năng */}
        <div style={{ marginBottom: '25px' }}>
          <h2 style={{ 
            color: '#333', 
            borderBottom: '2px solid #00b14f', 
            paddingBottom: '5px',
            fontSize: '20px',
            marginBottom: '15px'
          }}>
            Kỹ năng
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {finalData.skills.split(',').map((skill, index) => (
              <span 
                key={index}
                style={{
                  background: '#00b14f',
                  color: 'white',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                {skill.trim()}
              </span>
            ))}
          </div>
        </div>
        
        {/* Kinh nghiệm */}
        <div style={{ marginBottom: '25px' }}>
          <h2 style={{ 
            color: '#333', 
            borderBottom: '2px solid #00b14f', 
            paddingBottom: '5px',
            fontSize: '20px',
            marginBottom: '15px'
          }}>
            Kinh nghiệm
          </h2>
          <p style={{ 
            lineHeight: '1.6', 
            color: '#555',
            fontSize: '16px',
            textAlign: 'justify'
          }}>
            {finalData.experience}
          </p>
        </div>

        {/* Thông tin bổ sung từ cvFields */}
        {userProfile?.cvFields && Object.keys(userProfile.cvFields).length > 0 && (
          <div style={{ marginBottom: '25px' }}>
            <h2 style={{ 
              color: '#333', 
              borderBottom: '2px solid #00b14f', 
              paddingBottom: '5px',
              fontSize: '20px',
              marginBottom: '15px'
            }}>
              Thông tin bổ sung
            </h2>
            <div style={{ display: 'grid', gap: '10px' }}>
              {Object.entries(userProfile.cvFields).map(([key, value]) => {
                if (['fullName', 'email', 'phone', 'desiredPosition', 'summary', 'skills', 'experience', 'avatar'].includes(key)) {
                  return null; // Skip các field đã hiển thị
                }
                return (
                  <div key={key} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <strong style={{ color: '#333', minWidth: '120px', fontSize: '14px' }}>
                      {key.charAt(0).toUpperCase() + key.slice(1)}:
                    </strong>
                    <span style={{ color: '#555', fontSize: '14px', flex: 1 }}>
                      {value}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default SimpleCVViewer;
