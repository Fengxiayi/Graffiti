import { useEffect, useState } from 'react';
import { Pin, EyeOff, Eye, Trash2, Users, Brush } from 'lucide-react';
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
import {
  adminListProjects,
  adminSetProjectHidden,
  adminSetProjectPinned,
  adminDeleteProject,
} from '@client/src/api/admin';
import type { ProjectItem } from '@shared/api.interface';

function ProjectManage() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await adminListProjects(1, 50);
      setProjects(res.items);
    } catch {
      toast.error('加载项目失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const toggleHidden = async (project: ProjectItem) => {
    try {
      await adminSetProjectHidden(project.id, !project.isHidden);
      setProjects((prev) =>
        prev.map((p) => (p.id === project.id ? { ...p, isHidden: !p.isHidden } : p)),
      );
      toast.success(project.isHidden ? '已取消隐藏' : '已隐藏');
    } catch {
      toast.error('操作失败');
    }
  };

  const togglePinned = async (project: ProjectItem) => {
    try {
      await adminSetProjectPinned(project.id, !project.isPinned);
      setProjects((prev) =>
        prev.map((p) => (p.id === project.id ? { ...p, isPinned: !p.isPinned } : p)),
      );
      toast.success(project.isPinned ? '已取消置顶' : '已置顶');
    } catch {
      toast.error('操作失败');
    }
  };

  const handleDelete = async (project: ProjectItem) => {
    try {
      await adminDeleteProject(project.id);
      setProjects((prev) => prev.filter((p) => p.id !== project.id));
      toast.success('项目已删除');
    } catch {
      toast.error('删除失败');
    }
  };

  if (loading) {
    return <Skeleton className="h-40 w-full rounded-2xl" />;
  }

  if (projects.length === 0) {
    return <EmptyState text="暂无项目" />;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left text-muted-foreground">
              <th className="px-4 py-3 font-medium">项目</th>
              <th className="px-4 py-3 font-medium">创建人</th>
              <th className="px-4 py-3 font-medium">协作人数</th>
              <th className="px-4 py-3 font-medium">笔迹数</th>
              <th className="px-4 py-3 font-medium">状态</th>
              <th className="px-4 py-3 text-right font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                <td className="max-w-[260px] px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium">{project.name}</span>
                    {project.isPinned && (
                      <Badge className="bg-primary">
                        <Pin className="h-3 w-3" />
                      </Badge>
                    )}
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {project.description || '暂无描述'}
                  </p>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  <span className="font-mono text-xs">@{project.creatorId.slice(0, 8)}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    {project.memberCount}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Brush className="h-3.5 w-3.5" />
                    {project.strokeCount}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {project.isHidden ? (
                    <Badge variant="secondary">已隐藏</Badge>
                  ) : (
                    <Badge variant="outline">公开</Badge>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => togglePinned(project)}>
                      <Pin className="h-4 w-4" />
                      {project.isPinned ? '取消置顶' : '置顶'}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => toggleHidden(project)}>
                      {project.isHidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      {project.isHidden ? '取消隐藏' : '隐藏'}
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
                          <AlertDialogTitle>删除项目「{project.name}」？</AlertDialogTitle>
                          <AlertDialogDescription>
                            删除后该项目及其全部笔迹将被永久移除，且无法恢复。确定继续吗？
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>取消</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => handleDelete(project)}
                          >
                            确认删除
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

export default ProjectManage;
