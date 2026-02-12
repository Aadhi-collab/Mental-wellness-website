// API Service for NeonDB Integration
const API_BASE = '/.netlify/functions';

const ApiService = {
    // Set current user ID after login
    currentUserId: null,

    // Authentication
    async register(username, password) {
        try {
            const response = await fetch(`${API_BASE}/auth`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'register', username, password })
            });
            return await response.json();
        } catch (error) {
            console.error('Register error:', error);
            throw error;
        }
    },

    async login(username, password) {
        try {
            const response = await fetch(`${API_BASE}/auth`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'login', username, password })
            });
            const data = await response.json();
            
            if (data.user) {
                this.currentUserId = data.user.id;
                localStorage.setItem('userId', data.user.id);
                localStorage.setItem('username', data.user.username);
            }
            
            return data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },

    // Wellness Entries
    async saveEntry(entry) {
        try {
            const response = await fetch(`${API_BASE}/entries`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    user_id: this.currentUserId,
                    ...entry 
                })
            });
            return await response.json();
        } catch (error) {
            console.error('Save entry error:', error);
            throw error;
        }
    },

    async getAllEntries() {
        try {
            const response = await fetch(`${API_BASE}/entries?user_id=${this.currentUserId}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await response.json();
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('Get entries error:', error);
            return [];
        }
    },

    async getEntry(date) {
        try {
            const entries = await this.getAllEntries();
            return entries.find(entry => entry.date === date);
        } catch (error) {
            console.error('Get entry error:', error);
            return null;
        }
    },

    async getLastNDays(days) {
        try {
            const entries = await this.getAllEntries();
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - days);
            
            return entries.filter(entry => new Date(entry.date) >= cutoffDate);
        } catch (error) {
            console.error('Get last N days error:', error);
            return [];
        }
    },

    async deleteEntry(date) {
        try {
            const response = await fetch(`${API_BASE}/entries`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    user_id: this.currentUserId,
                    date 
                })
            });
            return await response.json();
        } catch (error) {
            console.error('Delete entry error:', error);
            throw error;
        }
    },

    // Calculate streak
    async calculateStreak() {
        try {
            const entries = await this.getAllEntries();
            if (entries.length === 0) return 0;
            
            let streak = 0;
            let currentDate = new Date();
            currentDate.setHours(0, 0, 0, 0);
            
            for (let i = 0; i < 365; i++) {
                const dateStr = currentDate.toISOString().split('T')[0];
                if (entries.find(e => e.date === dateStr)) {
                    streak++;
                } else {
                    break;
                }
                currentDate.setDate(currentDate.getDate() - 1);
            }
            
            return streak;
        } catch (error) {
            console.error('Calculate streak error:', error);
            return 0;
        }
    },

    // Initialize with user ID
    setUserId(userId) {
        this.currentUserId = userId;
    },

    // Fallback to local storage for offline support
    async getEntriesWithFallback() {
        try {
            return await this.getAllEntries();
        } catch (error) {
            console.warn('API unavailable, falling back to localStorage');
            const data = localStorage.getItem('wellnessTrackerData');
            return data ? JSON.parse(data) : [];
        }
    }
};
