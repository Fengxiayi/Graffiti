import React from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import Layout from './components/Layout';
import NotFound from './pages/NotFound/NotFound';
import HomePage from './pages/HomePage/HomePage';
import PaintPage from './pages/PaintPage/PaintPage';
import GalleryPage from './pages/GalleryPage/GalleryPage';
import MinePage from './pages/MinePage/MinePage';
import FeedbackPage from './pages/FeedbackPage/FeedbackPage';
import AdminPage from './pages/AdminPage/AdminPage';
import AuthPage from './pages/AuthPage/AuthPage';
import { useAuth } from './auth/AuthContext';

/** 需要登录的路由守卫：未登录跳转登录页 */
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) {
    return <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">加载中…</div>;
  }
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return <>{children}</>;
}

/** 管理员路由守卫：非管理员跳转主页 */
function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">加载中…</div>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

const RoutesComponent = () => {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage />} />
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="paint" element={<PaintPage />} />
        <Route path="gallery" element={<GalleryPage />} />
        <Route
          path="mine"
          element={
            <RequireAuth>
              <MinePage />
            </RequireAuth>
          }
        />
        <Route path="feedback" element={<FeedbackPage />} />
        <Route
          path="admin"
          element={
            <RequireAdmin>
              <AdminPage />
            </RequireAdmin>
          }
        />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default RoutesComponent;
