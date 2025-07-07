'use client';

import { useApp } from '@/contexts/AppContext';
import { getAssignmentStatus, filterAssignments, sortAssignmentsByDueDate } from '@/utils/utils';
import { useSwipeGestures } from '@/hooks/useSwipeGestures';
import type { Assignment } from '@/utils/utils';

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
  
  const {
    swipedItems,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    resetSwipe,
    removeSwipeState
  } = useSwipeGestures(sortedAssignments);

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
              resetSwipe(assignment.id);
              toggleAssignmentCompletion(assignment.id, !assignment.completed)
                .catch(error => console.error('완료 상태 변경 실패:', error));
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
              resetSwipe(assignment.id);
              editAssignment(assignment);
            }}
          >
            ✏️
          </button>
          <button 
            className="action-btn delete-btn"
            onClick={() => {
              removeSwipeState(assignment.id);
              deleteAssignment(assignment.id)
                .catch(error => console.error('과제 삭제 실패:', error));
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