import { getAssignmentStatus, formatDateForDisplay, sortAssignmentsByDueDate, filterAssignments } from './utils.js';

export function createAssignmentBoxElement(assignment, referenceToday, _isPopup = false) {
    // Create container for swipe functionality
    const container = document.createElement('div');
    container.classList.add('assignment-container');
    container.dataset.id = assignment.id;

    // Create the main assignment box
    const box = document.createElement('div');
    box.classList.add('assignment-box', assignment.platform);
    box.dataset.id = assignment.id;

    const header = document.createElement('div');
    header.classList.add('assignment-header');
    header.innerHTML = `<span class="course-name">${assignment.courseName}</span>`;
    
    const roundDiv = document.createElement('div');
    roundDiv.classList.add('assignment-round');
    roundDiv.textContent = assignment.round;
    
    const titleDiv = document.createElement('div');
    titleDiv.classList.add('assignment-title');
    titleDiv.textContent = assignment.title;

    const deadlineDiv = document.createElement('div');
    const { statusClass, statusText } = getAssignmentStatus(assignment, referenceToday);
    
    let deadlineText = `${formatDateForDisplay(assignment.dueDate)} ${assignment.dueTime}${statusText}`;
    
    deadlineDiv.classList.add('deadline', statusClass);
    deadlineDiv.textContent = deadlineText;

    // Add completion toggle button
    const completionToggle = document.createElement('div');
    completionToggle.classList.add('completion-toggle');
    completionToggle.innerHTML = assignment.completed ? '✅' : '⏳';
    completionToggle.title = assignment.completed ? '完了済み' : '未完了';
    completionToggle.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (window.app && window.app.toggleAssignmentCompletion) {
            const currentAssignment = window.app.assignmentsData.find(a => a.id === assignment.id);
            const currentCompleted = currentAssignment ? currentAssignment.completed : assignment.completed;
            await window.app.toggleAssignmentCompletion(assignment.id, !currentCompleted);
        }
    });

    box.appendChild(header);
    box.appendChild(roundDiv);
    box.appendChild(titleDiv);
    box.appendChild(deadlineDiv);
    box.appendChild(completionToggle);
    
    // Add completed class if assignment is completed
    if (assignment.completed) {
        box.classList.add('completed');
    }

    // Create action buttons (edit/delete)
    const actionsDiv = document.createElement('div');
    actionsDiv.classList.add('assignment-actions');
    
    const editBtn = document.createElement('button');
    editBtn.classList.add('action-btn', 'edit-btn');
    editBtn.innerHTML = '✏️';
    editBtn.setAttribute('title', '수정');
    editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (window.app && window.app.editAssignment) {
            window.app.editAssignment(assignment);
        }
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.classList.add('action-btn', 'delete-btn');
    deleteBtn.innerHTML = '🗑️';
    deleteBtn.setAttribute('title', '삭제');
    deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (window.app && window.app.deleteAssignment) {
            window.app.deleteAssignment(assignment.id);
        }
    });

    actionsDiv.appendChild(editBtn);
    actionsDiv.appendChild(deleteBtn);

    container.appendChild(box);
    container.appendChild(actionsDiv);

    // Add swipe functionality
    addSwipeHandlers(container, box, actionsDiv);
    
    return container;
}

