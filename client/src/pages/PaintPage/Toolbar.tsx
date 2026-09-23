import { cn } from '@client/src/lib/utils';
import { Brush, Eraser, Undo2 } from 'lucide-react';
import { Button } from '@client/src/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@client/src/components/ui/popover';

interface ToolbarProps {
  tool: 'pen' | 'eraser';
  onToolChange: (tool: 'pen' | 'eraser') => void;
  color: string;
  onColorChange: (color: string) => void;
  width: number;
  onWidthChange: (width: number) => void;
  onSaveGallery: () => void;
  onDeleteAll?: () => void;
  readOnly?: boolean;
}

const presetColors = [
  '#1f2937',
  '#ef4444',
  '#f97316',
  '#f59e0b',
  '#22c55e',
  '#14b8a6',
  '#3b82f6',
  '#6366f1',
  '#a855f7',
  '#ec4899',
];

function Toolbar({
  tool,
  onToolChange,
  color,
  onColorChange,
  width,
  onWidthChange,
  onSaveGallery,
  onDeleteAll,
  readOnly = false,
}: ToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm">
      {/* 画笔 / 橡皮 */}
      <div className="flex items-center gap-1 rounded-full bg-muted p-1">
        <button
          className={cn(
            'flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
            tool === 'pen'
              ? 'bg-card text-primary shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
          onClick={() => onToolChange('pen')}
          disabled={readOnly}
        >
          <Brush className="h-4 w-4" />
          画笔
        </button>
        <button
          className={cn(
            'flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
            tool === 'eraser'
              ? 'bg-card text-primary shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
          onClick={() => onToolChange('eraser')}
          disabled={readOnly}
        >
          <Eraser className="h-4 w-4" />
          橡皮
        </button>
      </div>

      {/* 颜色选择 */}
      {tool === 'pen' && (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 rounded-full" disabled={readOnly}>
              <span
                className="h-4 w-4 rounded-full border border-border"
                style={{ backgroundColor: color }}
              />
              颜色
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64">
            <div className="grid grid-cols-5 gap-2">
              {presetColors.map((c) => (
                <button
                  key={c}
                  className={cn(
                    'h-8 w-8 rounded-full border border-border transition-transform hover:scale-110',
                    c === color && 'ring-2 ring-primary ring-offset-2',
                  )}
                  style={{ backgroundColor: c }}
                  onClick={() => onColorChange(c)}
                  aria-label={`选择颜色 ${c}`}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}

      {/* 粗细调节 */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">粗细</span>
        <input
          type="range"
          min={1}
          max={30}
          value={width}
          onChange={(e) => onWidthChange(Number(e.target.value))}
          disabled={readOnly}
          className="h-2 w-24 cursor-pointer appearance-none rounded-full bg-muted accent-primary"
        />
        <span className="w-6 text-xs tabular-nums text-muted-foreground">{width}</span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        {onDeleteAll && (
          <Button variant="ghost" size="sm" className="gap-1.5 rounded-full text-muted-foreground" onClick={onDeleteAll} disabled={readOnly}>
            <Undo2 className="h-4 w-4" />
            清空我的笔迹
          </Button>
        )}
        <Button variant="default" size="sm" className="rounded-full" onClick={onSaveGallery} disabled={readOnly}>
          存入涂鸦精选
        </Button>
      </div>
    </div>
  );
}

export default Toolbar;
