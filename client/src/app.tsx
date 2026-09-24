import { Navigate, Route, Routes } from 'react-router-dom';
import { ReactNode } from 'react';

import { useAuth } from './auth/AuthContext';
import { Layout } from './components/Layout/Layout';
import { HomePage } from './pages/HomePage/HomePage';
import { ProjectsPage } from './pages/ProjectsPage/ProjectsPage';
import { PaintPage } from './pages/PaintPage/PaintPage';
import { GalleryPage } from './pages/GalleryPage/GalleryPage';
import { GalleryDetailPage } from './pages/GalleryDetailPage/GalleryDetailPage';
import { MinePage } from './pages/MinePage/MinePage';
import { FeedbackPage } from './pages/FeedbackPage/FeedbackPage';
import { AdminPage } from './pages/AdminPage/AdminPage';
import { AuthPage } from './pages/AuthPage/AuthPage';

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/paint/:projectId" element={<PaintPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/gallery/:id" element={<GalleryDetailPage />} />
        <Route
          path="/mine"
          element={
            <RequireAuth>
              <MinePage />
            </RequireAuth>
          }
        />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminPage />
            </RequireAdmin>
          }
        />
        <Route path="/login" element={<AuthPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

function RequireAuth({ children }: { children: ReactNode }) {
  const { isLogin, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-muted-foreground">
        加载中…
      </div>
    );
  }
  if (!isLogin) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return <>{children}</>;
}

function RequireAdmin({ children }: { children: ReactNode }) {
  const { user, isLogin, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-muted-foreground">
        加载中…
      </div>
    );
  }
  if (!isLogin) {
    return <Navigate to="/login" state={{ from: '/admin' }} replace />;
  }
  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}
