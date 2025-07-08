'use client';

import { useTranslations } from 'next-intl';
import { useApp } from '@/contexts/AppContext';
import { getAssignmentStatus, filterAssignments, sortAssignmentsByDueDate } from '@/utils/utils';
import { useTapToggle } from '@/hooks/useTapToggle';
import type { Assignment } from '@/utils/utils';

export default function Assignments() {
  const { 
    assignmentsData, 
    filters, 
    referenceToday, 
    viewStartDate,
    toggleAssignmentCompletion,
    deleteAssignment,
    editAssignment,
    isDesktop
  } = useApp();
  const t = useTranslations('assignmentStatus');
  const tNoAssignments = useTranslations('noAssignments');
  const tCommon = useTranslations('common');
  



  // Date range filter for calendar view
  const dateRangeFilter = {
    ...filters,
    dateRange: {
      start: viewStartDate,
      days: isDesktop ? 28 : 14
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
    tappedItems,
    handleTap,
    closeTapped,
    removeTappedState
  } = useTapToggle(sortedAssignments);

  const renderAssignmentBox = (assignment: Assignment) => {
    const { statusClass, statusText } = getAssignmentStatus(assignment, referenceToday, t);
    const isCompleted = assignment.completed;
    const isTapped = tappedItems[assignment.id] || false;

    return (
      <div 
        key={assignment.id} 
        className={`assignment-container ${isTapped ? 'tapped' : ''}`}
      >
        <div 
          className={`assignment-box ${assignment.platform} ${isCompleted ? 'completed' : ''}`}
          onClick={() => handleTap(assignment.id)}
        >
          <div 
            className="completion-toggle"
            onClick={(e) => {
              e.stopPropagation();
              closeTapped(assignment.id);
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
            onClick={(e) => {
              e.stopPropagation();
              closeTapped(assignment.id);
              editAssignment(assignment);
            }}
          >
            {tCommon('edit')}
          </button>
          <button 
            className="action-btn delete-btn"
            onClick={(e) => {
              e.stopPropagation();
              removeTappedState(assignment.id);
              deleteAssignment(assignment.id)
                .catch(error => console.error('과제 삭제 실패:', error));
            }}
          >
            {tCommon('delete')}
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
          {tNoAssignments('inPeriod')}
        </div>
      )}
    </div>
  );
}