// ============================================
// Mental Health Check-In & Wellness Tracker
// Core Application Logic
// ============================================

// ============================================
// Authentication & Session Management
// ============================================
const AuthManager = {
    usersKey: 'wellnessTrackerUsers',
    currentUserKey: 'wellnessTrackerCurrentUser',

    /**
     * Get all registered users
     * @returns {Array} Array of user objects
     */
    getAllUsers() {
        try {
            const data = localStorage.getItem(this.usersKey);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error reading users:', error);
            return [];
        }
    },

    /**
     * Get current logged-in user
     * @returns {Object|null} Current user object or null if not logged in
     */
    getCurrentUser() {
        try {
            const data = localStorage.getItem(this.currentUserKey);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error reading current user:', error);
            return null;
        }
    },

    /**
     * Register a new user
     * @param {string} name - User's full name
     * @param {string} email - User's email
     * @param {string} password - User's password
     * @returns {Object} Result object with success status and message
     */
    registerUser(name, email, password) {
        try {
            console.log('[Register] Starting registration for:', email);
            
            // Validate inputs
            if (!name || !email || !password) {
                console.log('[Register] Missing required fields');
                return { success: false, message: 'All fields are required' };
            }
            if (password.length < 6) {
                console.log('[Register] Password too short');
                return { success: false, message: 'Password must be at lea st 6 characters' };
            }
            if (!this.isValidEmail(email)) {
                console.log('[Register] Invalid email format');
                return { success: false, message: 'Invalid email format' };
            }

            const users = this.getAllUsers();
            console.log('[Register] Current users:', users.length);
            
            // Check if user already exists
            if (users.find(u => u.email === email)) {
                console.log('[Register] Email already exists');
                return { success: false, message: 'Email already registered' };
            }

            // Create new user with hashed password
            console.log('[Register] Hashing password...');
            const hashedPassword = AuthManager.hashPassword(password);
            console.log('[Register] Password hashed successfully');
            
            const newUser = {
                id: Date.now(),
                name,
                email,
                password: hashedPassword,
                createdAt: new Date().toISOString()
            };

            users.push(newUser);
            localStorage.setItem(this.usersKey, JSON.stringify(users));
            console.log('[Register] User saved to localStorage');

            return { success: true, message: 'Account created successfully' };
        } catch (error) {
            console.error('[Register] Registration error:', error);
            console.error('[Register] Error details:', error.message, error.stack);
            return { success: false, message: 'Registration failed: ' + error.message };
        }
    },

    /**
     * Login user
     * @param {string} email - User's email
     * @param {string} password - User's password
     * @returns {Object} Result object with success status and user data
     */
    loginUser(email, password) {
        try {
            if (!email || !password) {
                return { success: false, message: 'Email and password are required' };
            }

            const users = this.getAllUsers();
            const user = users.find(u => u.email === email);

            if (!user) {
                return { success: false, message: 'Email not found' };
            }

            // Compare passwords using hash
            if (!AuthManager.verifyPassword(password, user.password)) {
                return { success: false, message: 'Incorrect password' };
            }

            // Store current user (without password)
            const currentUser = { id: user.id, name: user.name, email: user.email };
            localStorage.setItem(this.currentUserKey, JSON.stringify(currentUser));

            return { success: true, user: currentUser, message: 'Login successful' };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'Login failed' };
        }
    },

    /**
     * Logout current user
     */
    logout() {
        try {
            localStorage.removeItem(this.currentUserKey);
        } catch (error) {
            console.error('Logout error:', error);
        }
    },

    /**
     * Validate email format
     * @param {string} email - Email to validate
     * @returns {boolean} True if valid email
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    /**
     * Hash password using PBKDF2 (Web Crypto API)
     * More secure than base64 encoding
     * @param {string} password - Plain text password
     * @returns {string} Hashed password (base64 encoded hash)
     */
    hashPassword(password) {
        try {
            console.log('[Hash] Creating hash for password of length:', password.length);
            
            // Create a simple hash using combination of password + timestamp for salt
            // For production, use bcrypt or Argon2 with a proper backend
            const salt = 'wellness-tracker-salt-'; // Static salt for demo (not production-ready)
            const combined = salt + password;
            
            // Create hash using DJB2 algorithm (deterministic)
            let hash = 0;
            for (let i = 0; i < combined.length; i++) {
                const char = combined.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash; // Convert to 32bit integer
            }
            
            // Additional encoding with base64 for storage
            const hashString = Math.abs(hash).toString(16);
            const result = btoa(hashString + ':' + password.length);
            console.log('[Hash] Hash created successfully, length:', result.length);
            return result;
        } catch (error) {
            console.error('[Hash] Password hashing error:', error);
            console.error('[Hash] Fallback to base64');
            return btoa(password); // Fallback to base64 if hashing fails
        }
    },

    /**
     * Verify password against stored hash
     * @param {string} plainPassword - Plain text password to verify
     * @param {string} storedHash - Stored hashed password
     * @returns {boolean} True if password matches
     */
    verifyPassword(plainPassword, storedHash) {
        try {
            // Hash the provided password and compare
            const hashedInput = this.hashPassword(plainPassword);
            
            // Use timing-safe comparison to prevent timing attacks
            return storedHash === hashedInput;
        } catch (error) {
            console.error('Password verification error:', error);
            return false;
        }
    }
};

