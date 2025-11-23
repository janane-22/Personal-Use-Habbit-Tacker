/**
 * HabitFlow - Database Management
 * Handles all local storage operations for offline functionality
 */

class HabitFlowDB {
    constructor() {
        this.dbName = 'HabitFlowDB';
        this.version = 1;
        this.init();
    }

    init() {
        // Create database structure if it doesn't exist
        const defaultData = {
            user: null,
            habits: [],
            completions: {},
            notes: {},
            settings: {
                theme: 'dark',
                accentColor: 'blue',
                notifications: {
                    enabled: true,
                    time: '09:00'
                },
                streak: 0,
                level: 1,
                xp: 0,
                achievements: []
            },
            stats: {
                totalHabits: 0,
                totalCompletions: 0,
                longestStreak: 0,
                weeklyData: [],
                monthlyData: []
            }
        };

        // Initialize with default data if database doesn't exist
        if (!localStorage.getItem(this.dbName)) {
            this.saveData(defaultData);
        }
    }

    // Generic data operations
    saveData(data) {
        try {
            localStorage.setItem(this.dbName, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Failed to save data:', error);
            return false;
        }
    }

    loadData() {
        try {
            const data = localStorage.getItem(this.dbName);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Failed to load data:', error);
            return null;
        }
    }

    clearData() {
        try {
            localStorage.removeItem(this.dbName);
            this.init();
            return true;
        } catch (error) {
            console.error('Failed to clear data:', error);
            return false;
        }
    }

    // User operations
    getUser() {
        const data = this.loadData();
        return data?.user || null;
    }

    setUser(user) {
        const data = this.loadData() || {};
        data.user = user;
        return this.saveData(data);
    }

    // Habits operations
    getHabits() {
        const data = this.loadData();
        return data?.habits || [];
    }

    setHabits(habits) {
        const data = this.loadData() || {};
        data.habits = habits;
        data.stats.totalHabits = habits.length;
        return this.saveData(data);
    }

    addHabit(habit) {
        const data = this.loadData() || {};
        if (!data.habits) data.habits = [];
        
        const newHabit = {
            id: this.generateId(),
            ...habit,
            createdAt: new Date().toISOString(),
            streak: 0,
            totalCompletions: 0
        };
        
        data.habits.push(newHabit);
        data.stats.totalHabits = data.habits.length;
        return this.saveData(data) ? newHabit : null;
    }

    updateHabit(id, updates) {
        const data = this.loadData() || {};
        if (!data.habits) return false;
        
        const habitIndex = data.habits.findIndex(h => h.id === id);
        if (habitIndex === -1) return false;
        
        data.habits[habitIndex] = { ...data.habits[habitIndex], ...updates };
        return this.saveData(data);
    }

    deleteHabit(id) {
        const data = this.loadData() || {};
        if (!data.habits) return false;
        
        data.habits = data.habits.filter(h => h.id !== id);
        
        // Remove habit completions
        if (data.completions) {
            Object.keys(data.completions).forEach(date => {
                if (data.completions[date]) {
                    delete data.completions[date][id];
                }
            });
        }
        
        data.stats.totalHabits = data.habits.length;
        return this.saveData(data);
    }

    // Completions operations
    getCompletion(date, habitId = null) {
        const data = this.loadData();
        if (!data?.completions) return {};
        
        if (habitId) {
            return data.completions[date]?.[habitId] || false;
        }
        
        return data.completions[date] || {};
    }

    setCompletion(date, habitId, completed) {
        const data = this.loadData() || {};
        if (!data.completions) data.completions = {};
        if (!data.completions[date]) data.completions[date] = {};
        
        data.completions[date][habitId] = completed;
        
        // Update habit stats
        this.updateHabitCompletionStats(habitId, date, completed);
        
        // Update global stats
        this.updateGlobalStats();
        
        return this.saveData(data);
    }

    updateHabitCompletionStats(habitId, date, completed) {
        const data = this.loadData();
        const habit = data?.habits?.find(h => h.id === habitId);
        if (!habit) return;
        
        const today = new Date().toISOString().split('T')[0];
        
        if (completed) {
            habit.totalCompletions = (habit.totalCompletions || 0) + 1;
            
            // Check if this completes a streak
            if (this.isConsecutiveDay(date, habitId)) {
                habit.streak = (habit.streak || 0) + 1;
            } else {
                habit.streak = 1;
            }
        } else {
            // Reset streak if completion is removed
            habit.streak = this.calculateCurrentStreak(habitId);
        }
        
        // Update user level and XP
        this.updateUserLevel();
    }

    isConsecutiveDay(date, habitId) {
        const completion = this.getCompletion(date, habitId);
        if (!completion) return false;
        
        const targetDate = new Date(date);
        targetDate.setDate(targetDate.getDate() - 1);
        const prevDate = targetDate.toISOString().split('T')[0];
        
        return this.getCompletion(prevDate, habitId);
    }

    calculateCurrentStreak(habitId) {
        const data = this.loadData();
        if (!data?.completions) return 0;
        
        const habit = data.habits?.find(h => h.id === habitId);
        if (!habit) return 0;
        
        let streak = 0;
        const today = new Date();
        
        for (let i = 0; i < 365; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(today.getDate() - i);
            const dateStr = checkDate.toISOString().split('T')[0];
            
            if (this.getCompletion(dateStr, habitId)) {
                streak++;
            } else {
                break;
            }
        }
        
        return streak;
    }

    getTodayCompletions() {
        const today = new Date().toISOString().split('T')[0];
        return this.getCompletion(today);
    }

    // Notes operations
    getNotes(date = null) {
        const data = this.loadData();
        if (!data?.notes) return {};
        
        if (date) {
            return data.notes[date] || null;
        }
        
        return data.notes || {};
    }

    setNotes(date, noteData) {
        const data = this.loadData() || {};
        if (!data.notes) data.notes = {};
        
        data.notes[date] = {
            ...noteData,
            updatedAt: new Date().toISOString()
        };
        
        return this.saveData(data);
    }

    deleteNotes(date) {
        const data = this.loadData();
        if (data?.notes) {
            delete data.notes[date];
            return this.saveData(data);
        }
        return false;
    }

    // Settings operations
    getSettings() {
        const data = this.loadData();
        return data?.settings || {};
    }

    updateSettings(updates) {
        const data = this.loadData() || {};
        if (!data.settings) data.settings = {};
        
        data.settings = { ...data.settings, ...updates };
        return this.saveData(data);
    }

    updateUserLevel() {
        const data = this.loadData();
        if (!data?.settings) return;
        
        const totalCompletions = data.stats?.totalCompletions || 0;
        const newLevel = Math.floor(totalCompletions / 100) + 1;
        const newXP = totalCompletions % 100;
        
        if (newLevel > data.settings.level) {
            data.settings.level = newLevel;
            data.settings.xp = newXP;
            
            // Trigger level up animation
            this.triggerLevelUp();
        } else {
            data.settings.xp = newXP;
        }
        
        this.saveData(data);
    }

    triggerLevelUp() {
        // Dispatch custom event for level up
        const event = new CustomEvent('levelUp', {
            detail: {
                level: this.getSettings().level,
                xp: this.getSettings().xp
            }
        });
        window.dispatchEvent(event);
    }

    // Statistics operations
    getStats() {
        const data = this.loadData();
        return data?.stats || {};
    }

    updateGlobalStats() {
        const data = this.loadData();
        if (!data?.completions || !data?.habits) return;
        
        let totalCompletions = 0;
        let longestStreak = 0;
        
        // Count total completions
        Object.values(data.completions).forEach(day => {
            if (day) {
                totalCompletions += Object.values(day).filter(completed => completed).length;
            }
        });
        
        // Calculate longest streak across all habits
        data.habits.forEach(habit => {
            longestStreak = Math.max(longestStreak, habit.streak || 0);
        });
        
        data.stats.totalCompletions = totalCompletions;
        data.stats.longestStreak = longestStreak;
        
        // Update weekly data
        this.updateWeeklyData();
        
        this.saveData(data);
    }

    updateWeeklyData() {
        const data = this.loadData();
        if (!data?.completions) return;
        
        const weeklyData = [];
        const today = new Date();
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            const dayCompletions = data.completions[dateStr] || {};
            const completedCount = Object.values(dayCompletions).filter(Boolean).length;
            const totalHabits = data.habits?.length || 0;
            const completionRate = totalHabits > 0 ? (completedCount / totalHabits) * 100 : 0;
            
            weeklyData.push({
                date: dateStr,
                dayName: date.toLocaleDateString('en', { weekday: 'short' }),
                completed: completedCount,
                total: totalHabits,
                percentage: completionRate
            });
        }
        
        data.stats.weeklyData = weeklyData;
    }

