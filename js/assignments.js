import { getAssignmentStatus, formatDateForDisplay, sortAssignmentsByDueDate, filterAssignments } from './utils.js';

export function createAssignmentBoxElement(assignment, referenceToday, isPopup = false) {
    const box = document.createElement('div');
    box.classList.add('assignment-box', assignment.platform);
    box.dataset.id = assignment.id;

    const header = document.createElement('div');
    header.classList.add('assignment-header');
    header.innerHTML = `<span class="course-name">${assignment.courseName}</span><span class="assignment-round">${assignment.round}</span>`;
    
    const titleDiv = document.createElement('div');
    titleDiv.classList.add('assignment-title');
    titleDiv.textContent = assignment.title;

    const deadlineDiv = document.createElement('div');
    const { statusClass, statusText } = getAssignmentStatus(assignment, referenceToday);
    
    let deadlineText = `${formatDateForDisplay(assignment.dueDate)} ${assignment.dueTime}${statusText}`;
    
    deadlineDiv.classList.add('deadline', statusClass);
    deadlineDiv.textContent = deadlineText;

    box.appendChild(header);
    box.appendChild(titleDiv);
    box.appendChild(deadlineDiv);
    return box;
}

export function renderAssignmentsList(assignmentsData, filters, referenceToday) {
    const listContainer = document.getElementById('calendar-assignments-list');
    listContainer.innerHTML = '';

    const filteredAssignments = filterAssignments(assignmentsData, {
        unsubmittedOnly: filters.unsubmittedOnly,
        hideOverdue: filters.hideOverdueCalendar
    }, referenceToday);
    
    const sortedAssignments = sortAssignmentsByDueDate(filteredAssignments);

    sortedAssignments.forEach(a => {
        const assignmentBoxElement = createAssignmentBoxElement(a, referenceToday, false);
        listContainer.appendChild(assignmentBoxElement);
    });
}

export function openAssignmentsPopup(dateString, assignmentsData, referenceToday) {
    const popup = document.getElementById('assignment-popup');
    const popupDateTitle = document.getElementById('popup-date-title');
    const popupListDiv = document.getElementById('popup-assignment-list');

    const [year, month, day] = dateString.split('-');
    popupDateTitle.textContent = `課題: ${parseInt(month)}月 ${parseInt(day)}日`;
    popupListDiv.innerHTML = '';

    const assignmentsForDate = assignmentsData
        .filter(a => a.dueDate === dateString)
        .sort((a,b) => new Date(a.dueDate + "T" + a.dueTime) - new Date(b.dueDate + "T" + b.dueTime));

    if (assignmentsForDate.length > 0) {
        assignmentsForDate.forEach(a => {
            const assignmentBoxElement = createAssignmentBoxElement(a, referenceToday, true);
            popupListDiv.appendChild(assignmentBoxElement);
        });
    } else {
        const noAssignmentsItem = document.createElement('div');
        noAssignmentsItem.classList.add('no-assignments-popup');
        noAssignmentsItem.textContent = 'この日付に予定された課題はありません。';
        popupListDiv.appendChild(noAssignmentsItem);
    }
    popup.classList.add('show');
}

export function closeAssignmentsPopup() {
    document.getElementById('assignment-popup').classList.remove('show');
} 