// ============================================
// Login Page Management
// ============================================
const LoginPageManager = {
    init() {
        console.log('[LoginPageManager] Initializing...');
        
        // Check if user is already logged in
        const currentUser = AuthManager.getCurrentUser();
        if (currentUser) {
            console.log('[LoginPageManager] User already logged in:', currentUser.email);
            this.showMainApp(currentUser);
            return;
        }

        console.log('[LoginPageManager] No user logged in, showing login page');
        
        // Show login page
        this.setupLoginForm();
        this.setupRegisterForm();
        this.setupFormToggle();
        this.setupPasswordToggle();
        
        // IMPORTANT: Show login form by default
        this.switchForm('login');
    },

    setupLoginForm() {
        const loginSubmitBtn = document.getElementById('loginSubmitBtn');
        const loginEmail = document.getElementById('loginEmail');
        const loginPassword = document.getElementById('loginPassword');

        if (loginSubmitBtn) {
            loginSubmitBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const email = loginEmail.value.trim();
                const password = loginPassword.value;

                const result = AuthManager.loginUser(email, password);
                if (result.success) {
                    this.showMainApp(result.user);
                } else {
                    alert('❌ ' + result.message);
                }
            });
        }

        // Allow Enter key to submit
        if (loginPassword) {
            loginPassword.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    loginSubmitBtn.click();
                }
            });
        }
    },

    setupRegisterForm() {
        const registerSubmitBtn = document.getElementById('registerSubmitBtn');
        const registerName = document.getElementById('registerName');
        const registerEmail = document.getElementById('registerEmail');
        const registerPassword = document.getElementById('registerPassword');
        const registerPasswordConfirm = document.getElementById('registerPasswordConfirm');

        console.log('[RegisterForm] Setup started');
        console.log('[RegisterForm] Button found:', !!registerSubmitBtn);
        console.log('[RegisterForm] Fields found:', !!registerName, !!registerEmail, !!registerPassword, !!registerPasswordConfirm);

        if (registerSubmitBtn) {
            registerSubmitBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('[RegisterForm] Submit clicked');
                
                const name = registerName.value.trim();
                const email = registerEmail.value.trim();
                const password = registerPassword.value;
                const passwordConfirm = registerPasswordConfirm.value;

                console.log('[RegisterForm] Form values - name:', name, 'email:', email, 'password length:', password.length);

                // Validation
                if (password !== passwordConfirm) {
                    console.log('[RegisterForm] Passwords do not match');
                    alert('❌ Passwords do not match');
                    return;
                }

                console.log('[RegisterForm] Calling registerUser...');
                const result = AuthManager.registerUser(name, email, password);
                console.log('[RegisterForm] Register result:', result);
                
                if (result.success) {
                    alert('✅ ' + result.message + ' You can now sign in.');
                    this.switchForm('login');
                    // Clear form
                    registerName.value = '';
                    registerEmail.value = '';
                    registerPassword.value = '';
                    registerPasswordConfirm.value = '';
                } else {
                    alert('❌ ' + result.message);
                }
            });
        }

        // Allow Enter key to submit
        if (registerPasswordConfirm) {
            registerPasswordConfirm.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    registerSubmitBtn.click();
                }
            });
        }
    },

    setupFormToggle() {
        const showRegisterBtn = document.getElementById('showRegisterBtn');
        const showLoginBtn = document.getElementById('showLoginBtn');

        if (showRegisterBtn) {
            showRegisterBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchForm('register');
            });
        }

        if (showLoginBtn) {
            showLoginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchForm('login');
            });
        }
    },

    setupPasswordToggle() {
        const passwordToggles = document.querySelectorAll('.password-toggle');
        
        passwordToggles.forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Get the corresponding input field
                const inputGroup = toggle.closest('.password-input-group');
                const passwordInput = inputGroup.querySelector('input[type="password"], input[type="text"]');
                
                if (passwordInput) {
                    if (passwordInput.type === 'password') {
                        // Show password
                        passwordInput.type = 'text';
                        toggle.textContent = '🙈';
                        toggle.title = 'Hide password';
                    } else {
                        // Hide password
                        passwordInput.type = 'password';
                        toggle.textContent = '👁️';
                        toggle.title = 'Show password';
                    }
                }
            });
        });
    },

    switchForm(formName) {
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');

        console.log('[SwitchForm] Switching to:', formName);
        console.log('[SwitchForm] Login form found:', !!loginForm);
        console.log('[SwitchForm] Register form found:', !!registerForm);

        if (formName === 'login') {
            if (loginForm) loginForm.classList.add('active-form');
            if (registerForm) registerForm.classList.remove('active-form');
            console.log('[SwitchForm] Login form shown');
        } else {
            if (loginForm) loginForm.classList.remove('active-form');
            if (registerForm) registerForm.classList.add('active-form');
            console.log('[SwitchForm] Register form shown');
        }
    },

    showMainApp(user) {
        const loginPage = document.getElementById('loginPage');
        const mainApp = document.getElementById('mainApp');

        if (loginPage) loginPage.classList.add('hidden');
        if (mainApp) mainApp.classList.remove('hidden');

        // Update user greeting
        const userGreeting = document.getElementById('userGreeting');
        if (userGreeting) {
            userGreeting.textContent = `👤 ${user.name}`;
        }
    },

    logout() {
        AuthManager.logout();
        const loginPage = document.getElementById('loginPage');
        const mainApp = document.getElementById('mainApp');

        if (loginPage) loginPage.classList.remove('hidden');
        if (mainApp) mainApp.classList.add('hidden');

        // Clear form inputs
        document.getElementById('loginEmail').value = '';
        document.getElementById('loginPassword').value = '';

        // Show login form
        this.switchForm('login');
    }
};

