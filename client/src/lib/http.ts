import axios from 'axios';

import { TOKEN_KEY, UNAUTHORIZED_EVENT } from '../auth/AuthContext';

const baseURL: string = import.meta.env.VITE_API_BASE_URL || '/api';

/** 统一 axios 实例：自动附带 Bearer Token，401 时广播未授权事件 */
export const http = axios.create({
  baseURL,
  timeout: 20000,
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    const status: number | undefined = error?.response?.status;
    const requestUrl: string | undefined = error?.config?.url;
    // 登录/注册接口的 401/400 不做全局登出
    const isAuthEndpoint =
      typeof requestUrl === 'string' &&
      (requestUrl.includes('/api/auth/login') ||
        requestUrl.includes('/api/auth/register'));
    if (status === 401 && !isAuthEndpoint) {
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    }
    return Promise.reject(error);
  },
);
