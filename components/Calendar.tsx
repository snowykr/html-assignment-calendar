'use client';

import { useEffect, useRef } from 'react';
import { useApp } from '@/contexts/AppContext';
import { adjustCalendarTitleFontSize } from '@/utils/utils';

interface CalendarProps {
  onDayClick: (dateStr: string) => void;
}

export default function Calendar({ onDayClick }: CalendarProps) {
  const { viewStartDate, navigateWeek, referenceToday, assignmentsData, filters } = useApp();
  const titleRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (titleRef.current) {
      adjustCalendarTitleFontSize(titleRef.current);
    }
  }, [viewStartDate]);

  const dayHeaders = ['日', '月', '火', '水', '木', '金', '土'];
  
  const startDate = new Date(viewStartDate);
  const endDateForTitle = new Date(startDate);
  endDateForTitle.setDate(startDate.getDate() + 13);

  const titleText = 
    `${startDate.getFullYear()}年 ${startDate.getMonth() + 1}月 ${startDate.getDate()}日 - ${endDateForTitle.getFullYear()}年 ${endDateForTitle.getMonth() + 1}月 ${endDateForTitle.getDate()}日`;

  const todayForHighlight = new Date(referenceToday);
  todayForHighlight.setHours(0, 0, 0, 0);

  const days = [];
  for (let i = 0; i < 14; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    currentDate.setHours(0, 0, 0, 0);

    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
    
    const assignmentsOnThisDay = assignmentsData.filter(a => {
      const isOverdueForCalendar = a.completed ? false : (new Date(a.dueDate + "T" + a.dueTime) < referenceToday);
      return a.dueDate === dateStr && 
             !(filters.hideOverdueCalendar && isOverdueForCalendar && !a.completed) && 
             (!filters.unsubmittedOnly || !a.completed);
    });

    const isToday = currentDate.getTime() === todayForHighlight.getTime();
    const platformsOnDay = new Set(assignmentsOnThisDay.map(a => a.platform));

    days.push({
      date: currentDate.getDate(),
      dateStr,
      isToday,
      platforms: Array.from(platformsOnDay),
      hasAssignments: assignmentsOnThisDay.length > 0
    });
  }

  return (
    <div className="calendar-section">
      <div className="calendar-header">
        <button onClick={() => navigateWeek(-1)}>&#9664;</button>
        <span ref={titleRef} className="calendar-title">{titleText}</span>
        <button onClick={() => navigateWeek(1)}>&#9654;</button>
      </div>
      
      <div className="calendar-grid">
        {dayHeaders.map((day, index) => (
          <div key={index} className="calendar-day-header">
            {day}
          </div>
        ))}
      </div>
      
      <div className="calendar-grid">
        {days.map((day, index) => (
          <div
            key={index}
            className={`calendar-day ${day.isToday ? 'today' : ''}`}
            data-date={day.dateStr}
            onClick={() => onDayClick(day.dateStr)}
          >
            <span className="day-number">{day.date}</span>
            {day.hasAssignments && (
              <div className="assignment-dot-container">
                {day.platforms.map((platform) => (
                  <div key={platform} className={`assignment-dot dot-${platform}`} />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}