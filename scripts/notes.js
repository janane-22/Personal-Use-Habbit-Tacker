/**
 * HabitFlow - Notes Management
 * Handles daily notes, journaling, and file attachments
 */

class NotesManager {
    constructor() {
        this.currentNoteDate = new Date().toISOString().split('T')[0];
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadCurrentNote();
    }

    bindEvents() {
        // Date navigation
        const prevDayBtn = document.getElementById('prev-note-day');
        const nextDayBtn = document.getElementById('next-note-day');
        const dateInput = document.getElementById('note-date');

        if (prevDayBtn) {
            prevDayBtn.addEventListener('click', () => this.navigateDay(-1));
        }

        if (nextDayBtn) {
            nextDayBtn.addEventListener('click', () => this.navigateDay(1));
        }

        if (dateInput) {
            dateInput.addEventListener('change', (e) => this.setNoteDate(e.target.value));
        }

        // Note content
        const noteContent = document.getElementById('note-content');
        if (noteContent) {
            let saveTimeout;
            noteContent.addEventListener('input', (e) => {
                clearTimeout(saveTimeout);
                saveTimeout = setTimeout(() => {
                    this.saveNote();
                }, 1000);
            });
        }

        // File upload
        const fileUploadArea = document.getElementById('file-upload-area');
        const fileInput = document.getElementById('file-input');

        if (fileUploadArea && fileInput) {
            fileUploadArea.addEventListener('click', () => fileInput.click());
            fileUploadArea.addEventListener('dragover', this.handleDragOver.bind(this));
            fileUploadArea.addEventListener('dragleave', this.handleDragLeave.bind(this));
            fileUploadArea.addEventListener('drop', this.handleDrop.bind(this));
            fileInput.addEventListener('change', this.handleFileSelect.bind(this));
        }
    }

    navigateDay(direction) {
        const currentDate = new Date(this.currentNoteDate);
        currentDate.setDate(currentDate.getDate() + direction);
        this.setNoteDate(currentDate.toISOString().split('T')[0]);
    }

    setNoteDate(dateStr) {
        this.currentNoteDate = dateStr;
        this.loadCurrentNote();
        
        // Update date input
        const dateInput = document.getElementById('note-date');
        if (dateInput) {
            dateInput.value = dateStr;
        }

        // Update note title
        this.updateNoteTitle(dateStr);
    }

    updateNoteTitle(dateStr) {
        const noteTitle = document.getElementById('note-date-title');
        if (!noteTitle) return;

        const date = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        let title = date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        if (dateStr === today.toISOString().split('T')[0]) {
            title = `Today's Notes - ${title}`;
        } else if (dateStr === yesterday.toISOString().split('T')[0]) {
            title = `Yesterday's Notes - ${title}`;
        } else if (dateStr === tomorrow.toISOString().split('T')[0]) {
            title = `Tomorrow's Notes - ${title}`;
        } else {
            title = `${title}`;
        }

        noteTitle.textContent = title;
    }

    loadCurrentNote() {
        const noteData = db.getNotes(this.currentNoteDate);
        const noteContent = document.getElementById('note-content');
        const attachmentsList = document.getElementById('attachments-list');

        if (noteContent) {
            noteContent.value = noteData?.content || '';
        }

        if (attachmentsList) {
            this.renderAttachments(noteData?.attachments || []);
        }
    }

    saveNote() {
        const noteContent = document.getElementById('note-content');
        if (!noteContent) return;

        const noteData = {
            content: noteContent.value,
            attachments: this.getCurrentAttachments(),
            mood: this.detectMood(noteContent.value),
            wordCount: this.countWords(noteContent.value)
        };

        const success = db.setNotes(this.currentNoteDate, noteData);
        
        if (success) {
            this.showSaveIndicator();
        }
    }

    getCurrentAttachments() {
        const attachmentsList = document.getElementById('attachments-list');
        if (!attachmentsList) return [];

        const attachments = [];
        const attachmentElements = attachmentsList.querySelectorAll('.attachment-item');
        
        attachmentElements.forEach(element => {
            const data = element.dataset.attachment;
            if (data) {
                attachments.push(JSON.parse(data));
            }
        });

        return attachments;
    }

    renderAttachments(attachments) {
        const attachmentsList = document.getElementById('attachments-list');
        if (!attachmentsList) return;

        attachmentsList.innerHTML = '';

        if (attachments.length === 0) {
            return;
        }

        attachments.forEach(attachment => {
            const attachmentElement = this.createAttachmentElement(attachment);
            attachmentsList.appendChild(attachmentElement);
        });
    }

