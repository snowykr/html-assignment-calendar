'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { getAssignmentStatus, filterAssignments, sortAssignmentsByDueDate } from '@/utils/utils';
import type { Assignment } from '@/utils/utils';

interface SwipedState {
  [key: number]: boolean;
}

export default function Assignments() {
  const { 
    assignmentsData, 
    filters, 
    referenceToday, 
    viewStartDate,
    toggleAssignmentCompletion,
    deleteAssignment,
    editAssignment
  } = useApp();
  
  const [swipedItems, setSwipedItems] = useState<SwipedState>({});
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  // Clean up swipedItems for assignments that no longer exist
  useEffect(() => {
    const validIds = new Set(assignmentsData.map(a => a.id));
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
  }, [assignmentsData]);

  const handleTouchStart = (e: React.TouchEvent, assignmentId: number) => {
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

  // Date range filter for calendar view
  const dateRangeFilter = {
    ...filters,
    dateRange: {
      start: viewStartDate,
      days: 14
    },
    hideOverdue: filters.hideOverdueCalendar
  };

  const filteredAssignments = filterAssignments(
    assignmentsData, 
    dateRangeFilter, 
    referenceToday
  );

  const sortedAssignments = sortAssignmentsByDueDate(filteredAssignments);

  const renderAssignmentBox = (assignment: Assignment) => {
    const { statusClass, statusText } = getAssignmentStatus(assignment, referenceToday);
    const isCompleted = assignment.completed;
    const isSwiped = swipedItems[assignment.id] || false;

    return (
      <div 
        key={assignment.id} 
        className={`assignment-container ${isSwiped ? 'swiped' : ''}`}
      >
        <div 
          className={`assignment-box ${assignment.platform} ${isCompleted ? 'completed' : ''}`}
          onTouchStart={(e) => handleTouchStart(e, assignment.id)}
          onTouchMove={handleTouchMove}
          onTouchEnd={() => handleTouchEnd(assignment.id)}
        >
          <div 
            className="completion-toggle"
            onClick={(e) => {
              e.stopPropagation();
              setSwipedItems(prev => ({ ...prev, [assignment.id]: false }));
              toggleAssignmentCompletion(assignment.id, !assignment.completed);
            }}
          >
            {isCompleted ? '✓' : '○'}
          </div>
          
          <div className="assignment-header">
            <div className="course-name">{assignment.courseName}</div>
          </div>
          
          <div className="assignment-round">{assignment.round}</div>
          <div className="assignment-title">{assignment.title}</div>
          
          <div className={`deadline ${statusClass}`}>
            {assignment.dueDate} {assignment.dueTime}{statusText}
          </div>
        </div>
        
        <div className="assignment-actions">
          <button 
            className="action-btn edit-btn"
            onClick={() => {
              setSwipedItems(prev => ({ ...prev, [assignment.id]: false }));
              editAssignment(assignment);
            }}
          >
            ✏️
          </button>
          <button 
            className="action-btn delete-btn"
            onClick={() => {
              setSwipedItems(prev => {
                const newState = { ...prev };
                delete newState[assignment.id];
                return newState;
              });
              deleteAssignment(assignment.id);
            }}
          >
            🗑️
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="assignments-list">
      {sortedAssignments.length > 0 ? (
        sortedAssignments.map(assignment => renderAssignmentBox(assignment))
      ) : (
        <div className="no-assignments-popup">
          期間内に課題がありません
        </div>
      )}
    </div>
  );
}