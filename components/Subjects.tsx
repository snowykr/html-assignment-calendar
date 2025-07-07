'use client';

import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { getAssignmentStatus, formatDateForDisplay } from '@/utils/utils';
import type { Assignment } from '@/utils/utils';

interface SubjectData {
  assignments: Assignment[];
  platform: 'teams' | 'openlms';
}

interface ExpandedState {
  [key: string]: boolean;
}

export default function Subjects() {
  const { 
    assignmentsData, 
    filters, 
    referenceToday, 
    subjectsPagination,
    updateSubjectPagination
  } = useApp();
  
  const [expandedSubjects, setExpandedSubjects] = useState<ExpandedState>({});

  // Group assignments by subject
  const subjects: { [key: string]: SubjectData } = {};
  assignmentsData.forEach(a => {
    if (!subjects[a.courseName]) {
      subjects[a.courseName] = { assignments: [], platform: a.platform };
    }
    subjects[a.courseName].assignments.push(a);
  });

  const toggleExpansion = (subjectName: string) => {
    setExpandedSubjects(prev => ({
      ...prev,
      [subjectName]: !prev[subjectName]
    }));
  };

  const renderSubjectAssignments = (subjectName: string, assignments: Assignment[]) => {
    const paginationState = subjectsPagination[subjectName] || { currentPage: 0, itemsPerPage: 3 };
    
    // Filter assignments based on filters
    let filteredAssignments = [...assignments];
    if (filters.hideOverdueSubjects) {
      filteredAssignments = filteredAssignments.filter(a => {
        if (a.completed) return true;
        const dueDateObj = new Date(a.dueDate + "T" + a.dueTime);
        return dueDateObj >= referenceToday;
      });
    }

    // Sort by due date
    filteredAssignments.sort((a, b) => {
      const dateA = new Date(a.dueDate + "T" + a.dueTime);
      const dateB = new Date(b.dueDate + "T" + b.dueTime);
      return dateA.getTime() - dateB.getTime();
    });

    // Pagination
    const start = paginationState.currentPage * paginationState.itemsPerPage;
    const end = start + paginationState.itemsPerPage;
    const paginatedAssignments = filteredAssignments.slice(start, end);
    const totalPages = Math.ceil(filteredAssignments.length / paginationState.itemsPerPage);

    return (
      <div className="subject-assignments">
        <div className="subject-assignments-inner-list">
          {paginatedAssignments.map(assignment => {
            const { statusClass, statusText } = getAssignmentStatus(assignment, referenceToday);
            const dueDateText = `${formatDateForDisplay(assignment.dueDate)} ${assignment.dueTime}${statusText}`;
            
            return (
              <div key={assignment.id} className="subject-assignment-item">
                <div>
                  <div className="subject-assignment-title">
                    {assignment.title} ({assignment.round})
                  </div>
                  <div className={`subject-assignment-due ${statusClass}`}>
                    {dueDateText}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredAssignments.length > paginationState.itemsPerPage && (
          <div className="assignment-nav">
            <button 
              className="nav-button"
              disabled={paginationState.currentPage === 0}
              onClick={(e) => {
                e.stopPropagation();
                updateSubjectPagination(subjectName, paginationState.currentPage - 1);
              }}
            >
              ← 前へ
            </button>
            <span className="page-info">
              {Math.min(start + 1, filteredAssignments.length)}-{Math.min(end, filteredAssignments.length)} / {filteredAssignments.length}
            </span>
            <button 
              className="nav-button"
              disabled={paginationState.currentPage >= totalPages - 1}
              onClick={(e) => {
                e.stopPropagation();
                updateSubjectPagination(subjectName, paginationState.currentPage + 1);
              }}
            >
              次へ →
            </button>
          </div>
        )}
      </div>
    );
  };

  const getSubjectStatus = (assignments: Assignment[]) => {
    let uncompletedAssignments = assignments.filter(a => !a.completed);
    if (filters.hideOverdueSubjects) {
      uncompletedAssignments = uncompletedAssignments.filter(a => {
        const dueDateObj = new Date(a.dueDate + "T" + a.dueTime);
        return dueDateObj >= referenceToday;
      });
    }

    if (uncompletedAssignments.length === 0) {
      return { text: 'すべての課題完了', className: 'completed' };
    }

    // Sort by due date
    uncompletedAssignments.sort((a, b) => {
      const dateA = new Date(a.dueDate + "T" + a.dueTime);
      const dateB = new Date(b.dueDate + "T" + b.dueTime);
      return dateA.getTime() - dateB.getTime();
    });

    const mostUrgent = uncompletedAssignments[0];
    const { statusClass, statusText } = getAssignmentStatus(mostUrgent, referenceToday);
    const dueDateText = `最も近い締切: ${formatDateForDisplay(mostUrgent.dueDate)}${statusText}`;
    
    return { text: dueDateText, className: statusClass };
  };

  return (
    <div className="subjects-list">
      {Object.entries(subjects).map(([subjectName, subjectData]) => {
        const status = getSubjectStatus(subjectData.assignments);
        const isExpanded = expandedSubjects[subjectName] || false;

        return (
          <div 
            key={subjectName}
            className={`subject-box ${subjectData.platform} ${isExpanded ? 'expanded' : ''}`}
            onClick={() => toggleExpansion(subjectName)}
          >
            <div className="subject-header-content">
              <div className="subject-header-main">
                <div className="subject-name-header">{subjectName}</div>
                <div className={`deadline ${status.className}`}>
                  {status.text}
                </div>
              </div>
              <span className="expand-icon-subject">⌄</span>
            </div>
            
            {isExpanded && renderSubjectAssignments(subjectName, subjectData.assignments)}
          </div>
        );
      })}
    </div>
  );
}