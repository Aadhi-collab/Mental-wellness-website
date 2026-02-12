// ============================================
// Mental Health Check-In & Wellness Tracker
// Core Application Logic
// ============================================

// Login Management
const LoginManager = {
    init() {
        // Setup tab switching
        this.setupTabs();
        
        // Setup password toggles
        this.setupPasswordToggles();
        
        // Setup forms
        const loginForm = document.getElementById('loginForm');
        const signupForm = document.getElementById('signupForm');
        
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }
        
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSignup();
            });
        }
        
        // Check if user is already logged in
        if (this.isLoggedIn()) {
            this.showApp();
        }
    },
    
    setupTabs() {
        const tabButtons = document.querySelectorAll('.auth-tab-btn');
        
        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabName = btn.getAttribute('data-tab');
                
                // Remove active class from all buttons
                tabButtons.forEach(b => b.classList.remove('active'));
                
                // Remove active class from all tab contents and hide
                document.querySelectorAll('.auth-tab-content').forEach(content => {
                    content.classList.remove('active');
                    content.style.display = 'none';
                });
                
                // Add active class to clicked button
                btn.classList.add('active');
                
                // Show and add active class to corresponding content
                const tabContent = document.querySelector(`.auth-tab-content[data-tab="${tabName}"]`);
                if (tabContent) {
                    tabContent.classList.add('active');
                    tabContent.style.display = 'flex';
                }
            });
        });
    },
    
    setupPasswordToggles() {
        const toggles = document.querySelectorAll('.toggle-password');
        
        toggles.forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Find the password input in the same password-input-group
                const passwordInput = toggle.parentElement.querySelector('input[type="password"], input[type="text"]');
                
                if (passwordInput) {
                    if (passwordInput.type === 'password') {
                        passwordInput.type = 'text';
                        toggle.textContent = '🙈';
                    } else {
                        passwordInput.type = 'password';
                        toggle.textContent = '👁️';
                    }
                }
            });
        });
    },
    
    async handleLogin() {
        const username = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value;
        
        // Clear previous error
        this.clearError('loginForm');
        
        if (!username || !password) {
            this.showError('loginForm', '⚠️ Please enter username and password');
            return;
        }
        
        try {
            // Try API login first
            const result = await ApiService.login(username, password);
            
            if (result.success && result.user) {
                localStorage.setItem('loggedInUser', username);
                localStorage.setItem('userId', result.user.id);
                localStorage.setItem('loginTime', new Date().getTime());
                this.showApp();
            } else {
                this.showError('loginForm', '❌ Invalid username or password');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showError('loginForm', '❌ Login failed. Please try again.');
        }
    },
    
    async handleSignup() {
        const username = document.getElementById('signupUsername').value.trim();
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // Clear previous error
        this.clearError('signupForm');
        
        // Validation
        if (!username || !password || !confirmPassword) {
            this.showError('signupForm', '⚠️ Please fill all fields');
            return;
        }
        
        if (username.length < 3) {
            this.showError('signupForm', '⚠️ Username must be at least 3 characters');
            return;
        }
        
        if (password.length < 4) {
            this.showError('signupForm', '⚠️ Password must be at least 4 characters');
            return;
        }
        
        if (password !== confirmPassword) {
            this.showError('signupForm', '⚠️ Passwords do not match');
            return;
        }
        
        try {
            // Call API to register
            const result = await ApiService.register(username, password);
            
            if (result.success) {
                // Auto-login after signup
                const loginResult = await ApiService.login(username, password);
                
                if (loginResult.success && loginResult.user) {
                    localStorage.setItem('loggedInUser', username);
                    localStorage.setItem('userId', loginResult.user.id);
                    localStorage.setItem('loginTime', new Date().getTime());
                    this.showApp();
                }
            } else if (result.error) {
                if (result.error.includes('already exists')) {
                    this.showError('signupForm', '❌ Username already taken. Choose a different one.');
                } else {
                    this.showError('signupForm', '❌ ' + result.error);
                }
            }
        } catch (error) {
            console.error('Signup error:', error);
            this.showError('signupForm', '❌ Signup failed. Please try again.');
        }
    },
    
    showError(formId, message) {
        const form = document.getElementById(formId);
        if (!form) return;
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'login-error';
        errorDiv.textContent = message;
        form.insertBefore(errorDiv, form.firstChild);
    },
    
    clearError(formId) {
        const form = document.getElementById(formId);
        if (!form) return;
        
        const errorMsg = form.querySelector('.login-error');
        if (errorMsg) {
            errorMsg.remove();
        }
    },
    
    showApp() {
        document.getElementById('loginPage').style.display = 'none';
        document.querySelector('.container').style.display = 'block';
    },
    
    isLoggedIn() {
        return localStorage.getItem('loggedInUser') !== null;
    },
    
    logout() {
        localStorage.removeItem('loggedInUser');
        localStorage.removeItem('userId');
        localStorage.removeItem('loginTime');
        location.reload();
    }
};

