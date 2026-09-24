import { useAuthActions } from '@client/src/hooks/useAuthActions';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@client/src/components/ui/tabs';
import { Button } from '@client/src/components/ui/button';
import { Skeleton } from '@client/src/components/ui/skeleton';
import { useCurrentUser } from '@client/src/hooks/useCurrentUser';

import ProjectManage from './ProjectManage';
import GalleryManage from './GalleryManage';
import FeedbackManage from './FeedbackManage';

function AdminPage() {
  const { user, loading: userLoading } = useCurrentUser();
  const { isLogin, goLogin } = useAuthActions();
  const isAdmin = user?.role === 'admin';

  if (userLoading) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-10 md:px-10">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="mt-8 h-40 w-full rounded-2xl" />
      </div>
    );
  }

  if (!isLogin) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-6 py-32 text-center">
        <h1 className="text-3xl font-bold tracking-tight">管理后台</h1>
        <p className="mt-4 max-w-md text-muted-foreground">请先登录</p>
        <Button className="mt-8 rounded-full px-10" onClick={() => goLogin()}>
          登录 / 注册
        </Button>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-6 py-32 text-center">
        <h1 className="text-3xl font-bold tracking-tight">管理后台</h1>
        <p className="mt-4 max-w-md text-muted-foreground">
          当前账号没有管理员权限，如需开通请联系站点管理员
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 md:px-10 lg:px-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">管理后台</h1>
        <p className="mt-2 text-muted-foreground">
          项目、涂鸦精选与反馈管理（管理员专属）
        </p>
      </div>

      <Tabs defaultValue="projects">
        <TabsList className="mb-6">
          <TabsTrigger value="projects">项目管理</TabsTrigger>
          <TabsTrigger value="gallery">精选管理</TabsTrigger>
          <TabsTrigger value="feedbacks">反馈管理</TabsTrigger>
        </TabsList>

        <TabsContent value="projects">
          <ProjectManage />
        </TabsContent>
        <TabsContent value="gallery">
          <GalleryManage />
        </TabsContent>
        <TabsContent value="feedbacks">
          <FeedbackManage />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AdminPage;