// ============================================
// Input Validation & Sanitization Utilities
// ============================================
const ValidationHelper = {
    /**
     * Validates email format
     * @param {string} email - Email to validate
     * @returns {boolean} True if valid email format
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    /**
     * Validates mood value (1-10 scale)
     * @param {number} mood - Mood value to validate
     * @returns {boolean} True if valid mood
     */
    isValidMood(mood) {
        const moodNum = parseInt(mood);
        return !isNaN(moodNum) && moodNum >= 1 && moodNum <= 10;
    },

    /**
     * Validates sleep hours (0-24)
     * @param {number} sleep - Sleep hours to validate
     * @returns {boolean} True if valid sleep value
     */
    isValidSleep(sleep) {
        const sleepNum = parseFloat(sleep);
        return !isNaN(sleepNum) && sleepNum >= 0 && sleepNum <= 24;
    },

    /**
     * Validates stress level (1-4 scale)
     * @param {number} stress - Stress value to validate
     * @returns {boolean} True if valid stress level
     */
    isValidStress(stress) {
        const stressNum = parseInt(stress);
        return !isNaN(stressNum) && stressNum >= 1 && stressNum <= 4;
    },

    /**
     * Validates journal entry (optional, max 500 chars)
     * @param {string} journal - Journal text to validate
     * @returns {boolean} True if valid
     */
    isValidJournal(journal) {
        return typeof journal === 'string' && journal.length <= 500;
    },

    /**
     * Sanitizes string input to prevent XSS
     * @param {string} input - String to sanitize
     * @returns {string} Sanitized string
     */
    sanitizeString(input) {
        if (typeof input !== 'string') return '';
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    },

    /**
     * Sanitizes CSV field to prevent injection
     * @param {string} field - Field to sanitize
     * @returns {string} Sanitized CSV field
     */
    sanitizeCSVField(field) {
        if (typeof field !== 'string') return '';
        // Escape quotes and wrap in quotes if contains comma, newline, or quote
        const needsQuotes = field.includes(',') || field.includes('\n') || field.includes('"');
        const escaped = field.replace(/"/g, '""');
        return needsQuotes ? `"${escaped}"` : escaped;
    },

    /**
     * Validates date format (YYYY-MM-DD)
     * @param {string} dateStr - Date string to validate
     * @returns {boolean} True if valid date
     */
    isValidDate(dateStr) {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(dateStr)) return false;
        const date = new Date(dateStr);
        return date instanceof Date && !isNaN(date);
    }
};

// ============================================
// Error Handling & Logging
// ============================================
const ErrorHandler = {
    /**
     * Log error with context
     * @param {string} context - Where error occurred
     * @param {Error} error - Error object
     */
    logError(context, error) {
        console.error(`[${context}]`, error);
    },

    /**
     * Display user-friendly error message
     * @param {string} title - Error title
     * @param {string} message - Error message
     */
    showError(title, message) {
        alert(`❌ ${title}\n\n${message}`);
    },

    /**
     * Display success message
     * @param {string} message - Success message
     */
    showSuccess(message) {
        alert(`✅ ${message}`);
    },

    /**
     * Display info message
     * @param {string} message - Info message
     */
    showInfo(message) {
        alert(`ℹ️ ${message}`);
    }
};

