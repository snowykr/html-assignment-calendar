import { renderCalendar, navigateWeek } from './calendar.js';
import { renderAssignmentsList, openAssignmentsPopup, closeAssignmentsPopup } from './assignments.js';
import { renderSubjectsList, renderSubjectPage, handleSubjectNav, toggleSubjectExpansion, initSubjectPagination } from './subjects.js';
import { getAllAssignments, initSupabase, updateAssignmentCompletion } from './supabase-service.js';
import { assignmentsData as fallbackData } from '../data/assignments.js';

const app = {
    // Configuration
    config: {
        referenceToday: new Date(2025, 5, 3),
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
    isOnlineMode: false,
    dataSource: 'none', // 'supabase', 'fallback', 'none'
    loadingMessage: '데이터를 불러오는 중...',

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
            const diffToMonday = (dayOfWeek === 0) ? -6 : 1 - dayOfWeek;
            this.viewStartDate = new Date(today.setDate(today.getDate() + diffToMonday));
            this.viewStartDate.setHours(0,0,0,0);

            // Show initial loading message
            this.render();

            // Try to load data from Supabase
            await this.loadDataWithFallback();

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
            this.dataSource = 'none';
            this.render();
        }
    },

    // Load data with fallback system
    async loadDataWithFallback() {
        try {
            // Try Supabase first
            this.loadingMessage = 'Supabase에 연결하는 중...';
            this.render();
            
            await initSupabase();
            
            this.loadingMessage = '데이터를 가져오는 중...';
            this.render();
            
            this.assignmentsData = await getAllAssignments();
            this.isOnlineMode = true;
            this.dataSource = 'supabase';
            
        } catch (error) {
            this.loadingMessage = '로컬 데이터로 전환하는 중...';
            this.render();
            
            // Fallback to local data
            this.assignmentsData = [...fallbackData];
            this.isOnlineMode = false;
            this.dataSource = 'fallback';
            
            // Show user notification about offline mode
            this.showOfflineModeNotification();
        }
    },

    // Show offline mode notification
    showOfflineModeNotification() {
        // Create a temporary notification
        const notification = document.createElement('div');
        notification.className = 'offline-notification';
        notification.innerHTML = `
            <div class="offline-message">
                📱 오프라인 모드: 로컬 데이터를 사용합니다
                <button onclick="this.parentElement.parentElement.remove()">✕</button>
            </div>
        `;
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
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
            this.config.referenceToday
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
        openAssignmentsPopup(dateStr, this.assignmentsData, this.config.referenceToday);
    },

    closeAssignmentsPopup() {
        closeAssignmentsPopup();
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
            this.assignmentsData = await getAllAssignments();
            
            // Re-initialize pagination with new data
            this.subjectsPagination = initSubjectPagination(this.assignmentsData, this.config.pagination.itemsPerPage);
            
            this.render();
            this.isLoading = false;
        } catch (error) {
            console.error('Failed to reload assignments:', error);
            this.isLoading = false;
        }
    },

    // Toggle assignment completion status
    async toggleAssignmentCompletion(assignmentId, completed) {
        try {
            if (this.isOnlineMode && this.dataSource === 'supabase') {
                // Online mode: Update in Supabase
                const updatedAssignment = await updateAssignmentCompletion(assignmentId, completed);
                
                // Update local data
                const assignmentIndex = this.assignmentsData.findIndex(a => a.id === assignmentId);
                if (assignmentIndex !== -1) {
                    this.assignmentsData[assignmentIndex] = updatedAssignment;
                }
            } else {
                // Offline mode: Update only locally
                const assignmentIndex = this.assignmentsData.findIndex(a => a.id === assignmentId);
                if (assignmentIndex !== -1) {
                    this.assignmentsData[assignmentIndex].completed = completed;
                }
                
                // Show offline mode notification
                this.showTemporaryMessage('📱 오프라인 모드: 로컬에서만 변경되었습니다', 2000);
            }
            
            // Re-render
            this.render();
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
    const popup = document.getElementById('assignment-popup');
    if (event.target == popup) {
        app.closeAssignmentsPopup();
    }
};