'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { useApp } from '@/contexts/AppContext';
import { useOutsideClick } from '@/hooks/useOutsideClick';
import PreviousAssignmentModal from './PreviousAssignmentModal';
import type { Assignment } from '@/utils/utils';

interface AddAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  presetDate?: string;
}

export default function AddAssignmentModal({ isOpen, onClose, presetDate }: AddAssignmentModalProps) {
  const { currentEditingAssignment, handleAssignmentSubmit, assignmentsData } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreviousModal, setShowPreviousModal] = useState(false);

  const t = useTranslations('addAssignment');
  const tCommon = useTranslations('common');
  const modalRef = useOutsideClick({ onOutsideClick: onClose, enabled: isOpen && !showPreviousModal });
  
  const [formData, setFormData] = useState({
    courseName: '',
    lesson: '',
    title: '',
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: '00:00',
    platform: '' as 'teams' | 'openlms' | '',
    link: '',
    memo: ''
  });

  useEffect(() => {
    if (currentEditingAssignment) {
      setFormData({
        courseName: currentEditingAssignment.courseName || '',
        lesson: currentEditingAssignment.lesson || '',
        title: currentEditingAssignment.title || '',
        dueDate: currentEditingAssignment.dueDate || '',
        dueTime: currentEditingAssignment.dueTime || '',
        platform: currentEditingAssignment.platform || '',
        link: currentEditingAssignment.link || '',
        memo: currentEditingAssignment.memo || ''
      });
    } else {
      // Reset form for new assignment
      setFormData({
        courseName: '',
        lesson: '',
        title: '',
        dueDate: presetDate || new Date().toISOString().split('T')[0],
        dueTime: '23:59',
        platform: '',
        link: '',
        memo: ''
      });
    }

    setShowPreviousModal(false);
  }, [currentEditingAssignment, isOpen, presetDate]);

  // URL validation function
  const isValidUrl = (url: string): boolean => {
    if (!url.trim()) return true; // Empty URL is valid (optional field)
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };



  // Apply previous assignment data to form
  const applyPreviousAssignment = (assignment: Assignment) => {
    setFormData({
      courseName: assignment.courseName,
      lesson: assignment.lesson,
      title: assignment.title,
      dueDate: presetDate || new Date().toISOString().split('T')[0],
      dueTime: '23:59',
      platform: assignment.platform,
      link: assignment.link || '',
      memo: assignment.memo || ''
    });
  };

  const handleFieldChange = (fieldName: string, value: string) => {
    const processedValue = fieldName === 'lesson' ? parseInt(value) || 0 : value;
    setFormData({ ...formData, [fieldName]: processedValue });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.courseName || !formData.lesson || !formData.title || 
        !formData.dueDate || !formData.dueTime || !formData.platform) {
      alert(t('fillAllFields'));
      return;
    }

    // Validate link URL format
    if (formData.link && !isValidUrl(formData.link)) {
      alert(t('invalidUrl'));
      return;
    }

    // Validate memo length
    if (formData.memo && formData.memo.length > 500) {
      alert(t('memoTooLong'));
      return;
    }

    setIsSubmitting(true);
    
    try {
      await handleAssignmentSubmit({
        ...formData,
        platform: formData.platform as 'teams' | 'openlms'
      });
      onClose();
    } catch (_error) {
      // Error is already handled in context
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const isEditing = currentEditingAssignment !== undefined;

  return (
    <div className="popup-modal show">
      <div className="popup-content-fixed" ref={modalRef}>
        <div className="popup-header">
          <h3>{isEditing ? t('editTitle') : t('title')}</h3>
          <button className="popup-close" onClick={onClose}>&times;</button>
        </div>
        
        <div className="popup-scrollable-content">
          <form id="assignment-form" onSubmit={handleSubmit}>
          <div className="form-group">
              <label className="form-label" htmlFor="course-name">{t('courseName')}</label>
              <input
                type="text"
                id="course-name"
                className="form-input"
                value={formData.courseName}
                onChange={(e) => handleFieldChange('courseName', e.target.value)}
                required
              />
            </div>
          <div className="form-group">
            <label className="form-label" htmlFor="lesson">{t('lesson')}</label>
            <input 
                type="number" 
                id="lesson" 
                className="form-input"
                value={formData.lesson}
                onChange={(e) => handleFieldChange('lesson', e.target.value)}
                min="1"
                required
              />
          </div>
          <div className="form-group">
              <label className="form-label" htmlFor="title">{t('title')}</label>
              <input
                type="text"
                id="title"
                className="form-input"
                value={formData.title}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                required
              />
            </div>
          <div className="form-group">
              <label className="form-label" htmlFor="due-date">{t('dueDate')}</label>
              <input
                type="date"
                id="due-date"
                className="form-input"
                value={formData.dueDate}
                onChange={(e) => handleFieldChange('dueDate', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="due-time">{t('dueTime')}</label>
              <input
                type="time"
                id="due-time"
                className="form-input"
                value={formData.dueTime}
                onChange={(e) => handleFieldChange('dueTime', e.target.value)}
                required
              />
            </div>
          <div className="form-group">
            <label className="form-label" htmlFor="platform">{t('platform')}</label>
            <select 
              id="platform" 
              className="form-select" 
              value={formData.platform}
              onChange={(e) => handleFieldChange('platform', e.target.value)}
              required
            >
              <option value="">{t('selectPlatform')}</option>
              <option value="teams">{t('teams')}</option>
              <option value="openlms">{t('openlms')}</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="link">{t('link')}</label>
            <input 
              type="url"
              id="link" 
              className={`form-input ${!isValidUrl(formData.link) ? 'border-red-500' : ''}`}
              value={formData.link}
              onChange={(e) => handleFieldChange('link', e.target.value)}
              placeholder={t('linkPlaceholder')}
              maxLength={2048}
            />
            {!isValidUrl(formData.link) && (
              <span className="text-red-500 text-sm">{t('invalidUrl')}</span>
            )}
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="memo">{t('memo')}</label>
            <textarea 
              id="memo" 
              className="form-input memo-textarea" 
              value={formData.memo}
              onChange={(e) => handleFieldChange('memo', e.target.value)}
              placeholder={t('memoPlaceholder')}
              maxLength={500}
              rows={3}
            />
            <div className="char-counter">
              {formData.memo.length}/500
            </div>
          </div>
        </form>
        </div>
        
        <div className="popup-footer">
          <div className="flex justify-between items-center w-full">
            <div className="flex gap-2">
              {!isEditing && (
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => setShowPreviousModal(true)}
                  disabled={assignmentsData.length === 0}
                >
                  {t('usePreviousInfo')}
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button 
                type="submit" 
                form="assignment-form"
                className="btn-submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? tCommon('submitting') : (isEditing ? tCommon('update') : tCommon('add'))}
              </button>
              <button 
                type="button" 
                className="btn-cancel" 
                onClick={onClose}
                disabled={isSubmitting}
              >
                {tCommon('cancel')}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <PreviousAssignmentModal
        isOpen={showPreviousModal}
        onClose={() => setShowPreviousModal(false)}
        assignments={assignmentsData}
        onApply={applyPreviousAssignment}
      />
    </div>
  );
}