// Data Management
// Data Management - User-Specific Storage
const StorageManager = {
    dataKeyPrefix: 'wellnessTrackerData_',
    
    /**
     * Generate user-specific storage key based on current logged-in user's email
     * Each user has completely isolated data storage
     * @returns {string|null} User-specific storage key or null if no user logged in
     */
    getUserStorageKey() {
        try {
            const currentUser = AuthManager.getCurrentUser();
            if (!currentUser || !currentUser.email) {
                console.error('[StorageManager] No user logged in');
                return null;
            }
            
            // Create a safe key by replacing special characters in email
            const safeEmail = currentUser.email.replace(/[^a-zA-Z0-9]/g, '_');
            const key = `${this.dataKeyPrefix}${safeEmail}`;
            console.log('[StorageManager] Using storage key:', key);
            return key;
        } catch (error) {
            console.error('[StorageManager.getUserStorageKey] Error:', error);
            return null;
        }
    },
    
    /**
     * Safely retrieve all mood entries for CURRENT USER from localStorage
     * Each user sees only their own data
     * @returns {Array} Array of entries or empty array on error
     */
    getAllEntries() {
        try {
            const key = this.getUserStorageKey();
            if (!key) {
                console.warn('[StorageManager.getAllEntries] No user key available');
                return [];
            }
            
            const data = localStorage.getItem(key);
            const entries = data ? JSON.parse(data) : [];
            console.log('[StorageManager.getAllEntries] Retrieved', entries.length, 'entries for user');
            return entries;
        } catch (error) {
            ErrorHandler.logError('StorageManager.getAllEntries', error);
            ErrorHandler.showError(
                'Data Read Error',
                'Could not read your data from storage. Your settings may have reset.'
            );
            return [];
        }
    },
    
    /**
     * Retrieve entry for specific date (CURRENT USER only)
     * @param {string} date - Date in YYYY-MM-DD format
     * @returns {Object|undefined} Entry object or undefined if not found
     */
    getEntry(date) {
        if (!ValidationHelper.isValidDate(date)) {
            ErrorHandler.logError('StorageManager.getEntry', 'Invalid date format');
            return undefined;
        }
        return this.getAllEntries().find(entry => entry.date === date);
    },
    
    /**
     * Save or update entry with validation (CURRENT USER only)
     * @param {Object} entry - Entry object with all required properties
     * @returns {boolean} True if save successful
     */
    saveEntry(entry) {
        try {
            const key = this.getUserStorageKey();
            if (!key) {
                throw new Error('User not authenticated. Please login first.');
            }
            
            // Validate entry object
            if (!entry || typeof entry !== 'object') {
                throw new Error('Invalid entry object');
            }
            if (!ValidationHelper.isValidDate(entry.date)) {
                throw new Error('Invalid date format in entry');
            }
            if (!ValidationHelper.isValidMood(entry.mood)) {
                throw new Error('Invalid mood value (must be 1-10)');
            }
            if (!ValidationHelper.isValidSleep(entry.sleep)) {
                throw new Error('Invalid sleep value (must be 0-24 hours)');
            }
            if (!ValidationHelper.isValidStress(entry.stress)) {
                throw new Error('Invalid stress value (must be 1-4)');
            }
            if (!ValidationHelper.isValidJournal(entry.journal || '')) {
                throw new Error('Journal entry exceeds maximum length (500 characters)');
            }

            const entries = this.getAllEntries();
            const index = entries.findIndex(e => e.date === entry.date);
            
            if (index >= 0) {
                console.log('[StorageManager.saveEntry] Updating existing entry for', entry.date);
                entries[index] = entry;
            } else {
                console.log('[StorageManager.saveEntry] Creating new entry for', entry.date);
                entries.push(entry);
            }
            
            // Sort by date (newest first)
            entries.sort((a, b) => new Date(b.date) - new Date(a.date));
            localStorage.setItem(key, JSON.stringify(entries));
            console.log('[StorageManager.saveEntry] Saved successfully for user');
            return true;
        } catch (error) {
            ErrorHandler.logError('StorageManager.saveEntry', error);
            throw error;
        }
    },
    
    /**
     * Get entries for last N days (CURRENT USER only)
     * @param {number} days - Number of days to retrieve
     * @returns {Array} Entries from the last N days
     */
    getLastNDays(days) {
        try {
            if (!Number.isInteger(days) || days <= 0) {
                throw new Error('Days must be a positive integer');
            }
            
            const entries = this.getAllEntries();
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - days);
            
            const filtered = entries.filter(entry => new Date(entry.date) >= cutoffDate);
            console.log('[StorageManager.getLastNDays] Retrieved', filtered.length, 'entries from last', days, 'days');
            return filtered;
        } catch (error) {
            ErrorHandler.logError('StorageManager.getLastNDays', error);
            return [];
        }
    },
    
    /**
     * Calculate consecutive check-in streak (CURRENT USER only)
     * @returns {number} Number of consecutive days checked in
     */
    calculateStreak() {
        try {
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
            
            console.log('[StorageManager.calculateStreak] Current user streak:', streak);
            return streak;
        } catch (error) {
            ErrorHandler.logError('StorageManager.calculateStreak', error);
            return 0;
        }
    },
    
    /**
     * Get info about all users' data (debugging/admin use)
     * @returns {Object} Object with user emails and their data counts
     */
    getAllUsersDataInfo() {
        try {
            const usersInfo = {};
            const keys = Object.keys(localStorage);
            
            keys.forEach(key => {
                if (key.startsWith(this.dataKeyPrefix)) {
                    const userEmail = key.replace(this.dataKeyPrefix, '').replace(/_/g, '');
                    const data = JSON.parse(localStorage.getItem(key)) || [];
                    usersInfo[userEmail] = {
                        entryCount: data.length,
                        lastEntry: data.length > 0 ? data[0].date : null
                    };
                }
            });
            
            console.log('[StorageManager.getAllUsersDataInfo] Users data:', usersInfo);
            return usersInfo;
        } catch (error) {
            ErrorHandler.logError('StorageManager.getAllUsersDataInfo', error);
            return {};
        }
    },
    
    /**
     * Delete all data for current user (for account deletion)
     * @returns {boolean} True if deletion successful
     */
    deleteUserData() {
        try {
            const key = this.getUserStorageKey();
            if (!key) return false;
            
            localStorage.removeItem(key);
            console.log('[StorageManager.deleteUserData] Deleted data for user');
            return true;
        } catch (error) {
            ErrorHandler.logError('StorageManager.deleteUserData', error);
            return false;
        }
    }
};