export function renderAssignmentsList(assignmentsData, filters, referenceToday, viewStartDate) {
    const listContainer = document.getElementById('calendar-assignments-list');
    listContainer.innerHTML = '';

    const filteredAssignments = filterAssignments(assignmentsData, {
        unsubmittedOnly: filters.unsubmittedOnly,
        hideOverdue: filters.hideOverdueCalendar,
        dateRange: viewStartDate ? { start: viewStartDate, days: 14 } : null
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

    const [, month, day] = dateString.split('-');
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

function syncActionHeight(container) {
    const box = container.querySelector('.assignment-box');
    const actionsDiv = container.querySelector('.assignment-actions');
    
    if (box && actionsDiv) {
        // 렌더링 완료 후 높이 계산
        requestAnimationFrame(() => {
            const boxHeight = box.offsetHeight;
            actionsDiv.style.height = `${boxHeight}px`;
        });
    }
}

function addSwipeHandlers(container, box, actionsDiv) {
    let startX = 0;
    let startY = 0;
    let currentX = 0;
    let currentY = 0;
    let isDragging = false;
    let startTime = 0;
    let isOpen = false;

    // 높이 동기화
    syncActionHeight(container);

    // 다른 스와이프 닫기 (수정된 버전)
    const closeOtherSwipes = () => {
        const openContainers = document.querySelectorAll('.assignment-container.swiped');
        openContainers.forEach(openContainer => {
            if (openContainer !== container) {
                openContainer.classList.remove('swiped');
                const openBox = openContainer.querySelector('.assignment-box');
                const openActions = openContainer.querySelector('.assignment-actions');
                if (openBox && openActions) {
                    openBox.style.transform = 'translateX(0)';
                    openActions.style.width = '0px';
                }
            }
        });
    };

    // 터치 시작
    const handleTouchStart = (e) => {
        const touch = e.touches[0];
        startX = touch.clientX;
        startY = touch.clientY;
        currentX = startX;
        currentY = startY;
        startTime = Date.now();
        isDragging = false;
        closeOtherSwipes();
    };

    // 터치 이동 (수정된 애니메이션)
    const handleTouchMove = (e) => {
        if (!startX || !startY) return;

        const touch = e.touches[0];
        currentX = touch.clientX;
        currentY = touch.clientY;

        const deltaX = currentX - startX;
        const deltaY = currentY - startY;

        if (!isDragging && Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
            isDragging = true;
            e.preventDefault();
            
            // 드래그 중 트랜지션 비활성화
            box.style.transition = 'none';
            actionsDiv.style.transition = 'none';
        }

        if (isDragging) {
            e.preventDefault();
            if (deltaX < 0) {
                const slideDistance = Math.abs(deltaX);
                const constrainedDistance = Math.min(slideDistance, 120);
                
                // 핵심 애니메이션: 과제박스 이동 + 액션 영역 확장
                box.style.transform = `translateX(-${constrainedDistance}px)`;
                actionsDiv.style.width = `${constrainedDistance}px`;
            }
        }
    };

    // 터치 종료 (수정된 스냅 로직)
    const handleTouchEnd = (_e) => {
        if (!isDragging) {
            startX = 0;
            startY = 0;
            return;
        }

        const deltaX = currentX - startX;
        const deltaTime = Date.now() - startTime;
        const velocity = Math.abs(deltaX) / deltaTime;

        // 트랜지션 복원
        box.style.transition = 'transform 0.3s ease';
        actionsDiv.style.transition = 'width 0.3s ease';

        // 스냅 결정
        const shouldOpen = deltaX < -60 || (deltaX < -30 && velocity > 0.5);

        if (shouldOpen) {
            // 열림 상태
            box.style.transform = 'translateX(-120px)';
            actionsDiv.style.width = '120px';
            container.classList.add('swiped');
            isOpen = true;
        } else {
            // 닫힘 상태
            box.style.transform = 'translateX(0)';
            actionsDiv.style.width = '0px';
            container.classList.remove('swiped');
            isOpen = false;
        }

        isDragging = false;
        startX = 0;
        startY = 0;
    };

    // 마우스 이벤트 (동일한 로직 적용)
    const handleMouseDown = (e) => {
        startX = e.clientX;
        startY = e.clientY;
        currentX = startX;
        currentY = startY;
        startTime = Date.now();
        isDragging = false;
        closeOtherSwipes();
        
        const handleMouseMove = (e) => {
            currentX = e.clientX;
            currentY = e.clientY;
            
            const deltaX = currentX - startX;
            const deltaY = currentY - startY;
            
            if (!isDragging && Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
                isDragging = true;
                e.preventDefault();
                box.style.transition = 'none';
                actionsDiv.style.transition = 'none';
            }
            
            if (isDragging) {
                e.preventDefault();
                if (deltaX < 0) {
                    const slideDistance = Math.abs(deltaX);
                    const constrainedDistance = Math.min(slideDistance, 120);
                    box.style.transform = `translateX(-${constrainedDistance}px)`;
                    actionsDiv.style.width = `${constrainedDistance}px`;
                }
            }
        };
        
        const handleMouseUp = () => {
            if (isDragging) {
                const deltaX = currentX - startX;
                const deltaTime = Date.now() - startTime;
                const velocity = Math.abs(deltaX) / deltaTime;
                
                box.style.transition = 'transform 0.3s ease';
                actionsDiv.style.transition = 'width 0.3s ease';
                
                const shouldOpen = deltaX < -60 || (deltaX < -30 && velocity > 0.5);
                
                if (shouldOpen) {
                    box.style.transform = 'translateX(-120px)';
                    actionsDiv.style.width = '120px';
                    container.classList.add('swiped');
                    isOpen = true;
                } else {
                    box.style.transform = 'translateX(0)';
                    actionsDiv.style.width = '0px';
                    container.classList.remove('swiped');
                    isOpen = false;
                }
            }
            
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            isDragging = false;
            startX = 0;
            startY = 0;
        };
        
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    // 이벤트 리스너 등록
    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: false });
    container.addEventListener('mousedown', handleMouseDown);

    // 외부 클릭 시 닫기 (수정된 버전)
    document.addEventListener('click', (e) => {
        if (!container.contains(e.target) && isOpen) {
            box.style.transform = 'translateX(0)';
            actionsDiv.style.width = '0px';
            container.classList.remove('swiped');
            isOpen = false;
        }
    });
} 