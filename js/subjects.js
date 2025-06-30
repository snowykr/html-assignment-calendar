import { getAssignmentStatus, formatDateForDisplay } from './utils.js';

export function renderSubjectsList(assignmentsData, filters, referenceToday, subjectsPagination, renderSubjectPage) {
    const container = document.getElementById('subjects-list-container');
    container.innerHTML = '';

    const subjects = {};
    assignmentsData.forEach(a => {
        if (!subjects[a.courseName]) {
            subjects[a.courseName] = { assignments: [], platform: a.platform };
        }
        subjects[a.courseName].assignments.push(a);
    });

    Object.keys(subjects).forEach(subjectName => {
        const subjectData = subjects[subjectName];
        
        const subjectBox = document.createElement('div');
        subjectBox.classList.add('subject-box', subjectData.platform);
        
        subjectBox.onclick = (event) => {
            if (event.target.closest('.assignment-nav')) return;
            toggleSubjectExpansion(subjectBox, subjectName, renderSubjectPage);
        };

        const subjectHeaderContent = document.createElement('div');
        subjectHeaderContent.classList.add('subject-header-content');

        const subjectHeaderMain = document.createElement('div');
        subjectHeaderMain.classList.add('subject-header-main');

        const subjectNameDiv = document.createElement('div');
        subjectNameDiv.classList.add('subject-name-header');
        subjectNameDiv.textContent = subjectName;
        subjectHeaderMain.appendChild(subjectNameDiv);

        let uncompletedAssignments = subjectData.assignments.filter(a => !a.completed);
        if (filters.hideOverdueSubjects) {
            uncompletedAssignments = uncompletedAssignments.filter(a => {
                const dueDateObj = new Date(a.dueDate + "T" + a.dueTime);
                return dueDateObj >= referenceToday;
            });
        }

        let overallStatusText = "すべての課題完了";
        let overallStatusClass = "completed";

        if (uncompletedAssignments.length > 0) {
            uncompletedAssignments.sort((a,b) => new Date(a.dueDate + "T" + a.dueTime) - new Date(b.dueDate + "T" + b.dueTime));
            const mostUrgentAssignment = uncompletedAssignments[0];
            const dueDateObj = new Date(mostUrgentAssignment.dueDate + "T" + mostUrgentAssignment.dueTime);
            
            if (dueDateObj < referenceToday) {
                overallStatusText = `期限切れ (最も早い: ${new Date(mostUrgentAssignment.dueDate).toLocaleDateString('ja-JP', {month:'numeric', day:'numeric'})})`;
                overallStatusClass = "overdue";
            } else if (dueDateObj.toDateString() === referenceToday.toDateString()) {
                overallStatusText = `今日締切 (${mostUrgentAssignment.dueTime})`;
                overallStatusClass = "due-soon";
            } else {
                const diffTime = dueDateObj.getTime() - referenceToday.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                overallStatusText = `${diffDays}日後 (最も早い: ${new Date(mostUrgentAssignment.dueDate).toLocaleDateString('ja-JP', {month:'numeric', day:'numeric'})})`;
                overallStatusClass = (diffDays <=3) ? "due-soon" : "normal";
            }
        }
        
        const deadlineStatusDiv = document.createElement('div');
        deadlineStatusDiv.classList.add('deadline', overallStatusClass);
        deadlineStatusDiv.textContent = overallStatusText;
        subjectHeaderMain.appendChild(deadlineStatusDiv);
        
        subjectHeaderContent.appendChild(subjectHeaderMain);

        const expandIcon = document.createElement('span');
        expandIcon.classList.add('expand-icon-subject');
        expandIcon.innerHTML = '▼';
        subjectHeaderContent.appendChild(expandIcon);
        
        subjectBox.appendChild(subjectHeaderContent);

        const subjectAssignmentsDiv = document.createElement('div');
        subjectAssignmentsDiv.classList.add('subject-assignments');
        
        const innerList = document.createElement('div');
        innerList.classList.add('subject-assignments-inner-list');
        subjectAssignmentsDiv.appendChild(innerList);

        const navDiv = document.createElement('div');
        navDiv.classList.add('assignment-nav');
        navDiv.innerHTML = `
            <button class="nav-button prev" onclick="event.stopPropagation(); window.app.handleSubjectNav('${subjectName}', 'prev', this)">前へ</button>
            <span class="page-info"></span>
            <button class="nav-button next" onclick="event.stopPropagation(); window.app.handleSubjectNav('${subjectName}', 'next', this)">次へ</button>
        `;
        
        subjectAssignmentsDiv.appendChild(navDiv);
        subjectBox.appendChild(subjectAssignmentsDiv);
        container.appendChild(subjectBox);

        if (!subjectsPagination[subjectName]) {
            subjectsPagination[subjectName] = { currentPage: 0, itemsPerPage: 3 };
        }
        if (subjectBox.classList.contains('expanded')) {
            renderSubjectPage(subjectName, subjectBox);
        }
    });
}

