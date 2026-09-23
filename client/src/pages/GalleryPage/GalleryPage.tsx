import { useEffect, useState } from 'react';
import { ImageIcon } from 'lucide-react';

import { Button } from '@client/src/components/ui/button';
import { Skeleton } from '@client/src/components/ui/skeleton';
import { useAuthActions } from '@lark-apaas/client-toolkit/hooks/useAuthActions';
import { getGallery } from '@client/src/api/gallery';
import type { GalleryItem } from '@shared/api.interface';

import GalleryCard from './GalleryCard';
import GalleryDetail from './GalleryDetail';

function GalleryPage() {
  const { isLogin } = useAuthActions();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selected, setSelected] = useState<GalleryItem | null>(null);

  const loadItems = async (nextPage: number) => {
    try {
      const res = await getGallery(nextPage, 12);
      setItems((prev) => (nextPage === 1 ? res.items : [...prev, ...res.items]));
      setHasMore(nextPage * 12 < res.total);
    } catch {
      // 忽略
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadItems(1);
  }, [isLogin]);

  const handleUpdated = (updated: GalleryItem) => {
    if (!updated.id) {
      // 被删除
      setItems((prev) => prev.filter((item) => item.id !== selected?.id));
      return;
    }
    setItems((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 md:px-10 lg:px-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">涂鸦精选</h1>
        <p className="mt-2 text-muted-foreground">
          来自用户与管理员上传的精彩涂鸦作品，点赞留言，一起交流创意
        </p>
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-2xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-24 text-center">
          <ImageIcon className="mb-4 h-12 w-12 text-muted-foreground/40" />
          <p className="text-lg font-medium">暂无精选作品</p>
          <p className="mt-2 text-sm text-muted-foreground">
            去画板创作，把得意之作存到精选吧
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item) => (
              <GalleryCard key={item.id} item={item} onOpen={setSelected} />
            ))}
          </div>
          {hasMore && (
            <div className="mt-10 text-center">
              <Button
                variant="outline"
                className="rounded-full"
                onClick={() => {
                  const next = page + 1;
                  setPage(next);
                  void loadItems(next);
                }}
              >
                加载更多
              </Button>
            </div>
          )}
        </>
      )}

      {selected && (
        <GalleryDetail
          item={selected}
          open={!!selected}
          onOpenChange={(open) => {
            if (!open) setSelected(null);
          }}
          onUpdated={handleUpdated}
        />
      )}
    </div>
  );
}

export default GalleryPage;
