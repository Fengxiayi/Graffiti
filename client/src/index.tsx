import React, { useCallback, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { Toaster } from 'sonner';

import { App } from './app';
import { AuthProvider } from './auth/AuthContext';
import { ThemeProvider } from './components/theme-provider';
import './index.css';

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-8 text-center">
      <h1 className="text-2xl font-bold">页面出错了</h1>
      <p className="max-w-md text-sm text-muted-foreground">{error.message}</p>
      <button
        onClick={() => window.location.reload()}
        className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
      >
        刷新重试
      </button>
    </div>
  );
}

const basePath: string = import.meta.env.VITE_CLIENT_BASE_PATH || '/';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <ThemeProvider>
        <BrowserRouter basename={basePath}>
          <AuthProvider>
            <App />
            <Toaster position="top-center" richColors />
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);
