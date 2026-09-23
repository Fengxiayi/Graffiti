import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Textarea } from '@client/src/components/ui/textarea';
import { createProject } from '@client/src/api/projects';
import { useAuthActions } from '@lark-apaas/client-toolkit/hooks/useAuthActions';

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
}

function CreateProjectDialog({ open, onOpenChange, onCreated }: CreateProjectDialogProps) {
  const navigate = useNavigate();
  const { isLogin, goLogin } = useAuthActions();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!isLogin) {
      goLogin();
      return;
    }
    if (!name.trim()) {
      toast.error('请输入项目名称');
      return;
    }
    setSubmitting(true);
    try {
      const project = await createProject({
        name: name.trim(),
        description: description.trim() || undefined,
      });
      toast.success('项目创建成功');
      onOpenChange(false);
      setName('');
      setDescription('');
      onCreated?.();
      navigate(`/paint?project=${project.id}`);
    } catch {
      toast.error('创建失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>创建新项目</DialogTitle>
          <DialogDescription>创建一个画布项目，邀请好友一起涂鸦创作。</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="project-name">
              项目名称
            </label>
            <Input
              id="project-name"
              placeholder="例如：周末涂鸦趴"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="project-desc">
              项目简介（可选）
            </label>
            <Textarea
              id="project-desc"
              placeholder="简单描述一下这个项目…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleCreate} disabled={submitting}>
            {submitting ? '创建中…' : '创建'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CreateProjectDialog;
