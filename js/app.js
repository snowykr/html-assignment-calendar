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
        
        // Reset form
        form.reset();
        
        // Set default date to today
        const today = new Date();
        const dateStr = today.toISOString().split('T')[0];
        document.getElementById('due-date').value = dateStr;
        
        // Set default time to 00:00
        document.getElementById('due-time').value = '00:00';
        
        // Show modal
        modal.classList.add('show');
        
        // Focus first input
        setTimeout(() => {
            document.getElementById('course-name').focus();
        }, 100);
    },

    closeAddAssignmentModal() {
        const modal = document.getElementById('add-assignment-modal');
        modal.classList.remove('show');
    },


    async handleAddAssignment(event) {
        event.preventDefault();
        
        const submitButton = event.target.querySelector('.btn-submit');
        const originalText = submitButton.textContent;
        
        try {
            // Disable submit button
            submitButton.disabled = true;
            submitButton.textContent = '追加中...';
            
            // Get form data
            const formData = new FormData(event.target);
            const assignmentData = {
                courseName: formData.get('courseName').trim(),
                round: formData.get('round').trim(),
                title: formData.get('title').trim(),
                dueDate: formData.get('dueDate'),
                dueTime: formData.get('dueTime'),
                platform: formData.get('platform'),
                completed: false
            };
            
            // Validate required fields
            if (!assignmentData.courseName || !assignmentData.round || !assignmentData.title || 
                !assignmentData.dueDate || !assignmentData.dueTime || !assignmentData.platform) {
                throw new Error('すべての項目を入力してください');
            }
            
            // Ensure no id field is present
            delete assignmentData.id;
            
            // Add assignment to Supabase
            const { addAssignment } = await import('./supabase-service.js');
            await addAssignment(assignmentData);
            
            // Close modal
            this.closeAddAssignmentModal();
            
            // Reload assignments
            await this.reloadAssignments();
            
            // Show success message
            this.showTemporaryMessage('課題を追加しました');
            
        } catch (error) {
            console.error('Failed to add assignment:', error);
            
            // Provide user-friendly error messages
            let userMessage = '課題の追加に失敗しました';
            
            if (error.message && error.message.includes('データベースで重複エラー')) {
                userMessage = 'データベースエラーが発生しました。しばらく待ってから再試行してください。';
            } else if (error.message && error.message.includes('すべての項目')) {
                userMessage = error.message;
            } else if (error.code === '23505') {
                userMessage = 'データの重複エラーが発生しました。管理者にお問い合わせください。';
            }
            
            alert(userMessage);
        } finally {
            // Re-enable submit button
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }
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
    
    if (event.target == assignmentPopup) {
        app.closeAssignmentsPopup();
    } else if (event.target == addAssignmentModal) {
        app.closeAddAssignmentModal();
    }
};