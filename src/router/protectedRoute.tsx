import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { Spin } from "antd";
import { UserProvider, useUser } from "../contexts/UserContext";
import { NotificationProvider } from "../contexts/NotificationContext";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string; 
}

function ProtectedRouteContent({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#FFFFFF'
      }}>
        <Spin size="large" tip="Đang kiểm tra quyền truy cập..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // nếu có yêu cầu role
  if (requiredRole) {
    const roles: string[] = user.roles || [];
    if (!roles.includes(requiredRole)) {
      return <Navigate to="/login" replace />;
    }
  }

  return <>{children}</>;
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  return (
    <UserProvider>
      <NotificationProvider>
        <ProtectedRouteContent requiredRole={requiredRole}>
          {children}
        </ProtectedRouteContent>
      </NotificationProvider>
    </UserProvider>
  );
}
