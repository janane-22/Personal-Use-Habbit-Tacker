/**
 * HabitFlow - Calendar Management
 * Handles 365-day calendar view and weekly calendar functionality
 */

class CalendarManager {
    constructor() {
        this.currentDate = new Date();
        this.currentYear = this.currentDate.getFullYear();
        this.currentMonth = this.currentDate.getMonth();
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderWeeklyCalendar();
        this.renderYearCalendar();
    }

    bindEvents() {
        // Year navigation
        const prevYearBtn = document.getElementById('prev-year');
        const nextYearBtn = document.getElementById('next-year');
        
        if (prevYearBtn) {
            prevYearBtn.addEventListener('click', () => this.navigateYear(-1));
        }
        
        if (nextYearBtn) {
            nextYearBtn.addEventListener('click', () => this.navigateYear(1));
        }

        // Calendar day clicks
        document.addEventListener('click', (event) => {
            if (event.target.classList.contains('calendar-day-cell') || 
                event.target.classList.contains('calendar-day')) {
                this.handleDayClick(event);
            }
        });

        // Week navigation
        document.addEventListener('click', (event) => {
            if (event.target.classList.contains('calendar-day')) {
                this.handleWeekDayClick(event);
            }
        });
    }

    renderWeeklyCalendar() {
        const calendarContainer = document.getElementById('weekly-calendar');
        if (!calendarContainer) return;

        calendarContainer.innerHTML = '';
        const today = new Date();
        const habits = db.getHabits();

        // Render last 7 days
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            const dayElement = this.createWeeklyDayElement(date, dateStr, habits);
            calendarContainer.appendChild(dayElement);
        }

