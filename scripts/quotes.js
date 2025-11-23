/**
 * HabitFlow - Daily Motivational Quotes
 * Provides inspiring quotes for daily motivation
 */

class QuoteManager {
    constructor() {
        this.quotes = this.initializeQuotes();
        this.init();
    }

    init() {
        this.displayTodaysQuote();
        this.bindEvents();
    }

    initializeQuotes() {
        return [
            // Habit Building Quotes
            {
                text: "The secret of getting ahead is getting started.",
                author: "Mark Twain",
                category: "habits",
                tags: ["motivation", "action"]
            },
            {
                text: "Success is the sum of small efforts, repeated day in and day out.",
                author: "Robert Collier",
                category: "habits",
                tags: ["consistency", "success"]
            },
            {
                text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.",
                author: "Will Durant",
                category: "habits",
                tags: ["excellence", "character"]
            },
            {
                text: "Don't break the chain.",
                author: "Jerry Seinfeld",
                category: "habits",
                tags: ["consistency", "routine"]
            },
            {
                text: "Motivation gets you started, but habit is what keeps you going.",
                author: "Jim Rohn",
                category: "habits",
                tags: ["habit", "persistence"]
            },

            // General Motivation
            {
                text: "The only way to do great work is to love what you do.",
                author: "Steve Jobs",
                category: "motivation",
                tags: ["passion", "work"]
            },
            {
                text: "Life is 10% what happens to you and 90% how you react to it.",
                author: "Charles R. Swindoll",
                category: "motivation",
                tags: ["attitude", "perspective"]
            },
            {
                text: "The best time to plant a tree was 20 years ago. The second best time is now.",
                author: "Chinese Proverb",
                category: "motivation",
                tags: ["timing", "action"]
            },
            {
                text: "What you get by achieving your goals is not as important as what you become by achieving your goals.",
                author: "Zig Ziglar",
                category: "motivation",
                tags: ["growth", "achievement"]
            },
            {
                text: "The future belongs to those who believe in the beauty of their dreams.",
                author: "Eleanor Roosevelt",
                category: "motivation",
                tags: ["dreams", "future"]
            },

            // Discipline & Self-Control
            {
                text: "Self-discipline is the ability to do what you need to do, when you need to do it, whether you feel like it or not.",
                author: "Elbert Hubbard",
                category: "discipline",
                tags: ["self-control", "action"]
            },
            {
                text: "No one can make you feel inferior without your consent.",
                author: "Eleanor Roosevelt",
                category: "discipline",
                tags: ["self-worth", "confidence"]
            },
            {
                text: "The greatest revolution of our generation is the discovery that human beings, by changing the inner attitudes of their minds, can change the outer aspects of their lives.",
                author: "William James",
                category: "discipline",
                tags: ["mindset", "change"]
            },
            {
                text: "Discipline equals freedom.",
                author: "Jocko Willink",
                category: "discipline",
                tags: ["discipline", "freedom"]
            },

            // Progress & Growth
            {
                text: "Progress, not perfection.",
                author: "Unknown",
                category: "progress",
                tags: ["improvement", "perfectionism"]
            },
            {
                text: "A journey of a thousand miles begins with a single step.",
                author: "Lao Tzu",
                category: "progress",
                tags: ["journey", "beginning"]
            },
            {
                text: "The only impossible journey is the one you never begin.",
                author: "Tony Robbins",
                category: "progress",
                tags: ["journey", "beginning"]
            },
            {
                text: "Every expert was once a beginner.",
                author: "Helen Hayes",
                category: "progress",
                tags: ["learning", "expertise"]
            },
            {
                text: "Fall seven times, stand up eight.",
                author: "Japanese Proverb",
                category: "progress",
                tags: ["resilience", "perseverance"]
            },

            // Wellness & Health
            {
                text: "Take care of your body. It's the only place you have to live.",
                author: "Jim Rohn",
                category: "wellness",
                tags: ["health", "body"]
            },
            {
                text: "Your body can stand almost anything. It's your mind that you have to convince.",
                author: "Unknown",
                category: "wellness",
                tags: ["mental-strength", "exercise"]
            },
            {
                text: "The greatest wealth is health.",
                author: "Virgil",
                category: "wellness",
                tags: ["health", "wealth"]
            },

            // Mindfulness & Mental Health
            {
                text: "The present moment is the only time over which we have dominion.",
                author: "Thích Nhất Hạnh",
                category: "mindfulness",
                tags: ["present", "mindfulness"]
            },
            {
                text: "Peace comes from within. Do not seek it without.",
                author: "Buddha",
                category: "mindfulness",
                tags: ["peace", "inner-calm"]
            },
            {
                text: "You have power over your mind - not outside events. Realize this, and you will find strength.",
                author: "Marcus Aurelius",
                category: "mindfulness",
                tags: ["control", "strength"]
            },

            // Learning & Knowledge
            {
                text: "Live as if you were to die tomorrow. Learn as if you were to live forever.",
                author: "Mahatma Gandhi",
                category: "learning",
                tags: ["learning", "urgency"]
            },
            {
                text: "Tell me and I forget, teach me and I may remember, involve me and I learn.",
                author: "Benjamin Franklin",
                category: "learning",
                tags: ["learning", "involvement"]
            },
            {
                text: "The beautiful thing about learning is that no one can take it away from you.",
                author: "B.B. King",
                category: "learning",
                tags: ["knowledge", "ownership"]
            },

            // Time Management
            {
                text: "Time is what we want most, but what we use worst.",
                author: "William Penn",
                category: "time",
                tags: ["time", "management"]
            },
            {
                text: "The key is not to prioritize what's on your schedule, but to schedule your priorities.",
                author: "Stephen Covey",
                category: "time",
                tags: ["priorities", "planning"]
            },
            {
                text: "Don't watch the clock; do what it does. Keep going.",
                author: "Sam Levenson",
                category: "time",
                tags: ["persistence", "time"]
            },

            // Success & Achievement
            {
                text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
                author: "Winston Churchill",
                category: "success",
                tags: ["courage", "perseverance"]
            },
            {
                text: "The way to get started is to quit talking and begin doing.",
                author: "Walt Disney",
                category: "success",
                tags: ["action", "beginning"]
            },
            {
                text: "Success is walking from failure to failure with no loss of enthusiasm.",
                author: "Winston Churchill",
                category: "success",
                tags: ["enthusiasm", "failure"]
            },

            // Confidence & Self-Belief
            {
                text: "Whether you think you can or you think you can't, you're right.",
                author: "Henry Ford",
                category: "confidence",
                tags: ["mindset", "belief"]
            },
            {
                text: "Believe you can and you're halfway there.",
                author: "Theodore Roosevelt",
                category: "confidence",
                tags: ["belief", "confidence"]
            },
            {
                text: "You yourself, as much as anybody in the entire universe, deserve your love and affection.",
                author: "Buddha",
                category: "confidence",
                tags: ["self-love", "acceptance"]
            },

            // New Day Motivation
            {
                text: "Today is a perfect day to start living your dreams.",
                author: "Unknown",
                category: "new-day",
                tags: ["dreams", "today"]
            },
            {
                text: "Each morning we are born again. What we do today matters most.",
                author: "Buddha",
                category: "new-day",
                tags: ["renewal", "today"]
            },
            {
                text: "Make each day your masterpiece.",
                author: "John Wooden",
                category: "new-day",
                tags: ["mastery", "excellence"]
            },

            // Weekend/Rest Motivation
            {
                text: "Rest when you're weary. Refresh and renew yourself, your body, your mind, your spirit.",
                author: "Diane M. K. Reeves",
                category: "rest",
                tags: ["rest", "renewal"]
            },
            {
                text: "Taking time to do nothing often brings everything into perspective.",
                author: "Danielle Dick",
                category: "rest",
                tags: ["perspective", "reflection"]
            }
        ];
    }

