'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { initSupabase } from '@/services/supabase-client';
import { 
  getAllAssignments, 
  updateAssignmentCompletion,
  addAssignment as addAssignmentService,
  updateAssignment as updateAssignmentService,
  deleteAssignment as deleteAssignmentService
} from '@/services/assignment-service';
import { handleError, logError, showUserError, AppError } from '@/utils/error-handler';
import { initSubjectPagination } from '@/utils/pagination';
import { loadFiltersFromStorage, saveFiltersToStorage, DEFAULT_FILTERS } from '@/utils/filter-storage';

interface Assignment {
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

interface Filters {
  unsubmittedOnly: boolean;
  hideOverdueCalendar: boolean;
  hideOverdueSubjects: boolean;
}

interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
}

interface SubjectsPagination {
  [key: string]: PaginationState;
}

interface AppContextType {
  // Configuration
  referenceToday: Date;
  viewStartDate: Date;
  
  // State
  assignmentsData: Assignment[];
  isLoading: boolean;
  loadingMessage: string;
  currentPopupDate: string | null;
  currentEditingAssignment?: Assignment;
  subjectsPagination: SubjectsPagination;
  isEditModalOpen: boolean;
  setIsEditModalOpen: (isOpen: boolean) => void;
  setCurrentEditingAssignment: (assignment: Assignment | undefined) => void;
  
  // Filters
  filters: Filters;
  
  // Actions
  navigateWeek: (direction: number) => void;
  toggleFilter: (filterName: keyof Filters) => void;
  reloadAssignments: () => Promise<void>;
  toggleAssignmentCompletion: (assignmentId: number, completed: boolean) => Promise<void>;
  deleteAssignment: (assignmentId: number) => Promise<void>;
  editAssignment: (assignment: Assignment) => void;
  handleAssignmentSubmit: (assignmentData: Partial<Assignment>) => Promise<void>;
  setCurrentPopupDate: (date: string | null) => void;
  showTemporaryMessage: (message: string, duration?: number) => void;
  updateSubjectPagination: (subjectName: string, newPage: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const t = useTranslations('messages');
  const tErrors = useTranslations('errors');
  const [referenceToday] = useState(new Date());
  const [viewStartDate, setViewStartDate] = useState(() => {
    const today = new Date(referenceToday);
    const dayOfWeek = today.getDay();
    const diffToSunday = -dayOfWeek;
    const startDate = new Date(today.setDate(today.getDate() + diffToSunday));
    startDate.setHours(0, 0, 0, 0);
    return startDate;
  });
  
  const [assignmentsData, setAssignmentsData] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(t('loadingData'));
  const [currentPopupDate, setCurrentPopupDate] = useState<string | null>(null);
  const [currentEditingAssignment, setCurrentEditingAssignment] = useState<Assignment | undefined>();
  const [subjectsPagination, setSubjectsPagination] = useState<SubjectsPagination>({});
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);

