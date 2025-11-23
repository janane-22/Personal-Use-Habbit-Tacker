/**
 * HabitFlow - Animation Utilities
 * Handles all micro-interactions, confetti effects, and UI animations
 */

class AnimationManager {
    constructor() {
        this.init();
    }

    init() {
        this.bindGlobalEvents();
        this.setupIntersectionObserver();
    }

    bindGlobalEvents() {
        // Listen for habit completion events
        document.addEventListener('habitCompleted', (event) => {
            this.animateHabitCompletion(event.detail.habitId);
        });

        // Listen for level up events
        document.addEventListener('levelUp', (event) => {
            this.animateLevelUp(event.detail.level);
        });

        // Listen for achievement events
        document.addEventListener('achievement', (event) => {
            this.animateAchievement(event.detail.achievement);
        });

        // Listen for form submissions
        document.addEventListener('submit', (event) => {
            if (event.target.classList.contains('habit-form')) {
                this.animateFormSuccess(event.target);
            }
        });
    }

    // Confetti Animation
    triggerConfetti(options = {}) {
        const {
            particleCount = 100,
            spread = 70,
            origin = { y: 0.6 },
            colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
        } = options;

        // Check if confetti library is available
        if (typeof confetti === 'function') {
            confetti({
                particleCount,
                spread,
                origin,
                colors
            });
        } else {
            // Fallback animation
            this.createFallbackConfetti();
        }
    }

    createFallbackConfetti() {
        const container = document.createElement('div');
        container.className = 'confetti-container';
        document.body.appendChild(container);

        const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
        
        for (let i = 0; i < 50; i++) {
            const confettiPiece = document.createElement('div');
            confettiPiece.className = 'confetti-piece';
            confettiPiece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confettiPiece.style.left = Math.random() * 100 + '%';
            confettiPiece.style.animationDelay = Math.random() * 2 + 's';
            confettiPiece.style.animationDuration = (Math.random() * 3 + 2) + 's';
            
            container.appendChild(confettiPiece);
        }

        // Remove container after animation
        setTimeout(() => {
            if (container.parentNode) {
                container.parentNode.removeChild(container);
            }
        }, 5000);
    }

    // Habit Completion Animation
    animateHabitCompletion(habitId) {
        const habitElement = document.querySelector(`[data-habit-id="${habitId}"]`);
        if (!habitElement) return;

        const toggleButton = habitElement.querySelector('.habit-completion-toggle');
        if (!toggleButton) return;

        // Animate the completion button
        this.animateButtonPress(toggleButton);
        
        // Add completion class
        setTimeout(() => {
            toggleButton.classList.add('completed');
            this.triggerConfetti({
                origin: { y: 0.8, x: 0.5 }
            });
        }, 200);

        // Animate progress dots
        this.animateProgressDots(habitElement);
        
        // Add celebration effect to entire card
        habitElement.classList.add('habit-completed');
        setTimeout(() => {
            habitElement.classList.remove('habit-completed');
        }, 1000);
    }

    animateButtonPress(button) {
        button.style.transform = 'scale(0.9)';
        setTimeout(() => {
            button.style.transform = 'scale(1.1)';
            setTimeout(() => {
                button.style.transform = 'scale(1)';
            }, 150);
        }, 100);
    }

    animateProgressDots(habitElement) {
        const dots = habitElement.querySelectorAll('.progress-dot');
        dots.forEach((dot, index) => {
            setTimeout(() => {
                dot.classList.add('completing');
                setTimeout(() => {
                    dot.classList.remove('completing');
                }, 600);
            }, index * 100);
        });
    }

    // Level Up Animation
    animateLevelUp(level) {
        const achievementBadge = document.createElement('div');
        achievementBadge.className = 'achievement-badge animate-bounce-in';
        achievementBadge.innerHTML = `
            <div class="achievement-icon">🎉</div>
            <div class="achievement-title">Level Up!</div>
            <div class="achievement-description">You've reached level ${level}</div>
        `;

        document.body.appendChild(achievementBadge);

        // Trigger confetti
        this.triggerConfetti({
            particleCount: 200,
            spread: 100
        });

        // Auto remove after animation
        setTimeout(() => {
            achievementBadge.style.animation = 'bounceOut 0.5s ease-in forwards';
            setTimeout(() => {
                if (achievementBadge.parentNode) {
                    achievementBadge.parentNode.removeChild(achievementBadge);
                }
            }, 500);
        }, 3000);
    }

