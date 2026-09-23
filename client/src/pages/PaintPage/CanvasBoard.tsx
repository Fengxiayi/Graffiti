import { useRef, useEffect, useCallback, useState } from 'react';
import { cn } from '@client/src/lib/utils';
import { useCanvasDrawing } from './useCanvasDrawing';
import type { StrokeItem, StrokeData } from '@shared/api.interface';

interface CanvasBoardProps {
  strokes: StrokeItem[];
  tool: 'pen' | 'eraser';
  color: string;
  width: number;
  onStrokeComplete: (strokeData: StrokeData) => void;
  onDeleteStroke?: (id: string) => void;
  isAdmin?: boolean;
  currentUserId?: string;
  readOnly?: boolean;
}

function CanvasBoard({
  strokes,
  tool,
  color,
  width,
  onStrokeComplete,
  onDeleteStroke,
  isAdmin = false,
  currentUserId,
  readOnly = false,
}: CanvasBoardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeStroke, setActiveStroke] = useState<StrokeData | null>(null);

  // 绘制已有笔迹
  const drawStrokes = useCallback((ctx: CanvasRenderingContext2D, strokeList: StrokeItem[]) => {
    for (const stroke of strokeList) {
      const data = stroke.strokeData;
      if (data.points.length < 2) continue;
      ctx.strokeStyle = data.color;
      ctx.lineWidth = data.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(data.points[0].x, data.points[0].y);
      for (let i = 1; i < data.points.length; i++) {
        ctx.lineTo(data.points[i].x, data.points[i].y);
      }
      ctx.stroke();
    }
  }, []);

  // 主渲染函数
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, rect.width, rect.height);
    // 白色画布底色
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.height);

    drawStrokes(ctx, strokes);

    // 绘制进行中的笔迹
    if (activeStroke && activeStroke.points.length >= 2) {
      ctx.strokeStyle = activeStroke.color;
      ctx.lineWidth = activeStroke.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(activeStroke.points[0].x, activeStroke.points[0].y);
      for (let i = 1; i < activeStroke.points.length; i++) {
        ctx.lineTo(activeStroke.points[i].x, activeStroke.points[i].y);
      }
      ctx.stroke();
    }
  }, [strokes, activeStroke, drawStrokes]);

  useEffect(() => {
    render();
  }, [render]);

  const { handlePointerDown, handlePointerMove, handlePointerUp } = useCanvasDrawing({
    containerRef,
    canvasRef,
    tool,
    color,
    width,
    readOnly,
    onStrokeStart: () => setActiveStroke(null),
    onStrokeUpdate: (data) => setActiveStroke(data),
    onStrokeComplete: (data) => {
      setActiveStroke(null);
      onStrokeComplete(data);
    },
  });

  const handlePointerDownWrapper = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (readOnly) return;
    handlePointerDown(e);
  };

  const handleStrokeDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onDeleteStroke) return;
    if (readOnly) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 从后往前找，优先命中最近画的笔迹
    for (let i = strokes.length - 1; i >= 0; i--) {
      const stroke = strokes[i];
      if (stroke.userId !== currentUserId && !isAdmin) continue;
      const points = stroke.strokeData.points;
      const lineWidth = Math.max(stroke.strokeData.width, 10);
      for (let j = 0; j < points.length - 1; j++) {
        const dist = distanceToSegment(x, y, points[j], points[j + 1]);
        if (dist <= lineWidth / 2 + 4) {
          onDeleteStroke(stroke.id);
          return;
        }
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-hidden rounded-xl border border-border bg-white"
    >
      <canvas
        ref={canvasRef}
        className={cn(
          'h-full w-full touch-none',
          readOnly ? 'cursor-default' : 'cursor-crosshair',
        )}
        onPointerDown={handlePointerDownWrapper}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onDoubleClick={handleStrokeDoubleClick}
      />
      {readOnly && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="rounded-full bg-black/40 px-4 py-1.5 text-sm text-white backdrop-blur">
            只读模式
          </span>
        </div>
      )}
    </div>
  );
}

function distanceToSegment(
  px: number,
  py: number,
  a: { x: number; y: number },
  b: { x: number; y: number },
): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(px - a.x, py - a.y);
  let t = ((px - a.x) * dx + (py - a.y) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  const closestX = a.x + t * dx;
  const closestY = a.y + t * dy;
  return Math.hypot(px - closestX, py - closestY);
}

export default CanvasBoard;
