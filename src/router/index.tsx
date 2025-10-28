import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Register from '../pages/Register';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Profile from '../pages/Profile';
import Company from '../pages/Company';
import Jobs from '../pages/Jobs';
import ApplicationsPage from '../pages/Applications';
import EmailVerification from '../pages/EmailVerification';
import ResendVerification from '../pages/ResendVerification';
import ProtectedRoute from './protectedRoute';
import PublicRoute from './publicRoute';
import MainLayout from '../layouts/MainLayout';

const AppRouter: React.FC = () => {
  return (
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<EmailVerification />} />
        <Route path="/resend-verification" element={<ResendVerification />} />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* Protected routes */}
        <Route
          element={
            <ProtectedRoute requiredRole="Recruiter">
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/company" element={<Company />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/create" element={<Jobs />} />
          {/* Backward-compatible redirect for legacy draft route */}
          <Route path="/jobs/draft" element={<Navigate to="/jobs?tab=draft" replace />} />
          <Route path="/applications" element={<ApplicationsPage />} />
        </Route>
      </Routes>
  );
};

export default AppRouter;
