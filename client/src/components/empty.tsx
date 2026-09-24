import { Brush } from 'lucide-react';

interface EmptyProps {
  title: string;
  description?: string;
}

export function Empty({ title, description }: EmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
      <Brush className="h-10 w-10 text-gray-300" />
      <p className="text-sm font-medium text-gray-500">{title}</p>
      {description ? <p className="text-xs text-gray-400">{description}</p> : null}
    </div>
  );
}
