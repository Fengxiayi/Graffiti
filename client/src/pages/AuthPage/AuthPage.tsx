import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { http } from '../../lib/http';
import { useAuth } from '../../auth/AuthContext';
import type { AuthResponse } from '../../../../shared/api.interface';

interface LocationState {
  from?: string;
}

export function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as LocationState;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'register' && password.length < 6) {
      toast.error('密码至少 6 位');
      return;
    }
    if (mode === 'register' && password !== confirmPassword) {
      toast.error('两次输入的密码不一致');
      return;
    }

    setSubmitting(true);
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const body =
        mode === 'login'
          ? { username, password }
          : {
              username,
              password,
              nickname: nickname.trim() || undefined,
            };
      const res = await http.post<AuthResponse>(endpoint, body);
      login(res.data.token, res.data.user);
      toast.success(mode === 'login' ? '登录成功' : '注册成功，欢迎加入大展宏涂！');
      navigate(state.from || '/', { replace: true });
    } catch (err: unknown) {
      const msg: string =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        '操作失败，请稍后重试';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-fuchsia-50 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border bg-white/80 p-8 shadow-xl backdrop-blur">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            {mode === 'login' ? '登录大展宏涂' : '注册新账号'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {mode === 'login' ? '欢迎回来，继续你的涂鸦创作' : '自定义账号密码，无需邮箱'}
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">账号</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="输入账号（2-50 字符）"
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === 'register' ? '至少 6 位' : '输入密码'}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          {mode === 'register' && (
            <>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">确认密码</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="再次输入密码"
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">昵称（可选）</label>
                <input
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="给自己起个好听的名字"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
          >
            {submitting ? '请稍候…' : mode === 'login' ? '登录' : '注册'}
          </button>
        </form>

        <div className="mt-5 text-center text-sm text-gray-500">
          {mode === 'login' ? (
            <>
              还没有账号？{' '}
              <button onClick={() => setMode('register')} className="font-medium text-indigo-600 hover:underline">
                立即注册
              </button>
            </>
          ) : (
            <>
              已有账号？{' '}
              <button onClick={() => setMode('login')} className="font-medium text-indigo-600 hover:underline">
                去登录
              </button>
            </>
          )}
        </div>

        <p className="mt-4 text-center text-xs text-gray-400">
          系统首个注册用户自动成为管理员
        </p>
      </div>
    </div>
  );
}
