import { X } from 'lucide-react';
import { Button } from '@client/src/components/ui/button';
import { ScrollArea } from '@client/src/components/ui/scroll-area';
import { cn } from '@client/src/lib/utils';
import type { ProjectItem } from '@shared/api.interface';
import { Users, Brush } from 'lucide-react';

interface ProjectPanelProps {
  open: boolean;
  projects: ProjectItem[];
  currentProject: ProjectItem | null;
  onSelect: (project: ProjectItem) => void;
  onClose: () => void;
}

function ProjectPanel({ open, projects, currentProject, onSelect, onClose }: ProjectPanelProps) {
  return (
    <div
      className={cn(
        'fixed inset-y-0 right-0 z-40 w-80 border-l border-border bg-card shadow-xl transition-transform duration-300',
        open ? 'translate-x-0' : 'translate-x-full',
      )}
    >
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h2 className="text-lg font-bold">切换项目</h2>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="关闭">
          <X className="h-5 w-5" />
        </Button>
      </div>
      <ScrollArea className="h-[calc(100vh-4rem)]">
        <div className="flex flex-col gap-2 p-4">
          {projects.length === 0 && (
            <p className="py-10 text-center text-sm text-muted-foreground">暂无其他项目</p>
          )}
          {projects.map((project) => (
            <button
              key={project.id}
              onClick={() => onSelect(project)}
              className={cn(
                'flex flex-col gap-1 rounded-xl border p-4 text-left transition-colors',
                currentProject?.id === project.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:bg-muted',
              )}
            >
              <span className="font-semibold">{project.name}</span>
              <span className="line-clamp-1 text-xs text-muted-foreground">
                {project.description || '暂无描述'}
              </span>
              <span className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {project.memberCount}
                </span>
                <span className="flex items-center gap-1">
                  <Brush className="h-3 w-3" />
                  {project.strokeCount}
                </span>
              </span>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

export default ProjectPanel;
