import { MessageSquare, Trash2 } from 'lucide-react';
import { cn } from '@client/src/lib/utils';

interface Comment {
  id: string;
  galleryId: string;
  content: string;
  replyTo: string | null;
  creatorId: string;
  createdAt: string;
}

interface CommentListProps {
  comments: Comment[];
  currentUserId?: string;
  isAdmin?: boolean;
  onReply: (comment: Comment) => void;
  onDelete: (commentId: string) => void;
}

function formatTime(iso: string): string {
  const date = new Date(iso);
  const now = Date.now();
  const diff = now - date.getTime();
  if (diff < 60_000) return '刚刚';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} 分钟前`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} 小时前`;
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

function CommentList({ comments, currentUserId, isAdmin = false, onReply, onDelete }: CommentListProps) {
  if (comments.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-center">
        <MessageSquare className="h-8 w-8 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">还没有评论，快来抢沙发</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {comments.map((comment) => {
        const mine = comment.creatorId === currentUserId;
        return (
          <div key={comment.id} className="rounded-xl border border-border bg-muted/50 p-3">
            <div className="mb-1 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">
                  {comment.replyTo ? (
                    <>
                      <span className="text-muted-foreground font-normal">回复</span> @
                      {comment.creatorId}
                    </>
                  ) : (
                    `@${comment.creatorId}`
                  )}
                </span>
                <span className="text-xs text-muted-foreground">{formatTime(comment.createdAt)}</span>
              </div>
              {(mine || isAdmin) && (
                <button
                  className="text-muted-foreground transition-colors hover:text-destructive"
                  onClick={() => onDelete(comment.id)}
                  aria-label="删除评论"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <p className="text-sm leading-6">{comment.content}</p>
            <button
              className={cn('mt-1 text-xs text-muted-foreground hover:text-primary')}
              onClick={() => onReply(comment)}
            >
              回复
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default CommentList;
