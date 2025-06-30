import { adjustCalendarTitleFontSize } from './utils.js';

export function renderCalendar(viewStartDate, referenceToday, assignmentsData, filters, openAssignmentsPopup) {
    const grid = document.getElementById('calendar-grid-main');
    const headerGrid = document.getElementById('calendar-days-header');
    const monthYearTitle = document.getElementById('calendar-month-year');
    grid.innerHTML = '';
    headerGrid.innerHTML = '';

    const dayHeaders = ['月', '火', '水', '木', '金', '土', '日'];
    dayHeaders.forEach(day => {
        const dayEl = document.createElement('div');
        dayEl.classList.add('calendar-day-header');
        dayEl.textContent = day;
        headerGrid.appendChild(dayEl);
    });
    
    const startDate = new Date(viewStartDate);
    const endDateForTitle = new Date(startDate);
    endDateForTitle.setDate(startDate.getDate() + 13);

    monthYearTitle.textContent = 
        `${startDate.getFullYear()}年 ${startDate.getMonth() + 1}月 ${startDate.getDate()}日 - ${endDateForTitle.getFullYear()}年 ${endDateForTitle.getMonth() + 1}月 ${endDateForTitle.getDate()}日`;

    adjustCalendarTitleFontSize(monthYearTitle);

    const todayForHighlight = new Date(referenceToday);
    todayForHighlight.setHours(0,0,0,0);

    for (let i = 0; i < 14; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        currentDate.setHours(0,0,0,0);

        const dayCell = document.createElement('div');
        dayCell.classList.add('calendar-day');
        
        const dayNumberSpan = document.createElement('span');
        dayNumberSpan.classList.add('day-number');
        dayNumberSpan.textContent = currentDate.getDate();
        dayCell.appendChild(dayNumberSpan);

        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
        dayCell.dataset.date = dateStr;

        if (currentDate.getTime() === todayForHighlight.getTime()) {
            dayCell.classList.add('today');
        }
        
        const assignmentsOnThisDay = assignmentsData.filter(a => {
            const isOverdueForCalendar = a.completed ? false : (new Date(a.dueDate + "T" + a.dueTime) < referenceToday);
            return a.dueDate === dateStr && 
                   !(filters.hideOverdueCalendar && isOverdueForCalendar && !a.completed) && 
                   (!filters.unsubmittedOnly || !a.completed);
        });

        if (assignmentsOnThisDay.length > 0) {
            const dotContainer = document.createElement('div');
            dotContainer.classList.add('assignment-dot-container');
            
            const platformsOnDay = new Set(assignmentsOnThisDay.map(a => a.platform));
            platformsOnDay.forEach(platform => {
                const dot = document.createElement('div');
                dot.classList.add('assignment-dot', `dot-${platform}`);
                dotContainer.appendChild(dot);
            });
            dayCell.appendChild(dotContainer);
        }
        
        dayCell.onclick = () => openAssignmentsPopup(dateStr);
        grid.appendChild(dayCell);
    }
}

export function navigateWeek(viewStartDate, direction) {
    const newDate = new Date(viewStartDate);
    newDate.setDate(newDate.getDate() + (7 * direction));
    return newDate;
} 