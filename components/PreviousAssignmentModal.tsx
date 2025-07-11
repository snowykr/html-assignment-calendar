'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useOutsideClick } from '@/hooks/useOutsideClick';
import type { Assignment } from '@/utils/utils';

interface PreviousAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignments: Assignment[];
  onApply: (assignment: Assignment) => void;
}

export default function PreviousAssignmentModal({ 
  isOpen, 
  onClose, 
  assignments, 
  onApply 
}: PreviousAssignmentModalProps) {
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const t = useTranslations('addAssignment');
  const tCommon = useTranslations('common');
  const modalRef = useOutsideClick({ onOutsideClick: onClose, enabled: isOpen });

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedCourse('');
      setSelectedAssignment(null);
    }
  }, [isOpen]);

  // Get unique courses
  const getUniqueCourses = () => {
    const courseMap = new Map<string, Assignment>();
    
    assignments
      .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
      .forEach(assignment => {
        if (!courseMap.has(assignment.courseName)) {
          courseMap.set(assignment.courseName, assignment);
        }
      });
    
    return Array.from(courseMap.values());
  };

  // Get assignments for selected course
  const getAssignmentsForCourse = (courseName: string) => {
    return assignments
      .filter(assignment => assignment.courseName === courseName)
      .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
  };

  const handleCourseChange = (courseName: string) => {
    setSelectedCourse(courseName);
    setSelectedAssignment(null);
  };

  const handleAssignmentChange = (assignmentId: string) => {
    const assignment = getAssignmentsForCourse(selectedCourse).find(a => a.id === parseInt(assignmentId));
    setSelectedAssignment(assignment || null);
  };

  const handleApply = () => {
    if (selectedAssignment) {
      onApply(selectedAssignment);
      onClose();
    }
  };

  // Prevent event propagation for modal content clicks
  const handleModalContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  if (!isOpen) return null;

  const uniqueCourses = getUniqueCourses();
  const courseAssignments = selectedCourse ? getAssignmentsForCourse(selectedCourse) : [];

  return (
    <div className="popup-modal show">
      <div className="popup-content" ref={modalRef} onClick={handleModalContentClick}>
        <div className="popup-header">
          <h3>{t('usePreviousInfo')}</h3>
          <button className="popup-close" onClick={onClose}>&times;</button>
        </div>
        
        <div className="popup-body">
          <div className="form-group">
            <label className="form-label">{t('selectCourse')}</label>
            <select 
              className="form-select"
              value={selectedCourse}
              onChange={(e) => handleCourseChange(e.target.value)}
            >
              <option value="">{t('selectCourse')}</option>
              {uniqueCourses.map(assignment => (
                <option key={assignment.courseName} value={assignment.courseName}>
                  {assignment.courseName}
                </option>
              ))}
            </select>
          </div>

          {selectedCourse && (
            <div className="form-group">
              <label className="form-label">{t('selectAssignment')}</label>
              <select 
                className="form-select"
                value={selectedAssignment?.id || ''}
                onChange={(e) => handleAssignmentChange(e.target.value)}
              >
                <option value="">{t('selectAssignment')}</option>
                {courseAssignments.map(assignment => (
                  <option key={assignment.id} value={assignment.id}>
                  {assignment.lesson}{t('lessonSuffix')} - {assignment.title}
                </option>
                ))}
              </select>
            </div>
          )}

          {selectedAssignment && (
            <div className="assignment-preview">
              <h4 className="preview-title">{t('previewTitle')}</h4>
              <div className="preview-content">
                <p><strong>{t('courseName')}:</strong> {selectedAssignment.courseName}</p>
                <p><strong>{t('lesson')}:</strong> {selectedAssignment.lesson}{t('lessonSuffix')}</p>
                <p><strong>{t('title')}:</strong> {selectedAssignment.title}</p>
                <p><strong>{t('platform')}:</strong> {selectedAssignment.platform === 'teams' ? t('teams') : t('openlms')}</p>
                {selectedAssignment.link && (
                  <p><strong>{t('link')}:</strong> {selectedAssignment.link}</p>
                )}
                {selectedAssignment.memo && (
                  <p><strong>{t('memo')}:</strong> {selectedAssignment.memo}</p>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            className="btn-submit"
            onClick={handleApply}
            disabled={!selectedAssignment}
          >
            {tCommon('apply')}
          </button>
          <button 
            type="button" 
            className="btn-cancel" 
            onClick={onClose}
          >
            {tCommon('cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}