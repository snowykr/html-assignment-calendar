'use client';

import { useApp } from '@/contexts/AppContext';
import Subjects from '@/components/Subjects';

export default function SubjectsPage() {
  const { filters, toggleFilter, isLoading, loadingMessage } = useApp();

  if (isLoading) {
    return (
      <div className="content">
        <div className="loading-message">{loadingMessage}</div>
      </div>
    );
  }

  return (
    <div className="tab-content active">
      <div className="content">
        <div className="filter-section">
          <div className="filter-row">
            <span className="filter-label">期限切れ課題を隠す</span>
            <div 
              className={`toggle-switch ${!filters.hideOverdueSubjects ? 'off' : ''}`}
              onClick={() => toggleFilter('hideOverdueSubjects')}
            >
              <div className="toggle-slider"></div>
            </div>
          </div>
        </div>
        
        <Subjects />
      </div>
    </div>
  );
}