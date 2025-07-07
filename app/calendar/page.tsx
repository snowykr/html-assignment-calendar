'use client';

import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import Calendar from '@/components/Calendar';
import Assignments from '@/components/Assignments';
import AssignmentPopup from '@/components/AssignmentPopup';

export default function CalendarPage() {
  const { filters, toggleFilter, isLoading, loadingMessage } = useApp();
  const [popupDate, setPopupDate] = useState<string | null>(null);

  const handleDayClick = (dateStr: string) => {
    setPopupDate(dateStr);
  };

  if (isLoading) {
    return (
      <div className="content">
        <div className="loading-message">{loadingMessage}</div>
      </div>
    );
  }

  return (
    <>
      <div className="tab-content active">
        <div className="content">
          <Calendar onDayClick={handleDayClick} />
          
          <div className="filter-section">
            <div className="filter-row">
              <span className="filter-label">提出済み課題を隠す</span>
              <div 
                className={`toggle-switch ${!filters.unsubmittedOnly ? 'off' : ''}`}
                onClick={() => toggleFilter('unsubmittedOnly')}
              >
                <div className="toggle-slider"></div>
              </div>
            </div>
            <div className="filter-row">
              <span className="filter-label">期限切れ課題を隠す</span>
              <div 
                className={`toggle-switch ${!filters.hideOverdueCalendar ? 'off' : ''}`}
                onClick={() => toggleFilter('hideOverdueCalendar')}
              >
                <div className="toggle-slider"></div>
              </div>
            </div>
          </div>
          
          <Assignments />
        </div>
      </div>
      
      <AssignmentPopup 
        date={popupDate} 
        onClose={() => setPopupDate(null)} 
      />
    </>
  );
}