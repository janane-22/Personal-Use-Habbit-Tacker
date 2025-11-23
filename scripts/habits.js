/**
 * HabitFlow - Habits Management
 * Handles all habit-related functionality including creation, editing, and tracking
 */

class HabitManager {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderHabits();
    }

    bindEvents() {
        // Add habit button
        const addHabitBtn = document.getElementById('add-habit-btn');
        if (addHabitBtn) {
            addHabitBtn.addEventListener('click', () => this.showAddHabitModal());
        }

        // Create habit form
        const createHabitForm = document.getElementById('create-habit-form');
        if (createHabitForm) {
            createHabitForm.addEventListener('submit', (e) => this.handleCreateHabit(e));
        }

        // Habit modal form
        const habitForm = document.getElementById('habit-form');
        if (habitForm) {
            habitForm.addEventListener('submit', (e) => this.handleSaveHabit(e));
        }

        // Modal close buttons
        const closeHabitModal = document.getElementById('close-habit-modal');
        if (closeHabitModal) {
            closeHabitModal.addEventListener('click', () => this.hideHabitModal());
        }

        const cancelHabit = document.getElementById('cancel-habit');
        if (cancelHabit) {
            cancelHabit.addEventListener('click', () => this.hideHabitModal());
        }

        // Habit card interactions
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('habit-completion-toggle')) {
                this.handleHabitToggle(e);
            }
            
            if (e.target.closest('.habit-actions')) {
                const habitCard = e.target.closest('.habit-card');
                if (habitCard) {
                    const habitId = habitCard.dataset.habitId;
                    this.handleHabitAction(e, habitId);
                }
            }
        });

        // Streak updates
        document.addEventListener('habitCompleted', (e) => {
            this.updateStreakDisplay(e.detail.habitId);
        });
    }

    renderHabits() {
        this.renderTodayHabits();
        this.renderHabitsManagement();
        this.updateHabitStats();
    }

    renderTodayHabits() {
        const habitsList = document.getElementById('habits-list');
        if (!habitsList) return;

        habitsList.innerHTML = '';
        const habits = db.getHabits();
        const today = new Date().toISOString().split('T')[0];

        if (habits.length === 0) {
            habitsList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🎯</div>
                    <h3 class="empty-title">No habits yet</h3>
                    <p class="empty-description">Start building better habits by creating your first one!</p>
                    <button class="btn btn-primary" onclick="habitManager.showAddHabitModal()">
                        Create Your First Habit
                    </button>
                </div>
            `;
            return;
        }

        habits.forEach(habit => {
            const habitElement = this.createHabitCard(habit, today);
            habitsList.appendChild(habitElement);
        });

        // Add empty state styles if needed
        this.addEmptyStateStyles();
    }

    createHabitCard(habit, date) {
        const habitCard = document.createElement('div');
        habitCard.className = 'habit-card';
        habitCard.dataset.habitId = habit.id;

        const isCompleted = db.getCompletion(date, habit.id);
        const completionClass = isCompleted ? 'completed' : '';

        habitCard.innerHTML = `
            <div class="habit-card-header">
                <div class="habit-card-info">
                    <div class="habit-icon" style="background: ${habit.color}20; border: 2px solid ${habit.color}">
                        ${habit.icon}
                    </div>
                    <div class="habit-details">
                        <h4>${habit.name}</h4>
                        <p>${habit.description || 'No description'}</p>
                    </div>
                </div>
                <div class="habit-actions">
                    <button class="habit-completion-toggle ${completionClass}" data-habit-id="${habit.id}" title="${isCompleted ? 'Completed' : 'Mark as complete'}">
                        ${isCompleted ? '✓' : ''}
                    </button>
                    <button class="icon-btn habit-menu-btn" data-action="menu" title="More options">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="1" fill="currentColor"/>
                            <circle cx="19" cy="12" r="1" fill="currentColor"/>
                            <circle cx="5" cy="12" r="1" fill="currentColor"/>
                        </svg>
                    </button>
                </div>
            </div>
            <div class="habit-progress">
                ${this.createProgressDots(habit, date)}
            </div>
        `;

        return habitCard;
    }

    createProgressDots(habit, endDate) {
        const dots = [];
        const today = new Date(endDate);
        
        // Show last 7 days of progress
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            const isCompleted = db.getCompletion(dateStr, habit.id);
            const isToday = dateStr === new Date().toISOString().split('T')[0];
            
            dots.push(`
                <div class="progress-dot ${isCompleted ? 'completed' : ''} ${isToday ? 'today' : ''}" 
                     style="${isCompleted ? `background: ${habit.color}; border-color: ${habit.color}` : ''}"
                     title="${date.toLocaleDateString()} - ${isCompleted ? 'Completed' : 'Missed'}">
                </div>
            `);
        }
        
        return dots.join('');
    }

    renderHabitsManagement() {
        const managementList = document.getElementById('habits-management-list');
        if (!managementList) return;

        managementList.innerHTML = '';
        const habits = db.getHabits();

        habits.forEach(habit => {
            const habitElement = this.createManagementHabitCard(habit);
            managementList.appendChild(habitElement);
        });
    }

    createManagementHabitCard(habit) {
        const habitCard = document.createElement('div');
        habitCard.className = 'management-habit-card';
        habitCard.innerHTML = `
            <div class="management-habit-info">
                <div class="management-habit-icon" style="background: ${habit.color}20; border: 2px solid ${habit.color}">
                    ${habit.icon}
                </div>
                <div class="management-habit-details">
                    <h5>${habit.name}</h5>
                    <p>${habit.description || 'No description'} • Streak: ${habit.streak || 0} days</p>
                </div>
            </div>
            <div class="management-habit-actions">
                <button class="icon-btn" onclick="habitManager.editHabit('${habit.id}')" title="Edit habit">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" stroke-width="2"/>
                        <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" stroke-width="2"/>
                    </svg>
                </button>
                <button class="icon-btn" onclick="habitManager.duplicateHabit('${habit.id}')" title="Duplicate habit">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" stroke-width="2"/>
                        <path d="M5 15H4C3.46957 15 2.96086 14.7893 2.58579 14.4142C2.21071 14.0391 2 13.5304 2 13V4C2 3.46957 2.21071 2.96086 2.58579 2.58579C2.96086 2.21071 3.46957 2 4 2H13C13.5304 2 14.0391 2.21071 14.4142 2.58579C14.7893 2.96086 15 3.46957 15 4" stroke="currentColor" stroke-width="2"/>
                    </svg>
                </button>
                <button class="icon-btn text-red-500" onclick="habitManager.deleteHabit('${habit.id}')" title="Delete habit">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 6H5H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6" stroke="currentColor" stroke-width="2"/>
                        <path d="M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6" stroke="currentColor" stroke-width="2"/>
                        <path d="M10 11V17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M14 11V17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
            </div>
        `;

        return habitCard;
    }

    handleHabitToggle(event) {
        const habitId = event.target.dataset.habitId;
        const habit = db.getHabits().find(h => h.id === habitId);
        if (!habit) return;

        const today = new Date().toISOString().split('T')[0];
        const isCompleted = db.getCompletion(today, habitId);

        // Toggle completion
        const newCompletionState = !isCompleted;
        db.setCompletion(today, habitId, newCompletionState);

        // Update UI
        this.updateHabitCard(habitId, newCompletionState);
        
        // Dispatch custom event for animations
        if (newCompletionState) {
            const completionEvent = new CustomEvent('habitCompleted', {
                detail: { habitId, habit }
            });
            document.dispatchEvent(completionEvent);
        }

        // Update streaks and stats
        this.updateHabitStats();
        db.checkAchievements();

        // Show success feedback
        if (newCompletionState) {
            animationManager.animateNotification(`Great job completing "${habit.name}"!`, 'success');
        }
    }

    updateHabitCard(habitId, isCompleted) {
        const habitCard = document.querySelector(`[data-habit-id="${habitId}"]`);
        if (!habitCard) return;

        const toggle = habitCard.querySelector('.habit-completion-toggle');
        const progressDots = habitCard.querySelector('.habit-progress');
        const today = new Date().toISOString().split('T')[0];

        if (toggle) {
            if (isCompleted) {
                toggle.classList.add('completed');
                toggle.innerHTML = '✓';
                toggle.title = 'Completed';
            } else {
                toggle.classList.remove('completed');
                toggle.innerHTML = '';
                toggle.title = 'Mark as complete';
            }
        }

        // Update progress dots
        const habit = db.getHabits().find(h => h.id === habitId);
        if (progressDots && habit) {
            progressDots.innerHTML = this.createProgressDots(habit, today);
        }
    }

    showAddHabitModal() {
        const modal = document.getElementById('habit-modal');
        const form = document.getElementById('habit-form');
        const title = document.getElementById('habit-modal-title');

        if (title) title.textContent = 'Add New Habit';
        if (form) {
            form.reset();
            form.dataset.mode = 'create';
            form.dataset.habitId = '';
        }

        if (modal) {
            modal.classList.add('active');
        }
    }

    editHabit(habitId) {
        const habit = db.getHabits().find(h => h.id === habitId);
        if (!habit) return;

        const modal = document.getElementById('habit-modal');
        const form = document.getElementById('habit-form');
        const title = document.getElementById('habit-modal-title');
        const nameInput = document.getElementById('modal-habit-name');
        const descriptionInput = document.getElementById('modal-habit-description');

        if (title) title.textContent = 'Edit Habit';
        if (nameInput) nameInput.value = habit.name;
        if (descriptionInput) descriptionInput.value = habit.description || '';
        if (form) {
            form.dataset.mode = 'edit';
            form.dataset.habitId = habitId;
        }

        if (modal) {
            modal.classList.add('active');
        }
    }

    hideHabitModal() {
        const modal = document.getElementById('habit-modal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    handleCreateHabit(event) {
        event.preventDefault();
        
        const form = event.target;
        const formData = new FormData(form);
        
        const habitData = {
            name: formData.get('name'),
            description: formData.get('description'),
            icon: formData.get('icon'),
            color: formData.get('color'),
            frequency: formData.get('frequency')
        };

        // Validate data
        if (!this.validateHabitData(habitData)) {
            return;
        }

        // Create habit
        const newHabit = db.addHabit(habitData);
        if (newHabit) {
            this.renderHabits();
            this.hideHabitModal();
            animationManager.animateNotification(`Habit "${habitData.name}" created successfully!`, 'success');
            
            // Trigger animations
            setTimeout(() => {
                const habitCard = document.querySelector(`[data-habit-id="${newHabit.id}"]`);
                if (habitCard) {
                    habitCard.classList.add('animate-bounce-in');
                }
            }, 100);
        }
    }

    handleSaveHabit(event) {
        event.preventDefault();
        
        const form = event.target;
        const formData = new FormData(form);
        const mode = form.dataset.mode;
        const habitId = form.dataset.habitId;
        
        const habitData = {
            name: formData.get('name'),
            description: formData.get('description')
        };

        // Validate data
        if (!this.validateHabitData(habitData)) {
            return;
        }

        if (mode === 'edit' && habitId) {
            // Update existing habit
            const success = db.updateHabit(habitId, habitData);
            if (success) {
                this.renderHabits();
                this.hideHabitModal();
                animationManager.animateNotification(`Habit "${habitData.name}" updated successfully!`, 'success');
            }
        } else {
            // Create new habit
            const newHabit = db.addHabit(habitData);
            if (newHabit) {
                this.renderHabits();
                this.hideHabitModal();
                animationManager.animateNotification(`Habit "${habitData.name}" created successfully!`, 'success');
            }
        }
    }

    validateHabitData(habitData) {
        if (!habitData.name || habitData.name.trim().length === 0) {
            animationManager.animateNotification('Please enter a habit name', 'error');
            return false;
        }

        if (habitData.name.length > 50) {
            animationManager.animateNotification('Habit name must be 50 characters or less', 'error');
            return false;
        }

        if (habitData.description && habitData.description.length > 200) {
            animationManager.animateNotification('Description must be 200 characters or less', 'error');
            return false;
        }

        return true;
    }

    duplicateHabit(habitId) {
        const habit = db.getHabits().find(h => h.id === habitId);
        if (!habit) return;

        const duplicatedHabit = {
            ...habit,
            name: `${habit.name} (Copy)`,
            streak: 0,
            totalCompletions: 0
        };
        delete duplicatedHabit.id;

        const newHabit = db.addHabit(duplicatedHabit);
        if (newHabit) {
            this.renderHabits();
            animationManager.animateNotification(`Habit "${duplicatedHabit.name}" duplicated successfully!`, 'success');
        }
    }

    deleteHabit(habitId) {
        const habit = db.getHabits().find(h => h.id === habitId);
        if (!habit) return;

        // Confirm deletion
        const confirmed = confirm(`Are you sure you want to delete "${habit.name}"? This action cannot be undone.`);
        if (!confirmed) return;

        const success = db.deleteHabit(habitId);
        if (success) {
            this.renderHabits();
            animationManager.animateNotification(`Habit "${habit.name}" deleted successfully`, 'success');
        }
    }

    updateHabitStats() {
        // Update current streak
        const habits = db.getHabits();
        let totalStreak = 0;
        let longestStreak = 0;

        habits.forEach(habit => {
            totalStreak = Math.max(totalStreak, habit.streak || 0);
            longestStreak = Math.max(longestStreak, habit.streak || 0);
        });

        // Update UI elements
        const currentStreakElement = document.getElementById('current-streak');
        if (currentStreakElement) {
            currentStreakElement.textContent = totalStreak;
            animationManager.animateStreakUpdate(totalStreak);
        }

        // Update streak motivation
        const streakMotivation = document.getElementById('streak-motivation');
        if (streakMotivation) {
            let motivation = '';
            if (totalStreak === 0) {
                motivation = 'Start your first streak!';
            } else if (totalStreak === 1) {
                motivation = 'Great start! Keep it up!';
            } else if (totalStreak < 7) {
                motivation = `You're on fire! ${7 - totalStreak} more days to reach a week!`;
            } else if (totalStreak < 30) {
                motivation = `Amazing streak! ${30 - totalStreak} more days to reach a month!`;
            } else {
                motivation = `Incredible! ${365 - totalStreak} more days to reach a year!`;
            }
            streakMotivation.textContent = motivation;
        }

        // Update daily progress ring
        this.updateDailyProgressRing();
    }

    updateDailyProgressRing() {
        const todayCompletions = db.getTodayCompletions();
        const completedCount = Object.values(todayCompletions).filter(Boolean).length;
        const totalHabits = db.getHabits().length;
        const percentage = totalHabits > 0 ? Math.round((completedCount / totalHabits) * 100) : 0;

        const progressRing = document.querySelector('.progress-ring-fill');
        const progressPercentage = document.querySelector('.progress-percentage');
        const dailyProgress = document.getElementById('daily-progress');

        if (progressRing && progressPercentage) {
            const degrees = (percentage / 100) * 360;
            progressRing.style.background = `conic-gradient(var(--habit-gold) 0deg, var(--habit-gold) ${degrees}deg, transparent ${degrees}deg, transparent 360deg)`;
            progressPercentage.textContent = `${percentage}%`;
        }

        if (dailyProgress) {
            dailyProgress.textContent = `${percentage}%`;
        }
    }

    updateStreakDisplay(habitId) {
        // This method is called when a habit completion is updated
        // It will refresh the overall stats display
        setTimeout(() => {
            this.updateHabitStats();
            db.checkAchievements();
        }, 100);
    }

    addEmptyStateStyles() {
        if (document.querySelector('#empty-state-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'empty-state-styles';
        styles.textContent = `
            .empty-state {
                text-align: center;
                padding: 3rem 2rem;
                background: var(--bg-surface);
                border: 1px solid var(--border-default);
                border-radius: var(--radius-lg);
            }
            .empty-icon {
                font-size: 3rem;
                margin-bottom: 1rem;
                opacity: 0.5;
            }
            .empty-title {
                color: var(--text-primary);
                margin-bottom: 0.5rem;
            }
            .empty-description {
                color: var(--text-secondary);
                margin-bottom: 2rem;
                max-width: 400px;
                margin-left: auto;
                margin-right: auto;
            }
        `;
        document.head.appendChild(styles);
    }

    // Search functionality
    searchHabits(query) {
        const habits = db.getHabits();
        const lowercaseQuery = query.toLowerCase();
        
        return habits.filter(habit => 
            habit.name.toLowerCase().includes(lowercaseQuery) ||
            (habit.description && habit.description.toLowerCase().includes(lowercaseQuery))
        );
    }

    // Filter functionality
    filterHabits(filterType) {
        const habits = db.getHabits();
        
        switch (filterType) {
            case 'active':
                return habits.filter(habit => (habit.streak || 0) > 0);
            case 'inactive':
                return habits.filter(habit => !habit.streak || habit.streak === 0);
            case 'longest-streak':
                return [...habits].sort((a, b) => (b.streak || 0) - (a.streak || 0));
            case 'recently-created':
                return [...habits].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            default:
                return habits;
        }
    }

    // Export habit data
    exportHabitsData() {
        const habits = db.getHabits();
        const data = {
            habits,
            exportDate: new Date().toISOString(),
            totalHabits: habits.length
        };
        
        return JSON.stringify(data, null, 2);
    }
}

// Create global habit manager
const habitManager = new HabitManager();