import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Spin } from "antd";
import api from "../apis/interceptor.api"; // axios instance

import type  {ReactNode}  from "react";

function PublicRoute({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const resp = await api.get("/auth/me");
        setIsAuth(Boolean(resp?.data));
      } catch (err) {
        setIsAuth(false);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#FFFFFF'
      }}>
        <Spin size="large" tip="Đang kiểm tra trạng thái đăng nhập..." />
      </div>
    );
  }

  // Nếu đã login thì redirect sang dashboard
  if (isAuth) {
    return <Navigate to="/dashboard" replace />;
  }

  // Nếu chưa login thì cho vào trang login
  return children;
}

export default PublicRoute;