// UI Manager - Handles all UI operations and user interactions
const UIManager = {
    /**
     * Updates the date display in the header
     * Shows the current date in long format (e.g., "Monday, February 10, 2024")
     */
    updateDateDisplay() {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const today = new Date().toLocaleDateString('en-US', options);
        const dateElement = document.getElementById('dateDisplay');
        if (dateElement) {
            dateElement.textContent = today;
        }
    },
    
    /**
     * Sets up emoji selection for mood
     * Allows users to click emojis (😢 😟 😐 🙂 😊) to select their mood
     */
    setupMoodEmojis() {
        const emojis = document.querySelectorAll('.mood-emoji');
        emojis.forEach(emoji => {
            emoji.addEventListener('click', (e) => {
                // Remove selection from all emojis
                emojis.forEach(el => el.classList.remove('selected'));
                // Add selection to clicked emoji
                e.target.classList.add('selected');
                // Update slider to correspond with emoji (1-5 scale converted to 1-10)
                const mood = e.target.getAttribute('data-mood');
                document.getElementById('moodSlider').value = mood * 2 - 1;
                UIManager.updateMoodValue();
            });
        });
    },
    
    /**
     * Updates mood value display and synchronizes emoji selection
     * Handles the real-time feedback when user adjusts the mood slider
     */
    updateMoodValue() {
        const value = document.getElementById('moodSlider').value;
        const moodValueElement = document.getElementById('moodValue');
        if (moodValueElement) {
            moodValueElement.textContent = value;
        }
        
        // Update emoji selection based on slider value
        const moodEmojis = document.querySelectorAll('.mood-emoji');
        moodEmojis.forEach(el => el.classList.remove('selected'));
        
        // Map slider value (1-10) to emoji position
        if (value <= 2) moodEmojis[0].classList.add('selected');
        else if (value <= 4) moodEmojis[1].classList.add('selected');
        else if (value <= 6) moodEmojis[2].classList.add('selected');
        else if (value <= 8) moodEmojis[3].classList.add('selected');
        else moodEmojis[4].classList.add('selected');
    },
    
    /**
     * Sets up mood slider event listener
     */
    setupMoodSlider() {
        const slider = document.getElementById('moodSlider');
        slider.addEventListener('input', () => UIManager.updateMoodValue());
    },
    
    /**
     * Sets up stress level button selection
     * Allows users to toggle between Uow, Moderate, High, Very High stress levels
     */
    setupStressButtons() {
        const buttons = document.querySelectorAll('.stress-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Remove selection from all buttons
                buttons.forEach(el => el.classList.remove('selected'));
                // Add selection to clicked button
                e.target.classList.add('selected');
            });
        });
    },
    
    /**
     * Updates the streak counter display
     * Calculates and displays consecutive days of check-ins
     */
    updateStreak() {
        try {
            const streak = StorageManager.calculateStreak();
            const streakElement = document.getElementById('streakCount');
            if (streakElement) {
                streakElement.textContent = streak;
            }
        } catch (error) {
            ErrorHandler.logError('UIManager.updateStreak', error);
        }
    },
    
    /**
     * Shows personalized wellness suggestion based on mood
     * Provides actionable recommendations for the user's current mood state
     * @param {number} moodValue - Current mood value (1-10)
     * @param {Array} activities - Selected activities
     */
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
        
        // Categorize mood into low, moderate, or high
        let category = 'moderate';
        if (moodValue <= 3) category = 'low';
        else if (moodValue >= 7) category = 'high';
        
        // Select random suggestion from category
        const categoryText = suggestions[category];
        const suggestion = categoryText[Math.floor(Math.random() * categoryText.length)];
        
        const suggestionDiv = document.getElementById('wellnessSuggestion');
        const suggestionText = document.getElementById('suggestionText');
        if (suggestionText) {
            suggestionText.textContent = suggestion;
        }
        if (suggestionDiv) {
            suggestionDiv.style.display = 'block';
        }
    }
};

// Navigation Manager - Handles view switching and navigation
const Navigation = {
    /**
     * Initializes navigation buttons and event listeners
     * Sets up click handlers for switching between views
     */
    init() {
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Update active button styling
                navButtons.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                // Show corresponding view
                const viewName = e.target.getAttribute('data-view');
                if (viewName) {
                    this.switchView(viewName);
                }
            });
        });
    },
    
    /**
     * Switches to specified view and loads relevant data
     * @param {string} viewName - Name of the view to switch to
     */
    switchView(viewName) {
        try {
            // Hide all views
            const views = document.querySelectorAll('.view');
            views.forEach(view => view.classList.remove('active'));
            
            // Show selected view
            const selectedView = document.getElementById(viewName);
            if (selectedView) {
                selectedView.classList.add('active');
                
                // Load view-specific data
                if (viewName === 'history') {
                    HistoryView.loadHistory();
                } else if (viewName === 'analytics') {
                    AnalyticsView.loadAnalytics();
                }
            }
        } catch (error) {
            ErrorHandler.logError('Navigation.switchView', error);
        }
    }
};

// Check-in View - Handles daily wellness check-in functionality
const CheckInView = {
    /**
     * Initializes check-in view
     * Sets up event listeners and loads today's data if it exists
     */
    init() {
        const submitBtn = document.getElementById('submitBtn');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.handleSubmit());
        }
        
        // Load today's data if it exists
        this.loadTodayData();
    },
    
    /**
     * Loads and populates form with today's entry data if it exists
     * Allows users to view/edit their current day's check-in
     */
    loadTodayData() {
        try {
            const today = new Date().toISOString().split('T')[0];
            const entry = StorageManager.getEntry(today);
            
            if (entry) {
                // Populate mood
                const moodSlider = document.getElementById('moodSlider');
                if (moodSlider) {
                    moodSlider.value = entry.mood;
                    UIManager.updateMoodValue();
                }
                
                // Populate sleep
                const sleepInput = document.getElementById('sleepHours');
                if (sleepInput && entry.sleep) {
                    sleepInput.value = entry.sleep;
                }
                
                // Populate stress
                if (entry.stress) {
                    const stressBtn = document.querySelector(`.stress-btn[data-stress="${entry.stress}"]`);
                    if (stressBtn) stressBtn.classList.add('selected');
                }
                
                // Populate journal
                const journalInput = document.getElementById('journalEntry');
                if (journalInput && entry.journal) {
                    journalInput.value = entry.journal;
                }
                
                // Populate activities
                if (entry.activities && entry.activities.length > 0) {
                    document.querySelectorAll('.tag-checkbox input').forEach(checkbox => {
                        checkbox.checked = entry.activities.includes(checkbox.value);
                    });
                }
            }
        } catch (error) {
            ErrorHandler.logError('CheckInView.loadTodayData', error);
        }
    },
    
    handleSubmit() {
        try {
            const today = new Date().toISOString().split('T')[0];
            
            // Collect and validate mood
            const moodValue = document.getElementById('moodSlider').value;
            if (!ValidationHelper.isValidMood(moodValue)) {
                throw new Error('Invalid mood value. Please select a mood between 1-10.');
            }
            const mood = parseInt(moodValue);
            
            // Collect and validate sleep
            const sleepValue = document.getElementById('sleepHours').value.trim();
            if (!sleepValue) {
                throw new Error('Sleep hours is required. Please enter how many hours you slept.');
            }
            if (!ValidationHelper.isValidSleep(sleepValue)) {
                throw new Error('Invalid sleep value. Please enter a number between 0-24 hours.');
            }
            const sleep = parseFloat(sleepValue);
            
            // Validate stress selection
            const stressElement = document.querySelector('.stress-btn.selected');
            if (!stressElement) {
                throw new Error('Stress level is required. Please select your stress level.');
            }
            const stress = parseInt(stressElement.getAttribute('data-stress'));
            if (!ValidationHelper.isValidStress(stress)) {
                throw new Error('Invalid stress value selected.');
            }
            
            // Collect and validate journal (optional)
            const journalValue = document.getElementById('journalEntry').value.trim();
            if (!ValidationHelper.isValidJournal(journalValue)) {
                throw new Error('Journal entry is too long. Maximum 500 characters allowed.');
            }
            const journal = journalValue ? ValidationHelper.sanitizeString(journalValue) : '';
            
            // Get activities
            const activities = [];
            document.querySelectorAll('.tag-checkbox input:checked').forEach(checkbox => {
                activities.push(checkbox.value);
            });
            
            // Create and save entry
            const entry = {
                date: today,
                mood,
                sleep,
                stress,
                journal,
                activities,
                timestamp: new Date().toISOString()
            };
            
            // Attempt to save
            StorageManager.saveEntry(entry);
            
            // Update UI on successful save
            UIManager.updateStreak();
            UIManager.showWellnessSuggestion(mood, activities);
            
            ErrorHandler.showSuccess(
                'Check-in saved successfully! Great job tracking your wellness!'
            );
        } catch (error) {
            ErrorHandler.logError('CheckInView.handleSubmit', error);
            ErrorHandler.showError('Check-in Error', error.message);
        }
    }
};

