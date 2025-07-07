import { useState, useEffect } from 'react';
import type { Assignment } from '@/utils/utils';

export interface SwipedState {
  [key: number]: boolean;
}

export function useSwipeGestures(assignments: Assignment[]) {
  const [swipedItems, setSwipedItems] = useState<SwipedState>({});
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  // Clean up swipedItems for assignments that no longer exist
  useEffect(() => {
    const validIds = new Set(assignments.map(a => a.id));
    setSwipedItems(prev => {
      const newState = { ...prev };
      Object.keys(newState).forEach(id => {
        const numericId = Number(id);
        if (!validIds.has(numericId)) {
          delete newState[numericId];
        }
      });
      return Object.keys(newState).length !== Object.keys(prev).length ? newState : prev;
    });
  }, [assignments]);

  const handleTouchStart = (e: React.TouchEvent, _assignmentId: number) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (assignmentId: number) => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      setSwipedItems(prev => ({ ...prev, [assignmentId]: true }));
    } else if (isRightSwipe) {
      setSwipedItems(prev => ({ ...prev, [assignmentId]: false }));
    }
  };

  const resetSwipe = (assignmentId: number) => {
    setSwipedItems(prev => ({ ...prev, [assignmentId]: false }));
  };

  const removeSwipeState = (assignmentId: number) => {
    setSwipedItems(prev => {
      const newState = { ...prev };
      delete newState[assignmentId];
      return newState;
    });
  };

  return {
    swipedItems,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    resetSwipe,
    removeSwipeState
  };
}