    // Achievement system
    checkAchievements() {
        const data = this.loadData();
        if (!data?.settings?.achievements) data.settings.achievements = [];
        
        const achievements = [];
        const existing = data.settings.achievements;
        
        // First habit achievement
        if (data.habits?.length >= 1 && !existing.includes('first_habit')) {
            achievements.push('first_habit');
        }
        
        // 7 day streak achievement
        const has7DayStreak = data.habits?.some(h => (h.streak || 0) >= 7);
        if (has7DayStreak && !existing.includes('7_day_streak')) {
            achievements.push('7_day_streak');
        }
        
        // 30 day streak achievement
        const has30DayStreak = data.habits?.some(h => (h.streak || 0) >= 30);
        if (has30DayStreak && !existing.includes('30_day_streak')) {
            achievements.push('30_day_streak');
        }
        
        // 100 completions achievement
        if (data.stats?.totalCompletions >= 100 && !existing.includes('100_completions')) {
            achievements.push('100_completions');
        }
        
        // Perfect week achievement
        const hasPerfectWeek = data.stats?.weeklyData?.some(week => week.percentage === 100);
        if (hasPerfectWeek && !existing.includes('perfect_week')) {
            achievements.push('perfect_week');
        }
        
        // Add new achievements
        if (achievements.length > 0) {
            data.settings.achievements = [...existing, ...achievements];
            this.saveData(data);
            
            // Trigger achievements event
            achievements.forEach(achievement => {
                this.triggerAchievement(achievement);
            });
        }
        
        return achievements;
    }

