import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import EmailVerificationBanner from '../components/EmailVerificationBanner';
import { useUser } from '../contexts/UserContext';
import './Layout.css';
import GlobalNotice from '../components/GlobalNotice';

const MainLayout: React.FC = () => {
  const { user } = useUser();
  
  const handleOverlayClick = () => {
    const sidebar = document.querySelector('.modern-sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    if (sidebar && overlay) {
      sidebar.classList.remove('mobile-open');
      overlay.classList.remove('active');
    }
  };

  return (
    <div className="modern-layout">
      {/* Sidebar Overlay for Mobile */}
      <div className="sidebar-overlay" onClick={handleOverlayClick}></div>
      
      {/* Full Width Header */}
      <Header />
      <GlobalNotice />
      
      {/* Content Area with Sidebar */}
      <div className="layout-body">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main Content Area */}
        <div className="content-container">
          <main className="main-content">
            <div className="content-wrapper">
              {/* Show verification banner if user is not verified */}
              {user && !user.isVerified && (
                <EmailVerificationBanner 
                  userEmail={user.email}
                  onVerificationSent={() => {
                  }}
                />
              )}
              <Outlet />
            </div>
          </main>
        </div>
      </div>
      
      {/* Full Width Footer */}
      <Footer />
    </div>
  );
};

export default MainLayout;