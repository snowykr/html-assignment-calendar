'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useApp } from '@/contexts/AppContext';
import { getAssignmentStatus, getFullLocale } from '@/utils/utils';
import { formatRound } from '@/utils/round-formatter';
import { useTapToggle } from '@/hooks/useTapToggle';
import MemoModal from './MemoModal';
import type { Assignment } from '@/utils/utils';
import { AppCheckIcon, AppIncompleteIcon } from '@/utils/icons';

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
  const tCommon = useTranslations('common');
  const tAddAssignment = useTranslations('addAssignment');
  const locale = useLocale();
  
  const [assignmentsForDate, setAssignmentsForDate] = useState<Assignment[]>([]);
  const {
    tappedItems,
    handleTap,
    closeTapped,
    removeTappedState
  } = useTapToggle(assignmentsForDate);
  
  // Memo modal state
  const [memoModalOpen, setMemoModalOpen] = useState(false);
  const [currentMemo, setCurrentMemo] = useState('');
  
  const showMemoModal = (memo: string) => {
    setCurrentMemo(memo);
    setMemoModalOpen(true);
  };
  
  const closeMemoModal = () => {
    setMemoModalOpen(false);
    setCurrentMemo('');
  };

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
    const isTapped = tappedItems[assignment.id] || false;
    const hasLinkOrMemo = assignment.link || assignment.memo;

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
              <AppCheckIcon className="h-4 w-4 text-green-600" aria-label={t('completedLabel')} /> : 
              <AppIncompleteIcon className="h-4 w-4 text-black" aria-label={t('incompleteLabel')} />
            }
          </div>
          
          <div className="assignment-header">
            <div className="course-name-with-indicators">
              <span className="course-name">{assignment.courseName}</span>
              <div className="assignment-indicators">
                {assignment.link && <span className="indicator-icon link-icon" title={t('linkAvailable')}>🔗</span>}
                {assignment.memo && <span className="indicator-icon memo-icon" title={t('memoAvailable')}>📝</span>}
              </div>
            </div>
          </div>
          
          <div className="assignment-round">{formatRound(assignment.round, locale)}</div>
          <div className="assignment-title">{assignment.title}</div>
          
          <div className={`deadline ${statusClass}`}>
            {assignment.dueTime}{statusText}
          </div>
        </div>
        
        <div className={`assignment-actions${isTapped && hasLinkOrMemo ? ' expanded' : ''}`}>
          <div className="action-row primary">
            <a 
              href={assignment.link || '#'} 
              target={assignment.link ? '_blank' : undefined}
              rel={assignment.link ? 'noopener noreferrer' : undefined}
              className={`action-btn link-btn${!assignment.link ? ' disabled' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                if (!assignment.link) {
                  e.preventDefault();
                  return;
                }
                closeTapped(assignment.id);
              }}
            >
              {tAddAssignment('link')}
            </a>
            <button 
              className="action-btn memo-btn"
              disabled={!assignment.memo}
              onClick={(e) => {
                e.stopPropagation();
                if (!assignment.memo) return;
                closeTapped(assignment.id);
                showMemoModal(assignment.memo);
              }}
            >
              {tAddAssignment('memo')}
            </button>
          </div>
          <div className="action-row secondary">
            <button 
              className="action-btn edit-btn"
              onClick={(e) => {
                e.stopPropagation();
                closeTapped(assignment.id);
                editAssignment(assignment);
                onClose();
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
                if (assignmentsForDate.length === 1) {
                  onClose();
                }
              }}
            >
              {tCommon('delete')}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
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
      
      <MemoModal 
        memo={currentMemo}
        isOpen={memoModalOpen}
        onClose={closeMemoModal}
      />
    </>
  );
}