    triggerAchievement(achievement) {
        const event = new CustomEvent('achievement', {
            detail: { achievement }
        });
        window.dispatchEvent(event);
    }

    // Export/Import functionality
    exportData() {
        const data = this.loadData();
        return JSON.stringify(data, null, 2);
    }

    importData(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            
            // Basic validation
            if (!data || typeof data !== 'object') {
                throw new Error('Invalid data format');
            }
            
            // Save imported data
            return this.saveData(data);
        } catch (error) {
            console.error('Failed to import data:', error);
            return false;
        }
    }

    // Utility functions
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    getTodayString() {
        return new Date().toISOString().split('T')[0];
    }

    getDateString(date) {
        return new Date(date).toISOString().split('T')[0];
    }

    formatDate(date) {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    getDayOfWeek(date) {
        return new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
    }

    isToday(date) {
        const today = this.getTodayString();
        return this.getDateString(date) === today;
    }

    getDaysInMonth(year, month) {
        return new Date(year, month + 1, 0).getDate();
    }

    getFirstDayOfMonth(year, month) {
        return new Date(year, month, 1).getDay();
    }

    // Search functionality
    searchHabits(query) {
        const habits = this.getHabits();
        if (!query) return habits;
        
        const lowercaseQuery = query.toLowerCase();
        return habits.filter(habit => 
            habit.name.toLowerCase().includes(lowercaseQuery) ||
            (habit.description && habit.description.toLowerCase().includes(lowercaseQuery))
        );
    }

    searchNotes(query) {
        const notes = this.getNotes();
        if (!query) return Object.keys(notes).map(date => ({ date, ...notes[date] }));
        
        const lowercaseQuery = query.toLowerCase();
        const results = [];
        
        Object.entries(notes).forEach(([date, noteData]) => {
            if ((noteData.content && noteData.content.toLowerCase().includes(lowercaseQuery)) ||
                (noteData.title && noteData.title.toLowerCase().includes(lowercaseQuery))) {
                results.push({ date, ...noteData });
            }
        });
        
        return results;
    }
}

// Create global database instance
const db = new HabitFlowDB();