// Data Management
const StorageManager = {
    storageKey: 'wellnessTrackerData',
    
    // Get all mood entries
    getAllEntries() {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : [];
    },
    
    // Get entry for specific date (YYYY-MM-DD)
    getEntry(date) {
        return this.getAllEntries().find(entry => entry.date === date);
    },
    
    // Save or update entry
    saveEntry(entry) {
        const entries = this.getAllEntries();
        const index = entries.findIndex(e => e.date === entry.date);
        
        if (index >= 0) {
            entries[index] = entry;
        } else {
            entries.push(entry);
        }
        
        // Sort by date (newest first)
        entries.sort((a, b) => new Date(b.date) - new Date(a.date));
        localStorage.setItem(this.storageKey, JSON.stringify(entries));
    },
    
    // Get entries for last N days
    getLastNDays(days) {
        const entries = this.getAllEntries();
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        
        return entries.filter(entry => new Date(entry.date) >= cutoffDate);
    },
    
    // Calculate streak
    calculateStreak() {
        const entries = this.getAllEntries();
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
    }
};

// UI Manager
const UIManager = {
    // Update date display
    updateDateDisplay() {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const today = new Date().toLocaleDateString('en-US', options);
        document.getElementById('dateDisplay').textContent = today;
    },
    
    // Set up mood emoji selection
    setupMoodEmojis() {
        const emojis = document.querySelectorAll('.mood-emoji');
        emojis.forEach(emoji => {
            emoji.addEventListener('click', (e) => {
                emojis.forEach(el => el.classList.remove('selected'));
                e.target.classList.add('selected');
                const mood = e.target.getAttribute('data-mood');
                document.getElementById('moodSlider').value = mood * 2 - 1;
                UIManager.updateMoodValue();
            });
        });
    },
    
    // Update mood value display
    updateMoodValue() {
        const value = document.getElementById('moodSlider').value;
        document.getElementById('moodValue').textContent = value;
        
        // Update emoji selection
        const moodEmojis = document.querySelectorAll('.mood-emoji');
        moodEmojis.forEach(el => el.classList.remove('selected'));
        
        if (value <= 2) moodEmojis[0].classList.add('selected');
        else if (value <= 4) moodEmojis[1].classList.add('selected');
        else if (value <= 6) moodEmojis[2].classList.add('selected');
        else if (value <= 8) moodEmojis[3].classList.add('selected');
        else moodEmojis[4].classList.add('selected');
    },
    
    // Set up mood slider
    setupMoodSlider() {
        const slider = document.getElementById('moodSlider');
        slider.addEventListener('input', () => UIManager.updateMoodValue());
    },
    
    // Set up stress buttons
    setupStressButtons() {
        const buttons = document.querySelectorAll('.stress-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                buttons.forEach(el => el.classList.remove('selected'));
                e.target.classList.add('selected');
            });
        });
    },
    
    // Update streak display
    updateStreak() {
        const streak = StorageManager.calculateStreak();
        document.getElementById('streakCount').textContent = streak;
    },
    
    // Show wellness suggestion
    showWellnessSuggestion(moodValue, activities) {
        const suggestions = {
            low: [
                "💪 Try some light exercise or a short walk to boost your mood.",
                "🧘 Consider a short meditation session (even 5 minutes helps!).",
                "👥 Reach out to a friend - social connection is healing.",
                "🎨 Engage in a hobby or creative activity you enjoy."
            ],
            moderate: [
                "🕐 Take a break from screens and get some fresh air.",
                "📚 Try journaling to process your thoughts and feelings.",
                "🎵 Listen to music that uplifts you.",
                "✨ Practice gratitude - list 3 things you're grateful for."
            ],
            high: [
                "🧘 Practice deep breathing or meditation to calm your mind.",
                "💤 Prioritize getting good sleep tonight.",
                "🌿 Spend time in nature if possible.",
                "📞 Consider talking to someone you trust about what's bothering you."
            ]
        };
        
        let category = 'moderate';
        if (moodValue <= 3) category = 'low';
        else if (moodValue >= 7) category = 'high';
        
        const suggestion = suggestions[category][Math.floor(Math.random() * suggestions[category].length)];
        
        const suggestionDiv = document.getElementById('wellnessSuggestion');
        document.getElementById('suggestionText').textContent = suggestion;
        suggestionDiv.style.display = 'block';
    }
};