        // Update progress indicator
        this.updateWeeklyProgress();
    }

    createWeeklyDayElement(date, dateStr, habits) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.dataset.date = dateStr;
        
        if (this.isToday(date)) {
            dayElement.classList.add('today');
        }

        const dayCompletions = db.getCompletion(dateStr);
        const completedCount = Object.values(dayCompletions).filter(Boolean).length;
        const totalHabits = habits.length;
        const completionRate = totalHabits > 0 ? (completedCount / totalHabits) * 100 : 0;

        dayElement.innerHTML = `
            <div class="calendar-day-number">${date.getDate()}</div>
            <div class="calendar-day-name">${date.toLocaleDateString('en', { weekday: 'short' })}</div>
            <div class="calendar-day-status" style="background: ${completionRate === 100 ? 'var(--success)' : completionRate > 0 ? 'var(--habit-gold)' : 'var(--border-default)'}"></div>
        `;

        // Add completion percentage tooltip
        if (totalHabits > 0) {
            dayElement.title = `${completedCount}/${totalHabits} habits completed (${Math.round(completionRate)}%)`;
        }

        return dayElement;
    }

    renderYearCalendar() {
        const calendarContainer = document.getElementById('year-calendar');
        if (!calendarContainer) return;

        calendarContainer.innerHTML = '';
        const yearDisplay = document.getElementById('year-display');
        
        if (yearDisplay) {
            yearDisplay.textContent = this.currentYear;
        }

        // Create month grids
        for (let month = 0; month < 12; month++) {
            const monthElement = this.createMonthElement(month);
            calendarContainer.appendChild(monthElement);
        }
    }

    createMonthElement(month) {
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        const monthDiv = document.createElement('div');
        monthDiv.className = 'calendar-month';

        const headerDiv = document.createElement('div');
        headerDiv.className = 'month-header';
        headerDiv.textContent = monthNames[month];

        const gridDiv = document.createElement('div');
        gridDiv.className = 'month-grid';

        // Get first day of month and number of days
        const firstDay = new Date(this.currentYear, month, 1).getDay();
        const daysInMonth = new Date(this.currentYear, month + 1, 0).getDate();

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDay; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'calendar-day-cell empty';
            gridDiv.appendChild(emptyCell);
        }

        // Add day cells
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${this.currentYear}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayCell = this.createYearDayCell(day, dateStr);
            gridDiv.appendChild(dayCell);
        }

        monthDiv.appendChild(headerDiv);
        monthDiv.appendChild(gridDiv);

        return monthDiv;
    }

    createYearDayCell(day, dateStr) {
        const dayCell = document.createElement('div');
        dayCell.className = 'calendar-day-cell';
        dayCell.dataset.date = dateStr;
        dayCell.title = new Date(dateStr).toLocaleDateString();

        // Check if it's today
        if (this.isToday(dateStr)) {
            dayCell.classList.add('today');
        }

        // Check completion status
        const dayCompletions = db.getCompletion(dateStr);
        const completedCount = Object.values(dayCompletions).filter(Boolean).length;
        const totalHabits = db.getHabits().length;

        if (completedCount > 0) {
            dayCell.classList.add('completed');
            
            // Set color based on completion percentage
            const completionRate = totalHabits > 0 ? (completedCount / totalHabits) : 0;
            if (completionRate === 1) {
                dayCell.style.background = 'var(--habit-emerald)';
            } else if (completionRate >= 0.5) {
                dayCell.style.background = 'var(--habit-gold)';
            } else {
                dayCell.style.background = 'var(--habit-sky)';
            }
        }

        return dayCell;
    }

    handleDayClick(event) {
        const dateStr = event.target.dataset.date;
        if (!dateStr) return;

        // Show day details
        this.showDayDetails(dateStr);
    }

    handleWeekDayClick(event) {
        const dateStr = event.target.closest('.calendar-day').dataset.date;
        if (!dateStr) return;

        // Navigate to that date
        this.navigateToDate(dateStr);
    }

    showDayDetails(dateStr) {
        const date = new Date(dateStr);
        const dayCompletions = db.getCompletion(dateStr);
        const habits = db.getHabits();
        
        // Calculate completion stats
        const completedHabits = habits.filter(habit => dayCompletions[habit.id]);
        const totalHabits = habits.length;
        const completionRate = totalHabits > 0 ? (completedHabits.length / totalHabits) * 100 : 0;

        // Create modal or show details
        const modal = this.createDayDetailsModal(date, completedHabits, totalHabits, completionRate);
        document.body.appendChild(modal);

        // Show modal with animation
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
    }

    createDayDetailsModal(date, completedHabits, totalHabits, completionRate) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${date.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    })}</h3>
                    <button class="icon-btn close-btn" onclick="this.closest('.modal').remove()">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6 6L18 18M6 18L18 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>
                <div class="day-details-content">
                    <div class="day-progress">
                        <div class="progress-circle">
                            <span class="progress-text">${Math.round(completionRate)}%</span>
                        </div>
                        <p class="progress-description">
                            ${completedHabits.length} of ${totalHabits} habits completed
                        </p>
                    </div>
                    <div class="completed-habits">
                        <h4>Completed Habits</h4>
                        ${completedHabits.length > 0 ? 
                            completedHabits.map(habit => `
                                <div class="completed-habit-item">
                                    <span class="habit-icon">${habit.icon}</span>
                                    <span class="habit-name">${habit.name}</span>
                                </div>
                            `).join('') : 
                            '<p class="no-habits">No habits completed on this day</p>'
                        }
                    </div>
                    <div class="day-actions">
                        <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Close</button>
                    </div>
                </div>
            </div>
        `;

        // Add styles for day details
        const styles = `
            <style>
                .day-details-content {
                    text-align: center;
                }
                .day-progress {
                    margin: 2rem 0;
                }
                .progress-circle {
                    width: 100px;
                    height: 100px;
                    border-radius: 50%;
                    border: 8px solid var(--border-default);
                    border-top-color: var(--habit-emerald);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 1rem;
                    animation: progressCircleFill 1s ease-out;
                }
                .progress-text {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: var(--text-primary);
                }
                .progress-description {
                    color: var(--text-secondary);
                    margin: 0;
                }
                .completed-habits {
                    margin: 2rem 0;
                    text-align: left;
                }
                .completed-habits h4 {
                    color: var(--text-primary);
                    margin-bottom: 1rem;
                }
                .completed-habit-item {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.5rem;
                    background: var(--bg-surface-2);
                    border-radius: 0.5rem;
                    margin-bottom: 0.5rem;
                }
                .habit-icon {
                    font-size: 1.25rem;
                }
                .habit-name {
                    color: var(--text-primary);
                }
                .no-habits {
                    color: var(--text-secondary);
                    text-align: center;
                    font-style: italic;
                }
                @keyframes progressCircleFill {
                    from { transform: scale(0); }
                    to { transform: scale(1); }
                }
            </style>
        `;

        modal.insertAdjacentHTML('afterbegin', styles);
        return modal;
    }

    navigateYear(direction) {
        this.currentYear += direction;
        this.renderYearCalendar();
        
        // Animate the navigation
        const yearDisplay = document.getElementById('year-display');
        if (yearDisplay) {
            yearDisplay.style.animation = 'bounceIn 0.3s ease-out';
            setTimeout(() => {
                yearDisplay.style.animation = '';
            }, 300);
        }
    }

    navigateToDate(dateStr) {
        const date = new Date(dateStr);
        this.currentYear = date.getFullYear();
        this.currentMonth = date.getMonth();
        
        this.renderYearCalendar();
        
        // Scroll to the month containing the date
        setTimeout(() => {
            const monthIndex = date.getMonth();
            const monthElements = document.querySelectorAll('.calendar-month');
            if (monthElements[monthIndex]) {
                monthElements[monthIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 100);
    }

    updateWeeklyProgress() {
        const today = new Date();
        const weeklyData = [];
        let totalCompletions = 0;
        let totalPossible = 0;

        // Calculate weekly progress
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            const dayCompletions = db.getCompletion(dateStr);
            const completedCount = Object.values(dayCompletions).filter(Boolean).length;
            const totalHabits = db.getHabits().length;
            
            weeklyData.push({
                date: dateStr,
                completed: completedCount,
                total: totalHabits
            });
            
            totalCompletions += completedCount;
            totalPossible += totalHabits;
        }

        const weeklyProgress = totalPossible > 0 ? (totalCompletions / totalPossible) * 100 : 0;
        
        // Update display elements
        const progressRing = document.querySelector('.progress-ring-fill');
        const progressPercentage = document.querySelector('.progress-percentage');
        const dailyProgress = document.querySelector('.date-progress');
        
        if (progressRing && progressPercentage) {
            const degrees = (weeklyProgress / 100) * 360;
            progressRing.style.background = `conic-gradient(var(--habit-gold) 0deg, var(--habit-gold) ${degrees}deg, transparent ${degrees}deg, transparent 360deg)`;
            progressPercentage.textContent = `${Math.round(weeklyProgress)}%`;
        }
        
        if (dailyProgress) {
            const todayStr = today.toISOString().split('T')[0];
            const todayCompletions = db.getTodayCompletions();
            const todayCompleted = Object.values(todayCompletions).filter(Boolean).length;
            const todayTotal = db.getHabits().length;
            const todayPercentage = todayTotal > 0 ? Math.round((todayCompleted / todayTotal) * 100) : 0;
            dailyProgress.textContent = `${todayPercentage}%`;
        }
    }

    isToday(date) {
        if (typeof date === 'string') {
            return date === new Date().toISOString().split('T')[0];
        }
        return date.toDateString() === new Date().toDateString();
    }

    // Utility methods for calendar calculations
    getDaysInMonth(year, month) {
        return new Date(year, month + 1, 0).getDate();
    }

    getFirstDayOfMonth(year, month) {
        return new Date(year, month, 1).getDay();
    }

    // Navigation helper for moving between months/years
    navigateToMonth(month, year) {
        this.currentMonth = month;
        this.currentYear = year;
        this.renderYearCalendar();
    }

    // Get calendar statistics
    getCalendarStats() {
        const habits = db.getHabits();
        const today = new Date();
        let bestStreak = 0;
        let currentStreak = 0;
        let totalCompletions = 0;
        let perfectDays = 0;
        let activeDays = 0;

        // Check last 365 days
        for (let i = 0; i < 365; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            const dayCompletions = db.getCompletion(dateStr);
            const completedCount = Object.values(dayCompletions).filter(Boolean).length;
            
            if (completedCount > 0) {
                activeDays++;
                totalCompletions += completedCount;
                
                if (completedCount === habits.length) {
                    perfectDays++;
                }
                
                // Calculate streak
                if (i === 0 || completedCount > 0) {
                    currentStreak = i === 0 ? currentStreak : currentStreak + 1;
                    bestStreak = Math.max(bestStreak, currentStreak);
                } else {
                    currentStreak = 0;
                }
            } else if (i > 0) {
                currentStreak = 0;
            }
        }

        return {
            totalCompletions,
            bestStreak,
            perfectDays,
            activeDays,
            totalDays: 365,
            completionRate: habits.length > 0 ? (totalCompletions / (activeDays * habits.length)) * 100 : 0
        };
    }

    // Export calendar data
    exportCalendarData() {
        const stats = this.getCalendarStats();
        const habits = db.getHabits();
        const data = {
            habits,
            stats,
            exportDate: new Date().toISOString()
        };
        
        return JSON.stringify(data, null, 2);
    }

    // Search functionality
    searchCalendar(query) {
        const results = [];
        const habits = db.getHabits();
        const lowercaseQuery = query.toLowerCase();

        // Search through habits for matching names/descriptions
        habits.forEach(habit => {
            if (habit.name.toLowerCase().includes(lowercaseQuery) ||
                (habit.description && habit.description.toLowerCase().includes(lowercaseQuery))) {
                results.push({
                    type: 'habit',
                    data: habit
                });
            }
        });

        return results;
    }

    // Highlight search results
    highlightSearchResults(results) {
        // Remove existing highlights
        document.querySelectorAll('.search-highlight').forEach(el => {
            el.classList.remove('search-highlight');
        });

        // Add highlights to matching elements
        results.forEach(result => {
            if (result.type === 'habit') {
                const habitElement = document.querySelector(`[data-habit-id="${result.data.id}"]`);
                if (habitElement) {
                    habitElement.classList.add('search-highlight');
                }
            }
        });
    }
}

// Create global calendar manager
const calendarManager = new CalendarManager();