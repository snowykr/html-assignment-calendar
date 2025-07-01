import { updateTime } from './utils.js';
import { renderCalendar, navigateWeek } from './calendar.js';
import { renderAssignmentsList, openAssignmentsPopup, closeAssignmentsPopup } from './assignments.js';
import { renderSubjectsList, renderSubjectPage, handleSubjectNav, toggleSubjectExpansion, initSubjectPagination } from './subjects.js';
import { assignmentsData } from '../data/assignments.js';

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
    assignmentsData: assignmentsData,
    subjectsPagination: {},

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

    // Initialize app
    init() {
        // Set initial date
        const today = new Date(this.config.referenceToday);
        const dayOfWeek = today.getDay();
        const diffToMonday = (dayOfWeek === 0) ? -6 : 1 - dayOfWeek;
        this.viewStartDate = new Date(today.setDate(today.getDate() + diffToMonday));
        this.viewStartDate.setHours(0,0,0,0);

        // Update time
        updateTime();
        setInterval(updateTime, 60000);

        // Initialize pagination
        this.subjectsPagination = initSubjectPagination(this.assignmentsData, this.config.pagination.itemsPerPage);

        // Initial render
        this.render();

        // Set initial filter states
        document.getElementById('filter-unsubmitted-toggle').classList.toggle('off', !this.filterUnsubmittedOnly);
        document.getElementById('filter-overdue-toggle').classList.toggle('off', !this.filterHideOverdueCalendar);
        document.getElementById('filter-overdue-subjects-toggle').classList.toggle('off', !this.filterHideOverdueSubjects);
    },

    // Render all components
    render() {
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
    }
};

// Export app for global access
window.app = app;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});

// Close popup when clicking outside
window.onclick = function(event) {
    const popup = document.getElementById('assignment-popup');
    if (event.target == popup) {
        app.closeAssignmentsPopup();
    }
}; 