// Navigation
const Navigation = {
    init() {
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Update active button
                navButtons.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                // Show corresponding view
                const viewName = e.target.getAttribute('data-view');
                this.switchView(viewName);
            });
        });
    },
    
    switchView(viewName) {
        // Hide all views
        const views = document.querySelectorAll('.view');
        views.forEach(view => view.classList.remove('active'));
        
        // Show selected view
        const selectedView = document.getElementById(viewName);
        if (selectedView) {
            selectedView.classList.add('active');
            
            // Load data for specific views
            if (viewName === 'history') {
                HistoryView.loadHistory();
            } else if (viewName === 'analytics') {
                AnalyticsView.loadAnalytics();
            }
        }
    }
};

// Check-in Functionality
const CheckInView = {
    init() {
        const submitBtn = document.getElementById('submitBtn');
        submitBtn.addEventListener('click', () => this.handleSubmit());
        
        // Load today's data if it exists
        this.loadTodayData();
    },
    
    loadTodayData() {
        const today = new Date().toISOString().split('T')[0];
        const entry = StorageManager.getEntry(today);
        
        if (entry) {
            // Mood
            document.getElementById('moodSlider').value = entry.mood;
            UIManager.updateMoodValue();
            
            // Sleep
            if (entry.sleep) document.getElementById('sleepHours').value = entry.sleep;
            
            // Stress
            if (entry.stress) {
                const stressBtn = document.querySelector(`.stress-btn[data-stress="${entry.stress}"]`);
                if (stressBtn) stressBtn.classList.add('selected');
            }
            
            // Journal
            if (entry.journal) document.getElementById('journalEntry').value = entry.journal;
            
            // Activities
            if (entry.activities && entry.activities.length > 0) {
                document.querySelectorAll('.tag-checkbox input').forEach(checkbox => {
                    checkbox.checked = entry.activities.includes(checkbox.value);
                });
            }
        }
    },
    
    handleSubmit() {
        const today = new Date().toISOString().split('T')[0];
        
        // Collect data
        const mood = parseInt(document.getElementById('moodSlider').value);
        const sleep = parseFloat(document.getElementById('sleepHours').value) || 0;
        const stress = document.querySelector('.stress-btn.selected')?.getAttribute('data-stress');
        const journal = document.getElementById('journalEntry').value;
        
        // Get activities
        const activities = [];
        document.querySelectorAll('.tag-checkbox input:checked').forEach(checkbox => {
            activities.push(checkbox.value);
        });
        
        // Validation
        if (sleep > 23) {
            alert('You cannot sleep more than 24 hours !');
            return;
        }
        
        if (!stress) {
            alert('Please select your stress level!');
            return;
        }
        
        // Create entry
        const entry = {
            date: today,
            mood,
            sleep,
            stress: parseInt(stress),
            journal,
            activities,
            timestamp: new Date().toISOString()
        };
        
        // Save to storage
        StorageManager.saveEntry(entry);
        
        // Update UI
        UIManager.updateStreak();
        UIManager.showWellnessSuggestion(mood, activities);
        
        // Show success message
        alert('✅ Check-in saved successfully! Great job tracking your wellness!');
    }
};

// History View
const HistoryView = {
    loadHistory() {
        const filterDays = document.getElementById('filterDays').value;
        const entries = StorageManager.getLastNDays(parseInt(filterDays));
        
        const historyList = document.getElementById('historyList');
        historyList.innerHTML = '';
        
        if (entries.length === 0) {
            historyList.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No entries yet. Start tracking your wellness today!</p>';
            return;
        }
        
        entries.forEach(entry => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            
            const moodEmoji = this.getMoodEmoji(entry.mood);
            const stressLabel = ['', 'Low 😌', 'Moderate 😐', 'High 😰', 'Very High 😱'][entry.stress];
            
            historyItem.innerHTML = `
                <div class="history-date">${new Date(entry.date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                })}</div>
                <div class="history-mood">
                    <span class="history-mood-emoji">${moodEmoji}</span>
                    <span>Mood: ${entry.mood}/10</span>
                </div>
                <div class="history-details">
                    <div class="history-detail-item">
                        <div class="history-detail-label">Sleep</div>
                        <div class="history-detail-value">${entry.sleep} hrs</div>
                    </div>
                    <div class="history-detail-item">
                        <div class="history-detail-label">Stress</div>
                        <div class="history-detail-value">${stressLabel}</div>
                    </div>
                </div>
                ${entry.activities && entry.activities.length > 0 ? `
                    <div style="margin-top: 1rem;">
                        <strong>Activities:</strong> ${entry.activities.join(', ')}
                    </div>
                ` : ''}
                ${entry.journal ? `<div class="history-journal"><strong>Notes:</strong> "${entry.journal}"</div>` : ''}
            `;
            
            historyList.appendChild(historyItem);
        });
    }
};

