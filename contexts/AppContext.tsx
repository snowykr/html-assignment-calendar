'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from '@/navigation';
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
import type { Assignment } from '@/utils/utils';


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
  isDesktop: boolean | undefined;
  
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
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
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
  const [isDesktop, setIsDesktop] = useState<boolean | undefined>(undefined);
  
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);

  // Check desktop mode
  useEffect(() => {
    const checkIsDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    
    checkIsDesktop();
    window.addEventListener('resize', checkIsDesktop);
    
    return () => window.removeEventListener('resize', checkIsDesktop);
  }, []);

  // Initialize app when authenticated
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
    
    if (status === 'authenticated' && session?.supabaseAccessToken) {
      init()
        .catch(error => console.error(t('initializationFailed'), error));
    } else if (status === 'unauthenticated') {
      setIsLoading(false);
      setAssignmentsData([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, session?.supabaseAccessToken]);
  
  // Update pagination when assignments data changes
  useEffect(() => {
    setSubjectsPagination(initSubjectPagination(assignmentsData, 3));
  }, [assignmentsData]);

  // Load saved filters from localStorage on client side
  useEffect(() => {
    const savedFilters = loadFiltersFromStorage();
    setFilters(savedFilters);
  }, []);

  // Handle authentication state - only redirect on protected pages
  useEffect(() => {
    const protectedRoutes = ['/calendar', '/subjects', '/settings'];
    const isProtectedRoute = protectedRoutes.some(route => pathname.includes(route));
    
    if (status === 'unauthenticated' && isProtectedRoute) {
      router.push('/');
    }
  }, [status, router, pathname]);

  const loadDataFromSupabase = async () => {
    if (!session?.supabaseAccessToken) {
      const errorMessage = '인증 토큰이 없습니다. 다시 로그인해주세요.';
      showTemporaryMessage(errorMessage);
      setIsLoading(false);
      return;
    }

    try {
      setLoadingMessage(t('fetchingData'));
      const data = await getAllAssignments(session.supabaseAccessToken);
      setAssignmentsData(data);
      setIsLoading(false);
    } catch (error) {
      const appError = handleError(error, { operation: 'loadDataFromSupabase' }, tErrors);
      logError(appError);
      showUserError(appError, showTemporaryMessage);
      setIsLoading(false);
    }
  };

  const navigateWeek = (direction: number) => {
    const newDate = new Date(viewStartDate);
    const weeksToMove = isDesktop === true ? 4 : 1;
    newDate.setDate(newDate.getDate() + (7 * weeksToMove * direction));
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
    if (!session?.supabaseAccessToken) {
      const errorMessage = '인증 토큰이 없습니다. 다시 로그인해주세요.';
      showTemporaryMessage(errorMessage);
      return;
    }

    try {
      setIsLoading(true);
      setLoadingMessage(t('refreshingData'));
      
      const data = await getAllAssignments(session.supabaseAccessToken);
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
    if (!session?.supabaseAccessToken) {
      const errorMessage = '인증 토큰이 없습니다. 다시 로그인해주세요.';
      showTemporaryMessage(errorMessage);
      return;
    }

    try {
      const updatedAssignment = await updateAssignmentCompletion(
        assignmentId, 
        completed, 
        session.supabaseAccessToken
      );
      
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
    if (!session?.supabaseAccessToken) {
      const errorMessage = '인증 토큰이 없습니다. 다시 로그인해주세요.';
      showTemporaryMessage(errorMessage);
      return;
    }

    const assignment = assignmentsData.find(a => a.id === assignmentId);
    if (!assignment) {
      console.error('Assignment not found for deletion');
      return;
    }

    const confirmMessage = t('confirmDelete', { title: `${assignment.courseName} - ${assignment.title}` });
    
    if (confirm(confirmMessage)) {
      try {
        await deleteAssignmentService(assignmentId, session.supabaseAccessToken);
        
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
    console.log('🚀 handleAssignmentSubmit 시작:', { isEditing, assignmentData });
    
    if (!session?.user?.id) {
      console.error('❌ 사용자 ID가 없음:', session);
      showTemporaryMessage('로그인이 필요합니다.');
      return;
    }
    console.log('✅ 사용자 ID 존재:', session.user.id);

    if (!session?.supabaseAccessToken) {
      console.error('❌ Supabase 액세스 토큰이 없음:', session);
      const errorMessage = '인증 토큰이 없습니다. 다시 로그인해주세요.';
      showTemporaryMessage(errorMessage);
      return;
    }
    console.log('✅ Supabase 액세스 토큰 존재');
    
    try {
      if (isEditing && currentEditingAssignment) {
        console.log('📝 과제 수정 모드');
        const updatedAssignment = await updateAssignmentService(
          currentEditingAssignment.id, 
          { ...assignmentData, completed: currentEditingAssignment.completed },
          session.supabaseAccessToken
        );
        
        setAssignmentsData(prev => 
          prev.map(a => a.id === currentEditingAssignment.id ? updatedAssignment : a)
        );
        
        showTemporaryMessage(t('assignmentUpdated'));
      } else {
        console.log('➕ 새 과제 추가 모드');
        const newAssignmentData = {
          ...assignmentData,
          userId: session.user.id,
          completed: false
        } as Assignment;
        console.log('📤 addAssignmentService 호출 데이터:', newAssignmentData);
        
        const newAssignment = await addAssignmentService(
          newAssignmentData,
          session.supabaseAccessToken
        );
        
        console.log('✅ 새 과제 추가 성공:', newAssignment);
        setAssignmentsData(prev => [...prev, newAssignment]);
        showTemporaryMessage(t('assignmentAdded'));
      }
      
      setCurrentEditingAssignment(undefined);
      setIsEditModalOpen(false);
      console.log('✅ handleAssignmentSubmit 완료');
    } catch (error) {
      console.error('❌ handleAssignmentSubmit 에러:', error);
      console.error('❌ 에러 타입:', typeof error);
      console.error('❌ 에러 상세:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        error: error
      });
      
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
    isDesktop,
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