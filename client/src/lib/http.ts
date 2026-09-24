import axios from 'axios';

/** localStorage 中保存 JWT 的键名 */
export const TOKEN_KEY = 'graffiti_token';

/** 未登录事件名（401 时广播，AuthContext 监听后清理状态） */
export const UNAUTHORIZED_EVENT = 'graffiti:unauthorized';

/** 统一 axios 实例：自动携带 Bearer token，401 时清理登录态 */
export const http = axios.create({
  baseURL: '/',
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
  (res) => res,
  (error) => {
    const url: string = error?.config?.url ?? '';
    if (error?.response?.status === 401 && !url.includes('/api/auth/login')) {
      localStorage.removeItem(TOKEN_KEY);
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    }
    return Promise.reject(error);
  },
);
