'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useApp } from '@/contexts/AppContext';
import { getAssignmentStatus, getFullLocale } from '@/utils/utils';
import { useSwipeGestures } from '@/hooks/useSwipeGestures';
import type { Assignment } from '@/utils/utils';

interface AssignmentPopupProps {
  date: string | null;
  onClose: () => void;
}


export default function AssignmentPopup({ date, onClose }: AssignmentPopupProps) {
  const { 
    assignmentsData, 
    referenceToday, 
    toggleAssignmentCompletion,
    deleteAssignment,
    editAssignment
  } = useApp();
  const t = useTranslations('assignmentStatus');
  const tNoAssignments = useTranslations('noAssignments');
  const locale = useLocale();
  
  const [assignmentsForDate, setAssignmentsForDate] = useState<Assignment[]>([]);
  const {
    swipedItems,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    resetSwipe,
    removeSwipeState
  } = useSwipeGestures(assignmentsForDate);

  useEffect(() => {
    if (date) {
      const filtered = assignmentsData.filter(a => a.dueDate === date);
      setAssignmentsForDate(filtered);
    }
  }, [date, assignmentsData]);



  if (!date) return null;

  const fullLocale = getFullLocale(locale);
  const dateDisplay = new Intl.DateTimeFormat(fullLocale, { month: 'long', day: 'numeric' }).format(new Date(date));

  const renderAssignmentItem = (assignment: Assignment) => {
    const { statusClass, statusText } = getAssignmentStatus(assignment, referenceToday, t);
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
            {assignment.dueTime}{statusText}
          </div>
        </div>
        
        <div className="assignment-actions">
          <button 
            className="action-btn edit-btn"
            onClick={() => {
              resetSwipe(assignment.id);
              editAssignment(assignment);
              onClose();
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
              if (assignmentsForDate.length === 1) {
                onClose();
              }
            }}
          >
            🗑️
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={`popup-modal ${date ? 'show' : ''}`} onClick={onClose}>
      <div className="popup-content" onClick={(e) => e.stopPropagation()}>
        <div className="popup-header">
          <h3>{dateDisplay}</h3>
          <button className="popup-close" onClick={onClose}>&times;</button>
        </div>
        <div id="popup-assignment-list">
          {assignmentsForDate.length > 0 ? (
            assignmentsForDate.map(assignment => renderAssignmentItem(assignment))
          ) : (
            <div className="no-assignments-popup">
              {tNoAssignments('onThisDay')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}