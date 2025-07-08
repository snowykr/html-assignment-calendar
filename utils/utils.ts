// Date and time utilities
export interface Assignment {
  id: number;
  courseName: string;
  round: string;
  title: string;
  dueDate: string;
  dueTime: string;
  platform: 'teams' | 'openlms';
  completed: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AssignmentStatus {
  statusClass: 'normal' | 'overdue' | 'due-soon' | 'completed';
  statusText: string;
  dueDateObj: Date;
}

// Assignment status calculation
export function getAssignmentStatus(
  assignment: Assignment, 
  referenceToday: Date,
  t?: (key: string, params?: any) => string
): AssignmentStatus {
  const dueDateObj = new Date(assignment.dueDate + "T" + assignment.dueTime);
  let statusClass: AssignmentStatus['statusClass'];
  let statusText: string;
  
  if (assignment.completed) {
    statusClass = 'completed';
    statusText = t ? t('completed') : ' (提出完了)';
  } else {
    const diffTime = dueDateObj.getTime() - referenceToday.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (dueDateObj < referenceToday) {
      statusClass = 'overdue';
      statusText = t ? t('overdue') : ' (期限切れ)';
    } else if (dueDateObj.toDateString() === referenceToday.toDateString()) {
      statusClass = 'due-soon';
      statusText = t ? t('dueToday') : ' (今日締切)';
    } else if (diffDays <= 3) {
      statusClass = 'due-soon';
      statusText = t ? t('daysLeft', { days: diffDays }) : ` (${diffDays}日後)`;
    } else {
      statusClass = 'normal';
      statusText = t ? t('daysLeft', { days: diffDays }) : ` (${diffDays}日後)`;
    }
  }
  
  return { statusClass, statusText, dueDateObj };
}

// Format date for display
export function formatDateForDisplay(dateStr: string, locale: string = 'ja-JP'): string {
  return new Date(dateStr).toLocaleDateString(locale, { 
    month: 'long', 
    day: 'numeric' 
  });
}


// Sort assignments by due date
export function sortAssignmentsByDueDate(assignments: Assignment[], completedLast = true): Assignment[] {
  return assignments.sort((a, b) => {
    if (completedLast && a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    const dateA = new Date(a.dueDate + "T" + a.dueTime);
    const dateB = new Date(b.dueDate + "T" + b.dueTime);
    return dateA.getTime() - dateB.getTime();
  });
}

// Filter assignments based on filters
export interface AssignmentFilters {
  dateRange?: {
    start: Date;
    days: number;
  };
  unsubmittedOnly?: boolean;
  hideOverdue?: boolean;
}

export function filterAssignments(
  assignments: Assignment[], 
  filters: AssignmentFilters, 
  referenceToday: Date
): Assignment[] {
  let filtered = [...assignments];
  
  // Date range filtering (for calendar view consistency)
  if (filters.dateRange) {
    const { start, days } = filters.dateRange;
    const startDate = new Date(start);
    const endDate = new Date(start);
    endDate.setDate(startDate.getDate() + days - 1);
    
    // Set time to beginning and end of day for accurate comparison
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    
    filtered = filtered.filter(a => {
      const assignmentDate = new Date(a.dueDate);
      assignmentDate.setHours(0, 0, 0, 0);
      return assignmentDate >= startDate && assignmentDate <= endDate;
    });
  }
  
  if (filters.unsubmittedOnly) {
    filtered = filtered.filter(a => !a.completed);
  }
  
  if (filters.hideOverdue) {
    filtered = filtered.filter(a => {
      if (a.completed) return true;
      const dueDateObj = new Date(a.dueDate + "T" + a.dueTime);
      return dueDateObj >= referenceToday;
    });
  }
  
  return filtered;
}

// Adjust calendar title font size to fit
export function adjustCalendarTitleFontSize(titleElement: HTMLElement): void {
  titleElement.style.fontSize = '18px';
  
  const container = titleElement.parentElement;
  if (!container) return;
  
  const containerWidth = container.offsetWidth;
  const buttons = container.querySelectorAll<HTMLButtonElement>('button');
  let buttonsWidth = 0;
  buttons.forEach(btn => buttonsWidth += btn.offsetWidth + 20);
  
  const availableWidth = containerWidth - buttonsWidth - 40;
  
  let fontSize = 18;
  while (titleElement.scrollWidth > availableWidth && fontSize > 14) {
    fontSize -= 1;
    titleElement.style.fontSize = fontSize + 'px';
  }
}

// Get cookie value by name
export function getCookie(name: string): string | null {
  if (typeof window === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  const cookie = cookies.find(c => c.trim().startsWith(name + '='));
  return cookie ? cookie.split('=')[1] : null;
}

// Convert short locale codes to full locale codes for better Intl API support
export function getFullLocale(locale: string): string {
  const localeMap: { [key: string]: string } = {
    'ko': 'ko-KR',
    'en': 'en-US', 
    'ja': 'ja-JP'
  };
  return localeMap[locale] || 'en-US';
}