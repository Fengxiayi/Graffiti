import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';

import RoutesComponent from './app';
import { AuthProvider } from './auth/AuthContext';
import { Toaster } from '@client/src/components/ui/sonner';
import './index.css';

const CLIENT_BASE_PATH = import.meta.env.VITE_CLIENT_BASE_PATH || '/';

function ErrorFallback({ error, resetErrorBoundary }: {
  error: unknown;
  resetErrorBoundary: () => void;
}) {
  const message = error instanceof Error ? error.message : '发生未知错误';
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-8 text-center">
      <h1 className="text-lg font-bold">页面出错了</h1>
      <p className="max-w-md text-sm text-muted-foreground">{message}</p>
      <button
        className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        onClick={resetErrorBoundary}
      >
        重新加载
      </button>
    </div>
  );
}

const MainApp = () => {
  return (
    <BrowserRouter basename={CLIENT_BASE_PATH}>
      <AuthProvider>
        <ErrorBoundary fallbackRender={ErrorFallback}>
          <RoutesComponent />
          <Toaster />
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  );
};

createRoot(document.getElementById('root')!).render(<MainApp />);
