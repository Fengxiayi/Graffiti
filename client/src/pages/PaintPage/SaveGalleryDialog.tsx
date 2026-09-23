import { useState } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@client/src/components/ui/dialog';
import { Button } from '@client/src/components/ui/button';
import { Input } from '@client/src/components/ui/input';
import { createGalleryItem } from '@client/src/api/gallery';

interface SaveGalleryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  screenshotDataUrl: string | null;
}

function SaveGalleryDialog({
  open,
  onOpenChange,
  projectId,
  screenshotDataUrl,
}: SaveGalleryDialogProps) {
  const [title, setTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSave = async () => {
    if (!screenshotDataUrl) {
      toast.error('当前画布为空，无法保存');
      return;
    }
    if (!title.trim()) {
      toast.error('请为作品起个标题');
      return;
    }
    setSubmitting(true);
    try {
      await createGalleryItem({
        title: title.trim(),
        imageUrl: screenshotDataUrl,
        projectId,
      });
      toast.success('已存入涂鸦精选');
      setTitle('');
      onOpenChange(false);
    } catch {
      toast.error('保存失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>存入涂鸦精选</DialogTitle>
          <DialogDescription>把当前画布截图分享到涂鸦精选板块。</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {screenshotDataUrl && (
            <div className="overflow-hidden rounded-lg border border-border">
              <img src={screenshotDataUrl} alt="画布预览" className="w-full object-cover" />
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="gallery-title">
              作品标题
            </label>
            <Input
              id="gallery-title"
              placeholder="给这幅作品起个名字…"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSave} disabled={submitting}>
            {submitting ? '保存中…' : '保存'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default SaveGalleryDialog;
