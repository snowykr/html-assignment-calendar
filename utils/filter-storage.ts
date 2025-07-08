interface Filters {
  unsubmittedOnly: boolean;
  hideOverdueCalendar: boolean;
  hideOverdueSubjects: boolean;
}

const STORAGE_KEY = 'assignmentCalendarFilters';

const DEFAULT_FILTERS: Filters = {
  unsubmittedOnly: false,
  hideOverdueCalendar: true,
  hideOverdueSubjects: true
};

export function loadFiltersFromStorage(): Filters {
  if (typeof window === 'undefined') {
    return DEFAULT_FILTERS;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        unsubmittedOnly: parsed.unsubmittedOnly ?? DEFAULT_FILTERS.unsubmittedOnly,
        hideOverdueCalendar: parsed.hideOverdueCalendar ?? DEFAULT_FILTERS.hideOverdueCalendar,
        hideOverdueSubjects: parsed.hideOverdueSubjects ?? DEFAULT_FILTERS.hideOverdueSubjects
      };
    }
  } catch (error) {
    console.error('Error loading filters from localStorage:', error);
  }
  
  return DEFAULT_FILTERS;
}

export function saveFiltersToStorage(filters: Filters): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
  } catch (error) {
    console.error('Error saving filters to localStorage:', error);
  }
}

export { DEFAULT_FILTERS };