    createAttachmentElement(attachment) {
        const attachmentElement = document.createElement('div');
        attachmentElement.className = 'attachment-item';
        attachmentElement.dataset.attachment = JSON.stringify(attachment);

        const icon = this.getAttachmentIcon(attachment.type);
        const fileName = attachment.name || 'Unknown file';
        const fileSize = this.formatFileSize(attachment.size || 0);

        attachmentElement.innerHTML = `
            <div class="attachment-icon">
                ${icon}
            </div>
            <div class="attachment-info">
                <div class="attachment-name">${fileName}</div>
                <div class="attachment-meta">${fileSize} • ${attachment.type || 'unknown'}</div>
            </div>
            <button class="icon-btn attachment-remove" title="Remove attachment">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 6L18 18M6 18L18 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>
        `;

        // Add click handler for removal
        const removeBtn = attachmentElement.querySelector('.attachment-remove');
        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                this.removeAttachment(attachmentElement);
            });
        }

        // Add click handler for viewing
        if (attachment.type?.startsWith('image/')) {
            attachmentElement.style.cursor = 'pointer';
            attachmentElement.addEventListener('click', () => {
                this.viewImageAttachment(attachment);
            });
        }

        return attachmentElement;
    }

    getAttachmentIcon(type) {
        const iconMap = {
            'image/jpeg': '🖼️',
            'image/png': '🖼️',
            'image/gif': '🖼️',
            'image/webp': '🖼️',
            'application/pdf': '📄',
            'text/plain': '📝',
            'application/msword': '📄',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📄',
            'application/vnd.ms-excel': '📊',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '📊'
        };

        return iconMap[type] || '📎';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    removeAttachment(attachmentElement) {
        const confirmed = confirm('Are you sure you want to remove this attachment?');
        if (!confirmed) return;

        attachmentElement.remove();
        this.saveNote();
        animationManager.animateNotification('Attachment removed', 'success');
    }

    viewImageAttachment(attachment) {
        // Create modal for viewing image
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 90%; max-height: 90%;">
                <div class="modal-header">
                    <h3>${attachment.name}</h3>
                    <button class="icon-btn close-btn" onclick="this.closest('.modal').remove()">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6 6L18 18M6 18L18 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>
                <div style="text-align: center; padding: 1rem;">
                    <img src="${attachment.url}" alt="${attachment.name}" style="max-width: 100%; max-height: 70vh; object-fit: contain;">
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    handleDragOver(event) {
        event.preventDefault();
        event.currentTarget.classList.add('drag-over');
    }

    handleDragLeave(event) {
        event.currentTarget.classList.remove('drag-over');
    }

    handleDrop(event) {
        event.preventDefault();
        event.currentTarget.classList.remove('drag-over');
        
        const files = event.dataTransfer.files;
        this.processFiles(files);
    }

    handleFileSelect(event) {
        const files = event.target.files;
        this.processFiles(files);
    }

    processFiles(files) {
        if (files.length === 0) return;

        Array.from(files).forEach(file => {
            if (this.validateFile(file)) {
                this.addFileAttachment(file);
            }
        });
    }

    validateFile(file) {
        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'application/pdf',
            'text/plain',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];

        if (file.size > maxSize) {
            animationManager.animateNotification(`File "${file.name}" is too large. Maximum size is 10MB.`, 'error');
            return false;
        }

        if (!allowedTypes.includes(file.type)) {
            animationManager.animateNotification(`File type "${file.type}" is not supported.`, 'error');
            return false;
        }

        return true;
    }

    addFileAttachment(file) {
        // For demo purposes, we'll create a data URL for small images
        // In a real app, you'd upload to a server or cloud storage
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const attachment = {
                name: file.name,
                type: file.type,
                size: file.size,
                url: e.target.result,
                uploadedAt: new Date().toISOString()
            };

            this.addAttachmentToList(attachment);
            this.saveNote();
            animationManager.animateNotification(`File "${file.name}" attached successfully!`, 'success');
        };

        if (file.type.startsWith('image/')) {
            reader.readAsDataURL(file);
        } else {
            // For non-image files, just store metadata
            const attachment = {
                name: file.name,
                type: file.type,
                size: file.size,
                url: null,
                uploadedAt: new Date().toISOString()
            };

            this.addAttachmentToList(attachment);
            this.saveNote();
            animationManager.animateNotification(`File "${file.name}" attached successfully!`, 'success');
        }
    }

    addAttachmentToList(attachment) {
        const attachmentsList = document.getElementById('attachments-list');
        if (!attachmentsList) return;

        const attachmentElement = this.createAttachmentElement(attachment);
        attachmentsList.appendChild(attachmentElement);
    }

    detectMood(text) {
        if (!text) return null;

        const positiveWords = ['happy', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'good', 'positive', 'motivated', 'energetic'];
        const negativeWords = ['sad', 'bad', 'terrible', 'awful', 'frustrated', 'stressed', 'anxious', 'worried', 'tired', 'exhausted'];

        const lowerText = text.toLowerCase();
        let positiveCount = 0;
        let negativeCount = 0;

        positiveWords.forEach(word => {
            if (lowerText.includes(word)) positiveCount++;
        });

        negativeWords.forEach(word => {
            if (lowerText.includes(word)) negativeCount++;
        });

        if (positiveCount > negativeCount) return 'positive';
        if (negativeCount > positiveCount) return 'negative';
        return 'neutral';
    }

    countWords(text) {
        if (!text) return 0;
        return text.trim().split(/\s+/).length;
    }

    showSaveIndicator() {
        const noteContent = document.getElementById('note-content');
        if (!noteContent) return;

        // Create save indicator
        const indicator = document.createElement('div');
        indicator.className = 'save-indicator';
        indicator.textContent = 'Saved';
        indicator.style.cssText = `
            position: fixed;
            bottom: 100px;
            right: 20px;
            background: var(--success);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 12px;
            z-index: 1000;
            animation: fadeInUp 0.3s ease-out, fadeOut 0.3s ease-in 2s forwards;
        `;

        document.body.appendChild(indicator);

        setTimeout(() => {
            if (indicator.parentNode) {
                indicator.parentNode.removeChild(indicator);
            }
        }, 2300);
    }

    // Search functionality
    searchNotes(query) {
        return db.searchNotes(query);
    }

    // Get notes statistics
    getNotesStats() {
        const allNotes = db.getNotes();
        const notesArray = Object.entries(allNotes).map(([date, data]) => ({
            date,
            ...data
        }));

        const totalNotes = notesArray.length;
        const totalWords = notesArray.reduce((sum, note) => sum + (note.wordCount || 0), 0);
        const totalAttachments = notesArray.reduce((sum, note) => sum + (note.attachments?.length || 0), 0);

        const moodCounts = notesArray.reduce((counts, note) => {
            if (note.mood) {
                counts[note.mood] = (counts[note.mood] || 0) + 1;
            }
            return counts;
        }, {});

        const avgWordsPerNote = totalNotes > 0 ? Math.round(totalWords / totalNotes) : 0;

        return {
            totalNotes,
            totalWords,
            totalAttachments,
            avgWordsPerNote,
            moodCounts,
            firstNoteDate: totalNotes > 0 ? notesArray.sort((a, b) => a.date.localeCompare(b.date))[0].date : null,
            lastNoteDate: totalNotes > 0 ? notesArray.sort((a, b) => b.date.localeCompare(a.date))[0].date : null
        };
    }

    // Export notes data
    exportNotesData() {
        const stats = this.getNotesStats();
        const allNotes = db.getNotes();
        
        const data = {
            notes: allNotes,
            stats,
            exportDate: new Date().toISOString()
        };

        return JSON.stringify(data, null, 2);
    }

    // Generate note summary
    generateNoteSummary(dateStr) {
        const noteData = db.getNotes(dateStr);
        if (!noteData || !noteData.content) return null;

        const wordCount = noteData.wordCount || 0;
        const attachmentCount = noteData.attachments?.length || 0;
        const mood = noteData.mood;

        let summary = '';
        
        if (wordCount > 0) {
            summary += `Wrote ${wordCount} words`;
        }

        if (attachmentCount > 0) {
            summary += summary ? ` and attached ${attachmentCount} file${attachmentCount > 1 ? 's' : ''}` : `Attached ${attachmentCount} file${attachmentCount > 1 ? 's' : ''}`;
        }

        if (mood) {
            const moodEmoji = mood === 'positive' ? '😊' : mood === 'negative' ? '😔' : '😐';
            summary += summary ? ` (${moodEmoji} mood)` : `${moodEmoji} mood`;
        }

        return summary || 'No content';
    }

    // Quick note templates
    addQuickNote(template) {
        const noteContent = document.getElementById('note-content');
        if (!noteContent) return;

        const templates = {
            gratitude: `Today I'm grateful for:\n1. \n2. \n3. \n\nHow did this make me feel? `,
            reflection: `Reflection for today:\n\nWhat went well?\n\nWhat could be improved?\n\nWhat did I learn?\n\nTomorrow I want to focus on: `,
            goals: `Daily goals:\n\n☐ \n☐ \n☐ \n\nCompleted: \n\nNotes: `,
            mood: `My mood today: [Happy/Sad/Anxious/Excited/Calm/Frustrated]\n\nWhat influenced my mood?\n\nHow do I want to feel tomorrow? `
        };

        if (templates[template]) {
            noteContent.value = templates[template];
            this.saveNote();
            animationManager.animateNotification(`${template} template added!`, 'success');
        }
    }

    // Mood tracking
    getMoodTrends(days = 30) {
        const allNotes = db.getNotes();
        const trends = [];
        const today = new Date();

        for (let i = 0; i < days; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            const noteData = allNotes[dateStr];
            if (noteData?.mood) {
                trends.push({
                    date: dateStr,
                    mood: noteData.mood,
                    wordCount: noteData.wordCount || 0
                });
            }
        }

        return trends.reverse();
    }
}

// Create global notes manager
const notesManager = new NotesManager();