// Analytics View
// Helper function to get CSS variable values
function getCSSVariable(varName) {
    return getComputedStyle(document.body).getPropertyValue(varName).trim();
}

const AnalyticsView = {
    charts: {},
    
    loadAnalytics() {
        const entries = StorageManager.getLastNDays(30);
        
        if (entries.length === 0) {
            document.querySelector('.analytics-container').innerHTML += 
                '<p style="text-align: center; color: var(--text-secondary);">Need more data to display analytics. Keep tracking!</p>';
            return;
        }
        
        // Calculate and display summaries
        this.displaySummaries(entries);
        
        // Create charts
        this.createCharts(entries);
        
        // Display weekly summary
        this.displayWeeklySummary(entries);
        
        // Setup export buttons
        this.setupExportButtons(entries);
    },
    
    displaySummaries(entries) {
        const avgMood = (entries.reduce((sum, e) => sum + e.mood, 0) / entries.length).toFixed(1);
        const avgSleep = (entries.reduce((sum, e) => sum + e.sleep, 0) / entries.length).toFixed(1);
        const avgStress = (entries.reduce((sum, e) => sum + e.stress, 0) / entries.length).toFixed(1);
        
        document.getElementById('avgMood').textContent = `${avgMood}/10`;
        document.getElementById('avgSleep').textContent = `${avgSleep} hrs`;
        document.getElementById('avgStress').textContent = `${avgStress}/4`;
    },
    
    createCharts(entries) {
        // Sort entries by date (oldest first)
        const sortedEntries = [...entries].reverse();
        
        const dates = sortedEntries.map(e => new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        const moods = sortedEntries.map(e => e.mood);
        const sleeps = sortedEntries.map(e => e.sleep);
        const stresses = sortedEntries.map(e => e.stress);
        
        // Mood Chart
        this.createMoodChart(dates, moods);
        
        // Sleep Chart
        this.createSleepChart(dates, sleeps);
        
        // Stress Chart
        this.createStressChart(dates, stresses);
    },
    
    createMoodChart(dates, moodData) {
        const ctx = document.getElementById('moodChart');
        
        // Destroy existing chart if it exists
        if (this.charts.mood) this.charts.mood.destroy();
        
        this.charts.mood = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: 'Daily Mood',
                    data: moodData,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 5,
                    pointBackgroundColor: '#667eea',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        labels: {
                            color: getCSSVariable('--text-primary')
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 10,
                        ticks: {
                            color: getCSSVariable('--text-secondary')
                        },
                        grid: {
                            color: getCSSVariable('--border-color')
                        }
                    },
                    x: {
                        ticks: {
                            color: getCSSVariable('--text-secondary')
                        },
                        grid: {
                            color: getCSSVariable('--border-color')
                        }
                    }
                }
            }
        });
    },
    
    createSleepChart(dates, sleepData) {
        const ctx = document.getElementById('sleepChart');
        
        if (this.charts.sleep) this.charts.sleep.destroy();
        
        this.charts.sleep = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: dates,
                datasets: [{
                    label: 'Hours of Sleep',
                    data: sleepData,
                    backgroundColor: '#48bb78',
                    borderColor: '#48bb78',
                    borderRadius: 5,
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        labels: {
                            color: getCSSVariable('--text-primary')
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 12,
                        ticks: {
                            color: getCSSVariable('--text-secondary')
                        },
                        grid: {
                            color: getCSSVariable('--border-color')
                        }
                    },
                    x: {
                        ticks: {
                            color: getCSSVariable('--text-secondary')
                        },
                        grid: {
                            color: getCSSVariable('--border-color')
                        }
                    }
                }
            }
        });
    },
    
    createStressChart(dates, stressData) {
        const ctx = document.getElementById('stressChart');
        
        if (this.charts.stress) this.charts.stress.destroy();
        
        this.charts.stress = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: 'Stress Level',
                    data: stressData,
                    borderColor: '#f6ad55',
                    backgroundColor: 'rgba(246, 173, 85, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 5,
                    pointBackgroundColor: '#f6ad55',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        labels: {
                            color: getCSSVariable('--text-primary')
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 4,
                        ticks: {
                            callback: function(value) {
                                return ['', 'Low', 'Moderate', 'High', 'Very High'][value];
                            },
                            color: getCSSVariable('--text-secondary')
                        },
                        grid: {
                            color: getCSSVariable('--border-color')
                        }
                    },
                    x: {
                        ticks: {
                            color: getCSSVariable('--text-secondary')
                        },
                        grid: {
                            color: getCSSVariable('--border-color')
                        }
                    }
                }
            }
        });
    },
    
    displayWeeklySummary(entries) {
        const summary = {};
        
        // Group entries by day of week
        entries.forEach(entry => {
            const date = new Date(entry.date);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            
            if (!summary[dayName]) {
                summary[dayName] = { moods: [], sleeps: [], stresses: [], count: 0 };
            }
            
            summary[dayName].moods.push(entry.mood);
            summary[dayName].sleeps.push(entry.sleep);
            summary[dayName].stresses.push(entry.stress);
            summary[dayName].count++;
        });
        
        const daysOrder = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const weeklySummaryContent = document.getElementById('weeklySummaryContent');
        weeklySummaryContent.innerHTML = '';
        
        daysOrder.forEach(day => {
            if (summary[day]) {
                const avgMood = (summary[day].moods.reduce((a, b) => a + b, 0) / summary[day].moods.length).toFixed(1);
                const moodEmoji = HistoryView.getMoodEmoji(avgMood);
                
                const weeklyDay = document.createElement('div');
                weeklyDay.className = 'weekly-day';
                weeklyDay.innerHTML = `
                    <div class="weekly-day-name">${day}</div>
                    <div class="weekly-day-emoji">${moodEmoji}</div>
                    <div style="font-size: 0.9rem; color: var(--text-secondary);">${avgMood}/10</div>
                `;
                weeklySummaryContent.appendChild(weeklyDay);
            }
        });
    },
    
    setupExportButtons(entries) {
        document.getElementById('exportCSV').addEventListener('click', () => this.exportCSV(entries));
        document.getElementById('exportPDF').addEventListener('click', () => this.exportPDF(entries));
    },
    
    exportCSV(entries) {
        let csv = 'Date,Mood,Sleep (hrs),Stress,Activities,Notes\n';
        
        entries.forEach(entry => {
            const date = new Date(entry.date).toLocaleDateString();
            const activities = entry.activities ? entry.activities.join('; ') : '';
            const notes = entry.journal ? entry.journal.replace(/"/g, '""') : '';
            
            csv += `"${date}",${entry.mood},${entry.sleep},${entry.stress},"${activities}","${notes}"\n`;
        });
        
        // Create blob and download
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `wellness-data-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    },
    
    exportPDF(entries) {
        alert('📄 PDF export feature - Please save this page as PDF using your browser (Ctrl+P or Cmd+P) to create a report of your wellness data.');
    }
};

// Helper function to get mood emoji
HistoryView.getMoodEmoji = function(moodValue) {
    if (moodValue <= 2) return '😢';
    if (moodValue <= 4) return '😟';
    if (moodValue <= 6) return '😐';
    if (moodValue <= 8) return '🙂';
    return '😊';
};

// Dark Mode Toggle
function setupThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const bodyElement = document.body;
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        bodyElement.classList.add('dark-mode');
        themeToggle.textContent = '☀️';
    }
    
    themeToggle.addEventListener('click', () => {
        if (bodyElement.classList.contains('dark-mode')) {
            bodyElement.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
            themeToggle.textContent = '🌙';
        } else {
            bodyElement.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
            themeToggle.textContent = '☀️';
        }
        
        // Reload analytics to update chart colors
        if (document.getElementById('analytics').classList.contains('active')) {
            AnalyticsView.loadAnalytics();
        }
    });
}

// Filter for history view
function setupHistoryFilter() {
    const filterSelect = document.getElementById('filterDays');
    filterSelect.addEventListener('change', () => {
        HistoryView.loadHistory();
    });
}

// Initialize all on page load
document.addEventListener('DOMContentLoaded', () => {
    // Initialize login
    LoginManager.init();
    
    // Initialize UI
    UIManager.updateDateDisplay();
    UIManager.setupMoodEmojis();
    UIManager.setupMoodSlider();
    UIManager.setupStressButtons();
    UIManager.updateStreak();
    
    // Initialize check-in
    CheckInView.init();
    
    // Initialize navigation
    Navigation.init();
    
    // Initialize theme
    setupThemeToggle();
    
    // Initialize history filter
    setupHistoryFilter();
    
    // Initialize logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to logout?')) {
                LoginManager.logout();
            }
        });
    }
});