    // Achievement Animation
    animateAchievement(achievementType) {
        const achievementMessages = {
            'first_habit': {
                icon: '🎯',
                title: 'First Habit!',
                description: 'You created your first habit. Great start!'
            },
            '7_day_streak': {
                icon: '🔥',
                title: 'Streak Master!',
                description: '7-day streak achieved. You\'re on fire!'
            },
            '30_day_streak': {
                icon: '💎',
                title: 'Habit Champion!',
                description: '30-day streak! You\'re a true champion!'
            },
            '100_completions': {
                icon: '⭐',
                title: 'Century Club!',
                description: '100 completions! You\'re unstoppable!'
            },
            'perfect_week': {
                icon: '🌟',
                title: 'Perfect Week!',
                description: 'You completed all habits for a week!'
            }
        };

        const achievement = achievementMessages[achievementType];
        if (!achievement) return;

        const achievementBadge = document.createElement('div');
        achievementBadge.className = 'achievement-badge animate-bounce-in';
        achievementBadge.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-title">${achievement.title}</div>
            <div class="achievement-description">${achievement.description}</div>
        `;

        document.body.appendChild(achievementBadge);

        // Trigger confetti
        this.triggerConfetti({
            particleCount: 150,
            spread: 80,
            colors: ['#FFD700', '#FFA500', '#FF69B4', '#32CD32', '#4169E1']
        });

        // Auto remove after animation
        setTimeout(() => {
            achievementBadge.style.animation = 'bounceOut 0.5s ease-in forwards';
            setTimeout(() => {
                if (achievementBadge.parentNode) {
                    achievementBadge.parentNode.removeChild(achievementBadge);
                }
            }, 500);
        }, 4000);
    }

    // Form Success Animation
    animateFormSuccess(form) {
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            // Change button text and color
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span class="btn-text">✓ Success!</span>';
            submitBtn.style.background = 'var(--success)';
            
            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.style.background = '';
            }, 2000);
        }
    }

    // Progress Ring Animation
    animateProgressRing(percentage) {
        const ring = document.querySelector('.progress-ring-fill');
        if (!ring) return;

        const degrees = (percentage / 100) * 360;
        ring.style.background = `conic-gradient(var(--habit-gold) 0deg, var(--habit-gold) ${degrees}deg, transparent ${degrees}deg, transparent 360deg)`;
        ring.classList.add('animating');
        
        setTimeout(() => {
            ring.classList.remove('animating');
        }, 800);
    }

    // Streak Counter Animation
    animateStreakUpdate(newStreak) {
        const streakElement = document.querySelector('.streak-number');
        if (!streakElement) return;

        streakElement.classList.add('updating');
        this.animateNumberChange(streakElement, newStreak);
        
        setTimeout(() => {
            streakElement.classList.remove('updating');
        }, 600);
    }

    animateNumberChange(element, newValue) {
        const currentValue = parseInt(element.textContent) || 0;
        const increment = newValue > currentValue ? 1 : -1;
        const duration = 600; // ms
        const steps = Math.abs(newValue - currentValue);
        const stepTime = duration / steps;

        let current = currentValue;
        const timer = setInterval(() => {
            current += increment;
            element.textContent = current;
            
            if (current === newValue) {
                clearInterval(timer);
            }
        }, stepTime);
    }

    // Page Transition Animations
    animatePageTransition(fromView, toView) {
        if (fromView) {
            fromView.style.animation = 'fadeOut 0.3s ease forwards';
        }
        
        setTimeout(() => {
            if (fromView) {
                fromView.classList.remove('active');
                fromView.style.animation = '';
            }
            
            if (toView) {
                toView.classList.add('active');
                toView.style.animation = 'fadeInUp 0.3s ease forwards';
            }
        }, 150);
    }

    // Micro-interactions
    setupMicroInteractions() {
        // Button hover effects
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(button => {
            button.addEventListener('mouseenter', () => {
                button.style.transform = 'translateY(-2px)';
            });
            
            button.addEventListener('mouseleave', () => {
                button.style.transform = 'translateY(0)';
            });
        });

        // Card hover effects
        const cards = document.querySelectorAll('.habit-card, .stat-card, .progress-card');
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-4px)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
            });
        });
    }

    // Ripple Effect
    createRippleEffect(event, element) {
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        const ripple = document.createElement('span');
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s ease-out;
            pointer-events: none;
        `;

        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);

        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 600);
    }

    // Garden/Forest Animation
    animateGardenGrowth() {
        const gardenContainer = document.querySelector('.garden-container');
        if (!gardenContainer) return;

        const habits = db.getHabits();
        const completedToday = Object.values(db.getTodayCompletions()).filter(Boolean).length;
        const completionRate = habits.length > 0 ? completedToday / habits.length : 0;

        // Determine plant based on completion rate
        let plant = '';
        if (completionRate === 1) {
            plant = '🌳'; // Full tree
        } else if (completionRate >= 0.7) {
            plant = '🌱'; // Growing plant
        } else if (completionRate >= 0.3) {
            plant = '🌿'; // Small plant
        } else {
            plant = '🌾'; // Wilted plant
        }

        gardenContainer.innerHTML = `
            <div class="garden-plant">${plant}</div>
            <p style="text-align: center; margin-top: 8px; font-size: 12px;">
                ${Math.round(completionRate * 100)}% Complete
            </p>
        `;

        // Animate plant growth
        const plantElement = gardenContainer.querySelector('.garden-plant');
        if (plantElement) {
            plantElement.style.animation = 'plantGrow 0.8s ease-out';
        }
    }

    // Floating Action Button Animation
    animateFAB() {
        const fab = document.querySelector('.fab');
        if (!fab) return;

        // Animate FAB entrance
        fab.style.transform = 'scale(0) rotate(180deg)';
        fab.style.opacity = '0';
        
        setTimeout(() => {
            fab.style.transition = 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
            fab.style.transform = 'scale(1) rotate(0deg)';
            fab.style.opacity = '1';
        }, 500);

        // Add click animation
        fab.addEventListener('click', (e) => {
            this.createRippleEffect(e, fab);
        });
    }

    // Setup Intersection Observer for scroll animations
    setupIntersectionObserver() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-fade-in-up');
                }
            });
        }, observerOptions);

        // Observe elements for scroll animations
        const elementsToAnimate = document.querySelectorAll(
            '.habit-card, .stat-card, .chart-card, .progress-card'
        );
        
        elementsToAnimate.forEach(element => {
            observer.observe(element);
        });
    }

    // Notification Animations
    animateNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification animate-slideInFromTop`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${type === 'success' ? '✓' : '!'}</span>
                <span class="notification-message">${message}</span>
            </div>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--bg-surface);
            border: 1px solid var(--border-default);
            border-left: 4px solid ${type === 'success' ? 'var(--success)' : 'var(--warning)'};
            border-radius: var(--radius-md);
            padding: 16px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            z-index: 2000;
            min-width: 300px;
            animation: slideInFromTop 0.3s ease-out;
        `;

        document.body.appendChild(notification);

        // Auto remove
        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s ease-in forwards';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Loading State Animations
    showLoadingSpinner(element) {
        element.innerHTML = '<div class="loading-spinner"></div>';
        element.disabled = true;
    }

    hideLoadingSpinner(element, originalContent) {
        element.innerHTML = originalContent;
        element.disabled = false;
    }

    // Keyboard Shortcuts Animation
    animateKeyboardShortcut(key) {
        const keyElement = document.createElement('div');
        keyElement.className = 'keyboard-key';
        keyElement.textContent = key;
        keyElement.style.cssText = `
            position: fixed;
            bottom: 100px;
            right: 20px;
            background: var(--bg-surface);
            border: 1px solid var(--border-default);
            border-radius: var(--radius-sm);
            padding: 8px 12px;
            font-size: 12px;
            color: var(--text-secondary);
            animation: fadeInUp 0.3s ease-out, fadeOut 0.3s ease-in 2s forwards;
            z-index: 1500;
            pointer-events: none;
        `;

        document.body.appendChild(keyElement);

        setTimeout(() => {
            if (keyElement.parentNode) {
                keyElement.parentNode.removeChild(keyElement);
            }
        }, 2300);
    }

    // Theme Transition Animation
    animateThemeChange() {
        const body = document.body;
        body.style.transition = 'background-color 0.5s ease, color 0.5s ease';
        
        setTimeout(() => {
            body.style.transition = '';
        }, 500);
    }

    // Easter Egg Animations
    triggerEasterEgg(eggType) {
        const easterEggs = {
            rain: () => this.animateRain(),
            fireworks: () => this.animateFireworks(),
            floating: () => this.animateFloatingElements()
        };

        if (easterEggs[eggType]) {
            easterEggs[eggType]();
        }
    }

    animateRain() {
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const raindrop = document.createElement('div');
                raindrop.style.cssText = `
                    position: fixed;
                    top: -10px;
                    left: ${Math.random() * 100}%;
                    width: 2px;
                    height: 20px;
                    background: linear-gradient(to bottom, transparent, var(--primary-500));
                    animation: rainFall 2s linear;
                    z-index: 1000;
                    pointer-events: none;
                `;
                
                document.body.appendChild(raindrop);
                
                setTimeout(() => {
                    if (raindrop.parentNode) {
                        raindrop.parentNode.removeChild(raindrop);
                    }
                }, 2000);
            }, i * 100);
        }
    }

    animateFireworks() {
        const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'];
        
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const x = Math.random() * window.innerWidth;
                const y = Math.random() * (window.innerHeight * 0.6);
                
                colors.forEach(color => {
                    const particle = document.createElement('div');
                    particle.style.cssText = `
                        position: fixed;
                        left: ${x}px;
                        top: ${y}px;
                        width: 6px;
                        height: 6px;
                        background: ${color};
                        border-radius: 50%;
                        animation: fireworkExplosion 1s ease-out forwards;
                        z-index: 1000;
                        pointer-events: none;
                    `;
                    
                    document.body.appendChild(particle);
                    
                    setTimeout(() => {
                        if (particle.parentNode) {
                            particle.parentNode.removeChild(particle);
                        }
                    }, 1000);
                });
            }, i * 200);
        }
    }

    animateFloatingElements() {
        const elements = ['🎈', '🎀', '⭐', '💫', '🌟'];
        
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                const element = document.createElement('div');
                element.textContent = elements[Math.floor(Math.random() * elements.length)];
                element.style.cssText = `
                    position: fixed;
                    left: ${Math.random() * window.innerWidth}px;
                    top: ${window.innerHeight + 50}px;
                    font-size: ${Math.random() * 20 + 20}px;
                    animation: floatUp 4s linear forwards;
                    z-index: 1000;
                    pointer-events: none;
                `;
                
                document.body.appendChild(element);
                
                setTimeout(() => {
                    if (element.parentNode) {
                        element.parentNode.removeChild(element);
                    }
                }, 4000);
            }, i * 200);
        }
    }

    // Cleanup method
    cleanup() {
        // Remove all animation event listeners
        document.removeEventListener('habitCompleted', this.animateHabitCompletion);
        document.removeEventListener('levelUp', this.animateLevelUp);
        document.removeEventListener('achievement', this.animateAchievement);
    }
}

// Add CSS animations to document
const animationStyles = `
    @keyframes fadeOut {
        to {
            opacity: 0;
            transform: translateY(-20px);
        }
    }
    
    @keyframes rainFall {
        to {
            transform: translateY(${window.innerHeight + 50}px);
            opacity: 0;
        }
    }
    
    @keyframes fireworkExplosion {
        0% {
            transform: scale(0) rotate(0deg);
            opacity: 1;
        }
        100% {
            transform: scale(${Math.random() * 3 + 1}) rotate(720deg);
            opacity: 0;
        }
    }
    
    @keyframes floatUp {
        to {
            transform: translateY(-${window.innerHeight + 100}px);
            opacity: 0;
        }
    }
`;

// Inject animation styles
const styleSheet = document.createElement('style');
styleSheet.textContent = animationStyles;
document.head.appendChild(styleSheet);

// Create global animation manager
const animationManager = new AnimationManager();