import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="modern-footer">
      <div className="footer-content">
        <div className="footer-text">
          © {currentYear} ThaiCV Recruiter. Tất cả quyền được bảo lưu.
        </div>
        <div className="footer-links">
          <a href="/privacy" className="footer-link">
            Chính sách bảo mật
          </a>
          <a href="/terms" className="footer-link">
            Điều khoản sử dụng
          </a>
          <a href="/support" className="footer-link">
            Hỗ trợ
          </a>
          <a href="/contact" className="footer-link">
            Liên hệ
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;