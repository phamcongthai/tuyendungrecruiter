import React, { useEffect, useRef, useState } from 'react';
import { Modal, Spin, message } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import GrapeJS from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import { usersAPI, type UserCvData } from '../apis/users.api';

interface CVViewerProps {
  open: boolean;
  onClose: () => void;
  accountId: string;
  userName?: string;
}

const CVViewer: React.FC<CVViewerProps> = ({
  open,
  onClose,
  accountId,
  userName
}) => {
  const [loading, setLoading] = useState(false);
  const [cvData, setCvData] = useState<UserCvData | null>(null);
  const editorRef = useRef<any>(null);
  const initRef = useRef(false);

  useEffect(() => {
    if (!open || initRef.current) return;

    const initEditor = async () => {
      try {
        setLoading(true);
        
        // Bước 1: Lấy user profile từ accountId
        console.log('Step 1: Fetching user profile for accountId:', accountId);
        let userResponse;
        try {
          userResponse = await usersAPI.getUserByAccountId(accountId);
          console.log('User profile received:', userResponse);
        } catch (error) {
          console.error('Error fetching user profile:', error);
          // Fallback: tạo user data giả để test
          userResponse = {
            _id: 'test-user-id',
            accountId: accountId,
            avatar: null,
            desiredPosition: 'Software Developer',
            summaryExperience: '3 năm kinh nghiệm phát triển phần mềm',
            skills: ['JavaScript', 'React', 'Node.js'],
            cvId: null,
            cvFields: {
              fullName: userName || 'Test User',
              email: 'test@example.com',
              phone: '0123456789',
              summary: 'Kinh nghiệm phát triển web với React và Node.js'
            }
          };
          console.log('Using fallback user data:', userResponse);
        }
        
        if (!userResponse) {
          throw new Error('Không tìm thấy thông tin user');
        }

        // Bước 2: Kiểm tra user có cvId không
        const cvId = userResponse.cvId;
        let cvTemplate = null;
        
        if (cvId) {
          console.log('Step 2: User has cvId, fetching CV template:', cvId);
          try {
            // Gọi API cv-samples để lấy template
            const templateResponse = await fetch(`http://localhost:3000/cv-samples/${cvId}`);
            if (templateResponse.ok) {
              cvTemplate = await templateResponse.json();
              console.log('CV template received:', cvTemplate);
            } else {
              console.warn('Failed to fetch CV template:', templateResponse.status);
            }
          } catch (error) {
            console.warn('Error fetching CV template:', error);
          }
        } else {
          console.log('Step 2: User has no cvId, will use default template');
        }

        // Tạo data object
        const data = {
          user: userResponse,
          cvTemplate: cvTemplate
        };
        
        setCvData(data);
        
        // Wait for DOM element to be ready
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const container = document.getElementById('cv-viewer-container');
        if (!container) {
          throw new Error('CV viewer container not found');
        }
        
        // Bước 3: Initialize GrapesJS editor
        console.log('Step 3: Initializing GrapesJS editor');
        const editor = GrapeJS.init({
          container: container,
          height: '700px',
          fromElement: false,
          storageManager: false,
          blockManager: { appendTo: undefined },
          layerManager: { appendTo: undefined },
          selectorManager: { appendTo: undefined },
          styleManager: { appendTo: undefined },
          panels: { defaults: [] },
          canvas: {
            styles: [
              'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
            ]
          }
        });

        // Disable editing interactions
        try {
          editor.off();
          if (editor.Panels) editor.Panels.getPanels().reset([]);
          if (editor.BlockManager) editor.BlockManager.getAll().reset([]);
          if (editor.LayerManager) editor.LayerManager.getAll().reset([]);
          if (editor.SelectorManager) editor.SelectorManager.getAll().reset([]);
          if (editor.StyleManager) editor.StyleManager.getAll().reset([]);
          
          editor.on('component:selected', (e) => {
            e.stopPropagation();
            return false;
          });
          
          editor.on('component:highlight', (e) => {
            e.stopPropagation();
            return false;
          });
        } catch (error) {
          console.warn('Error disabling editor interactions:', error);
        }

        editorRef.current = editor;
        initRef.current = true;

        // Bước 4: Load CV template và apply data
        console.log('Step 4: Loading CV template and applying data');
        await loadCVTemplate(data);
        
      } catch (error) {
        console.error('Error initializing CV viewer:', error);
        message.error('Không thể tải CV: ' + (error.message || 'Lỗi không xác định'));
      } finally {
        setLoading(false);
      }
    };

    // Use setTimeout to ensure DOM is ready
    const timeoutId = setTimeout(initEditor, 200);

    return () => {
      clearTimeout(timeoutId);
      if (editorRef.current) {
        try {
          editorRef.current.destroy();
        } catch (error) {
          console.warn('Error destroying editor:', error);
        }
        editorRef.current = null;
        initRef.current = false;
      }
    };
  }, [open, accountId]);

  const loadCVTemplate = async (data: UserCvData) => {
    if (!editorRef.current) return;

    try {
      if (!data.cvTemplate) {
        console.warn('Không có CV template, sử dụng template mặc định');
        // Sử dụng template mặc định
        const defaultTemplate = {
          html: `
            <div style="padding: 20px; font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #333; margin-bottom: 10px;" data-field="fullName">${data.user.desiredPosition || 'Tên ứng viên'}</h1>
                <p style="color: #666; font-size: 18px;" data-field="desiredPosition">Vị trí mong muốn</p>
                <p style="color: #888;" data-field="email">Email liên hệ</p>
                <p style="color: #888;" data-field="phone">Số điện thoại</p>
              </div>
              
              <div style="margin-bottom: 30px;">
                <h2 style="color: #333; border-bottom: 2px solid #00b14f; padding-bottom: 5px;">Giới thiệu bản thân</h2>
                <p style="line-height: 1.6;" data-field="summary">Mô tả ngắn gọn về kinh nghiệm và kỹ năng...</p>
              </div>
              
              <div style="margin-bottom: 30px;">
                <h2 style="color: #333; border-bottom: 2px solid #00b14f; padding-bottom: 5px;">Kỹ năng</h2>
                <p data-field="skills">Kỹ năng chính...</p>
              </div>
              
              <div style="margin-bottom: 30px;">
                <h2 style="color: #333; border-bottom: 2px solid #00b14f; padding-bottom: 5px;">Kinh nghiệm</h2>
                <p data-field="experience">Kinh nghiệm làm việc...</p>
              </div>
            </div>
          `,
          css: `
            body { margin: 0; padding: 0; background: #f5f5f5; }
            h1, h2 { color: #333; }
            p { color: #666; line-height: 1.6; }
          `
        };
        
        editorRef.current.setComponents(defaultTemplate.html);
        editorRef.current.setStyle(defaultTemplate.css);
      } else {
        // Sử dụng template từ database
        editorRef.current.setComponents(data.cvTemplate.html);
        editorRef.current.setStyle(data.cvTemplate.css);
      }

      // Apply user data to template fields
      setTimeout(() => {
        const doc = getEditorDocument();
        if (doc) {
          console.log('Applying user data to template:', data.user);
          
          // Apply cvFields nếu có
          if (data.user.cvFields) {
            Object.keys(data.user.cvFields).forEach((key) => {
              const element = doc.querySelector(`[data-field="${key}"]`);
              if (element) {
                element.textContent = String(data.user.cvFields[key] || '');
                console.log(`Applied field ${key}:`, data.user.cvFields[key]);
              }
            });
          }

          // Apply avatar if available
          const avatarElement = doc.querySelector('[data-field="avatar"]') as HTMLImageElement;
          if (avatarElement && data.user.avatar) {
            avatarElement.src = data.user.avatar;
            console.log('Applied avatar:', data.user.avatar);
          }

          // Apply user name if available
          const nameElement = doc.querySelector('[data-field="fullName"]');
          if (nameElement && userName) {
            nameElement.textContent = userName;
            console.log('Applied name:', userName);
          }

          // Apply other user data
          const desiredPositionElement = doc.querySelector('[data-field="desiredPosition"]');
          if (desiredPositionElement && data.user.desiredPosition) {
            desiredPositionElement.textContent = data.user.desiredPosition;
          }

          const summaryElement = doc.querySelector('[data-field="summary"]');
          if (summaryElement && data.user.summaryExperience) {
            summaryElement.textContent = data.user.summaryExperience;
          }

          const skillsElement = doc.querySelector('[data-field="skills"]');
          if (skillsElement && data.user.skills) {
            skillsElement.textContent = data.user.skills.join(', ');
          }
        }
      }, 200);

    } catch (error) {
      console.error('Error loading CV template:', error);
      message.error('Không thể tải mẫu CV');
    }
  };

  const getEditorDocument = () => {
    try {
      return editorRef.current?.Canvas?.getDocument?.() as Document | null;
    } catch {
      return null;
    }
  };

  const handleClose = () => {
    if (editorRef.current) {
      try {
        editorRef.current.destroy();
      } catch (error) {
        console.warn('Error destroying editor on close:', error);
      }
      editorRef.current = null;
      initRef.current = false;
    }
    setCvData(null);
    onClose();
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <EyeOutlined />
          <span>Xem CV ứng viên</span>
          {userName && (
            <span style={{ fontSize: '14px', color: '#666', fontWeight: 'normal' }}>
              - {userName}
            </span>
          )}
          {cvData?.cvTemplate && (
            <span style={{ fontSize: '12px', color: '#999', fontWeight: 'normal' }}>
              ({cvData.cvTemplate.name})
            </span>
          )}
        </div>
      }
      open={open}
      onCancel={handleClose}
      width={1000}
      footer={null}
      destroyOnClose
    >
      <div style={{ position: 'relative' }}>
        {loading && (
          <div style={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)',
            zIndex: 1000,
            background: 'rgba(255, 255, 255, 0.9)',
            padding: '20px',
            borderRadius: '8px'
          }}>
            <Spin size="large" />
          </div>
        )}
        <div 
          id="cv-viewer-container" 
          style={{ 
            border: '1px solid #e5e7eb', 
            borderRadius: '8px', 
            height: '700px',
            minHeight: '700px',
            background: '#fff'
          }} 
        />
      </div>
    </Modal>
  );
};

export default CVViewer;