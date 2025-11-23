/**
 * HabitFlow - Authentication System
 * Handles user registration, login, and session management
 */

class AuthManager {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
        this.checkAuthState();
    }

    bindEvents() {
        const authForm = document.getElementById('auth-form');
        const authSwitch = document.getElementById('auth-switch-link');
        const demoBtn = document.getElementById('demo-btn');
        const logoutBtn = document.getElementById('logout-btn');

        if (authForm) {
            authForm.addEventListener('submit', this.handleAuth.bind(this));
        }

        if (authSwitch) {
            authSwitch.addEventListener('click', this.toggleAuthMode.bind(this));
        }

        if (demoBtn) {
            demoBtn.addEventListener('click', this.handleDemo.bind(this));
        }

        if (logoutBtn) {
            logoutBtn.addEventListener('click', this.logout.bind(this));
        }
    }

    checkAuthState() {
        const user = db.getUser();
        
        if (user) {
            this.showApp();
        } else {
            this.showAuth();
        }
    }

    handleAuth(event) {
        event.preventDefault();
        
        const form = event.target;
        const formData = new FormData(form);
        const isSignUp = form.dataset.mode === 'signup';
        
        const userData = {
            email: formData.get('email'),
            password: formData.get('password'),
            name: formData.get('name') || 'HabitMaster'
        };

        // Basic validation
        if (!this.validateAuthData(userData, isSignUp)) {
            return;
        }

        // Show loading state
        this.setFormLoading(form, true);

        try {
            if (isSignUp) {
                this.signUp(userData);
            } else {
                this.signIn(userData);
            }
        } catch (error) {
            this.showError(error.message);
        } finally {
            this.setFormLoading(form, false);
        }
    }

    validateAuthData(userData, isSignUp) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!userData.email || !emailRegex.test(userData.email)) {
            this.showError('Please enter a valid email address');
            return false;
        }

        if (!userData.password || userData.password.length < 6) {
            this.showError('Password must be at least 6 characters long');
            return false;
        }

        if (isSignUp && !userData.name) {
            this.showError('Please enter your full name');
            return false;
        }

        return true;
    }

    signUp(userData) {
        // Check if user already exists
        const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
        const userExists = existingUsers.find(u => u.email === userData.email);

        if (userExists) {
            throw new Error('An account with this email already exists');
        }

        // Create new user
        const newUser = {
            id: db.generateId(),
            email: userData.email,
            name: userData.name,
            createdAt: new Date().toISOString(),
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
            }
        };

        // Hash password (simple implementation)
        const hashedPassword = this.hashPassword(userData.password);
        
        // Save user
        existingUsers.push({
            ...newUser,
            password: hashedPassword
        });
        
        localStorage.setItem('users', JSON.stringify(existingUsers));
        
        // Initialize user in main database
        db.setUser(newUser);
        
        // Show success message
        this.showSuccess('Account created successfully! Welcome to HabitFlow!');
        
        // Redirect to app
        setTimeout(() => {
            this.showApp();
        }, 1500);
    }

    signIn(userData) {
        const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
        const user = existingUsers.find(u => u.email === userData.email);

        if (!user) {
            throw new Error('No account found with this email address');
        }

        // Verify password
        const hashedPassword = this.hashPassword(userData.password);
        if (user.password !== hashedPassword) {
            throw new Error('Incorrect password');
        }

        // Set current user
        db.setUser(user);
        
        this.showSuccess('Welcome back!');
        
        // Redirect to app
        setTimeout(() => {
            this.showApp();
        }, 1000);
    }

    handleDemo() {
        // Create demo user with sample data
        const demoUser = {
            id: db.generateId(),
            email: 'demo@habitflow.app',
            name: 'Demo User',
            createdAt: new Date().toISOString(),
            isDemo: true,
            settings: {
                theme: 'dark',
                accentColor: 'blue',
                notifications: {
                    enabled: true,
                    time: '09:00'
                },
                streak: 3,
                level: 2,
                xp: 45,
                achievements: ['first_habit', '7_day_streak']
            }
        };

        db.setUser(demoUser);
        this.createDemoData();
        
        this.showSuccess('Demo mode activated!');
        
        setTimeout(() => {
            this.showApp();
        }, 1000);
    }

    createDemoData() {
        // Create sample habits
        const sampleHabits = [
            {
                name: 'Drink 8 Glasses of Water',
                description: 'Stay hydrated throughout the day',
                icon: '💧',
                color: '#38BDF8',
                frequency: 'daily'
            },
            {
                name: 'Exercise for 30 Minutes',
                description: 'Keep your body active and healthy',
                icon: '🏃',
                color: '#34D399',
                frequency: 'daily'
            },
            {
                name: 'Read for 20 Minutes',
                description: 'Expand your knowledge and imagination',
                icon: '📚',
                color: '#8B5CF6',
                frequency: 'daily'
            },
            {
                name: 'Practice Mindfulness',
                description: 'Meditate or practice gratitude',
                icon: '🧘',
                color: '#F43F5E',
                frequency: 'daily'
            }
        ];

        sampleHabits.forEach(habit => {
            db.addHabit(habit);
        });

        // Add some sample completions for the past week
        const habits = db.getHabits();
        const today = new Date();
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            // Random completion pattern
            habits.forEach(habit => {
                const shouldComplete = Math.random() > 0.3; // 70% completion rate
                if (shouldComplete) {
                    db.setCompletion(dateStr, habit.id, true);
                }
            });
        }

        // Add sample notes
        const todayNotes = {
            content: 'Great day! Completed most of my habits. Feeling motivated to keep going!',
            mood: 'positive',
            attachments: []
        };

        db.setNotes(today.toISOString().split('T')[0], todayNotes);

        // Update global stats
        db.updateGlobalStats();
    }

    logout() {
        // Clear current user
        db.setUser(null);
        
        // Show confirmation
        this.showSuccess('You have been logged out successfully');
        
        // Redirect to auth
        setTimeout(() => {
            this.showAuth();
        }, 1000);
    }

    toggleAuthMode(event) {
        event.preventDefault();
        
        const authTitle = document.getElementById('auth-title');
        const authSubtitle = document.getElementById('auth-subtitle');
        const authSubmit = document.getElementById('auth-submit');
        const authSwitchText = document.getElementById('auth-switch-text');
        const authSwitchLink = document.getElementById('auth-switch-link');
        const authForm = document.getElementById('auth-form');
        const nameGroup = document.getElementById('name-group');
        const confirmPasswordGroup = document.getElementById('confirm-password-group');
        const confirmPassword = document.getElementById('confirm-password');

        const isSignUp = authForm.dataset.mode !== 'signup';

        if (isSignUp) {
            // Switch to sign up
            authForm.dataset.mode = 'signup';
            authTitle.textContent = 'Join HabitFlow';
            authSubtitle.textContent = 'Start building better habits today';
            authSubmit.innerHTML = '<span class="btn-text">Create Account</span>';
            authSwitchText.innerHTML = 'Already have an account? <a href="#" id="auth-switch-link">Sign in</a>';
            
            // Show name and confirm password fields
            nameGroup.style.display = 'block';
            confirmPasswordGroup.style.display = 'block';
        } else {
            // Switch to sign in
            authForm.dataset.mode = 'signin';
            authTitle.textContent = 'Welcome Back';
            authSubtitle.textContent = 'Sign in to continue your habit journey';
            authSubmit.innerHTML = '<span class="btn-text">Sign In</span>';
            authSwitchText.innerHTML = 'Don\'t have an account? <a href="#" id="auth-switch-link">Sign up</a>';
            
            // Hide name and confirm password fields
            nameGroup.style.display = 'none';
            confirmPasswordGroup.style.display = 'none';
        }

        // Re-bind events for new switch link
        document.getElementById('auth-switch-link').addEventListener('click', this.toggleAuthMode.bind(this));
        
        // Clear form
        authForm.reset();
    }

    setFormLoading(form, loading) {
        const submitBtn = form.querySelector('button[type="submit"]');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoader = submitBtn.querySelector('.btn-loader');

        if (loading) {
            submitBtn.disabled = true;
            submitBtn.classList.add('btn-loading');
            if (btnText) btnText.style.display = 'none';
            if (btnLoader) btnLoader.style.display = 'inline';
        } else {
            submitBtn.disabled = false;
            submitBtn.classList.remove('btn-loading');
            if (btnText) btnText.style.display = 'inline';
            if (btnLoader) btnLoader.style.display = 'none';
        }
    }

    showApp() {
        // Hide loading screen and auth modal
        const loadingScreen = document.getElementById('loading-screen');
        const authModal = document.getElementById('auth-modal');
        const app = document.getElementById('app');

        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
        }

        if (authModal) {
            authModal.classList.remove('active');
        }

        if (app) {
            app.style.display = 'flex';
        }

        // Initialize app components
        this.initializeApp();
    }

    showAuth() {
        // Hide app and show auth modal
        const app = document.getElementById('app');
        const authModal = document.getElementById('auth-modal');
        const loadingScreen = document.getElementById('loading-screen');

        if (app) {
            app.style.display = 'none';
        }

        if (authModal) {
            authModal.classList.add('active');
        }

        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
        }
    }

    initializeApp() {
        // Initialize main app components
        if (window.AppManager) {
            window.AppManager.init();
        }
    }

    hashPassword(password) {
        // Simple hash function for demo purposes
        // In production, use a proper hashing library like bcrypt
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString();
    }

    showError(message) {
        this.showToast(message, 'error');
    }

    showSuccess(message) {
        this.showToast(message, 'success');
    }

    showToast(message, type = 'info') {
        // Remove existing toast
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }

        // Create new toast
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-header">
                <span class="toast-title">${type === 'success' ? 'Success' : type === 'error' ? 'Error' : 'Info'}</span>
                <button class="toast-close">&times;</button>
            </div>
            <p class="toast-message">${message}</p>
        `;

        document.body.appendChild(toast);

        // Show toast
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);

        // Auto hide after 3 seconds
        setTimeout(() => {
            this.hideToast(toast);
        }, 3000);

        // Bind close event
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            this.hideToast(toast);
        });
    }

    hideToast(toast) {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }

    // Password strength checker
    checkPasswordStrength(password) {
        let strength = 0;
        const checks = [
            { regex: /.{8,}/, name: 'length', points: 1 },
            { regex: /[a-z]/, name: 'lowercase', points: 1 },
            { regex: /[A-Z]/, name: 'uppercase', points: 1 },
            { regex: /[0-9]/, name: 'numbers', points: 1 },
            { regex: /[^A-Za-z0-9]/, name: 'special', points: 2 }
        ];

        checks.forEach(check => {
            if (check.regex.test(password)) {
                strength += check.points;
            }
        });

        return {
            strength,
            maxStrength: 7,
            percentage: Math.min((strength / 7) * 100, 100),
            level: strength >= 5 ? 'strong' : strength >= 3 ? 'medium' : 'weak'
        };
    }

    // Email validation
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}

// Create global auth manager
const authManager = new AuthManager();