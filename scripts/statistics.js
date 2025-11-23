/**
 * HabitFlow - Statistics and Analytics
 * Handles charts, analytics, and progress tracking
 */

class StatisticsManager {
    constructor() {
        this.charts = {};
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderStatistics();
    }

    bindEvents() {
        // View navigation
        document.addEventListener('click', (event) => {
            if (event.target.matches('.nav-item[data-view="statistics"]')) {
                this.showStatisticsView();
            }
        });

        // Chart interactions
        document.addEventListener('click', (event) => {
            if (event.target.closest('.chart-container')) {
                this.handleChartInteraction(event);
            }
        });

        // Time range filters
        const timeRangeFilters = document.querySelectorAll('.time-range-filter');
        timeRangeFilters.forEach(filter => {
            filter.addEventListener('click', (e) => {
                this.updateChartTimeRange(e.target.dataset.range);
            });
        });
    }

    renderStatistics() {
        this.updateStatsCards();
        this.renderCharts();
    }

    updateStatsCards() {
        const stats = db.getStats();
        const user = db.getUser();
        
        // Update stat cards
        const totalHabits = document.getElementById('total-habits');
        const currentStreak = document.getElementById('total-streak');
        const longestStreak = document.getElementById('longest-streak');
        const totalCompletions = document.getElementById('total-completions');

        if (totalHabits) {
            this.animateNumber(totalHabits, stats.totalHabits || 0);
        }

        if (currentStreak) {
            const habits = db.getHabits();
            const maxStreak = habits.reduce((max, habit) => Math.max(max, habit.streak || 0), 0);
            this.animateNumber(currentStreak, maxStreak);
        }

        if (longestStreak) {
            this.animateNumber(longestStreak, stats.longestStreak || 0);
        }

        if (totalCompletions) {
            this.animateNumber(totalCompletions, stats.totalCompletions || 0);
        }

        // Update user level and XP
        if (user?.settings) {
            this.updateUserProgress(user.settings);
        }
    }

    animateNumber(element, targetNumber) {
        const startNumber = parseInt(element.textContent) || 0;
        const increment = targetNumber > startNumber ? 1 : -1;
        const duration = 1000; // ms
        const steps = Math.abs(targetNumber - startNumber);
        const stepTime = duration / Math.max(steps, 1);

        let current = startNumber;
        const timer = setInterval(() => {
            current += increment;
            element.textContent = current;
            
            if (current === targetNumber) {
                clearInterval(timer);
            }
        }, stepTime);
    }

    updateUserProgress(settings) {
        const userLevel = document.getElementById('user-level');
        const userAvatar = document.getElementById('user-avatar');
        const userInitial = document.getElementById('user-initial');

        if (userLevel && settings.level) {
            userLevel.textContent = `Level ${settings.level}`;
        }

        if (userAvatar && settings.level) {
            // Add level-based styling
            userAvatar.style.background = this.getLevelColor(settings.level);
        }

        if (userInitial && userAvatar) {
            const user = db.getUser();
            if (user?.name) {
                userInitial.textContent = user.name.charAt(0).toUpperCase();
            }
        }
    }

    getLevelColor(level) {
        if (level >= 20) return 'linear-gradient(135deg, #FFD700, #FFA500)'; // Gold
        if (level >= 15) return 'linear-gradient(135deg, #C0C0C0, #A9A9A9)'; // Silver
        if (level >= 10) return 'linear-gradient(135deg, #CD7F32, #8B4513)'; // Bronze
        if (level >= 5) return 'linear-gradient(135deg, #3B82F6, #1D4ED8)'; // Blue
        return 'linear-gradient(135deg, #10B981, #047857)'; // Green (default)
    }

    renderCharts() {
        this.renderWeeklyChart();
        this.renderHabitsChart();
        this.renderStreakChart();
        this.renderCompletionTrendChart();
    }

