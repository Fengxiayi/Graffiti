import { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Brush,
  Home,
  Image as ImageIcon,
  User,
  MessageSquare,
  Bell,
  LogOut,
  ShieldCheck,
  Palette,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '@client/src/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@client/src/components/ui/dropdown-menu';
import { useCurrentUser } from '@client/src/hooks/useCurrentUser';
import { getNotifications } from '@client/src/api/notifications';
import { logger } from '@lark-apaas/client-toolkit/logger';
import { useAuthActions } from '@lark-apaas/client-toolkit/hooks/useAuthActions';
import { UserDisplay } from '@client/src/components/business-ui/user-display';
import { cn } from '@client/src/lib/utils';

const navItems = [
  { path: '/', label: '主页', icon: Home },
  { path: '/paint', label: '一起绘画', icon: Brush },
  { path: '/gallery', label: '涂鸦精选', icon: ImageIcon },
  { path: '/mine', label: '我的', icon: User },
  { path: '/feedback', label: '网站反馈', icon: MessageSquare },
];

function Layout() {
  const { user, loading } = useCurrentUser();
  const { isLogin, goLogin, logout } = useAuthActions();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!isLogin) {
      setUnreadCount(0);
      return;
    }
    let cancelled = false;
    const fetchUnread = async () => {
      try {
        const res = await getNotifications();
        if (!cancelled) setUnreadCount(res.unreadCount);
      } catch (err) {
        logger.debug('fetch unread failed', err);
      }
    };
    void fetchUnread();
    const timer = setInterval(() => {
      void fetchUnread();
    }, 30000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [isLogin, location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const renderUserArea = () => {
    if (loading) return null;
    if (!isLogin || !user) {
      return (
        <Button
          variant="default"
          size="sm"
          className="rounded-full"
          onClick={() => goLogin()}
        >
          登录 / 注册
        </Button>
      );
    }
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-full border border-border bg-card px-2 py-1 hover:bg-muted transition-colors">
            <UserDisplay size="sm" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuLabel>
            <div className="flex items-center gap-2">
              <UserDisplay size="sm" />
              <span className="truncate">{user.userName ?? user.userId}</span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate('/mine')}>
            <User className="mr-2 h-4 w-4" />
            我的主页
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/admin')}>
            <ShieldCheck className="mr-2 h-4 w-4" />
            管理后台
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            退出登录
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/90 backdrop-blur supports-[backdrop-filter]:bg-card/70">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-3">
            <button
              className="rounded-lg p-2 hover:bg-muted md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="打开菜单"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <Link to="/" className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Palette className="h-5 w-5" />
              </span>
              <span className="hidden text-lg font-bold sm:block">大展宏涂</span>
            </Link>
          </div>

          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {isLogin && (
              <Button
                variant="ghost"
                size="icon"
                className="relative rounded-full"
                onClick={() => navigate('/mine')}
                aria-label="消息通知"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Button>
            )}
            {renderUserArea()}
          </div>
        </div>

        {/* 移动端导航 */}
        {mobileOpen && (
          <nav className="border-t border-border bg-card px-4 py-3 md:hidden">
            <div className="flex flex-col gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-muted',
                    )
                  }
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              ))}
            </div>
          </nav>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-border bg-card py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-2 px-4 text-sm text-muted-foreground md:flex-row md:justify-between">
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-primary" />
            <span>大展宏涂 · 与小伙伴们共度涂鸦娱乐</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/gallery" className="hover:text-foreground transition-colors">
              涂鸦精选
            </Link>
            <Link to="/feedback" className="hover:text-foreground transition-colors">
              网站反馈
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
