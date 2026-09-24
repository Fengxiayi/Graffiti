import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Home, Brush, Star, User, MessageSquare, ShieldCheck } from 'lucide-react';

import { useAuthActions } from '../../hooks/useAuthActions';

export function Layout() {
  const { isLogin, user, goLogin, logout } = useAuthActions();
  const location = useLocation();

  const navItems = [
    { to: '/', label: '主页', icon: Home },
    { to: '/projects', label: '一起绘画', icon: Brush },
    { to: '/gallery', label: '涂鸦精选', icon: Star },
    { to: '/mine', label: '我的', icon: User },
    { to: '/feedback', label: '网站反馈', icon: MessageSquare },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <NavLink to="/" className="flex items-center gap-2 text-lg font-bold text-gray-900">
            <Brush className="h-6 w-6 text-indigo-600" />
            大展宏涂
          </NavLink>

          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 rounded-md px-3 py-2 text-sm transition ${
                    isActive
                      ? 'bg-indigo-50 font-semibold text-indigo-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
            {user?.role === 'admin' && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `flex items-center gap-1.5 rounded-md px-3 py-2 text-sm transition ${
                    isActive
                      ? 'bg-amber-50 font-semibold text-amber-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <ShieldCheck className="h-4 w-4" />
                管理后台
              </NavLink>
            )}
          </nav>

          <div className="flex items-center gap-3">
            {isLogin ? (
              <div className="flex items-center gap-2">
                <span className="hidden text-sm text-gray-600 sm:block">
                  {user?.nickname || user?.userName}
                  {user?.role === 'admin' ? '（管理员）' : ''}
                </span>
                <button
                  onClick={logout}
                  className="rounded-md border px-3 py-1.5 text-sm text-gray-600 transition hover:bg-gray-50"
                >
                  退出
                </button>
              </div>
            ) : (
              <button
                onClick={goLogin}
                className="rounded-md bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-indigo-700"
              >
                登录 / 注册
              </button>
            )}
          </div>
        </div>

        {/* 移动端导航 */}
        <nav className="flex overflow-x-auto border-t px-2 py-1.5 md:hidden">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-1 rounded-md px-3 py-1.5 text-sm ${
                  isActive ? 'bg-indigo-50 font-semibold text-indigo-600' : 'text-gray-600'
                }`
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
          {user?.role === 'admin' && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-1 rounded-md px-3 py-1.5 text-sm ${
                  isActive ? 'bg-amber-50 font-semibold text-amber-600' : 'text-gray-600'
                }`
              }
            >
              <ShieldCheck className="h-4 w-4" />
              管理后台
            </NavLink>
          )}
        </nav>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t py-6 text-center text-xs text-gray-400">
        大展宏涂 · 与小伙伴们共度涂鸦娱乐，大展宏涂
      </footer>
    </div>
  );
}
