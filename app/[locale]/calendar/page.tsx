'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useApp } from '@/contexts/AppContext';
import Calendar from '@/components/Calendar';
import Assignments from '@/components/Assignments';
import AssignmentPopup from '@/components/AssignmentPopup';

export default function CalendarPage() {
  const { filters, toggleFilter, isLoading, loadingMessage, isDesktop } = useApp();
  const [popupDate, setPopupDate] = useState<string | null>(null);
  const t = useTranslations('filters');

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

  // 모바일용 레이아웃
  if (!isDesktop) {
    return (
      <>
        <div className="tab-content active mobile-flex-layout">
          {/* 고정 달력 */}
          <div className="calendar-fixed-mobile">
            <Calendar 
              onDayClick={handleDayClick} 
              weeksToShow={2}
            />
          </div>
          
          {/* 스크롤 가능한 영역 */}
          <div className="scrollable-content-mobile">
            <div className="filter-section">
              <div className="filter-row">
                <span className="filter-label">{t('hideCompleted')}</span>
                <div 
                  className={`toggle-switch ${!filters.unsubmittedOnly ? 'off' : ''}`}
                  onClick={() => toggleFilter('unsubmittedOnly')}
                >
                  <div className="toggle-slider"></div>
                </div>
              </div>
              <div className="filter-row">
                <span className="filter-label">{t('hideOverdue')}</span>
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

  // 데스크톱용 레이아웃 (기존 유지)
  return (
    <>
      <div className="tab-content active">
        <div className="content lg:grid lg:grid-cols-2 lg:gap-6 xl:gap-8 lg:p-6 xl:p-8 2xl:p-12">
          <div className="lg:sticky lg:top-0 lg:h-fit">
            <Calendar 
              onDayClick={handleDayClick} 
              weeksToShow={4}
            />
            
            <div className="filter-section">
              <div className="filter-row">
                <span className="filter-label">{t('hideCompleted')}</span>
                <div 
                  className={`toggle-switch ${!filters.unsubmittedOnly ? 'off' : ''}`}
                  onClick={() => toggleFilter('unsubmittedOnly')}
                >
                  <div className="toggle-slider"></div>
                </div>
              </div>
              <div className="filter-row">
                <span className="filter-label">{t('hideOverdue')}</span>
                <div 
                  className={`toggle-switch ${!filters.hideOverdueCalendar ? 'off' : ''}`}
                  onClick={() => toggleFilter('hideOverdueCalendar')}
                >
                  <div className="toggle-slider"></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="lg:overflow-y-auto">
            <Assignments />
          </div>
        </div>
      </div>
      
      <AssignmentPopup 
        date={popupDate} 
        onClose={() => setPopupDate(null)} 
      />
    </>
  );
}