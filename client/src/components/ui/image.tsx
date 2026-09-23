import { cn } from '@client/src/lib/utils';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: React.ReactNode;
}

function Image({ className, alt = '', fallback, ...props }: ImageProps) {
  return (
    <div className={cn('relative overflow-hidden', className)}>
      <img className="h-full w-full object-cover" alt={alt} {...props} />
      {fallback && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground">
          {fallback}
        </div>
      )}
    </div>
  );
}

export { Image };