    renderWeeklyChart() {
        const canvas = document.getElementById('weekly-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const weeklyData = db.getStats().weeklyData || [];

        if (this.charts.weekly) {
            this.charts.weekly.destroy();
        }

        this.charts.weekly = new Chart(ctx, {
            type: 'line',
            data: {
                labels: weeklyData.map(day => day.dayName),
                datasets: [{
                    label: 'Completion Rate',
                    data: weeklyData.map(day => day.percentage),
                    borderColor: '#3B82F6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#3B82F6',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(17, 17, 17, 0.9)',
                        titleColor: '#E4E4E7',
                        bodyColor: '#A1A1AA',
                        borderColor: '#2D2D2D',
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: false,
                        callbacks: {
                            label: function(context) {
                                return `${Math.round(context.parsed.y)}% completed`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: '#2D2D2D',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#A1A1AA',
                            font: {
                                family: 'Inter'
                            }
                        }
                    },
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: {
                            color: '#2D2D2D',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#A1A1AA',
                            font: {
                                family: 'Inter'
                            },
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                },
                elements: {
                    point: {
                        hoverBackgroundColor: '#3B82F6'
                    }
                }
            }
        });
    }

    renderHabitsChart() {
        const canvas = document.getElementById('habits-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const habits = db.getHabits();

        if (this.charts.habits) {
            this.charts.habits.destroy();
        }

        const habitData = habits.map(habit => {
            const totalCompletions = habit.totalCompletions || 0;
            const createdDate = new Date(habit.createdAt);
            const daysSinceCreated = Math.floor((new Date() - createdDate) / (1000 * 60 * 60 * 24));
            const potentialCompletions = Math.max(daysSinceCreated, 1);
            
            return {
                name: habit.name,
                completionRate: Math.round((totalCompletions / potentialCompletions) * 100),
                totalCompletions,
                streak: habit.streak || 0,
                color: habit.color || '#3B82F6'
            };
        });

        this.charts.habits = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: habitData.map(h => h.name),
                datasets: [{
                    data: habitData.map(h => h.totalCompletions),
                    backgroundColor: habitData.map(h => h.color),
                    borderColor: '#111111',
                    borderWidth: 2,
                    hoverBorderWidth: 3,
                    hoverBorderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#A1A1AA',
                            font: {
                                family: 'Inter',
                                size: 12
                            },
                            padding: 20,
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(17, 17, 17, 0.9)',
                        titleColor: '#E4E4E7',
                        bodyColor: '#A1A1AA',
                        borderColor: '#2D2D2D',
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: true,
                        callbacks: {
                            label: function(context) {
                                const habit = habitData[context.dataIndex];
                                return [
                                    `Completions: ${habit.totalCompletions}`,
                                    `Rate: ${habit.completionRate}%`,
                                    `Streak: ${habit.streak} days`
                                ];
                            }
                        }
                    }
                },
                cutout: '60%'
            }
        });
    }

    renderStreakChart() {
        // Create streak evolution chart
        const container = document.querySelector('.charts-container');
        if (!container) return;

        // Remove existing streak chart
        const existingStreakChart = container.querySelector('#streak-chart');
        if (existingStreakChart) {
            existingStreakChart.remove();
        }

        const streakChartCard = document.createElement('div');
        streakChartCard.className = 'chart-card';
        streakChartCard.innerHTML = `
            <h3 class="chart-title">Streak Evolution</h3>
            <canvas id="streak-chart"></canvas>
        `;

        container.appendChild(streakChartCard);

        const canvas = document.getElementById('streak-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const habits = db.getHabits();

        // Generate streak data for last 30 days
        const streakData = this.generateStreakData(habits, 30);

        if (this.charts.streak) {
            this.charts.streak.destroy();
        }

        this.charts.streak = new Chart(ctx, {
            type: 'line',
            data: {
                labels: streakData.map(d => d.date),
                datasets: [
                    {
                        label: 'Current Streak',
                        data: streakData.map(d => d.current),
                        borderColor: '#10B981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#10B981',
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2,
                        pointRadius: 4
                    },
                    {
                        label: 'Longest Streak',
                        data: streakData.map(d => d.longest),
                        borderColor: '#F59E0B',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        borderWidth: 2,
                        borderDash: [5, 5],
                        fill: false,
                        tension: 0.4,
                        pointBackgroundColor: '#F59E0B',
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2,
                        pointRadius: 3
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#A1A1AA',
                            font: {
                                family: 'Inter'
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(17, 17, 17, 0.9)',
                        titleColor: '#E4E4E7',
                        bodyColor: '#A1A1AA',
                        borderColor: '#2D2D2D',
                        borderWidth: 1,
                        cornerRadius: 8
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: '#2D2D2D',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#A1A1AA',
                            font: {
                                family: 'Inter'
                            },
                            maxTicksLimit: 7
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: '#2D2D2D',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#A1A1AA',
                            font: {
                                family: 'Inter'
                            }
                        }
                    }
                }
            }
        });
    }

    renderCompletionTrendChart() {
        // Create completion trend chart
        const container = document.querySelector('.charts-container');
        if (!container) return;

        const trendChartCard = document.createElement('div');
        trendChartCard.className = 'chart-card';
        trendChartCard.innerHTML = `
            <h3 class="chart-title">Daily Completion Trends</h3>
            <canvas id="trend-chart"></canvas>
        `;

        container.appendChild(trendChartCard);

        const canvas = document.getElementById('trend-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const trendData = this.generateCompletionTrendData(60); // Last 60 days

        if (this.charts.trend) {
            this.charts.trend.destroy();
        }

        this.charts.trend = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: trendData.map(d => d.date),
                datasets: [{
                    label: 'Completions',
                    data: trendData.map(d => d.completions),
                    backgroundColor: 'rgba(59, 130, 246, 0.6)',
                    borderColor: '#3B82F6',
                    borderWidth: 1,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(17, 17, 17, 0.9)',
                        titleColor: '#E4E4E7',
                        bodyColor: '#A1A1AA',
                        borderColor: '#2D2D2D',
                        borderWidth: 1,
                        cornerRadius: 8,
                        callbacks: {
                            label: function(context) {
                                return `${context.parsed.y} habits completed`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: '#2D2D2D',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#A1A1AA',
                            font: {
                                family: 'Inter'
                            },
                            maxTicksLimit: 10
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: '#2D2D2D',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#A1A1AA',
                            font: {
                                family: 'Inter'
                            }
                        }
                    }
                }
            }
        });
    }

    generateStreakData(habits, days) {
        const data = [];
        const today = new Date();

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            // Calculate current and longest streaks for this date
            let currentStreak = 0;
            let longestStreak = 0;

            habits.forEach(habit => {
                // Count consecutive completions up to this date
                let streak = 0;
                let checkDate = new Date(date);
                
                while (checkDate <= date) {
                    const checkDateStr = checkDate.toISOString().split('T')[0];
                    if (db.getCompletion(checkDateStr, habit.id)) {
                        streak++;
                        checkDate.setDate(checkDate.getDate() - 1);
                    } else {
                        break;
                    }
                }

                currentStreak = Math.max(currentStreak, streak);
                longestStreak = Math.max(longestStreak, habit.streak || 0);
            });

            data.push({
                date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                current: currentStreak,
                longest: longestStreak
            });
        }

        return data;
    }

