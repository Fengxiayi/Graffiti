import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Share2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@client/src/components/ui/button';
import { Input } from '@client/src/components/ui/input';
import { Badge } from '@client/src/components/ui/badge';
import { Skeleton } from '@client/src/components/ui/skeleton';
import { useCurrentUser } from '@client/src/hooks/useCurrentUser';
import { useAuthActions } from '@lark-apaas/client-toolkit/hooks/useAuthActions';
import { getProjects, getProjectById } from '@client/src/api/projects';
import { getStrokes, createStroke, deleteStroke } from '@client/src/api/strokes';
import type { ProjectItem, StrokeItem, StrokeData } from '@shared/api.interface';

import ProjectCard from './ProjectCard';
import CanvasBoard from './CanvasBoard';
import Toolbar from './Toolbar';
import CreateProjectDialog from './CreateProjectDialog';
import SaveGalleryDialog from './SaveGalleryDialog';

const POLL_INTERVAL = 2000;

function PaintPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const projectIdParam = searchParams.get('project');

  const { user, loading: userLoading } = useCurrentUser();
  const { isLogin, goLogin } = useAuthActions();

  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [search, setSearch] = useState('');

  const [currentProject, setCurrentProject] = useState<ProjectItem | null>(null);
  const [strokes, setStrokes] = useState<StrokeItem[]>([]);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [color, setColor] = useState('#1f2937');
  const [width, setWidth] = useState(5);

  const [createOpen, setCreateOpen] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [screenshot, setScreenshot] = useState<string | null>(null);

  const canvasWrapRef = useRef<HTMLDivElement>(null);
  const ownStrokesRef = useRef<string[]>([]);
  const loadedCursorRef = useRef<string | null>(null);
  const isAdmin = false;

  const loadProjects = useCallback(async () => {
    try {
      const res = await getProjects(1, 50);
      setProjects(res.items);
    } catch {
      toast.error('加载项目列表失败');
    } finally {
      setLoadingProjects(false);
    }
  }, []);

  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  // 根据 URL 参数进入项目
  useEffect(() => {
    if (!projectIdParam) {
      setCurrentProject(null);
      setStrokes([]);
      return;
    }
    let cancelled = false;
    const enter = async () => {
      try {
        const project = await getProjectById(projectIdParam);
        if (!cancelled) {
          setCurrentProject(project);
          setStrokes([]);
          ownStrokesRef.current = [];
          loadedCursorRef.current = null;
        }
      } catch {
        if (!cancelled) {
          toast.error('项目不存在或已被删除');
          setSearchParams({});
        }
      }
    };
    void enter();
    return () => {
      cancelled = true;
    };
  }, [projectIdParam, setSearchParams]);

  // 轮询拉取笔迹（多人协作同步）
  useEffect(() => {
    if (!currentProject) return;
    let cancelled = false;

    const poll = async () => {
      try {
        const res = await getStrokes(currentProject.id, loadedCursorRef.current ?? undefined, 100);
        if (cancelled) return;
        setStrokes((prev) => {
          const seen = new Set(prev.map((s) => s.id));
          const merged = [...prev];
          for (const item of res.items) {
            if (!seen.has(item.id)) {
              merged.push(item);
              seen.add(item.id);
            }
          }
          return merged;
        });
        loadedCursorRef.current = res.nextCursor;
      } catch {
        // 网络错误忽略，下次轮询重试
      }
    };

    void poll();
    const timer = setInterval(() => void poll(), POLL_INTERVAL);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [currentProject]);

  const handleStrokeComplete = useCallback(
    async (strokeData: StrokeData) => {
      if (!currentProject) return;
      try {
        const created = await createStroke({
          projectId: currentProject.id,
          strokeData,
        });
        ownStrokesRef.current.push(created.id);
        setStrokes((prev) => [...prev, created]);
      } catch {
        toast.error('笔迹保存失败');
      }
    },
    [currentProject],
  );

  const handleDeleteStroke = useCallback(
    async (strokeId: string) => {
      try {
        await deleteStroke(strokeId, isAdmin);
        setStrokes((prev) => prev.filter((s) => s.id !== strokeId));
      } catch {
        toast.error('删除失败');
      }
    },
    [isAdmin],
  );

  const handleDeleteAllMine = useCallback(async () => {
    if (!currentProject) return;
    const myStrokes = strokes.filter((s) => ownStrokesRef.current.includes(s.id));
    if (myStrokes.length === 0) {
      toast.info('你还没有绘制笔迹');
      return;
    }
    try {
      await Promise.all(myStrokes.map((s) => deleteStroke(s.id, false)));
      setStrokes((prev) => prev.filter((s) => !ownStrokesRef.current.includes(s.id)));
      ownStrokesRef.current = [];
      toast.success('已清空你的笔迹');
    } catch {
      toast.error('清空失败');
    }
  }, [currentProject, strokes]);

  const handleSaveToGallery = useCallback(() => {
    if (!isLogin) {
      goLogin();
      return;
    }
    if (!currentProject) return;
    const canvas = canvasWrapRef.current?.querySelector('canvas');
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    setScreenshot(dataUrl);
    setSaveOpen(true);
  }, [currentProject, isLogin, goLogin]);

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  // 项目列表视图
  if (!currentProject) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-10 md:px-10 lg:px-16">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">一起绘画</h1>
            <p className="mt-2 text-muted-foreground">
              选择一个项目加入创作，或创建属于你们的新画布
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Input
              placeholder="搜索项目…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-56"
            />
            <Button className="rounded-full" onClick={() => setCreateOpen(true)}>
              <Plus className="mr-1.5 h-4 w-4" />
              创建项目
            </Button>
          </div>
        </div>

        {loadingProjects ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-2xl" />
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-24 text-center">
            <p className="text-lg font-medium">还没有项目</p>
            <p className="mt-2 text-sm text-muted-foreground">创建第一个项目，邀请好友一起来涂鸦吧</p>
            <Button className="mt-6 rounded-full" onClick={() => setCreateOpen(true)}>
              <Plus className="mr-1.5 h-4 w-4" />
              创建项目
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}

        <CreateProjectDialog open={createOpen} onOpenChange={setCreateOpen} onCreated={loadProjects} />
      </div>
    );
  }

  // 画板视图
  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-[1400px] flex-col gap-4 px-4 py-4 md:px-8">
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-xl font-bold">{currentProject.name}</h1>
            {currentProject.isPinned && <Badge className="bg-primary">置顶</Badge>}
          </div>
          <p className="truncate text-xs text-muted-foreground">
            {currentProject.description || '一起涂鸦吧'}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href).then(
                () => toast.success('链接已复制，分享给好友一起画'),
                () => toast.error('复制失败'),
              );
            }}
          >
            <Share2 className="mr-1.5 h-4 w-4" />
            分享项目
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full text-muted-foreground"
            onClick={() => setSearchParams({})}
          >
            返回列表
          </Button>
        </div>
      </div>

      <div ref={canvasWrapRef} className="min-h-0 flex-1">
        <CanvasBoard
          strokes={strokes}
          tool={tool}
          color={color}
          width={width}
          onStrokeComplete={handleStrokeComplete}
          onDeleteStroke={handleDeleteStroke}
          isAdmin={isAdmin}
          currentUserId={user?.userId}
          readOnly={!isLogin}
        />
      </div>

      <Toolbar
        tool={tool}
        onToolChange={setTool}
        color={color}
        onColorChange={setColor}
        width={width}
        onWidthChange={setWidth}
        onSaveGallery={handleSaveToGallery}
        onDeleteAll={handleDeleteAllMine}
        readOnly={!isLogin}
      />

      <SaveGalleryDialog
        open={saveOpen}
        onOpenChange={setSaveOpen}
        projectId={currentProject.id}
        screenshotDataUrl={screenshot}
      />
    </div>
  );
}

export default PaintPage;
