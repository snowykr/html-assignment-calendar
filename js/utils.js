// Date and time utilities
// updateTime function removed - no longer needed after status-bar removal

// Assignment status calculation
export function getAssignmentStatus(assignment, referenceToday) {
    const dueDateObj = new Date(assignment.dueDate + "T" + assignment.dueTime);
    let statusClass = 'normal';
    let statusText = '';
    
    if (assignment.completed) {
        statusClass = 'completed';
        statusText = ' (提出完了)';
    } else {
        const diffTime = dueDateObj.getTime() - referenceToday.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (dueDateObj < referenceToday) {
            statusClass = 'overdue';
            statusText = ' (期限切れ)';
        } else if (dueDateObj.toDateString() === referenceToday.toDateString()) {
            statusClass = 'due-soon';
            statusText = ' (今日締切)';
        } else if (diffDays <= 3) {
            statusClass = 'due-soon';
            statusText = ` (${diffDays}日後)`;
        } else {
            statusClass = 'normal';
            statusText = ` (${diffDays}日後)`;
        }
    }
    
    return { statusClass, statusText, dueDateObj };
}

// Format date for display
export function formatDateForDisplay(dateStr) {
    return new Date(dateStr).toLocaleDateString('ja-JP', { 
        month: 'long', 
        day: 'numeric' 
    });
}

// Check if assignment is overdue
export function isAssignmentOverdue(assignment, referenceToday) {
    if (assignment.completed) return false;
    const dueDateObj = new Date(assignment.dueDate + "T" + assignment.dueTime);
    return dueDateObj < referenceToday;
}

// Sort assignments by due date
export function sortAssignmentsByDueDate(assignments, completedLast = true) {
    return assignments.sort((a, b) => {
        if (completedLast && a.completed !== b.completed) {
            return a.completed ? 1 : -1;
        }
        const dateA = new Date(a.dueDate + "T" + a.dueTime);
        const dateB = new Date(b.dueDate + "T" + b.dueTime);
        return dateA - dateB;
    });
}

// Filter assignments based on filters
export function filterAssignments(assignments, filters, referenceToday) {
    let filtered = [...assignments];
    
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
export function adjustCalendarTitleFontSize(titleElement) {
    titleElement.style.fontSize = '18px';
    
    const container = titleElement.parentElement;
    const containerWidth = container.offsetWidth;
    const buttons = container.querySelectorAll('button');
    let buttonsWidth = 0;
    buttons.forEach(btn => buttonsWidth += btn.offsetWidth + 20);
    
    const availableWidth = containerWidth - buttonsWidth - 40;
    
    let fontSize = 18;
    while (titleElement.scrollWidth > availableWidth && fontSize > 14) {
        fontSize -= 1;
        titleElement.style.fontSize = fontSize + 'px';
    }
}