import { Link } from 'react-router-dom';
import { Palette } from 'lucide-react';
import { Button } from '@client/src/components/ui/button';

function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <span className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary">
        <Palette className="h-10 w-10" />
      </span>
      <h1 className="text-6xl font-black tracking-tight">404</h1>
      <p className="mt-4 text-lg font-medium">页面走丢了</p>
      <p className="mt-2 max-w-md text-muted-foreground">
        你访问的页面不存在或已被移动，回到主页继续涂鸦吧
      </p>
      <Button asChild className="mt-8 rounded-full px-10">
        <Link to="/">返回主页</Link>
      </Button>
    </div>
  );
}

export default NotFound;