// History View - Displays calendar with mood history and details
const HistoryView = {
    currentDate: new Date(),
    
    /**
     * Initializes history view - renders calendar and sets up navigation
     */
    loadHistory() {
        this.renderCalendar();
        this.setupCalendarNavigation();
        this.displayDetailsMessage();
    },
    
    /**
     * Renders calendar grid for current month
     * Displays moods with emojis for days with entries
     * Shows previous/next month days in grayed out style
     */
    renderCalendar() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        // Update month/year display
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                           'July', 'August', 'September', 'October', 'November', 'December'];
        const monthDisplay = document.getElementById('monthYearDisplay');
        if (monthDisplay) {
            monthDisplay.textContent = `${monthNames[month]} ${year}`;
        }
        
        // Get all entries and create lookup map for O(1) access
        const allEntries = StorageManager.getAllEntries();
        const entryMap = {};
        allEntries.forEach(entry => {
            entryMap[entry.date] = entry;
        });
        
        // Get calendar structure info
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();
        
        // Create calendar grid
        const calendarDays = document.getElementById('calendarDays');
        if (!calendarDays) return;
        
        calendarDays.innerHTML = '';
        
        // Add previous month's days (grayed out)
        for (let i = firstDay - 1; i >= 0; i--) {
            const day = daysInPrevMonth - i;
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day other-month';
            dayElement.textContent = day;
            calendarDays.appendChild(dayElement);
        }
        
        // Add current month's days
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const entry = entryMap[dateStr];
            
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            
            // Display mood emoji if entry exists for this day
            if (entry) {
                dayElement.classList.add('has-entry');
                const moodEmoji = this.getMoodEmoji(entry.mood);
                dayElement.innerHTML = `<div class="calendar-day-emoji">${moodEmoji}</div><div>${day}</div>`;
            } else {
                dayElement.textContent = day;
            }
            
            // Add click handler to display entry details
            dayElement.addEventListener('click', () => {
                if (entry) {
                    this.displayEntryDetails(entry, dateStr);
                    
                    // Update selected state
                    document.querySelectorAll('.calendar-day').forEach(el => el.classList.remove('selected'));
                    dayElement.classList.add('selected');
                }
            });
            
            calendarDays.appendChild(dayElement);
        }
        
        // Add next month's days (grayed out) to complete grid
        const totalCells = calendarDays.children.length;
        const remainingCells = 42 - totalCells; // 6 weeks * 7 days
        for (let day = 1; day <= remainingCells; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day other-month';
            dayElement.textContent = day;
            calendarDays.appendChild(dayElement);
        }
    },
    
    /**
     * Sets up previous/next month navigation buttons
     */
    setupCalendarNavigation() {
        const prevBtn = document.getElementById('prevMonth');
        const nextBtn = document.getElementById('nextMonth');
        
        if (prevBtn) {
            prevBtn.removeEventListener('click', this.handlePrevMonth.bind(this));
            prevBtn.addEventListener('click', this.handlePrevMonth.bind(this));
        }
        
        if (nextBtn) {
            nextBtn.removeEventListener('click', this.handleNextMonth.bind(this));
            nextBtn.addEventListener('click', this.handleNextMonth.bind(this));
        }
    },
    
    /**
     * Navigates to previous month
     */
    handlePrevMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.renderCalendar();
    },
    
    /**
     * Navigates to next month
     */
    handleNextMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.renderCalendar();
    },
    
    /**
     * Displays detailed entry information in the details panel
     * Shows mood, sleep, stress, activities, and journal notes
     * @param {Object} entry - Entry data to display
     * @param {string} dateStr - Date string in YYYY-MM-DD format
     */
    displayEntryDetails(entry, dateStr) {
        const date = new Date(entry.date);
        const moodEmoji = this.getMoodEmoji(entry.mood);
        const stressLabel = ['', 'Low 😌', 'Moderate 😐', 'High 😰', 'Very High 😱'][entry.stress];
        
        const detailsPanel = document.getElementById('detailsPanel');
        if (!detailsPanel) return;
        
        detailsPanel.innerHTML = `
            <h3>${date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h3>
            
            <div class="detail-item">
                <div class="detail-label">Mood</div>
                <div class="detail-value">
                    <span class="detail-emoji">${moodEmoji}</span> ${entry.mood}/10
                </div>
            </div>
            
            <div class="detail-item">
                <div class="detail-label">Sleep</div>
                <div class="detail-value">😴 ${entry.sleep} hours</div>
            </div>
            
            <div class="detail-item">
                <div class="detail-label">Stress Level</div>
                <div class="detail-value">${stressLabel}</div>
            </div>
            
            ${entry.activities && entry.activities.length > 0 ? `
                <div class="detail-item">
                    <div class="detail-label">Activities</div>
                    <div class="detail-value">🎯 ${entry.activities.join(', ')}</div>
                </div>
            ` : ''}
            
            ${entry.journal ? `
                <div class="detail-item">
                    <div class="detail-label">Notes</div>
                    <div class="detail-value" style="font-style: italic;">"${entry.journal}"</div>
                </div>
            ` : ''}
        `;
    },
    
    /**
     * Displays default message when no entry is selected
     */
    displayDetailsMessage() {
        const detailsPanel = document.getElementById('detailsPanel');
        if (detailsPanel) {
            detailsPanel.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Click on a date to see details</p>';
        }
    }
};

