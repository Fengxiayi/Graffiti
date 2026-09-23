import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ImageIcon, Brush, Users } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@client/src/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@client/src/components/ui/tabs';
import { Skeleton } from '@client/src/components/ui/skeleton';
import { Badge } from '@client/src/components/ui/badge';
import { useCurrentUser } from '@client/src/hooks/useCurrentUser';
import { useAuthActions } from '@lark-apaas/client-toolkit/hooks/useAuthActions';
import { getMyProjects } from '@client/src/api/projects';
import { getMyGalleryItems } from '@client/src/api/gallery';
import type { ProjectItem, GalleryItem } from '@shared/api.interface';

import ProjectCard from '../PaintPage/ProjectCard';
import GalleryCard from '../GalleryPage/GalleryCard';
import GalleryDetail from '../GalleryPage/GalleryDetail';

function MinePage() {
  const { user, loading: userLoading } = useCurrentUser();
  const { isLogin, goLogin } = useAuthActions();
  const [created, setCreated] = useState<ProjectItem[]>([]);
  const [joined, setJoined] = useState<ProjectItem[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGallery, setSelectedGallery] = useState<GalleryItem | null>(null);

  useEffect(() => {
    if (!isLogin) return;
    let cancelled = false;
    const load = async () => {
      try {
        const [projectsRes, galleryRes] = await Promise.all([
          getMyProjects(),
          getMyGalleryItems(),
        ]);
        if (!cancelled) {
          setCreated(projectsRes.created);
          setJoined(projectsRes.joined);
          setGalleryItems(galleryRes.items);
        }
      } catch {
        if (!cancelled) toast.error('加载数据失败');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [isLogin]);

  if (userLoading) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-10 md:px-10 lg:px-16">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="mt-8 h-40 w-full rounded-2xl" />
      </div>
    );
  }

  if (!isLogin || !user) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-6 py-32 text-center md:px-10">
        <h1 className="text-3xl font-bold tracking-tight">我的</h1>
        <p className="mt-4 max-w-md text-muted-foreground">
          登录后即可查看你参与或创建的项目，以及你上传的精选作品
        </p>
        <Button className="mt-8 rounded-full px-10" onClick={() => goLogin()}>
          登录 / 注册
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 md:px-10 lg:px-16">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">我的主页</h1>
          <p className="mt-2 text-muted-foreground">{user.userName ?? user.userId}</p>
        </div>
        <Button asChild className="rounded-full">
          <Link to="/paint">
            <Plus className="mr-1.5 h-4 w-4" />
            新建项目
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="projects">
        <TabsList className="mb-6">
          <TabsTrigger value="projects">项目</TabsTrigger>
          <TabsTrigger value="gallery">我的精选</TabsTrigger>
        </TabsList>

        <TabsContent value="projects">
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-72 rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="space-y-10">
              <div>
                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                  <Brush className="h-5 w-5 text-primary" />
                  我创建的项目
                  <Badge variant="secondary">{created.length}</Badge>
                </h2>
                {created.length === 0 ? (
                  <EmptyProjects />
                ) : (
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {created.map((project) => (
                      <ProjectCard key={project.id} project={project} />
                    ))}
                  </div>
                )}
              </div>
              <div>
                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                  <Users className="h-5 w-5 text-primary" />
                  我参与的项目
                  <Badge variant="secondary">{joined.length}</Badge>
                </h2>
                {joined.length === 0 ? (
                  <EmptyProjects text="还没有参与的项目，去发现小伙伴的创作吧" />
                ) : (
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {joined.map((project) => (
                      <ProjectCard key={project.id} project={project} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="gallery">
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-72 rounded-2xl" />
              ))}
            </div>
          ) : galleryItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
              <ImageIcon className="mb-4 h-12 w-12 text-muted-foreground/40" />
              <p className="text-lg font-medium">还没有上传过精选</p>
              <p className="mt-2 text-sm text-muted-foreground">
                在画板中点击「存入涂鸦精选」即可分享作品
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {galleryItems.map((item) => (
                <GalleryCard key={item.id} item={item} onOpen={setSelectedGallery} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {selectedGallery && (
        <GalleryDetail
          item={selectedGallery}
          open={!!selectedGallery}
          onOpenChange={(open) => {
            if (!open) setSelectedGallery(null);
          }}
          onUpdated={(updated) => {
            if (!updated.id) {
              setGalleryItems((prev) => prev.filter((item) => item.id !== selectedGallery.id));
            } else {
              setGalleryItems((prev) =>
                prev.map((item) => (item.id === updated.id ? updated : item)),
              );
            }
          }}
        />
      )}
    </div>
  );
}

function EmptyProjects({ text = '还没有创建项目，创建一个开始涂鸦吧' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-14 text-center">
      <Brush className="mb-3 h-10 w-10 text-muted-foreground/40" />
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

export default MinePage;
