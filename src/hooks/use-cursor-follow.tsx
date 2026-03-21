import { useState, useCallback, MouseEvent } from "react";

export interface CursorPosition {
  x: number;
  y: number;
  isInside: boolean;
}

export function useCursorFollow() {
  const [pos, setPos] = useState<CursorPosition>({ x: 0, y: 0, isInside: false });

  const onMouseMove = useCallback((e: MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      isInside: true,
    });
  }, []);

  const onMouseLeave = useCallback(() => {
    setPos((p) => ({ ...p, isInside: false }));
  }, []);

  return { pos, onMouseMove, onMouseLeave };
}

export function useCardTilt() {
  const [transform, setTransform] = useState("");

  const onMouseMove = useCallback((e: MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTransform(`perspective(800px) rotateX(${-y * 8}deg) rotateY(${x * 8}deg) scale3d(1.02,1.02,1.02)`);
  }, []);

  const onMouseLeave = useCallback(() => {
    setTransform("perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)");
  }, []);

  return { transform, onMouseMove, onMouseLeave };
}
