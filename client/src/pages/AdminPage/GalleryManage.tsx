import { useEffect, useState } from 'react';
import { Pin, Trash2, Heart, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@client/src/components/ui/button';
import { Badge } from '@client/src/components/ui/badge';
import { Skeleton } from '@client/src/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@client/src/components/ui/alert-dialog';
import { adminListGallery, adminSetGalleryPinned, adminDeleteGalleryItem } from '@client/src/api/admin';
import type { GalleryItem } from '@shared/api.interface';

function GalleryManage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await adminListGallery(1, 50);
      setItems(res.items);
    } catch {
      toast.error('加载精选失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const togglePinned = async (item: GalleryItem) => {
    try {
      await adminSetGalleryPinned(item.id, !item.isPinned);
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, isPinned: !i.isPinned } : i)),
      );
      toast.success(item.isPinned ? '已取消置顶' : '已置顶');
    } catch {
      toast.error('操作失败');
    }
  };

  const handleDelete = async (item: GalleryItem) => {
    try {
      await adminDeleteGalleryItem(item.id);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      toast.success('作品已删除');
    } catch {
      toast.error('删除失败');
    }
  };

  if (loading) {
    return <Skeleton className="h-40 w-full rounded-2xl" />;
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
        <p className="text-sm text-muted-foreground">暂无精选作品</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((item) => (
        <div key={item.id} className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="relative aspect-[4/3] overflow-hidden bg-muted">
            <img src={item.imageUrl} alt={item.title} loading="lazy" className="h-full w-full object-cover" />
            {item.isPinned && (
              <Badge className="absolute left-3 top-3 bg-primary">
                <Pin className="mr-1 h-3 w-3" /> 置顶
              </Badge>
            )}
          </div>
          <div className="p-4">
            <h3 className="mb-2 truncate font-semibold">{item.title}</h3>
            <div className="mb-3 flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Heart className="h-3.5 w-3.5" />
                {item.likeCount}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="h-3.5 w-3.5" />
                {item.commentCount}
              </span>
              <span className="ml-auto font-mono">@{item.creatorId.slice(0, 8)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => togglePinned(item)}>
                <Pin className="mr-1 h-3.5 w-3.5" />
                {item.isPinned ? '取消置顶' : '置顶'}
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                    删除
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>删除精选作品「{item.title}」？</AlertDialogTitle>
                    <AlertDialogDescription>
                      删除后该作品及其点赞、评论将一并移除，且无法恢复。
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>取消</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={() => handleDelete(item)}
                    >
                      确认删除
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default GalleryManage;
