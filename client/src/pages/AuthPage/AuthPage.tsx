import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Palette, Loader2 } from 'lucide-react';

import { useAuth } from '../../auth/AuthContext';
import { Button } from '@client/src/components/ui/button';
import { Input } from '@client/src/components/ui/input';

type Mode = 'login' | 'register';

export default function AuthPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from || '/';

  const [mode, setMode] = useState<Mode>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const switchMode = (next: Mode) => {
    setMode(next);
    setPassword('');
    setConfirmPassword('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (mode === 'register') {
      if (password !== confirmPassword) {
        toast.error('两次输入的密码不一致');
        return;
      }
      if (password.length < 6) {
        toast.error('密码至少 6 位');
        return;
      }
    }

    setSubmitting(true);
    try {
      if (mode === 'login') {
        await login(username, password);
        toast.success('登录成功，欢迎回来');
      } else {
        await register({ username, password, nickname: nickname || undefined });
        toast.success('注册成功，已自动登录');
      }
      navigate(from, { replace: true });
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (mode === 'login' ? '登录失败，请检查账号密码' : '注册失败，请稍后再试');
      toast.error(Array.isArray(message) ? message[0] : message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/20 px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center gap-3">
          <Link to="/" className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
            <Palette className="h-6 w-6" />
          </Link>
          <h1 className="text-2xl font-bold">大展宏涂</h1>
          <p className="text-sm text-muted-foreground">与小伙伴们共度涂鸦娱乐，大展宏涂</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-6 flex rounded-full bg-muted p-1">
            {(['login', 'register'] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => switchMode(m)}
                className={`flex-1 rounded-full py-2 text-sm font-medium transition-colors ${
                  mode === m ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
                }`}
              >
                {m === 'login' ? '登录' : '注册'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">账号</label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="2-50 个字符"
                required
                autoComplete="username"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">密码</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'register' ? '至少 6 位' : '请输入密码'}
                required
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
            </div>

            {mode === 'register' && (
              <>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">确认密码</label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="再次输入密码"
                    required
                    autoComplete="new-password"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">
                    昵称 <span className="text-xs text-muted-foreground">（可选）</span>
                  </label>
                  <Input
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="展示用昵称"
                    autoComplete="nickname"
                  />
                </div>
              </>
            )}

            <Button type="submit" className="mt-2 w-full" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === 'login' ? '登录' : '注册并登录'}
            </Button>
          </form>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            {mode === 'login' ? '还没有账号？' : '已有账号？'}
            <button
              type="button"
              className="ml-1 font-medium text-primary hover:underline"
              onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
            >
              {mode === 'login' ? '立即注册' : '去登录'}
            </button>
          </p>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            系统首个注册用户自动成为管理员
          </p>
        </div>
      </div>
    </div>
  );
}
