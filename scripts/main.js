/**
 * HabitFlow - Main Application Controller
 * Coordinates all managers and handles overall application flow
 */

class AppManager {
    constructor() {
        this.currentView = 'dashboard';
        this.isInitialized = false;
        this.init();
    }

    init() {
        if (this.isInitialized) return;
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeApp());
        } else {
            this.initializeApp();
        }
    }

    async initializeApp() {
        try {
            // Hide loading screen after a short delay
            setTimeout(() => {
                const loadingScreen = document.getElementById('loading-screen');
                if (loadingScreen) {
                    loadingScreen.classList.add('hidden');
                }
            }, 2000);

            // Initialize core components
            this.setupEventListeners();
            this.initializeManagers();
            this.setupPWA();
            this.startBackgroundTasks();

            this.isInitialized = true;
            console.log('HabitFlow initialized successfully');
        } catch (error) {
            console.error('Failed to initialize HabitFlow:', error);
            this.showError('Failed to initialize application');
        }
    }

    initializeManagers() {
        // Make managers globally accessible
        window.habitManager = habitManager;
        window.calendarManager = calendarManager;
        window.notesManager = notesManager;
        window.statisticsManager = statisticsManager;
        window.settingsManager = settingsManager;
        window.animationManager = animationManager;
        window.authManager = authManager;
        window.db = db;
        window.quoteManager = quoteManager;

        // Update UI with current data
        this.updateDashboardUI();
        this.updateNavigation();
        this.updateUserInfo();

        // Check for achievements on startup
        setTimeout(() => {
            db.checkAchievements();
        }, 1000);
    }

    setupEventListeners() {
        // Navigation events
        this.bindNavigationEvents();
        
        // View change events
        this.bindViewChangeEvents();
        
        // Global events
        this.bindGlobalEvents();
        
        // Window events
        this.bindWindowEvents();
    }

    bindNavigationEvents() {
        // Desktop navigation
        document.querySelectorAll('.nav-item[data-view]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const view = link.dataset.view;
                this.navigateToView(view);
            });
        });

        // Mobile bottom navigation
        document.querySelectorAll('.bottom-nav .nav-item[data-view]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const view = link.dataset.view;
                this.navigateToView(view);
            });
        });

        // Sidebar toggle
        const menuBtn = document.getElementById('menu-btn');
        const sidebar = document.getElementById('sidebar');
        const closeSidebar = document.getElementById('close-sidebar');

        if (menuBtn && sidebar) {
            menuBtn.addEventListener('click', () => {
                sidebar.classList.add('open');
            });
        }

        if (closeSidebar && sidebar) {
            closeSidebar.addEventListener('click', () => {
                sidebar.classList.remove('open');
            });
        }

        // Close sidebar when clicking outside
        document.addEventListener('click', (e) => {
            if (sidebar && sidebar.classList.contains('open')) {
                const isClickInsideSidebar = sidebar.contains(e.target);
                const isClickOnMenuBtn = menuBtn && menuBtn.contains(e.target);
                
                if (!isClickInsideSidebar && !isClickOnMenuBtn) {
                    sidebar.classList.remove('open');
                }
            }
        });
    }

    bindViewChangeEvents() {
        // Dashboard updates
        document.addEventListener('habitCompleted', () => {
            this.updateDashboardUI();
        });

        document.addEventListener('achievement', (e) => {
            this.showAchievementNotification(e.detail.achievement);
        });

        document.addEventListener('levelUp', (e) => {
            this.showLevelUpNotification(e.detail.level);
        });
    }

    bindGlobalEvents() {
        // Custom events from other managers
        document.addEventListener('settingsUpdated', () => {
            this.updateUserInfo();
        });

        document.addEventListener('dataChanged', () => {
            this.updateDashboardUI();
            this.updateNavigation();
        });

        // Form submissions
        document.addEventListener('submit', (e) => {
            if (e.target.classList.contains('habit-form')) {
                e.preventDefault();
                this.handleHabitFormSubmission(e.target);
            }
        });

        // File drag and drop
        document.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        document.addEventListener('drop', (e) => {
            e.preventDefault();
        });
    }

    bindWindowEvents() {
        // Window resize
        window.addEventListener('resize', () => {
            this.handleWindowResize();
        });

        // Online/Offline detection
        window.addEventListener('online', () => {
            this.handleOnlineStatus(true);
        });

        window.addEventListener('offline', () => {
            this.handleOnlineStatus(false);
        });

        // Before unload
        window.addEventListener('beforeunload', (e) => {
            // Save any pending data
            this.savePendingData();
        });

        // Visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this.handleAppVisible();
            }
        });
    }

    navigateToView(viewName) {
        if (this.currentView === viewName) return;

        // Update URL hash
        window.location.hash = viewName;

        // Update navigation active states
        this.updateActiveNavigation(viewName);

        // Hide all views
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });

        // Show target view
        const targetView = document.getElementById(`${viewName}-view`);
        if (targetView) {
            targetView.classList.add('active');
            
            // Animate transition
            const previousView = document.querySelector('.view.active:not(#' + targetView.id + ')');
            if (previousView) {
                animationManager.animatePageTransition(previousView, targetView);
            }
        }

        this.currentView = viewName;

        // View-specific initialization
        this.initializeView(viewName);

        // Close sidebar on mobile
        const sidebar = document.getElementById('sidebar');
        if (sidebar && window.innerWidth <= 768) {
            sidebar.classList.remove('open');
        }
    }

    initializeView(viewName) {
        switch (viewName) {
            case 'dashboard':
                this.initializeDashboard();
                break;
            case 'calendar':
                this.initializeCalendar();
                break;
            case 'statistics':
                this.initializeStatistics();
                break;
            case 'habits':
                this.initializeHabits();
                break;
            case 'notes':
                this.initializeNotes();
                break;
            case 'settings':
                this.initializeSettings();
                break;
        }
    }

    initializeDashboard() {
        // Update dashboard data
        this.updateDashboardUI();
        this.updateWeeklyCalendar();
        this.updateProgressDisplay();
        this.updateQuote();
    }

    initializeCalendar() {
        // Calendar is already initialized in CalendarManager constructor
        calendarManager.renderYearCalendar();
    }

    initializeStatistics() {
        // Statistics will be rendered when the view becomes visible
        setTimeout(() => {
            statisticsManager.renderStatistics();
        }, 100);
    }

    initializeHabits() {
        // Habits are already managed by HabitManager
        habitManager.renderHabitsManagement();
    }

    initializeNotes() {
        // Notes are already managed by NotesManager
        notesManager.loadCurrentNote();
    }

    initializeSettings() {
        // Settings are already managed by SettingsManager
        settingsManager.loadSettings();
    }

    updateDashboardUI() {
        // Update date display
        this.updateDateDisplay();
        
        // Update progress
        this.updateProgressDisplay();
        
        // Update streak information
        this.updateStreakDisplay();
        
        // Update habit cards
        habitManager.renderTodayHabits();
        
        // Update garden/forest animation
        animationManager.animateGardenGrowth();
    }

    updateDateDisplay() {
        const dateText = document.getElementById('current-date');
        if (dateText) {
            const today = new Date();
            const options = { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            };
            dateText.textContent = today.toLocaleDateString('en-US', options);
        }

        // Update dashboard subtitle with time-based greeting
        const dashboardSubtitle = document.getElementById('dashboard-subtitle');
        if (dashboardSubtitle) {
            const hour = new Date().getHours();
            let greeting = 'Ready to build better habits?';
            
            if (hour < 12) {
                greeting = 'Good morning! Start your day right.';
            } else if (hour < 17) {
                greeting = 'Good afternoon! Keep up the momentum.';
            } else {
                greeting = 'Good evening! Reflect on your day.';
            }
            
            dashboardSubtitle.textContent = greeting;
        }
    }

    updateProgressDisplay() {
        const habits = db.getHabits();
        const today = new Date().toISOString().split('T')[0];
        const todayCompletions = db.getTodayCompletions();
        const completedCount = Object.values(todayCompletions).filter(Boolean).length;
        const totalHabits = habits.length;
        const percentage = totalHabits > 0 ? Math.round((completedCount / totalHabits) * 100) : 0;

        // Update progress ring
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

    updateStreakDisplay() {
        const habits = db.getHabits();
        const maxStreak = habits.reduce((max, habit) => Math.max(max, habit.streak || 0), 0);

        const currentStreakElement = document.getElementById('current-streak');
        if (currentStreakElement) {
            currentStreakElement.textContent = maxStreak;
        }

        // Update streak motivation
        const streakMotivation = document.getElementById('streak-motivation');
        if (streakMotivation) {
            let motivation = '';
            if (maxStreak === 0) {
                motivation = 'Start your first streak!';
            } else if (maxStreak < 7) {
                motivation = `Great start! ${7 - maxStreak} more days to reach a week!`;
            } else if (maxStreak < 30) {
                motivation = `Amazing! ${30 - maxStreak} more days to reach a month!`;
            } else {
                motivation = `Incredible! ${365 - maxStreak} more days to reach a year!`;
            }
            streakMotivation.textContent = motivation;
        }
    }

    updateWeeklyCalendar() {
        calendarManager.renderWeeklyCalendar();
    }

    updateQuote() {
        // Quote is updated automatically by QuoteManager
        // This method can be used to force a refresh if needed
    }

    updateNavigation() {
        // Update active navigation states
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });

        const activeNav = document.querySelector(`.nav-item[data-view="${this.currentView}"]`);
        if (activeNav) {
            activeNav.classList.add('active');
        }
    }

    updateActiveNavigation(viewName) {
        // Remove active from all nav items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });

        // Add active to current view nav items
        document.querySelectorAll(`.nav-item[data-view="${viewName}"]`).forEach(item => {
            item.classList.add('active');
        });
    }

    updateUserInfo() {
        const user = db.getUser();
        if (!user) return;

        const userName = document.getElementById('user-name');
        const userInitial = document.getElementById('user-initial');
        const userLevel = document.getElementById('user-level');
        const userAvatar = document.getElementById('user-avatar');

        if (userName) {
            userName.textContent = user.name || 'HabitMaster';
        }

        if (userInitial && user.name) {
            userInitial.textContent = user.name.charAt(0).toUpperCase();
        }

        if (userLevel && user.settings) {
            userLevel.textContent = `Level ${user.settings.level || 1}`;
        }

        if (userAvatar && user.settings) {
            const level = user.settings.level || 1;
            userAvatar.style.background = this.getLevelColor(level);
        }
    }

    getLevelColor(level) {
        if (level >= 20) return 'linear-gradient(135deg, #FFD700, #FFA500)'; // Gold
        if (level >= 15) return 'linear-gradient(135deg, #C0C0C0, #A9A9A9)'; // Silver
        if (level >= 10) return 'linear-gradient(135deg, #CD7F32, #8B4513)'; // Bronze
        if (level >= 5) return 'linear-gradient(135deg, #3B82F6, #1D4ED8)'; // Blue
        return 'linear-gradient(135deg, #10B981, #047857)'; // Green (default)
    }

    showAchievementNotification(achievement) {
        const messages = {
            'first_habit': '🎯 You created your first habit! Great start!',
            '7_day_streak': '🔥 7-day streak achieved! You\'re on fire!',
            '30_day_streak': '💎 30-day streak! True dedication!',
            '100_completions': '⭐ 100 completions! Unstoppable!',
            'perfect_week': '🌟 Perfect week! Amazing consistency!'
        };

        const message = messages[achievement] || 'Achievement unlocked!';
        animationManager.animateNotification(message, 'success');
    }

    showLevelUpNotification(level) {
        animationManager.animateNotification(`🎉 Level Up! You've reached level ${level}!`, 'success');
    }

    handleHabitFormSubmission(form) {
        // Delegate to HabitManager
        if (window.habitManager) {
            habitManager.handleCreateHabit({ preventDefault: () => {}, target: form });
        }
    }

    handleWindowResize() {
        // Handle responsive layout changes
        if (window.innerWidth > 768) {
            const sidebar = document.getElementById('sidebar');
            if (sidebar) {
                sidebar.classList.remove('open');
            }
        }

        // Resize charts if statistics view is active
        if (this.currentView === 'statistics' && window.statisticsManager) {
            setTimeout(() => {
                statisticsManager.renderStatistics();
            }, 100);
        }
    }

    handleOnlineStatus(isOnline) {
        if (isOnline) {
            animationManager.animateNotification('Connection restored', 'success');
            // Sync data if needed
            this.syncData();
        } else {
            animationManager.animateNotification('Working offline', 'info');
        }
    }

    handleAppVisible() {
        // Refresh data when app becomes visible
        this.updateDashboardUI();
        
        // Check for new achievements
        setTimeout(() => {
            db.checkAchievements();
        }, 500);
    }

    savePendingData() {
        // Save any unsaved data
        if (window.notesManager) {
            notesManager.saveNote();
        }
    }

    syncData() {
        // Placeholder for data synchronization
        // In a real app, this would sync with a server
        console.log('Data sync completed');
    }

    startBackgroundTasks() {
        // Daily reminder setup
        this.setupDailyReminder();

        // Auto-save intervals
        setInterval(() => {
            this.savePendingData();
        }, 30000); // Save every 30 seconds

        // Achievement checks
        setInterval(() => {
            db.checkAchievements();
        }, 60000); // Check every minute

        // Quote updates (daily)
        this.scheduleQuoteUpdate();
    }

    setupDailyReminder() {
        const settings = db.getSettings();
        if (settings.notifications?.enabled) {
            settingsManager.scheduleDailyReminder();
        }
    }

    scheduleQuoteUpdate() {
        // Check if quote needs to be updated (new day)
        const today = new Date().toDateString();
        const storedQuote = localStorage.getItem('todaysQuote');
        
        if (!storedQuote) {
            quoteManager.displayTodaysQuote();
        } else {
            const { date } = JSON.parse(storedQuote);
            if (date !== today) {
                quoteManager.displayTodaysQuote();
            }
        }
    }

    setupPWA() {
        // Register service worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('Service Worker registered:', registration);
                })
                .catch(error => {
                    console.log('Service Worker registration failed:', error);
                });
        }

        // Handle PWA install prompt
        let deferredPrompt;
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            
            // Show install button or notification
            this.showInstallPrompt();
        });

        // Store the deferred prompt for later use
        window.deferredPrompt = deferredPrompt;
    }

    showInstallPrompt() {
        // Create install notification
        const installBanner = document.createElement('div');
        installBanner.className = 'install-banner';
        installBanner.innerHTML = `
            <div class="install-content">
                <span class="install-text">📱 Install HabitFlow for the best experience!</span>
                <button class="btn btn-sm install-btn">Install</button>
                <button class="icon-btn dismiss-btn" title="Dismiss">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 6L18 18M6 18L18 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
            </div>
        `;

        // Add styles
        installBanner.style.cssText = `
            position: fixed;
            bottom: 80px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--bg-surface);
            border: 1px solid var(--border-default);
            border-radius: var(--radius-lg);
            padding: 1rem;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            z-index: 1000;
            animation: slideInFromBottom 0.5s ease-out;
            max-width: 90%;
        `;

        document.body.appendChild(installBanner);

        // Handle install button
        const installBtn = installBanner.querySelector('.install-btn');
        installBtn.addEventListener('click', async () => {
            if (window.deferredPrompt) {
                window.deferredPrompt.prompt();
                const { outcome } = await window.deferredPrompt.userChoice;
                
                if (outcome === 'accepted') {
                    animationManager.animateNotification('App installed successfully!', 'success');
                }
                
                window.deferredPrompt = null;
                installBanner.remove();
            }
        });

        // Handle dismiss button
        const dismissBtn = installBanner.querySelector('.dismiss-btn');
        dismissBtn.addEventListener('click', () => {
            installBanner.style.animation = 'slideOutToBottom 0.3s ease-in forwards';
            setTimeout(() => installBanner.remove(), 300);
        });

        // Auto-dismiss after 10 seconds
        setTimeout(() => {
            if (installBanner.parentNode) {
                installBanner.style.animation = 'slideOutToBottom 0.3s ease-in forwards';
                setTimeout(() => installBanner.remove(), 300);
            }
        }, 10000);
    }

    showError(message) {
        animationManager.animateNotification(message, 'error');
    }

    // URL routing
    handleHashChange() {
        const hash = window.location.hash.slice(1);
        if (hash && hash !== this.currentView) {
            this.navigateToView(hash);
        }
    }
}

// Initialize the app
const appManager = new AppManager();

// Handle URL routing
window.addEventListener('hashchange', () => {
    appManager.handleHashChange();
});

// Initial route
window.addEventListener('load', () => {
    appManager.handleHashChange();
});

// Export for global access
window.AppManager = AppManager;