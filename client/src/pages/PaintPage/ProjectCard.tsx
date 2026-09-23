import { Link } from 'react-router-dom';
import { Users, Brush, Pin, EyeOff } from 'lucide-react';
import { Card, CardContent } from '@client/src/components/ui/card';
import { Badge } from '@client/src/components/ui/badge';
import type { ProjectItem } from '@shared/api.interface';

interface ProjectCardProps {
  project: ProjectItem;
  onEnter?: (project: ProjectItem) => void;
}

function ProjectCard({ project, onEnter }: ProjectCardProps) {
  const cover = project.coverUrl;
  const coverContent = cover ? (
    <img src={cover} alt={project.name} className="h-full w-full object-cover" />
  ) : (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
      <Brush className="h-12 w-12 text-primary/60" />
    </div>
  );

  return (
    <Card className="group overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg">
      <div className="relative aspect-[16/10] overflow-hidden">
        {coverContent}
        <div className="absolute left-3 top-3 flex gap-2">
          {project.isPinned && (
            <Badge className="bg-primary text-primary-foreground">
              <Pin className="mr-1 h-3 w-3" /> 置顶
            </Badge>
          )}
          {project.isHidden && (
            <Badge variant="secondary">
              <EyeOff className="mr-1 h-3 w-3" /> 已隐藏
            </Badge>
          )}
        </div>
      </div>
      <CardContent className="p-5">
        <h3 className="mb-1 truncate text-lg font-semibold">{project.name}</h3>
        <p className="mb-4 line-clamp-2 min-h-10 text-sm text-muted-foreground">
          {project.description || '暂无描述'}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {project.memberCount} 人协作
            </span>
            <span className="flex items-center gap-1">
              <Brush className="h-3.5 w-3.5" />
              {project.strokeCount} 笔
            </span>
          </div>
          <Link
            to={`/paint?project=${project.id}`}
            onClick={() => onEnter?.(project)}
            className="rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            进入画板
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default ProjectCard;