export function renderSubjectPage(subjectName, subjectBoxElement, assignmentsData, filters, referenceToday, paginationState) {
    let subjectAssignments = assignmentsData.filter(a => a.courseName === subjectName);
    
    if (filters.hideOverdueSubjects) {
        subjectAssignments = subjectAssignments.filter(a => {
            if (a.completed) return true;
            const dueDateObj = new Date(a.dueDate + "T" + a.dueTime);
            return dueDateObj >= referenceToday;
        });
    }
    
    subjectAssignments.sort((a,b) => new Date(a.dueDate + "T" + a.dueTime) - new Date(b.dueDate + "T" + b.dueTime));

    const listElement = subjectBoxElement.querySelector('.subject-assignments-inner-list');
    const pageInfoSpan = subjectBoxElement.querySelector('.page-info');
    const prevButton = subjectBoxElement.querySelector('.nav-button.prev');
    const nextButton = subjectBoxElement.querySelector('.nav-button.next');
    const navElement = subjectBoxElement.querySelector('.assignment-nav');

    const totalItems = subjectAssignments.length;
    const totalPages = Math.ceil(totalItems / paginationState.itemsPerPage);

    listElement.innerHTML = '';

    const start = paginationState.currentPage * paginationState.itemsPerPage;
    const end = start + paginationState.itemsPerPage;
    const pageItems = subjectAssignments.slice(start, end);

    if (pageItems.length === 0 && subjectAssignments.length > 0) {
        listElement.innerHTML = `<div class="no-assignments-popup" style="padding: 10px 0;">表示する課題がありません（フィルター適用中）。</div>`;
    } else if (subjectAssignments.length === 0) {
        listElement.innerHTML = `<div class="no-assignments-popup" style="padding: 10px 0;">この科目に該当する課題はありません。</div>`;
    }

    pageItems.forEach(a => {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('subject-assignment-item');
        
        const { statusClass, statusText } = getAssignmentStatus(a, referenceToday);
        let dueDateText = `${formatDateForDisplay(a.dueDate)} ${a.dueTime}${statusText}`;
        
        itemDiv.innerHTML = `
            <div>
                <div class="subject-assignment-title">${a.title} (${a.round})</div>
                <div class="subject-assignment-due ${statusClass}">${dueDateText}</div>
            </div>
        `;
        listElement.appendChild(itemDiv);
    });
    
    if (subjectAssignments.length > 0 && totalPages > 0) {
        navElement.style.display = 'flex';
        pageInfoSpan.textContent = `${Math.min(start + 1, subjectAssignments.length)}-${Math.min(end, subjectAssignments.length)} / ${subjectAssignments.length}`;
        prevButton.disabled = paginationState.currentPage === 0;
        nextButton.disabled = paginationState.currentPage >= totalPages - 1 || end >= subjectAssignments.length;
    } else {
        navElement.style.display = 'none';
    }
}

export function handleSubjectNav(subjectName, direction, buttonElement, assignmentsData, filters, referenceToday, paginationState, renderSubjectPageFunc) {
    const subjectBoxElement = buttonElement.closest('.subject-box');
    
    let subjectAssignmentsForCount = assignmentsData.filter(a => a.courseName === subjectName);
    if (filters.hideOverdueSubjects) {
        subjectAssignmentsForCount = subjectAssignmentsForCount.filter(a => {
            if (a.completed) return true;
            const dueDateObj = new Date(a.dueDate + "T" + a.dueTime);
            return dueDateObj >= referenceToday;
        });
    }
    const totalItems = subjectAssignmentsForCount.length;
    const totalPages = Math.ceil(totalItems / paginationState.itemsPerPage);

    if (direction === 'prev' && paginationState.currentPage > 0) {
        paginationState.currentPage--;
    } else if (direction === 'next' && paginationState.currentPage < totalPages - 1) {
        paginationState.currentPage++;
    }
    renderSubjectPageFunc(subjectName, subjectBoxElement);
}

export function toggleSubjectExpansion(element, subjectName, renderSubjectPageFunc) {
    element.classList.toggle('expanded');
    if (element.classList.contains('expanded')) {
        renderSubjectPageFunc(subjectName, element);
    }
}

export function initSubjectPagination(assignmentsData) {
    const pagination = {};
    assignmentsData.forEach(a => {
        if (!pagination[a.courseName]) {
            pagination[a.courseName] = { currentPage: 0, itemsPerPage: 3 };
        }
    });
    return pagination;
} 