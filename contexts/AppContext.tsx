'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { initSupabase } from '@/services/supabase-client';
import { 
  getAllAssignments, 
  updateAssignmentCompletion,
  addAssignment as addAssignmentService,
  updateAssignment as updateAssignmentService,
  deleteAssignment as deleteAssignmentService
} from '@/services/assignment-service';
import { initSubjectPagination } from '@/utils/pagination';

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
  const [loadingMessage, setLoadingMessage] = useState('데이터를 불러오는 중...');
  const [currentPopupDate, setCurrentPopupDate] = useState<string | null>(null);
  const [currentEditingAssignment, setCurrentEditingAssignment] = useState<Assignment | undefined>();
  const [subjectsPagination, setSubjectsPagination] = useState<SubjectsPagination>({});
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const [filters, setFilters] = useState<Filters>({
    unsubmittedOnly: false,
    hideOverdueCalendar: true,
    hideOverdueSubjects: true
  });

  // Initialize app
  useEffect(() => {
    const init = async () => {
      try {
        setIsLoading(true);
        setLoadingMessage('앱을 초기화하는 중...');
        
        // Load data from Supabase
        await loadDataFromSupabase();
        
      } catch (error) {
        console.error('❌ Critical error during app initialization:', error);
        setIsLoading(false);
        setAssignmentsData([]);
      }
    };
    
    init();
  }, []);
  
  // Update pagination when assignments data changes
  useEffect(() => {
    setSubjectsPagination(initSubjectPagination(assignmentsData, 3));
  }, [assignmentsData]);

  const loadDataFromSupabase = async () => {
    setLoadingMessage('Supabase에 연결하는 중...');
    await initSupabase();
    
    setLoadingMessage('데이터를 가져오는 중...');
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
    setFilters(prev => ({
      ...prev,
      [filterName]: !prev[filterName]
    }));
  };

  const reloadAssignments = async () => {
    try {
      setIsLoading(true);
      setLoadingMessage('데이터를 새로고침하는 중...');
      
      const data = await getAllAssignments();
      setAssignmentsData(data);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to reload assignments:', error);
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
      console.error('❌ Failed to toggle assignment completion:', error);
      alert('과제 완료 상태를 변경하는데 실패했습니다.');
    }
  };

  const deleteAssignment = async (assignmentId: number) => {
    const assignment = assignmentsData.find(a => a.id === assignmentId);
    if (!assignment) {
      console.error('Assignment not found for deletion');
      return;
    }

    const confirmMessage = `'${assignment.courseName} - ${assignment.title}' 과제를 삭제하시겠습니까?`;
    
    if (confirm(confirmMessage)) {
      try {
        await deleteAssignmentService(assignmentId);
        
        setAssignmentsData(prev => prev.filter(a => a.id !== assignmentId));
        showTemporaryMessage('과제를 삭제했습니다');
      } catch (error) {
        console.error('Failed to delete assignment:', error);
        alert('과제 삭제에 실패했습니다: ' + ((error as Error).message || '알 수 없는 오류'));
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
        
        showTemporaryMessage('과제를 수정했습니다');
      } else {
        const newAssignment = await addAssignmentService({
          ...assignmentData,
          completed: false
        } as Assignment);
        
        setAssignmentsData(prev => [...prev, newAssignment]);
        showTemporaryMessage('과제를 추가했습니다');
      }
      
      setCurrentEditingAssignment(undefined);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Failed to save assignment:', error);
      const userMessage = isEditing ? '과제 수정에 실패했습니다' : '과제 추가에 실패했습니다';
      alert(userMessage);
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