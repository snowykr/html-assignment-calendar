'use client';

import { useTranslations } from 'next-intl';
import { useOutsideClick } from '@/hooks/useOutsideClick';

interface MemoModalProps {
  memo: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function MemoModal({ memo, isOpen, onClose }: MemoModalProps) {
  const tCommon = useTranslations('common');
  const tAddAssignment = useTranslations('addAssignment');
  const modalRef = useOutsideClick({ onOutsideClick: onClose, enabled: isOpen });

  if (!isOpen) return null;

  return (
    <div className="popup-modal show">
      <div className="popup-content memo-modal" ref={modalRef}>
        <div className="popup-header">
          <h3>{tAddAssignment('memo')}</h3>
          <button className="popup-close" onClick={onClose}>&times;</button>
        </div>
        <div className="memo-content">
          <p>{memo}</p>
        </div>
        <div className="form-actions">
          <button 
            type="button" 
            className="btn-cancel" 
            onClick={onClose}
          >
            {tCommon('close')}
          </button>
        </div>
      </div>
    </div>
  );
}