    bindEvents() {
        // Refresh quote button (if you want to add one later)
        const refreshBtn = document.getElementById('refresh-quote');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.displayRandomQuote();
            });
        }
    }

    displayTodaysQuote() {
        const today = new Date().toDateString();
        const storedQuote = localStorage.getItem('todaysQuote');
        
        if (storedQuote) {
            const { date, quote } = JSON.parse(storedQuote);
            if (date === today) {
                this.renderQuote(quote);
                return;
            }
        }

        // Generate new quote for today
        const todaysQuote = this.generateTodaysQuote();
        this.renderQuote(todaysQuote);
        
        // Store for today
        localStorage.setItem('todaysQuote', JSON.stringify({
            date: today,
            quote: todaysQuote
        }));
    }

    generateTodaysQuote() {
        // Use a deterministic method based on the date to ensure same quote all day
        const today = new Date();
        const dayOfYear = this.getDayOfYear(today);
        const seed = dayOfYear + today.getFullYear();
        
        // Use seed to select quote
        const quoteIndex = seed % this.quotes.length;
        const selectedQuote = this.quotes[quoteIndex];
        
        // Add some randomization based on user's habits
        const userHabits = db.getHabits();
        const recentCompletions = this.getRecentCompletions();
        
        // Adjust quote selection based on user context
        let contextAdjustedQuote = this.adjustQuoteForContext(selectedQuote, userHabits, recentCompletions);
        
        return contextAdjustedQuote;
    }

    adjustQuoteForContext(quote, habits, recentCompletions) {
        // If user has many completed habits recently, use motivation quote
        if (recentCompletions > habits.length * 0.7) {
            const successQuotes = this.quotes.filter(q => q.category === 'success' || q.category === 'progress');
            if (successQuotes.length > 0) {
                return successQuotes[Math.floor(Math.random() * successQuotes.length)];
            }
        }
        
        // If user hasn't completed many habits, use encouragement quote
        if (recentCompletions < habits.length * 0.3) {
            const motivationQuotes = this.quotes.filter(q => q.category === 'motivation' || q.category === 'habits');
            if (motivationQuotes.length > 0) {
                return motivationQuotes[Math.floor(Math.random() * motivationQuotes.length)];
            }
        }
        
        // If it's the weekend, might use rest/recovery quotes
        const today = new Date();
        if (today.getDay() === 0 || today.getDay() === 6) {
            const restQuotes = this.quotes.filter(q => q.category === 'rest' || q.category === 'mindfulness');
            if (restQuotes.length > 0 && Math.random() > 0.5) {
                return restQuotes[Math.floor(Math.random() * restQuotes.length)];
            }
        }
        
        return quote;
    }

    getRecentCompletions() {
        const today = new Date();
        let recentCompletions = 0;
        let totalPossible = 0;
        
        // Check last 3 days
        for (let i = 0; i < 3; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            const dayCompletions = db.getCompletion(dateStr);
            const completedCount = Object.values(dayCompletions).filter(Boolean).length;
            recentCompletions += completedCount;
            totalPossible += db.getHabits().length;
        }
        
        return totalPossible > 0 ? recentCompletions / totalPossible : 0;
    }

    getDayOfYear(date) {
        const start = new Date(date.getFullYear(), 0, 0);
        const diff = date - start;
        const oneDay = 1000 * 60 * 60 * 24;
        return Math.floor(diff / oneDay);
    }

    renderQuote(quote) {
        const quoteText = document.getElementById('daily-quote-text');
        const quoteAuthor = document.getElementById('daily-quote-author');
        
        if (quoteText && quoteAuthor) {
            // Add fade-out effect
            quoteText.style.opacity = '0';
            quoteAuthor.style.opacity = '0';
            
            setTimeout(() => {
                quoteText.textContent = `"${quote.text}"`;
                quoteAuthor.textContent = `— ${quote.author}`;
                
                // Add fade-in effect
                quoteText.style.opacity = '1';
                quoteAuthor.style.opacity = '1';
            }, 300);
        }
    }

    displayRandomQuote() {
        const randomIndex = Math.floor(Math.random() * this.quotes.length);
        const randomQuote = this.quotes[randomIndex];
        this.renderQuote(randomQuote);
    }

    getQuotesByCategory(category) {
        return this.quotes.filter(quote => quote.category === category);
    }

    getQuotesByTag(tag) {
        return this.quotes.filter(quote => quote.tags.includes(tag));
    }

    searchQuotes(query) {
        const lowercaseQuery = query.toLowerCase();
        return this.quotes.filter(quote => 
            quote.text.toLowerCase().includes(lowercaseQuery) ||
            quote.author.toLowerCase().includes(lowercaseQuery) ||
            quote.category.toLowerCase().includes(lowercaseQuery) ||
            quote.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
        );
    }

    getRandomQuote() {
        return this.quotes[Math.floor(Math.random() * this.quotes.length)];
    }

    // Additional utility methods
    getQuoteOfTheDayBySeed(seed) {
        const quoteIndex = seed % this.quotes.length;
        return this.quotes[quoteIndex];
    }

    generateWeeklyQuotes() {
        const quotes = [];
        const today = new Date();
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dayOfYear = this.getDayOfYear(date);
            const seed = dayOfYear + date.getFullYear();
            const quoteIndex = seed % this.quotes.length;
            
            quotes.push({
                date: date.toISOString().split('T')[0],
                quote: this.quotes[quoteIndex]
            });
        }
        
        return quotes;
    }

    // Method to add custom quotes (for future feature)
    addCustomQuote(text, author, category = 'custom', tags = []) {
        const customQuote = {
            text,
            author,
            category,
            tags,
            isCustom: true
        };
        
        // Store custom quotes separately
        const customQuotes = JSON.parse(localStorage.getItem('customQuotes') || '[]');
        customQuotes.push(customQuote);
        localStorage.setItem('customQuotes', JSON.stringify(customQuotes));
        
        return true;
    }

    getCustomQuotes() {
        return JSON.parse(localStorage.getItem('customQuotes') || '[]');
    }

    // Context-aware quote selection
    getContextualQuote(userStats) {
        const { currentStreak, longestStreak, completionRate, dayOfWeek } = userStats;
        
        // High streak - motivational success quotes
        if (currentStreak > longestStreak * 0.8) {
            const successQuotes = this.getQuotesByCategory('success');
            if (successQuotes.length > 0) {
                return successQuotes[Math.floor(Math.random() * successQuotes.length)];
            }
        }
        
        // Low completion rate - encouragement quotes
        if (completionRate < 0.3) {
            const motivationQuotes = this.getQuotesByCategory('motivation');
            if (motivationQuotes.length > 0) {
                return motivationQuotes[Math.floor(Math.random() * motivationQuotes.length)];
            }
        }
        
        // Weekend - rest/balance quotes
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            const restQuotes = this.getQuotesByCategory('rest');
            if (restQuotes.length > 0 && Math.random() > 0.5) {
                return restQuotes[Math.floor(Math.random() * restQuotes.length)];
            }
        }
        
        // Default to habits category
        const habitQuotes = this.getQuotesByCategory('habits');
        if (habitQuotes.length > 0) {
            return habitQuotes[Math.floor(Math.random() * habitQuotes.length)];
        }
        
        // Fallback to any quote
        return this.getRandomQuote();
    }
}

// Create global quote manager
const quoteManager = new QuoteManager();