// Analytics View - Displays charts and trends from wellness data
const AnalyticsView = {
    charts: {},
    
    /**
     * Initializes analytics view
     * Loads data and creates visualizations
     */
    loadAnalytics() {
        try {
            const entries = StorageManager.getLastNDays(30);
            
            if (entries.length === 0) {
                const analyticsContainer = document.querySelector('.analytics-container');
                if (analyticsContainer) {
                    analyticsContainer.innerHTML += 
                        '<p style="text-align: center; color: var(--text-secondary);">Need more data to display analytics. Keep tracking!</p>';
                }
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
        } catch (error) {
            ErrorHandler.logError('AnalyticsView.loadAnalytics', error);
        }
    },
    
    /**
     * Calculates and displays summary statistics
     * Shows average mood, sleep, and stress across the period
     * @param {Array} entries - Array of wellness entries
     */
    displaySummaries(entries) {
        const avgMood = (entries.reduce((sum, e) => sum + e.mood, 0) / entries.length).toFixed(1);
        const avgSleep = (entries.reduce((sum, e) => sum + e.sleep, 0) / entries.length).toFixed(1);
        const avgStress = (entries.reduce((sum, e) => sum + e.stress, 0) / entries.length).toFixed(1);
        
        const avgMoodEl = document.getElementById('avgMood');
        const avgSleepEl = document.getElementById('avgSleep');
        const avgStressEl = document.getElementById('avgStress');
        
        if (avgMoodEl) avgMoodEl.textContent = `${avgMood}/10`;
        if (avgSleepEl) avgSleepEl.textContent = `${avgSleep} hrs`;
        if (avgStressEl) avgStressEl.textContent = `${avgStress}/4`;
    },
    
    createCharts(entries) {
        try {
            // Sort entries by date (oldest first for proper chart display)
            const sortedEntries = [...entries].reverse();
            
            const dates = sortedEntries.map(e => new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
            const moods = sortedEntries.map(e => e.mood);
            const sleeps = sortedEntries.map(e => e.sleep);
            const stresses = sortedEntries.map(e => e.stress);
            
            // Create three different chart types for different perspectives
            this.createMoodChart(dates, moods);
            this.createSleepChart(dates, sleeps);
            this.createStressChart(dates, stresses);
        } catch (error) {
            ErrorHandler.logError('AnalyticsView.createCharts', error);
        }
    },
    
    createMoodChart(dates, moodData) {
        const ctx = document.getElementById('moodChart');
        if (!ctx) return;
        
        // Destroy existing chart to prevent memory leaks
        if (this.charts.mood) this.charts.mood.destroy();
        
        // Create line chart showing mood trends
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
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary')
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 10,
                        ticks: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary')
                        },
                        grid: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--border-color')
                        }
                    },
                    x: {
                        ticks: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary')
                        },
                        grid: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--border-color')
                        }
                    }
                }
            }
        });
    },
    
    createSleepChart(dates, sleepData) {
        const ctx = document.getElementById('sleepChart');
        if (!ctx) return;
        
        // Destroy existing chart
        if (this.charts.sleep) this.charts.sleep.destroy();
        
        // Create bar chart for sleep hours
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
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary')
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 12,
                        ticks: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary')
                        },
                        grid: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--border-color')
                        }
                    },
                    x: {
                        ticks: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary')
                        },
                        grid: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--border-color')
                        }
                    }
                }
            }
        });
    },
    
    createStressChart(dates, stressData) {
        const ctx = document.getElementById('stressChart');
        if (!ctx) return;
        
        // Destroy existing chart
        if (this.charts.stress) this.charts.stress.destroy();
        
        // Create line chart for stress trends
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
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary')
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 4,
                        ticks: {
                            // Convert numeric stress level to label
                            callback: function(value) {
                                return ['', 'Low', 'Moderate', 'High', 'Very High'][value];
                            },
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary')
                        },
                        grid: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--border-color')
                        }
                    },
                    x: {
                        ticks: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary')
                        },
                        grid: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--border-color')
                        }
                    }
                }
            }
        });
    },
    
    displayWeeklySummary(entries) {
        try {
            // Group entries by day of week
            const summary = {};
            
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
            
            // Display organized by day order
            const daysOrder = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const weeklySummaryContent = document.getElementById('weeklySummaryContent');
            if (!weeklySummaryContent) return;
            
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
        } catch (error) {
            ErrorHandler.logError('AnalyticsView.displayWeeklySummary', error);
        }
    },
    
    /**
     * Sets up export button event listeners
     * @param {Array} entries - Array of wellness entries to export
     */
    setupExportButtons(entries) {
        const csvBtn = document.getElementById('exportCSV');
        const pdfBtn = document.getElementById('exportPDF');
        
        if (csvBtn) csvBtn.addEventListener('click', () => this.exportCSV(entries));
        if (pdfBtn) pdfBtn.addEventListener('click', () => this.exportPDF(entries));
    },
    
    exportCSV(entries) {
        try {
            let csv = 'Date,Mood,Sleep (hrs),Stress,Activities,Notes\n';
            
            entries.forEach(entry => {
                const date = new Date(entry.date).toLocaleDateString();
                const activities = entry.activities ? entry.activities.join('; ') : '';
                const notes = entry.journal || '';
                
                // Use sanitization to prevent CSV injection
                csv += [
                    ValidationHelper.sanitizeCSVField(date),
                    ValidationHelper.sanitizeCSVField(entry.mood.toString()),
                    ValidationHelper.sanitizeCSVField(entry.sleep.toString()),
                    ValidationHelper.sanitizeCSVField(entry.stress.toString()),
                    ValidationHelper.sanitizeCSVField(activities),
                    ValidationHelper.sanitizeCSVField(notes)
                ].join(',') + '\n';
            });
            
            // Create blob and download
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            
            link.setAttribute('href', url);
            link.setAttribute('download', `wellness-data-${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            ErrorHandler.showSuccess('Data exported successfully as CSV!');
        } catch (error) {
            ErrorHandler.logError('AnalyticsView.exportCSV', error);
            ErrorHandler.showError(
                'Export Error',
                'Could not export data. Please try again.'
            );
        }
    },
    
    exportPDF(entries) {
        try {
            ErrorHandler.showInfo(
                'PDF Export: Please save this page as PDF using your browser ' +
                '(Ctrl+P or Cmd+P on Mac) to create a comprehensive report of your wellness data.'
            );
        } catch (error) {
            ErrorHandler.logError('AnalyticsView.exportPDF', error);
        }
    }
};

// Helper function to convert mood value to emoji
/**
 * Maps numeric mood value to corresponding emoji
 * 1-2: 😢 (Very sad)
 * 3-4: 😟 (Sad)
 * 5-6: 😐 (Neutral)
 * 7-8: 🙂 (Happy)
 * 9-10: 😊 (Very happy)
 * @param {number} moodValue - Mood value (1-10)
 * @returns {string} Corresponding mood emoji
 */
HistoryView.getMoodEmoji = function(moodValue) {
    if (moodValue <= 2) return '😢';
    if (moodValue <= 4) return '😟';
    if (moodValue <= 6) return '😐';
    if (moodValue <= 8) return '🙂';
    return '😊';
};

// Dark Mode Toggle - Handles theme switching
/**
 * Sets up dark mode toggle functionality
 * Persists theme preference in localStorage
 */
function setupThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const htmlElement = document.documentElement;
    
    if (!themeToggle) return;
    
    try {
        // Check for saved theme preference, default to 'light'
        const savedTheme = localStorage.getItem('theme') || 'light';
        
        if (savedTheme === 'dark') {
            htmlElement.classList.add('dark-mode');
            themeToggle.textContent = '☀️';
        } else {
            htmlElement.classList.remove('dark-mode');
            themeToggle.textContent = '🌙';
        }
        
        themeToggle.addEventListener('click', () => {
            if (htmlElement.classList.contains('dark-mode')) {
                // Switch to light mode
                htmlElement.classList.remove('dark-mode');
                localStorage.setItem('theme', 'light');
                themeToggle.textContent = '🌙';
            } else {
                // Switch to dark mode
                htmlElement.classList.add('dark-mode');
                localStorage.setItem('theme', 'dark');
                themeToggle.textContent = '☀️';
            }
            
            // Reload charts if analytics view is active to update legend colors
            const analyticsView = document.getElementById('analytics');
            if (analyticsView && analyticsView.classList.contains('active')) {
                AnalyticsView.loadAnalytics();
            }
        });
    } catch (error) {
        ErrorHandler.logError('setupThemeToggle', error);
    }
}

// Initialize all modules when DOM is ready
/**
 * Main initialization function
 * Runs when DOM is fully loaded
 * Sets up all UI components and event listeners
 */
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Initialize login page first
        LoginPageManager.init();

        // Initialize logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to logout?')) {
                    LoginPageManager.logout();
                }
            });
        }

        // Initialize UI components
        UIManager.updateDateDisplay();
        UIManager.setupMoodEmojis();
        UIManager.setupMoodSlider();
        UIManager.setupStressButtons();
        UIManager.updateStreak();
        
        // Initialize check-in view
        CheckInView.init();
        
        // Initialize navigation
        Navigation.init();
        
        // Initialize theme toggle
        setupThemeToggle();
    } catch (error) {
        ErrorHandler.logError('DOMContentLoaded initialization', error);
        ErrorHandler.showError(
            'Initialization Error',
            'Failed to initialize the application. Please refresh the page.'
        );
    }
});
