'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { useApp } from '@/contexts/AppContext';
import { useOutsideClick } from '@/hooks/useOutsideClick';

interface AddAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  presetDate?: string;
}

export default function AddAssignmentModal({ isOpen, onClose, presetDate }: AddAssignmentModalProps) {
  const { currentEditingAssignment, handleAssignmentSubmit } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const t = useTranslations('addAssignment');
  const tCommon = useTranslations('common');
  const modalRef = useOutsideClick({ onOutsideClick: onClose, enabled: isOpen });
  
  const [formData, setFormData] = useState({
    courseName: '',
    round: '',
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
        round: currentEditingAssignment.round || '',
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
        round: '',
        title: '',
        dueDate: presetDate || new Date().toISOString().split('T')[0],
        dueTime: '23:59',
        platform: '',
        link: '',
        memo: ''
      });
    }
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.courseName || !formData.round || !formData.title || 
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
      <div className="popup-content" ref={modalRef}>
        <div className="popup-header">
          <h3>{isEditing ? t('editTitle') : t('title')}</h3>
          <button className="popup-close" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="course-name">{t('courseName')}</label>
            <input 
              type="text" 
              id="course-name" 
              className="form-input" 
              value={formData.courseName}
              onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="round">{t('round')}</label>
            <input 
              type="text" 
              id="round" 
              className="form-input" 
              value={formData.round}
              onChange={(e) => setFormData({ ...formData, round: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="title">{t('assignmentTitle')}</label>
            <input 
              type="text" 
              id="title" 
              className="form-input" 
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, dueTime: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="platform">{t('platform')}</label>
            <select 
              id="platform" 
              className="form-select" 
              value={formData.platform}
              onChange={(e) => setFormData({ ...formData, platform: e.target.value as 'teams' | 'openlms' | '' })}
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
              className="form-input" 
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              placeholder={t('linkPlaceholder')}
              maxLength={2048}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="memo">{t('memo')}</label>
            <textarea 
              id="memo" 
              className="form-input memo-textarea" 
              value={formData.memo}
              onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
              placeholder={t('memoPlaceholder')}
              maxLength={500}
              rows={3}
            />
            <div className="char-counter">
              {formData.memo.length}/500
            </div>
          </div>
          <div className="form-actions">
            <button 
              type="submit" 
              className="btn-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (isEditing ? t('editingInProgress') : t('addingInProgress')) : (isEditing ? tCommon('edit') : tCommon('add'))}
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
        </form>
      </div>
    </div>
  );
}