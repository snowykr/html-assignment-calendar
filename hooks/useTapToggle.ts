import { useState, useEffect } from 'react';
import type { Assignment } from '@/utils/utils';

export interface TappedState {
  [key: number]: boolean;
}

export function useTapToggle(assignments: Assignment[]) {
  const [tappedItems, setTappedItems] = useState<TappedState>({});

  // Clean up tappedItems for assignments that no longer exist
  useEffect(() => {
    const validIds = new Set(assignments.map(a => a.id));
    setTappedItems(prev => {
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

  const handleTap = (assignmentId: number) => {
    setTappedItems(prev => {
      const newState: TappedState = {};
      
      // Close all other items
      Object.keys(prev).forEach(id => {
        if (Number(id) !== assignmentId) {
          newState[Number(id)] = false;
        }
      });
      
      // Toggle the tapped item
      newState[assignmentId] = !prev[assignmentId];
      
      return newState;
    });
  };

  const closeTapped = (assignmentId: number) => {
    setTappedItems(prev => ({ ...prev, [assignmentId]: false }));
  };

  const removeTappedState = (assignmentId: number) => {
    setTappedItems(prev => {
      const newState = { ...prev };
      delete newState[assignmentId];
      return newState;
    });
  };

  return {
    tappedItems,
    handleTap,
    closeTapped,
    removeTappedState
  };
}