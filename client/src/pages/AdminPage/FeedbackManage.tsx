import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@client/src/components/ui/button';
import { Badge } from '@client/src/components/ui/badge';
import { Skeleton } from '@client/src/components/ui/skeleton';
import { adminListFeedbacks, adminUpdateFeedbackStatus } from '@client/src/api/admin';
import type { FeedbackItem } from '@shared/api.interface';

const statusMap: Record<string, { label: string; variant: 'outline' | 'secondary' | 'default' }> = {
  pending: { label: '待处理', variant: 'secondary' },
  processing: { label: '处理中', variant: 'outline' },
  completed: { label: '已完成', variant: 'default' },
};

function FeedbackManage() {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await adminListFeedbacks(1, 50);
      setFeedbacks(res.items);
    } catch {
      toast.error('加载反馈失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const changeStatus = async (item: FeedbackItem, status: string) => {
    try {
      await adminUpdateFeedbackStatus(item.id, status);
      setFeedbacks((prev) => prev.map((f) => (f.id === item.id ? { ...f, status } : f)));
      toast.success('状态已更新');
    } catch {
      toast.error('更新失败');
    }
  };

  if (loading) {
    return <Skeleton className="h-40 w-full rounded-2xl" />;
  }

  if (feedbacks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
        <p className="text-sm text-muted-foreground">暂无反馈</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {feedbacks.map((item) => {
        const statusInfo = statusMap[item.status] ?? statusMap.pending;
        return (
          <div key={item.id} className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-2 flex items-center justify-between">
              <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
              <span className="text-xs text-muted-foreground">
                {new Date(item.createdAt).toLocaleString('zh-CN')}
              </span>
            </div>
            <p className="mb-4 whitespace-pre-wrap text-sm leading-6">{item.content}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {item.contact ? `联系方式：${item.contact}` : '未留联系方式'}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className={item.status === 'processing' ? 'bg-primary text-primary-foreground' : ''}
                  onClick={() => changeStatus(item, 'processing')}
                >
                  标记处理中
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className={item.status === 'completed' ? 'bg-success text-success-foreground' : ''}
                  onClick={() => changeStatus(item, 'completed')}
                >
                  标记完成
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default FeedbackManage;
