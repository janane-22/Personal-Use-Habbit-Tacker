/**
 * HabitFlow - Settings Management
 * Handles user preferences, settings, and application configuration
 */

class SettingsManager {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadSettings();
        this.setupThemeToggle();
    }

    bindEvents() {
        // Theme settings
        const themeSetting = document.getElementById('theme-setting');
        if (themeSetting) {
            themeSetting.addEventListener('change', (e) => this.updateTheme(e.target.value));
        }

        const accentColorSetting = document.getElementById('accent-color-setting');
        if (accentColorSetting) {
            accentColorSetting.addEventListener('change', (e) => this.updateAccentColor(e.target.value));
        }

        // Notification settings
        const dailyReminder = document.getElementById('daily-reminder');
        const reminderTime = document.getElementById('reminder-time');

        if (dailyReminder) {
            dailyReminder.addEventListener('change', (e) => this.updateNotificationSetting('enabled', e.target.checked));
        }

        if (reminderTime) {
            reminderTime.addEventListener('change', (e) => this.updateNotificationSetting('time', e.target.value));
        }

        // Data management
        const exportDataBtn = document.getElementById('export-data');
        if (exportDataBtn) {
            exportDataBtn.addEventListener('click', () => this.exportData());
        }

        const importDataBtn = document.getElementById('import-data');
        if (importDataBtn) {
            importDataBtn.addEventListener('click', () => this.importData());
        }

        const resetDataBtn = document.getElementById('reset-data');
        if (resetDataBtn) {
            resetDataBtn.addEventListener('click', () => this.resetData());
        }

        // Keyboard shortcuts
        this.setupKeyboardShortcuts();
        
        // Auto-save settings
        this.setupAutoSave();
    }

    loadSettings() {
        const settings = db.getSettings();
        
        // Load theme settings
        const themeSetting = document.getElementById('theme-setting');
        if (themeSetting) {
            themeSetting.value = settings.theme || 'dark';
        }

        // Load accent color
        const accentColorSetting = document.getElementById('accent-color-setting');
        if (accentColorSetting) {
            const colorMap = {
                '#3B82F6': 'blue',
                '#10B981': 'green',
                '#F59E0B': 'orange',
                '#EF4444': 'red',
                '#8B5CF6': 'purple'
            };
            const currentColor = settings.accentColor || 'blue';
            const colorHex = Object.keys(colorMap).find(key => colorMap[key] === currentColor);
            if (colorHex) {
                accentColorSetting.value = colorHex;
            }
        }

        // Load notification settings
        const dailyReminder = document.getElementById('daily-reminder');
        const reminderTime = document.getElementById('reminder-time');

        if (dailyReminder && settings.notifications) {
            dailyReminder.checked = settings.notifications.enabled || false;
        }

        if (reminderTime && settings.notifications) {
            reminderTime.value = settings.notifications.time || '09:00';
        }

        // Apply current theme
        this.applyTheme(settings.theme || 'dark');
        this.applyAccentColor(settings.accentColor || 'blue');
    }

    updateTheme(theme) {
        const settings = db.getSettings();
        settings.theme = theme;
        db.updateSettings({ theme });
        
        this.applyTheme(theme);
        animationManager.animateNotification(`Theme changed to ${theme}`, 'success');
    }

    updateAccentColor(colorHex) {
        const colorMap = {
            '#3B82F6': 'blue',
            '#10B981': 'green',
            '#F59E0B': 'orange',
            '#EF4444': 'red',
            '#8B5CF6': 'purple'
        };
        
        const colorName = colorMap[colorHex] || 'blue';
        const settings = db.getSettings();
        settings.accentColor = colorName;
        db.updateSettings({ accentColor: colorName });
        
        this.applyAccentColor(colorName);
        animationManager.animateNotification(`Accent color changed to ${colorName}`, 'success');
    }

    updateNotificationSetting(key, value) {
        const settings = db.getSettings();
        if (!settings.notifications) {
            settings.notifications = { enabled: true, time: '09:00' };
        }
        
        settings.notifications[key] = value;
        db.updateSettings({ notifications: settings.notifications });
        
        if (key === 'enabled') {
            if (value) {
                this.requestNotificationPermission();
            } else {
                this.clearScheduledNotification();
            }
        }
        
        animationManager.animateNotification(`Notification setting updated`, 'success');
    }

    applyTheme(theme) {
        const body = document.body;
        
        // Remove existing theme classes
        body.classList.remove('theme-dark', 'theme-light', 'theme-auto');
        
        // Add new theme class
        body.classList.add(`theme-${theme}`);
        
        // Animate theme transition
        animationManager.animateThemeChange();
        
        // Update system preference
        if (theme === 'auto') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            body.classList.add(prefersDark ? 'theme-dark' : 'theme-light');
        }
    }

    applyAccentColor(colorName) {
        const body = document.body;
        
        // Remove existing accent color classes
        body.classList.remove('theme-blue', 'theme-green', 'theme-orange', 'theme-red', 'theme-purple');
        
        // Add new accent color class
        body.classList.add(`theme-${colorName}`);
        
        // Update CSS custom properties
        this.updateAccentColorCSS(colorName);
    }

    updateAccentColorCSS(colorName) {
        const colorMap = {
            blue: '#3B82F6',
            green: '#10B981',
            orange: '#F59E0B',
            red: '#EF4444',
            purple: '#8B5CF6'
        };
        
        const colorHex = colorMap[colorName] || '#3B82F6';
        document.documentElement.style.setProperty('--primary-500', colorHex);
        
        // Update primary variants
        const darkerColor = this.darkenColor(colorHex, 20);
        const lighterColor = this.lightenColor(colorHex, 30);
        
        document.documentElement.style.setProperty('--primary-700', darkerColor);
        document.documentElement.style.setProperty('--primary-light', lighterColor);
    }

    darkenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }

    lightenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }

    setupThemeToggle() {
        const themeBtn = document.getElementById('theme-btn');
        if (!themeBtn) return;

        themeBtn.addEventListener('click', () => {
            const currentTheme = db.getSettings().theme || 'dark';
            const nextTheme = currentTheme === 'dark' ? 'light' : currentTheme === 'light' ? 'auto' : 'dark';
            this.updateTheme(nextTheme);
            
            const themeSetting = document.getElementById('theme-setting');
            if (themeSetting) {
                themeSetting.value = nextTheme;
            }
        });

        // Update theme icon
        this.updateThemeIcon();
    }

    updateThemeIcon() {
        const themeBtn = document.getElementById('theme-btn');
        const themeIcon = document.getElementById('theme-icon');
        if (!themeBtn || !themeIcon) return;

        const currentTheme = db.getSettings().theme || 'dark';
        let iconPath = '';

        switch (currentTheme) {
            case 'light':
                iconPath = 'M12 3V1M12 23V21M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22';
                break;
            case 'auto':
                iconPath = 'M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z';
                break;
            default: // dark
                iconPath = 'M12 3V1M12 23V21M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22';
        }

        themeIcon.innerHTML = `<path d="${iconPath}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
    }

    requestNotificationPermission() {
        if ('Notification' in window) {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    this.scheduleDailyReminder();
                    animationManager.animateNotification('Notifications enabled!', 'success');
                } else {
                    animationManager.animateNotification('Notification permission denied', 'error');
                }
            });
        }
    }

    scheduleDailyReminder() {
        const settings = db.getSettings();
        if (!settings.notifications?.enabled) return;

        const time = settings.notifications.time || '09:00';
        const [hours, minutes] = time.split(':').map(Number);
        
        // Calculate time until next reminder
        const now = new Date();
        const reminderTime = new Date();
        reminderTime.setHours(hours, minutes, 0, 0);
        
        // If time has passed today, schedule for tomorrow
        if (reminderTime <= now) {
            reminderTime.setDate(reminderTime.getDate() + 1);
        }
        
        const timeUntilReminder = reminderTime.getTime() - now.getTime();
        
        // Store reminder timeout ID for potential cancellation
        this.reminderTimeout = setTimeout(() => {
            this.showNotification();
            // Schedule next reminder
            this.scheduleDailyReminder();
        }, timeUntilReminder);
    }

    showNotification() {
        if ('Notification' in window && Notification.permission === 'granted') {
            const habits = db.getHabits();
            const todayCompletions = db.getTodayCompletions();
            const completedCount = Object.values(todayCompletions).filter(Boolean).length;
            const totalHabits = habits.length;
            
            const notification = new Notification('HabitFlow Reminder', {
                body: `You have ${totalHabits - completedCount} habits left to complete today!`,
                icon: '/icons/icon.svg',
                badge: '/icons/badge.svg',
                tag: 'daily-reminder',
                requireInteraction: false
            });

            // Auto-close after 5 seconds
            setTimeout(() => {
                notification.close();
            }, 5000);
        }
    }

    clearScheduledNotification() {
        if (this.reminderTimeout) {
            clearTimeout(this.reminderTimeout);
            this.reminderTimeout = null;
        }
    }

    exportData() {
        const data = {
            habits: db.getHabits(),
            completions: db.loadData()?.completions || {},
            notes: db.getNotes(),
            settings: db.getSettings(),
            stats: db.getStats(),
            exportDate: new Date().toISOString(),
            version: '1.0.0'
        };

        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `habitflow-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        animationManager.animateNotification('Data exported successfully!', 'success');
    }

    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    
                    // Validate data structure
                    if (!this.validateImportedData(data)) {
                        animationManager.animateNotification('Invalid backup file format', 'error');
                        return;
                    }

                    // Confirm import
                    const confirmed = confirm('This will replace all your current data. Are you sure you want to continue?');
                    if (!confirmed) return;

                    // Import data
                    const success = db.importData(JSON.stringify(data));
                    if (success) {
                        animationManager.animateNotification('Data imported successfully!', 'success');
                        
                        // Reload the page to reflect changes
                        setTimeout(() => {
                            location.reload();
                        }, 1500);
                    } else {
                        animationManager.animateNotification('Failed to import data', 'error');
                    }
                } catch (error) {
                    animationManager.animateNotification('Invalid JSON file', 'error');
                }
            };
            reader.readAsText(file);
        };
        
        input.click();
    }

    validateImportedData(data) {
        // Basic validation
        return data && 
               typeof data === 'object' &&
               (data.habits || data.completions || data.notes || data.settings) &&
               data.exportDate;
    }

    resetData() {
        const confirmed = confirm(
            'This will delete ALL your data including habits, completions, notes, and settings. This action cannot be undone. Are you absolutely sure?'
        );
        
        if (!confirmed) return;

        // Double confirmation for safety
        const secondConfirmation = prompt(
            'Type "DELETE" to confirm:'
        );
        
        if (secondConfirmation !== 'DELETE') {
            animationManager.animateNotification('Reset cancelled', 'info');
            return;
        }

        db.clearData();
        animationManager.animateNotification('All data has been reset', 'success');
        
        // Reload the page
        setTimeout(() => {
            location.reload();
        }, 1500);
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Only trigger shortcuts when not typing in input fields
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.contentEditable === 'true') {
                return;
            }

            // Ctrl/Cmd + key combinations
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 't':
                        e.preventDefault();
                        this.toggleTheme();
                        break;
                    case 'n':
                        e.preventDefault();
                        this.showAddHabitModal();
                        break;
                    case 's':
                        e.preventDefault();
                        this.showSettings();
                        break;
                    case 'e':
                        e.preventDefault();
                        this.exportData();
                        break;
                }
            }

            // Arrow keys for navigation
            switch (e.key) {
                case 'ArrowLeft':
                    if (e.altKey) {
                        e.preventDefault();
                        // Navigate to previous day in notes
                        if (window.notesManager) {
                            window.notesManager.navigateDay(-1);
                        }
                    }
                    break;
                case 'ArrowRight':
                    if (e.altKey) {
                        e.preventDefault();
                        // Navigate to next day in notes
                        if (window.notesManager) {
                            window.notesManager.navigateDay(1);
                        }
                    }
                    break;
            }
        });

        // Show keyboard shortcut hints
        this.showKeyboardShortcutsHint();
    }

    showKeyboardShortcutsHint() {
        // Create a help modal with keyboard shortcuts
        const hint = document.createElement('div');
        hint.className = 'keyboard-shortcuts-hint';
        hint.innerHTML = `
            <div class="shortcuts-modal" style="display: none;">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Keyboard Shortcuts</h3>
                        <button class="icon-btn close-btn" onclick="this.closest('.modal-content').parentElement.parentElement.remove()">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6 6L18 18M6 18L18 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </button>
                    </div>
                    <div class="shortcuts-list">
                        <div class="shortcut-item">
                            <kbd>Ctrl/Cmd + T</kbd>
                            <span>Toggle theme</span>
                        </div>
                        <div class="shortcut-item">
                            <kbd>Ctrl/Cmd + N</kbd>
                            <span>New habit</span>
                        </div>
                        <div class="shortcut-item">
                            <kbd>Ctrl/Cmd + S</kbd>
                            <span>Settings</span>
                        </div>
                        <div class="shortcut-item">
                            <kbd>Ctrl/Cmd + E</kbd>
                            <span>Export data</span>
                        </div>
                        <div class="shortcut-item">
                            <kbd>Alt + ←</kbd>
                            <span>Previous day (notes)</span>
                        </div>
                        <div class="shortcut-item">
                            <kbd>Alt + →</kbd>
                            <span>Next day (notes)</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(hint);

        // Add styles for the shortcuts modal
        if (!document.querySelector('#keyboard-shortcuts-styles')) {
            const styles = document.createElement('style');
            styles.id = 'keyboard-shortcuts-styles';
            styles.textContent = `
                .keyboard-shortcuts-hint .modal-content {
                    max-width: 400px;
                }
                .shortcuts-list {
                    margin: 1rem 0;
                }
                .shortcut-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0.75rem 0;
                    border-bottom: 1px solid var(--border-default);
                }
                .shortcut-item:last-child {
                    border-bottom: none;
                }
                kbd {
                    background: var(--bg-surface-2);
                    border: 1px solid var(--border-default);
                    border-radius: 4px;
                    padding: 2px 6px;
                    font-family: 'Monaco', 'Menlo', monospace;
                    font-size: 12px;
                    color: var(--text-primary);
                }
            `;
            document.head.appendChild(styles);
        }

        // Show hint after a delay
        setTimeout(() => {
            const modal = hint.querySelector('.shortcuts-modal');
            modal.style.display = 'flex';
            modal.classList.add('active');
        }, 3000);

        // Auto-hide after 8 seconds
        setTimeout(() => {
            const modal = hint.querySelector('.shortcuts-modal');
            if (modal) {
                modal.classList.remove('active');
                setTimeout(() => {
                    hint.remove();
                }, 300);
            }
        }, 8000);
    }

    setupAutoSave() {
        // Auto-save settings when they change
        const settingsInputs = document.querySelectorAll('#settings-view input, #settings-view select');
        settingsInputs.forEach(input => {
            input.addEventListener('change', () => {
                // Settings are already saved in the individual handlers
                // This is just for additional user feedback
                this.showAutoSaveIndicator();
            });
        });
    }

    showAutoSaveIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'auto-save-indicator';
        indicator.textContent = 'Settings saved';
        indicator.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--success);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 12px;
            z-index: 1000;
            animation: fadeInUp 0.3s ease-out, fadeOut 0.3s ease-in 1.5s forwards;
        `;

        document.body.appendChild(indicator);

        setTimeout(() => {
            if (indicator.parentNode) {
                indicator.parentNode.removeChild(indicator);
            }
        }, 1800);
    }

    // Utility methods
    toggleTheme() {
        const themeBtn = document.getElementById('theme-btn');
        if (themeBtn) {
            themeBtn.click();
        }
    }

    showAddHabitModal() {
        if (window.habitManager) {
            window.habitManager.showAddHabitModal();
        }
    }

    showSettings() {
        // Navigate to settings view
        const settingsLink = document.querySelector('.nav-item[data-view="settings"]');
        if (settingsLink) {
            settingsLink.click();
        }
    }

    // Get settings summary for dashboard
    getSettingsSummary() {
        const settings = db.getSettings();
        return {
            theme: settings.theme || 'dark',
            accentColor: settings.accentColor || 'blue',
            notifications: settings.notifications?.enabled || false,
            level: settings.level || 1,
            xp: settings.xp || 0,
            achievements: settings.achievements?.length || 0
        };
    }
}

// Create global settings manager
const settingsManager = new SettingsManager();