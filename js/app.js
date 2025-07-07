import { renderCalendar, navigateWeek } from './calendar.js';
import { renderAssignmentsList, openAssignmentsPopup, closeAssignmentsPopup } from './assignments.js';
import { renderSubjectsList, renderSubjectPage, handleSubjectNav, toggleSubjectExpansion, initSubjectPagination } from './subjects.js';
import { getAllAssignments, initSupabase, updateAssignmentCompletion } from './supabase-service.js';

const app = {
    // Configuration
    config: {
        referenceToday: new Date(),
        pagination: {
            itemsPerPage: 3
        },
        filters: {
            unsubmittedOnly: false,
            hideOverdueCalendar: true,
            hideOverdueSubjects: true
        }
    },

    // State  
    viewStartDate: new Date(),
    assignmentsData: [],
    subjectsPagination: {},
    isLoading: false,
    loadingMessage: '데이터를 불러오는 중...',
    currentPopupDate: null,

    // Getters for filter state
    get filterUnsubmittedOnly() {
        return this._filterUnsubmittedOnly ?? this.config.filters.unsubmittedOnly;
    },
    set filterUnsubmittedOnly(value) {
        this._filterUnsubmittedOnly = value;
    },

    get filterHideOverdueCalendar() {
        return this._filterHideOverdueCalendar ?? this.config.filters.hideOverdueCalendar;
    },
    set filterHideOverdueCalendar(value) {
        this._filterHideOverdueCalendar = value;
    },

    get filterHideOverdueSubjects() {
        return this._filterHideOverdueSubjects ?? this.config.filters.hideOverdueSubjects;
    },
    set filterHideOverdueSubjects(value) {
        this._filterHideOverdueSubjects = value;
    },

    // Initialize app with fallback system
    async init() {
        try {
            // Set loading state
            this.isLoading = true;
            this.loadingMessage = '앱을 초기화하는 중...';
            
            // Set initial date
            const today = new Date(this.config.referenceToday);
            const dayOfWeek = today.getDay();
            const diffToSunday = -dayOfWeek;
            this.viewStartDate = new Date(today.setDate(today.getDate() + diffToSunday));
            this.viewStartDate.setHours(0,0,0,0);

            // Show initial loading message
            this.render();

            // Load data from Supabase
            await this.loadDataFromSupabase();

            // Initialize pagination
            this.subjectsPagination = initSubjectPagination(this.assignmentsData, this.config.pagination.itemsPerPage);

            // Set initial filter states
            document.getElementById('filter-unsubmitted-toggle').classList.toggle('off', !this.filterUnsubmittedOnly);
            document.getElementById('filter-overdue-toggle').classList.toggle('off', !this.filterHideOverdueCalendar);
            document.getElementById('filter-overdue-subjects-toggle').classList.toggle('off', !this.filterHideOverdueSubjects);
            
            this.isLoading = false;
            this.render();
            
        } catch (error) {
            console.error('❌ Critical error during app initialization:', error);
            this.isLoading = false;
            this.assignmentsData = [];
            this.showErrorState(error.message || '데이터를 불러오는데 실패했습니다.');
        }
    },

    // Load data from Supabase
    async loadDataFromSupabase() {
        this.loadingMessage = 'Supabase에 연결하는 중...';
        this.render();
        
        await initSupabase();
        
        this.loadingMessage = '데이터를 가져오는 중...';
        this.render();
        
        this.assignmentsData = await getAllAssignments();
    },

    // Show error state with retry option
    showErrorState(errorMessage) {
        const calendarList = document.getElementById('calendar-assignments-list');
        const subjectsList = document.getElementById('subjects-list-container');
        
        const errorHTML = `
            <div class="error-state">
                <div class="error-message">⚠️ ${errorMessage}</div>
                <button class="retry-button" onclick="app.retryConnection()">다시 시도</button>
            </div>
        `;
        
        if (calendarList) {
            calendarList.innerHTML = errorHTML;
        }
        
        if (subjectsList) {
            subjectsList.innerHTML = errorHTML;
        }
    },

    // Retry connection
    async retryConnection() {
        try {
            this.isLoading = true;
            this.loadingMessage = '다시 연결하는 중...';
            this.render();
            
            await this.loadDataFromSupabase();
            
            // Re-initialize pagination
            this.subjectsPagination = initSubjectPagination(this.assignmentsData, this.config.pagination.itemsPerPage);
            
            this.isLoading = false;
            this.render();
            
        } catch (error) {
            console.error('❌ Retry failed:', error);
            this.isLoading = false;
            this.showErrorState(error.message || '연결에 다시 실패했습니다.');
        }
    },


    // Main render function
    render() {
        // Show loading indicator if loading
        if (this.isLoading) {
            this.showLoadingState();
            return;
        }

        const filters = {
            unsubmittedOnly: this.filterUnsubmittedOnly,
            hideOverdueCalendar: this.filterHideOverdueCalendar,
            hideOverdueSubjects: this.filterHideOverdueSubjects
        };

        renderCalendar(
            this.viewStartDate,
            this.config.referenceToday,
            this.assignmentsData,
            filters,
            (dateStr) => this.openAssignmentsPopup(dateStr)
        );

        renderAssignmentsList(
            this.assignmentsData,
            filters,
            this.config.referenceToday,
            this.viewStartDate
        );

        renderSubjectsList(
            this.assignmentsData,
            filters,
            this.config.referenceToday,
            this.subjectsPagination,
            (subjectName, element) => this.renderSubjectPage(subjectName, element)
        );
    },

    // Show loading state with dynamic message
    showLoadingState() {
        const calendarList = document.getElementById('calendar-assignments-list');
        const subjectsList = document.getElementById('subjects-list-container');
        
        const loadingHTML = `<div class="loading-message">${this.loadingMessage}</div>`;
        
        if (calendarList) {
            calendarList.innerHTML = loadingHTML;
        }
        
        if (subjectsList) {
            subjectsList.innerHTML = loadingHTML;
        }
    },

    // Tab switching
    switchTab(tabName, clickedButton) {
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        clickedButton.classList.add('active');
        document.getElementById(tabName + '-tab').classList.add('active');
    },

    // Calendar navigation
    navigateWeek(direction) {
        this.viewStartDate = navigateWeek(this.viewStartDate, direction);
        this.render();
    },

    // Filter toggles
    toggleFilter(element, filterProperty) {
        element.classList.toggle('off');
        this[filterProperty] = !element.classList.contains('off');
        this.render();
    },

    toggleFilterUnsubmitted(element) {
        this.toggleFilter(element, 'filterUnsubmittedOnly');
    },

    toggleFilterOverdue(element) {
        this.toggleFilter(element, 'filterHideOverdueCalendar');
    },

    toggleFilterOverdueInSubjects(element) {
        this.toggleFilter(element, 'filterHideOverdueSubjects');
    },

    // Assignment popup
    openAssignmentsPopup(dateStr) {
        this.currentPopupDate = dateStr;
        openAssignmentsPopup(dateStr, this.assignmentsData, this.config.referenceToday);
    },

    closeAssignmentsPopup() {
        this.currentPopupDate = null;
        closeAssignmentsPopup();
    },

    // Add Assignment Modal
    openAddAssignmentModal() {
        const modal = document.getElementById('add-assignment-modal');
        const form = document.getElementById('add-assignment-form');
        const submitButton = form.querySelector('.btn-submit');
        
        // Reset editing state
        this.currentEditingAssignment = undefined;
        
        // Reset form
        form.reset();
        
        // Set default date to today
        document.getElementById('due-date').value = new Date().toISOString().split('T')[0];
        
        // Set default time to 00:00
        document.getElementById('due-time').value = '00:00';
        
        // Set button text to add mode
        submitButton.textContent = '추가';
        
        // Show modal
        modal.classList.add('show');
        
        // Focus first input
        setTimeout(() => {
            document.getElementById('course-name').focus();
        }, 100);
    },

    closeAddAssignmentModal() {
        const modal = document.getElementById('add-assignment-modal');
        const form = document.getElementById('add-assignment-form');
        const submitButton = form.querySelector('.btn-submit');
        
        modal.classList.remove('show');
        
        // Reset editing state
        this.currentEditingAssignment = undefined;
        
        // Reset form and button text
        form.reset();
        submitButton.textContent = '추가';
        
        // Set default values for next use
        document.getElementById('due-date').value = new Date().toISOString().split('T')[0];
        document.getElementById('due-time').value = '00:00';
    },


    // Alias for backward compatibility
    async handleAddAssignment(event) {
        return this.handleAssignmentSubmit(event);
    },

    // Subject-related methods
    renderSubjectPage(subjectName, element) {
        renderSubjectPage(
            subjectName,
            element,
            this.assignmentsData,
            {
                hideOverdueSubjects: this.filterHideOverdueSubjects
            },
            this.config.referenceToday,
            this.subjectsPagination[subjectName]
        );
    },

    handleSubjectNav(subjectName, direction, buttonElement) {
        handleSubjectNav(
            subjectName,
            direction,
            buttonElement,
            this.assignmentsData,
            {
                hideOverdueSubjects: this.filterHideOverdueSubjects
            },
            this.config.referenceToday,
            this.subjectsPagination[subjectName],
            (name, element) => this.renderSubjectPage(name, element)
        );
    },

    toggleSubjectExpansion(element, subjectName) {
        toggleSubjectExpansion(
            element,
            subjectName,
            (name, el) => this.renderSubjectPage(name, el)
        );
    },

    // Reload assignments from Supabase
    async reloadAssignments() {
        try {
            this.isLoading = true;
            this.loadingMessage = '데이터를 새로고침하는 중...';
            this.render();
            
            this.assignmentsData = await getAllAssignments();
            
            // Re-initialize pagination with new data
            this.subjectsPagination = initSubjectPagination(this.assignmentsData, this.config.pagination.itemsPerPage);
            
            this.isLoading = false;
            this.render();
        } catch (error) {
            console.error('Failed to reload assignments:', error);
            this.isLoading = false;
            this.showErrorState(error.message || '데이터 새로고침에 실패했습니다.');
        }
    },

    // Toggle assignment completion status
    async toggleAssignmentCompletion(assignmentId, completed) {
        try {
            // Update in Supabase
            const updatedAssignment = await updateAssignmentCompletion(assignmentId, completed);
            
            // Update local data
            const assignmentIndex = this.assignmentsData.findIndex(a => a.id === assignmentId);
            if (assignmentIndex !== -1) {
                this.assignmentsData[assignmentIndex] = updatedAssignment;
            }
            
            // Re-render
            this.render();
            
            // Re-render popup if it's currently open
            if (this.currentPopupDate) {
                openAssignmentsPopup(this.currentPopupDate, this.assignmentsData, this.config.referenceToday);
            }
        } catch (error) {
            console.error('❌ Failed to toggle assignment completion:', error.message || 'Unknown error');
            alert('과제 완료 상태를 변경하는데 실패했습니다.');
        }
    },

    // Show temporary message
    showTemporaryMessage(message, duration = 3000) {
        const toast = document.createElement('div');
        toast.className = 'toast-message';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        // Auto-remove
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, duration);
    },

    // Delete assignment with confirmation
    async deleteAssignment(assignmentId) {
        const assignment = this.assignmentsData.find(a => a.id === assignmentId);
        if (!assignment) {
            console.error('Assignment not found for deletion');
            return;
        }

        const confirmMessage = `'${assignment.courseName} - ${assignment.title}' 과제를 삭제하시겠습니까?`;
        
        if (confirm(confirmMessage)) {
            try {
                // Delete from Supabase
                const { deleteAssignment } = await import('./supabase-service.js');
                await deleteAssignment(assignmentId);
                
                // Remove from local data
                const assignmentIndex = this.assignmentsData.findIndex(a => a.id === assignmentId);
                if (assignmentIndex !== -1) {
                    this.assignmentsData.splice(assignmentIndex, 1);
                }
                
                // Re-initialize pagination with updated data
                this.subjectsPagination = initSubjectPagination(this.assignmentsData, this.config.pagination.itemsPerPage);
                
                // Re-render
                this.render();
                
                // Re-render popup if it's currently open
                if (this.currentPopupDate) {
                    openAssignmentsPopup(this.currentPopupDate, this.assignmentsData, this.config.referenceToday);
                }
                
                this.showTemporaryMessage('과제를 삭제했습니다');
                
            } catch (error) {
                console.error('Failed to delete assignment:', error);
                alert('과제 삭제에 실패했습니다: ' + (error.message || '알 수 없는 오류'));
            }
        }
    },

    // Edit assignment
    editAssignment(assignment) {
        this.currentEditingAssignment = assignment;
        const modal = document.getElementById('add-assignment-modal');
        const form = document.getElementById('add-assignment-form');
        const submitButton = form.querySelector('.btn-submit');
        
        // Fill form with existing data
        form.courseName.value = String(assignment.courseName || '');
        form.round.value = String(assignment.round || '');
        form.title.value = String(assignment.title || '');
        form.dueDate.value = String(assignment.dueDate || '');
        form.dueTime.value = String(assignment.dueTime || '');
        form.platform.value = String(assignment.platform || '');
        
        // Change submit button text
        submitButton.textContent = '수정';
        
        // Show modal
        modal.classList.add('show');
        
        // Focus first input
        setTimeout(() => {
            document.getElementById('course-name').focus();
        }, 100);
    },

    // Handle form submission (both add and edit)
    async handleAssignmentSubmit(event) {
        event.preventDefault();
        
        const submitButton = event.target.querySelector('.btn-submit');
        const originalText = submitButton.textContent;
        const isEditing = this.currentEditingAssignment !== undefined;
        
        try {
            // Disable submit button
            submitButton.disabled = true;
            submitButton.textContent = isEditing ? '수정 중...' : '추가 중...';
            
            // Get form data
            const formData = new FormData(event.target);
            const assignmentData = {
                courseName: formData.get('courseName').trim(),
                round: formData.get('round').trim(),
                title: formData.get('title').trim(),
                dueDate: formData.get('dueDate'),
                dueTime: formData.get('dueTime'),
                platform: formData.get('platform'),
                completed: isEditing ? this.currentEditingAssignment.completed : false
            };
            
            // Validate required fields
            if (!assignmentData.courseName || !assignmentData.round || !assignmentData.title || 
                !assignmentData.dueDate || !assignmentData.dueTime || !assignmentData.platform) {
                alert('모든 항목을 입력해주세요');
                return;
            }
            
            if (isEditing) {
                // Update assignment
                const { updateAssignment } = await import('./supabase-service.js');
                const updatedAssignment = await updateAssignment(this.currentEditingAssignment.id, assignmentData);
                
                // Update local data
                const assignmentIndex = this.assignmentsData.findIndex(a => a.id === this.currentEditingAssignment.id);
                if (assignmentIndex !== -1) {
                    this.assignmentsData[assignmentIndex] = updatedAssignment;
                }
                
                this.showTemporaryMessage('과제를 수정했습니다');
                
            } else {
                // Add new assignment
                const { addAssignment } = await import('./supabase-service.js');
                const newAssignment = await addAssignment(assignmentData);
                
                // Add to local data
                this.assignmentsData.push(newAssignment);
                
                this.showTemporaryMessage('과제를 추가했습니다');
            }
            
            // Re-initialize pagination with updated data
            this.subjectsPagination = initSubjectPagination(this.assignmentsData, this.config.pagination.itemsPerPage);
            
            // Close modal
            this.closeAddAssignmentModal();
            
            // Re-render
            this.render();
            
            // Re-render popup if it's currently open
            if (this.currentPopupDate) {
                openAssignmentsPopup(this.currentPopupDate, this.assignmentsData, this.config.referenceToday);
            }
            
        } catch (error) {
            console.error('Failed to save assignment:', error);
            
            // Provide user-friendly error message
            const userMessage = isEditing ? '과제 수정에 실패했습니다' : '과제 추가에 실패했습니다';
            alert(userMessage);
        } finally {
            // Re-enable submit button
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }
    }
};

// Export app for global access
window.app = app;

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    await app.init();
});

// Close popup when clicking outside
window.onclick = function(event) {
    const assignmentPopup = document.getElementById('assignment-popup');
    const addAssignmentModal = document.getElementById('add-assignment-modal');
    
    if (event.target === assignmentPopup) {
        app.closeAssignmentsPopup();
    } else if (event.target === addAssignmentModal) {
        app.closeAddAssignmentModal();
    }
};