  // Initialize app
  useEffect(() => {
    const init = async () => {
      try {
        setIsLoading(true);
        setLoadingMessage(t('initializingApp'));
        
        // Load data from Supabase
        await loadDataFromSupabase();
        
      } catch (error) {
        console.error('❌ Critical error during app initialization:', error);
        setIsLoading(false);
        setAssignmentsData([]);
      }
    };
    
    init()
      .catch(error => console.error(t('initializationFailed'), error));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Update pagination when assignments data changes
  useEffect(() => {
    setSubjectsPagination(initSubjectPagination(assignmentsData, 3));
  }, [assignmentsData]);

  // Load saved filters from localStorage on client side
  useEffect(() => {
    const savedFilters = loadFiltersFromStorage();
    setFilters(savedFilters);
  }, []);

  const loadDataFromSupabase = async () => {
    setLoadingMessage(t('connectingDB'));
    await initSupabase();
    
    setLoadingMessage(t('fetchingData'));
    const data = await getAllAssignments();
    setAssignmentsData(data);
    setIsLoading(false);
  };

  const navigateWeek = (direction: number) => {
    const newDate = new Date(viewStartDate);
    newDate.setDate(newDate.getDate() + (7 * direction));
    setViewStartDate(newDate);
  };

  const toggleFilter = (filterName: keyof Filters) => {
    setFilters(prev => {
      const newFilters = {
        ...prev,
        [filterName]: !prev[filterName]
      };
      saveFiltersToStorage(newFilters);
      return newFilters;
    });
  };

  const reloadAssignments = async () => {
    try {
      setIsLoading(true);
      setLoadingMessage(t('refreshingData'));
      
      const data = await getAllAssignments();
      setAssignmentsData(data);
      setIsLoading(false);
    } catch (error) {
      const appError = handleError(error, { operation: 'reloadAssignments' }, tErrors);
      logError(appError);
      showUserError(appError, showTemporaryMessage);
      setIsLoading(false);
    }
  };

  const toggleAssignmentCompletion = async (assignmentId: number, completed: boolean) => {
    try {
      const updatedAssignment = await updateAssignmentCompletion(assignmentId, completed);
      
      setAssignmentsData(prev => 
        prev.map(a => a.id === assignmentId ? updatedAssignment : a)
      );
    } catch (error) {
      if (error instanceof Object && 'userMessage' in error) {
        showUserError(error as AppError, showTemporaryMessage);
      } else {
        const appError = handleError(error, { 
          operation: 'toggleAssignmentCompletion',
          assignmentId,
          additionalInfo: { completed }
        }, tErrors);
        logError(appError);
        showUserError(appError, showTemporaryMessage);
      }
    }
  };

  const deleteAssignment = async (assignmentId: number) => {
    const assignment = assignmentsData.find(a => a.id === assignmentId);
    if (!assignment) {
      console.error('Assignment not found for deletion');
      return;
    }

    const confirmMessage = t('confirmDelete', { title: `${assignment.courseName} - ${assignment.title}` });
    
    if (confirm(confirmMessage)) {
      try {
        await deleteAssignmentService(assignmentId);
        
        setAssignmentsData(prev => prev.filter(a => a.id !== assignmentId));
        showTemporaryMessage(t('assignmentDeleted'));
      } catch (error) {
        if (error instanceof Object && 'userMessage' in error) {
          showUserError(error as AppError, showTemporaryMessage);
        } else {
          const appError = handleError(error, { 
            operation: 'deleteAssignment',
            assignmentId
          }, tErrors);
          logError(appError);
          showUserError(appError, showTemporaryMessage);
        }
      }
    }
  };

  const editAssignment = (assignment: Assignment) => {
    setCurrentEditingAssignment(assignment);
    setIsEditModalOpen(true);
  };

  const handleAssignmentSubmit = async (assignmentData: Partial<Assignment>) => {
    const isEditing = currentEditingAssignment !== undefined;
    
    try {
      if (isEditing && currentEditingAssignment) {
        const updatedAssignment = await updateAssignmentService(
          currentEditingAssignment.id, 
          { ...assignmentData, completed: currentEditingAssignment.completed }
        );
        
        setAssignmentsData(prev => 
          prev.map(a => a.id === currentEditingAssignment.id ? updatedAssignment : a)
        );
        
        showTemporaryMessage(t('assignmentUpdated'));
      } else {
        const newAssignment = await addAssignmentService({
          ...assignmentData,
          completed: false
        } as Assignment);
        
        setAssignmentsData(prev => [...prev, newAssignment]);
        showTemporaryMessage(t('assignmentAdded'));
      }
      
      setCurrentEditingAssignment(undefined);
      setIsEditModalOpen(false);
    } catch (error) {
      if (error instanceof Object && 'userMessage' in error) {
        showUserError(error as AppError, showTemporaryMessage);
      } else {
        const operation = isEditing ? 'updateAssignment' : 'addAssignment';
        const appError = handleError(error, { 
          operation,
          additionalInfo: { isEditing, assignmentData }
        }, tErrors);
        logError(appError);
        showUserError(appError, showTemporaryMessage);
      }
    }
  };

  const showTemporaryMessage = (message: string, duration = 3000) => {
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove();
      }
    }, duration);
  };

  const updateSubjectPagination = (subjectName: string, newPage: number) => {
    setSubjectsPagination(prev => ({
      ...prev,
      [subjectName]: {
        ...prev[subjectName],
        currentPage: newPage
      }
    }));
  };

  const value: AppContextType = {
    referenceToday,
    viewStartDate,
    assignmentsData,
    isLoading,
    loadingMessage,
    currentPopupDate,
    currentEditingAssignment,
    subjectsPagination,
    isEditModalOpen,
    setIsEditModalOpen,
    setCurrentEditingAssignment,
    filters,
    navigateWeek,
    toggleFilter,
    reloadAssignments,
    toggleAssignmentCompletion,
    deleteAssignment,
    editAssignment,
    handleAssignmentSubmit,
    setCurrentPopupDate,
    showTemporaryMessage,
    updateSubjectPagination
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}