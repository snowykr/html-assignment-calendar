'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useApp } from '@/contexts/AppContext';
import { getAssignmentStatus, filterAssignments, sortAssignmentsByDueDate, formatDateTimeForDisplay } from '@/utils/utils';
import { formatRound } from '@/utils/round-formatter';
import { useTapToggle } from '@/hooks/useTapToggle';
import type { Assignment } from '@/utils/utils';
import { AppCheckIcon, AppIncompleteIcon } from '@/utils/icons';

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
  const locale = useLocale();
  



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
              toggleAssignmentCompletion(assignment.id, !assignment.completed);
            }}
          >
            {isCompleted ? 
              <AppCheckIcon className="h-4 w-4 text-green-600" aria-label="완료됨" /> : 
              <AppIncompleteIcon className="h-4 w-4 text-black" aria-label="미완료 - 클릭하여 완료 처리" />
            }
          </div>
          
          <div className="assignment-header">
            <div className="course-name">{assignment.courseName}</div>
          </div>
          
          <div className="assignment-round">{formatRound(assignment.round, locale)}</div>
          <div className="assignment-title">{assignment.title}</div>
          
          <div className={`deadline ${statusClass}`}>
            {formatDateTimeForDisplay(assignment, locale)}{statusText}
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
              deleteAssignment(assignment.id);
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