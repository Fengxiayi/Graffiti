import { useEffect, useState } from 'react';
import { Heart, Send, Trash2, Pin } from 'lucide-react';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@client/src/components/ui/dialog';
import { Button } from '@client/src/components/ui/button';
import { Textarea } from '@client/src/components/ui/textarea';
import { Badge } from '@client/src/components/ui/badge';
import { UserDisplay } from '@client/src/components/business-ui/user-display';
import { useAuthActions } from '@lark-apaas/client-toolkit/hooks/useAuthActions';
import { useCurrentUser } from '@client/src/hooks/useCurrentUser';
import {
  getGalleryItem,
  toggleGalleryLike,
  getGalleryComments,
  createGalleryComment,
  deleteGalleryComment,
} from '@client/src/api/gallery';
import { adminSetGalleryPinned, adminDeleteGalleryItem } from '@client/src/api/admin';
import type { GalleryItem } from '@shared/api.interface';
import { cn } from '@client/src/lib/utils';

import CommentList from './CommentList';

interface GalleryDetailProps {
  item: GalleryItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated?: (item: GalleryItem) => void;
  isAdmin?: boolean;
}

interface Comment {
  id: string;
  galleryId: string;
  content: string;
  replyTo: string | null;
  creatorId: string;
  createdAt: string;
}

function GalleryDetail({ item, open, onOpenChange, onUpdated, isAdmin = false }: GalleryDetailProps) {
  const { user } = useCurrentUser();
  const { isLogin, goLogin } = useAuthActions();
  const [detail, setDetail] = useState<GalleryItem>(item);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const [liked, setLiked] = useState(!!item.isLiked);
  const [likeCount, setLikeCount] = useState(item.likeCount);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setDetail(item);
    setLiked(!!item.isLiked);
    setLikeCount(item.likeCount);
    setCommentText('');
    setReplyTo(null);
    void loadDetail();
    void loadComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, item.id]);

  const loadDetail = async () => {
    try {
      const res = await getGalleryItem(item.id);
      setDetail(res);
      setLiked(!!res.isLiked);
      setLikeCount(res.likeCount);
    } catch {
      // 忽略
    }
  };

  const loadComments = async () => {
    try {
      const res = await getGalleryComments(item.id);
      setComments(res.items);
    } catch {
      // 忽略
    }
  };

  const handleLike = async () => {
    if (!isLogin) {
      goLogin();
      return;
    }
    try {
      const res = await toggleGalleryLike(item.id);
      setLiked(res.liked);
      setLikeCount(res.likeCount);
    } catch {
      toast.error('操作失败');
    }
  };

  const handleComment = async () => {
    if (!isLogin) {
      goLogin();
      return;
    }
    const content = commentText.trim();
    if (!content) return;
    setSubmitting(true);
    try {
      const created = await createGalleryComment({
        galleryId: item.id,
        content,
        replyTo: replyTo?.id,
      });
      setComments((prev) => [...prev, created]);
      setCommentText('');
      setReplyTo(null);
      toast.success('评论成功');
    } catch {
      toast.error('评论失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      if (isAdmin) {
        await adminDeleteGalleryComment(commentId);
      } else {
        await deleteGalleryComment(commentId);
      }
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      toast.success('评论已删除');
    } catch {
      toast.error('删除失败');
    }
  };

  const handlePin = async () => {
    try {
      await adminSetGalleryPinned(item.id, !detail.isPinned);
      const next = { ...detail, isPinned: !detail.isPinned };
      setDetail(next);
      onUpdated?.(next);
      toast.success(next.isPinned ? '已置顶' : '已取消置顶');
    } catch {
      toast.error('操作失败');
    }
  };

  const handleDelete = async () => {
    try {
      await adminDeleteGalleryItem(item.id);
      toast.success('作品已删除');
      onOpenChange(false);
      onUpdated?.({ ...detail, id: '' } as GalleryItem);
    } catch {
      toast.error('删除失败');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 pr-10">
            <span className="truncate">{detail.title}</span>
            {detail.isPinned && (
              <Badge className="bg-primary">
                <Pin className="mr-1 h-3 w-3" /> 置顶
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-hidden rounded-xl border border-border bg-muted">
          <img src={detail.imageUrl} alt={detail.title} className="w-full object-contain" />
        </div>

        <div className="flex items-center justify-between">
          <UserDisplay size="sm" />
          <div className="flex items-center gap-2">
            {isAdmin && (
              <>
                <Button variant="outline" size="sm" className="rounded-full" onClick={handlePin}>
                  <Pin className="mr-1.5 h-4 w-4" />
                  {detail.isPinned ? '取消置顶' : '置顶'}
                </Button>
                <Button variant="destructive" size="sm" className="rounded-full" onClick={handleDelete}>
                  <Trash2 className="mr-1.5 h-4 w-4" />
                  删除
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 border-b border-border pb-4">
          <Button
            variant={liked ? 'default' : 'outline'}
            size="sm"
            className={cn('rounded-full', liked && 'bg-red-500 hover:bg-red-500')}
            onClick={handleLike}
          >
            <Heart className={cn('mr-1.5 h-4 w-4', liked && 'fill-current')} />
            {likeCount}
          </Button>
          <span className="text-sm text-muted-foreground">
            {comments.length} 条评论
          </span>
        </div>

        {/* 评论列表 */}
        <CommentList
          comments={comments}
          currentUserId={user?.userId}
          isAdmin={isAdmin}
          onReply={(comment) => {
            if (!isLogin) {
              goLogin();
              return;
            }
            setReplyTo(comment);
            setCommentText(`@${comment.creatorId} `);
          }}
          onDelete={handleDeleteComment}
        />

        {/* 评论输入 */}
        <div className="space-y-2">
          {replyTo && (
            <div className="flex items-center justify-between rounded-lg bg-muted px-3 py-2 text-sm">
              <span className="truncate text-muted-foreground">
                回复 @{replyTo.creatorId}
              </span>
              <button className="text-muted-foreground hover:text-foreground" onClick={() => setReplyTo(null)}>
                ✕
              </button>
            </div>
          )}
          <div className="flex gap-2">
            <Textarea
              placeholder={isLogin ? '说点什么…' : '登录后参与评论'}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              disabled={!isLogin}
              rows={2}
            />
            <Button
              className="shrink-0 self-end"
              onClick={handleComment}
              disabled={!isLogin || submitting || !commentText.trim()}
            >
              <Send className="mr-1.5 h-4 w-4" />
              发送
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default GalleryDetail;
