'use client';

import { useEffect, useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { getAssignmentStatus, formatDateForDisplay, isAssignmentOverdue } from '@/utils/utils';
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
  
  const [assignmentsForDate, setAssignmentsForDate] = useState<Assignment[]>([]);

  useEffect(() => {
    if (date) {
      const filtered = assignmentsData.filter(a => a.dueDate === date);
      setAssignmentsForDate(filtered);
    }
  }, [date, assignmentsData]);

  if (!date) return null;

  const dateDisplay = formatDateForDisplay(date);

  const renderAssignmentItem = (assignment: Assignment) => {
    const { statusClass, statusText } = getAssignmentStatus(assignment, referenceToday);
    const isCompleted = assignment.completed;

    return (
      <div 
        key={assignment.id}
        className={`assignment-box ${assignment.platform} ${isCompleted ? 'completed' : ''}`}
      >
        <div 
          className="completion-toggle"
          onClick={(e) => {
            e.stopPropagation();
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
          {assignment.dueTime}{statusText}
        </div>

        <div className="assignment-actions" style={{ marginTop: '10px' }}>
          <button 
            className="action-btn edit-btn"
            onClick={() => {
              editAssignment(assignment);
              onClose();
            }}
            style={{ marginRight: '8px' }}
          >
            編集
          </button>
          <button 
            className="action-btn delete-btn"
            onClick={() => {
              deleteAssignment(assignment.id);
              if (assignmentsForDate.length === 1) {
                onClose();
              }
            }}
          >
            削除
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
              この日の課題はありません
            </div>
          )}
        </div>
      </div>
    </div>
  );
}