import { useCallback, useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import type { StrokeData } from '@shared/api.interface';

interface UseCanvasDrawingOptions {
  containerRef: RefObject<HTMLDivElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  tool: 'pen' | 'eraser';
  color: string;
  width: number;
  readOnly?: boolean;
  onStrokeStart?: (data: StrokeData) => void;
  onStrokeUpdate?: (data: StrokeData) => void;
  onStrokeComplete: (data: StrokeData) => void;
}

/**
 * 画布绘制 Hook：管理指针事件，将坐标换算到画布本地坐标系，
 * 并组装成 StrokeData 回传给调用方。
 */
export function useCanvasDrawing({
  containerRef,
  canvasRef,
  tool,
  color,
  width,
  readOnly = false,
  onStrokeStart,
  onStrokeUpdate,
  onStrokeComplete,
}: UseCanvasDrawingOptions) {
  const drawingRef = useRef(false);
  const pointsRef = useRef<{ x: number; y: number }[]>([]);

  const getLocalPoint = (e: React.PointerEvent): { x: number; y: number } | null => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return null;
    const rect = container.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (readOnly) return;
      e.preventDefault();
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.setPointerCapture(e.pointerId);
      drawingRef.current = true;
      const point = getLocalPoint(e);
      if (!point) return;
      pointsRef.current = [point];
      const data: StrokeData = {
        type: tool,
        color: tool === 'eraser' ? '#ffffff' : color,
        width,
        points: [point],
      };
      onStrokeStart?.(data);
    },
    [readOnly, canvasRef, containerRef, tool, color, width, onStrokeStart],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!drawingRef.current) return;
      e.preventDefault();
      const point = getLocalPoint(e);
      if (!point) return;
      pointsRef.current.push(point);
      const data: StrokeData = {
        type: tool,
        color: tool === 'eraser' ? '#ffffff' : color,
        width,
        points: [...pointsRef.current],
      };
      onStrokeUpdate?.(data);
    },
    [tool, color, width, containerRef, onStrokeUpdate],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!drawingRef.current) return;
      drawingRef.current = false;
      e.preventDefault();
      const point = getLocalPoint(e);
      if (point) {
        pointsRef.current.push(point);
      }
      if (pointsRef.current.length >= 2) {
        onStrokeComplete({
          type: tool,
          color: tool === 'eraser' ? '#ffffff' : color,
          width,
          points: pointsRef.current,
        });
      }
      pointsRef.current = [];
    },
    [tool, color, width, containerRef, onStrokeComplete],
  );

  useEffect(() => {
    return () => {
      drawingRef.current = false;
      pointsRef.current = [];
    };
  }, []);

  return { handlePointerDown, handlePointerMove, handlePointerUp };
}
