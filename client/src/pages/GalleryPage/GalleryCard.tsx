import { Heart, MessageCircle, Pin } from 'lucide-react';
import { Card, CardContent } from '@client/src/components/ui/card';
import { Badge } from '@client/src/components/ui/badge';
import { UserDisplay } from '@client/src/components/business-ui/user-display';
import { cn } from '@client/src/lib/utils';
import type { GalleryItem } from '@shared/api.interface';

interface GalleryCardProps {
  item: GalleryItem;
  onOpen: (item: GalleryItem) => void;
}

function GalleryCard({ item, onOpen }: GalleryCardProps) {
  return (
    <Card
      className="group cursor-pointer overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg"
      onClick={() => onOpen(item)}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={item.imageUrl}
          alt={item.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {item.isPinned && (
          <Badge className="absolute left-3 top-3 bg-primary text-primary-foreground">
            <Pin className="mr-1 h-3 w-3" /> 置顶
          </Badge>
        )}
        {item.isLiked && (
          <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 backdrop-blur">
            <Heart className="h-4 w-4 fill-red-500 text-red-500" />
          </span>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="mb-2 truncate font-semibold">{item.title}</h3>
        <div className="flex items-center justify-between">
          <UserDisplay size="xs" />
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className={cn('flex items-center gap-1', item.isLiked && 'text-red-500')}>
              <Heart className={cn('h-3.5 w-3.5', item.isLiked && 'fill-current')} />
              {item.likeCount}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="h-3.5 w-3.5" />
              {item.commentCount}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default GalleryCard;