    generateCompletionTrendData(days) {
        const data = [];
        const today = new Date();
        const habits = db.getHabits();

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            const dayCompletions = db.getCompletion(dateStr);
            const completedCount = Object.values(dayCompletions).filter(Boolean).length;

            data.push({
                date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                completions: completedCount
            });
        }

        return data;
    }

    showStatisticsView() {
        // Refresh charts when entering statistics view
        setTimeout(() => {
            this.renderStatistics();
        }, 100);
    }

    handleChartInteraction(event) {
        // Handle chart clicks for detailed views
        const chartContainer = event.target.closest('.chart-container');
        if (!chartContainer) return;

        const chartId = chartContainer.querySelector('canvas')?.id;
        if (!chartId) return;

        this.showChartDetails(chartId, event);
    }

    showChartDetails(chartId, event) {
        // Create detailed chart view modal
        const modal = document.createElement('div');
        modal.className = 'modal active';
        
        let content = '';
        
        switch (chartId) {
            case 'weekly-chart':
                content = this.generateWeeklyChartDetails();
                break;
            case 'habits-chart':
                content = this.generateHabitsChartDetails();
                break;
            case 'streak-chart':
                content = this.generateStreakChartDetails();
                break;
            case 'trend-chart':
                content = this.generateTrendChartDetails();
                break;
        }

        modal.innerHTML = `
            <div class="modal-content" style="max-width: 90%; max-height: 90%;">
                <div class="modal-header">
                    <h3>Chart Details</h3>
                    <button class="icon-btn close-btn" onclick="this.closest('.modal').remove()">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6 6L18 18M6 18L18 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>
                <div class="chart-details-content">
                    ${content}
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    generateWeeklyChartDetails() {
        const weeklyData = db.getStats().weeklyData || [];
        const totalCompletions = weeklyData.reduce((sum, day) => sum + day.completed, 0);
        const totalPossible = weeklyData.reduce((sum, day) => sum + day.total, 0);
        const avgCompletion = totalPossible > 0 ? Math.round((totalCompletions / totalPossible) * 100) : 0;

        return `
            <div class="chart-summary">
                <h4>Weekly Summary</h4>
                <div class="summary-stats">
                    <div class="stat">
                        <span class="stat-label">Total Completions</span>
                        <span class="stat-value">${totalCompletions}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Average Completion</span>
                        <span class="stat-value">${avgCompletion}%</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Best Day</span>
                        <span class="stat-value">${this.getBestDay(weeklyData)}</span>
                    </div>
                </div>
            </div>
            <div class="daily-breakdown">
                <h4>Daily Breakdown</h4>
                ${weeklyData.map(day => `
                    <div class="daily-stat">
                        <span class="day-name">${day.dayName}</span>
                        <span class="completion-bar">
                            <span class="bar-fill" style="width: ${day.percentage}%"></span>
                        </span>
                        <span class="completion-text">${day.completed}/${day.total}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    generateHabitsChartDetails() {
        const habits = db.getHabits();
        const sortedHabits = [...habits].sort((a, b) => (b.totalCompletions || 0) - (a.totalCompletions || 0));

        return `
            <div class="chart-summary">
                <h4>Habits Performance</h4>
                <div class="habits-ranking">
                    ${sortedHabits.map((habit, index) => {
                        const totalCompletions = habit.totalCompletions || 0;
                        const createdDate = new Date(habit.createdAt);
                        const daysSinceCreated = Math.floor((new Date() - createdDate) / (1000 * 60 * 60 * 24));
                        const completionRate = daysSinceCreated > 0 ? Math.round((totalCompletions / daysSinceCreated) * 100) : 0;
                        
                        return `
                            <div class="habit-rank-item">
                                <div class="rank-number">${index + 1}</div>
                                <div class="habit-info">
                                    <span class="habit-icon">${habit.icon}</span>
                                    <div class="habit-details">
                                        <div class="habit-name">${habit.name}</div>
                                        <div class="habit-subtitle">${totalCompletions} completions • ${completionRate}% rate</div>
                                    </div>
                                </div>
                                <div class="streak-display">${habit.streak || 0}🔥</div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    generateStreakChartDetails() {
        const habits = db.getHabits();
        const totalStreaks = habits.reduce((sum, habit) => sum + (habit.streak || 0), 0);
        const longestStreak = habits.reduce((max, habit) => Math.max(max, habit.streak || 0), 0);
        const activeHabits = habits.filter(habit => (habit.streak || 0) > 0).length;

        return `
            <div class="chart-summary">
                <h4>Streak Analysis</h4>
                <div class="streak-summary">
                    <div class="streak-stat">
                        <span class="stat-icon">🔥</span>
                        <div class="stat-info">
                            <span class="stat-value">${totalStreaks}</span>
                            <span class="stat-label">Total Streak Days</span>
                        </div>
                    </div>
                    <div class="streak-stat">
                        <span class="stat-icon">⭐</span>
                        <div class="stat-info">
                            <span class="stat-value">${longestStreak}</span>
                            <span class="stat-label">Longest Streak</span>
                        </div>
                    </div>
                    <div class="streak-stat">
                        <span class="stat-icon">💪</span>
                        <div class="stat-info">
                            <span class="stat-value">${activeHabits}</span>
                            <span class="stat-label">Active Habits</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    generateTrendChartDetails() {
        const trendData = this.generateCompletionTrendData(60);
        const avgCompletions = Math.round(trendData.reduce((sum, day) => sum + day.completions, 0) / trendData.length);
        const maxCompletions = Math.max(...trendData.map(day => day.completions));
        const perfectDays = trendData.filter(day => day.completions === db.getHabits().length).length;

        return `
            <div class="chart-summary">
                <h4>Completion Trends</h4>
                <div class="trend-summary">
                    <div class="trend-stat">
                        <span class="stat-label">Daily Average</span>
                        <span class="stat-value">${avgCompletions} habits</span>
                    </div>
                    <div class="trend-stat">
                        <span class="stat-label">Best Day</span>
                        <span class="stat-value">${maxCompletions} habits</span>
                    </div>
                    <div class="trend-stat">
                        <span class="stat-label">Perfect Days</span>
                        <span class="stat-value">${perfectDays}</span>
                    </div>
                </div>
            </div>
        `;
    }

    getBestDay(weeklyData) {
        if (!weeklyData.length) return 'N/A';
        const bestDay = weeklyData.reduce((best, current) => 
            current.percentage > best.percentage ? current : best
        );
        return `${bestDay.dayName} (${Math.round(bestDay.percentage)}%)`;
    }

    updateChartTimeRange(range) {
        // Update chart with new time range
        this.renderCharts();
        
        // Update active filter
        document.querySelectorAll('.time-range-filter').forEach(filter => {
            filter.classList.remove('active');
        });
        document.querySelector(`[data-range="${range}"]`)?.classList.add('active');
    }

    // Export statistics data
    exportStatisticsData() {
        const stats = db.getStats();
        const habits = db.getHabits();
        const user = db.getUser();
        
        const exportData = {
            overview: {
                totalHabits: habits.length,
                totalCompletions: stats.totalCompletions,
                longestStreak: stats.longestStreak,
                level: user?.settings?.level,
                xp: user?.settings?.xp
            },
            weeklyData: stats.weeklyData,
            habits: habits.map(habit => ({
                name: habit.name,
                completions: habit.totalCompletions,
                streak: habit.streak,
                createdAt: habit.createdAt,
                color: habit.color,
                icon: habit.icon
            })),
            exportDate: new Date().toISOString()
        };

        return JSON.stringify(exportData, null, 2);
    }

    // Calculate insights
    generateInsights() {
        const insights = [];
        const stats = db.getStats();
        const habits = db.getHabits();
        
        // Completion rate insight
        const totalPossibleCompletions = habits.length * 365; // Assuming daily habits
        const completionRate = stats.totalCompletions / totalPossibleCompletions * 100;
        
        if (completionRate >= 80) {
            insights.push({
                type: 'success',
                title: 'Excellent Consistency!',
                message: `You have a ${Math.round(completionRate)}% completion rate. Keep up the amazing work!`
            });
        } else if (completionRate >= 60) {
            insights.push({
                type: 'warning',
                title: 'Good Progress',
                message: `Your ${Math.round(completionRate)}% completion rate is solid. Try to identify what helps you complete habits on your best days.`
            });
        } else {
            insights.push({
                type: 'info',
                title: 'Growth Opportunity',
                message: `Focus on building smaller, more achievable habits to improve your ${Math.round(completionRate)}% completion rate.`
            });
        }

        // Streak insight
        const longestStreak = stats.longestStreak;
        if (longestStreak >= 30) {
            insights.push({
                type: 'success',
                title: 'Streak Champion!',
                message: `Your longest streak of ${longestStreak} days is incredible! You're building real discipline.`
            });
        } else if (longestStreak >= 7) {
            insights.push({
                type: 'warning',
                title: 'Great Streak!',
                message: `A ${longestStreak}-day streak shows commitment. Can you push it to 30 days?`
            });
        }

        // Habit diversity insight
        const recentlyActiveHabits = habits.filter(habit => {
            const createdDate = new Date(habit.createdAt);
            const daysSinceCreated = Math.floor((new Date() - createdDate) / (1000 * 60 * 60 * 24));
            return daysSinceCreated <= 30 && (habit.totalCompletions || 0) > 0;
        }).length;

        if (recentlyActiveHabits >= 5) {
            insights.push({
                type: 'info',
                title: 'Habit Explorer',
                message: `You've been actively working with ${recentlyActiveHabits} different habits this month. Variety can help build comprehensive wellness!`
            });
        }

        return insights;
    }

    // Cleanup
    destroy() {
        Object.values(this.charts).forEach(chart => {
            if (chart) chart.destroy();
        });
        this.charts = {};
    }
}

// Create global statistics manager
const statisticsManager = new StatisticsManager();