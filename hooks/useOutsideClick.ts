'use client';

import { useEffect, useRef } from 'react';

interface UseOutsideClickOptions {
  onOutsideClick: () => void;
  enabled?: boolean;
}

export function useOutsideClick({ onOutsideClick, enabled = true }: UseOutsideClickOptions) {
  const ref = useRef<HTMLDivElement>(null);
  const mouseDownTargetRef = useRef<EventTarget | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const handleMouseDown = (event: MouseEvent) => {
      mouseDownTargetRef.current = event.target;
    };

    const handleMouseUp = (event: MouseEvent) => {
      if (!ref.current) return;

      const mouseDownTarget = mouseDownTargetRef.current;
      const mouseUpTarget = event.target;

      // mousedown과 mouseup이 모두 모달 바깥에서 발생한 경우에만 모달 닫기
      const isMouseDownOutside = mouseDownTarget && !ref.current.contains(mouseDownTarget as Node);
      const isMouseUpOutside = mouseUpTarget && !ref.current.contains(mouseUpTarget as Node);

      if (isMouseDownOutside && isMouseUpOutside) {
        onOutsideClick();
      }

      // 다음 클릭을 위해 초기화
      mouseDownTargetRef.current = null;
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [onOutsideClick, enabled]);

  return ref;
}