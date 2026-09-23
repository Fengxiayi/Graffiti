import { useCurrentUser } from '@client/src/hooks/useCurrentUser';
import { cn } from '@client/src/lib/utils';

interface UserDisplayProps {
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

const sizeMap = {
  xs: { avatar: 'h-5 w-5 text-[10px]', name: 'text-xs' },
  sm: { avatar: 'h-7 w-7 text-xs', name: 'text-sm' },
  md: { avatar: 'h-9 w-9 text-sm', name: 'text-sm' },
};

/**
 * 用户头像 + 名称展示组件。
 * 未登录时展示默认游客样式。
 */
function UserDisplay({ size = 'md', className }: UserDisplayProps) {
  const { user } = useCurrentUser();
  const styles = sizeMap[size];
  const displayName = user?.userName || user?.userId || '游客';
  const initials = displayName.slice(0, 1).toUpperCase();

  return (
    <span className={cn('flex items-center gap-2', className)}>
      <span
        className={cn(
          'flex shrink-0 items-center justify-center rounded-full bg-primary/15 font-semibold text-primary',
          styles.avatar,
        )}
      >
        {initials}
      </span>
      <span className={cn('truncate text-muted-foreground', styles.name)}>
        {displayName}
      </span>
    </span>
  );
}

export { UserDisplay };
export default UserDisplay;
