'use client';

import { useTranslations } from 'next-intl';
import { useApp } from '@/contexts/AppContext';
import Subjects from '@/components/Subjects';

export default function DemoSubjectsPage() {
  const { filters, toggleFilter, isLoading, loadingMessage } = useApp();
  const tFilters = useTranslations('filters');

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
            <span className="filter-label">{tFilters('hideOverdueSubjects')}</span>
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