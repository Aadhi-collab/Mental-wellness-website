// ============================================
// Supabase Authentication Integration
// Replace the existing AuthManager with this version
// ============================================

const SupabaseAuthManager = {
    /**
     * Register a new user with Supabase
     * @param {string} name - User's full name
     * @param {string} email - User's email
     * @param {string} password - User's password
     * @returns {Promise<Object>} Result of registration
     */
    async registerUser(name, email, password) {
        try {
            console.log('[Supabase Register] Starting registration for:', email);
            
            // Validate inputs
            if (!name || !email || !password) {
                return { success: false, message: 'All fields are required' };
            }
            if (password.length < 6) {
                return { success: false, message: 'Password must be at least 6 characters' };
            }
            if (!this.isValidEmail(email)) {
                return { success: false, message: 'Invalid email format' };
            }

            // Create user in Supabase Auth
            const { data, error } = await supabaseClient.auth.signUp({
                email: email,
                password: password
            });

            if (error) {
                console.error('[Supabase Register] Auth error:', error);
                return { success: false, message: error.message };
            }

            // Create user profile in database
            const { user } = data;
            const profileResult = await createUserProfile(user.id, { name, email });
            
            if (!profileResult.success) {
                return { success: false, message: 'Failed to create user profile' };
            }

            console.log('[Supabase Register] User registered successfully:', email);
            return { success: true, message: 'Account created successfully. Please check your email to confirm.' };
        } catch (error) {
            console.error('[Supabase Register] Error:', error);
            return { success: false, message: 'Registration failed: ' + error.message };
        }
    },

    /**
     * Login user with Supabase
     * @param {string} email - User's email
     * @param {string} password - User's password
     * @returns {Promise<Object>} Login result with user data
     */
    async loginUser(email, password) {
        try {
            if (!email || !password) {
                return { success: false, message: 'Email and password are required' };
            }

            // Sign in with Supabase Auth
            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) {
                console.error('[Supabase Login] Auth error:', error);
                return { success: false, message: error.message };
            }

            const { user } = data;
            
            // Fetch user profile
            const profile = await getUserProfile(user.id);
            
            if (!profile) {
                return { success: false, message: 'User profile not found' };
            }

            const currentUser = {
                id: user.id,
                name: profile.name,
                email: profile.email
            };

            // Store in localStorage for quick access (Supabase also manages session)
            localStorage.setItem('wellnessTrackerCurrentUser', JSON.stringify(currentUser));

            console.log('[Supabase Login] Login successful:', email);
            return { success: true, user: currentUser, message: 'Login successful' };
        } catch (error) {
            console.error('[Supabase Login] Error:', error);
            return { success: false, message: 'Login failed: ' + error.message };
        }
    },

    /**
     * Logout current user
     * @returns {Promise<Object>} Logout result
     */
    async logout() {
        try {
            const { error } = await supabaseClient.auth.signOut();
            if (error) throw error;
            
            localStorage.removeItem('wellnessTrackerCurrentUser');
            console.log('[Supabase Logout] User logged out successfully');
            return { success: true };
        } catch (error) {
            console.error('[Supabase Logout] Error:', error);
            return { success: false, message: error.message };
        }
    },

    /**
     * Get current authenticated user
     * @returns {Promise<Object|null>} Current user or null
     */
    async getCurrentUser() {
        try {
            const { data: { user } } = await supabaseClient.auth.getUser();
            
            if (!user) {
                // Check localStorage fallback
                const cached = localStorage.getItem('wellnessTrackerCurrentUser');
                return cached ? JSON.parse(cached) : null;
            }

            const profile = await getUserProfile(user.id);
            return {
                id: user.id,
                name: profile?.name || user.email,
                email: user.email
            };
        } catch (error) {
            console.error('[Supabase getCurrentUser] Error:', error);
            return null;
        }
    },

    /**
     * Get user ID from current session
     * @returns {Promise<string|null>} User ID or null
     */
    async getUserId() {
        try {
            const { data: { user } } = await supabaseClient.auth.getUser();
            return user?.id || null;
        } catch (error) {
            console.error('[Supabase getUserId] Error:', error);
            return null;
        }
    },

    /**
     * Validate email format
     * @param {string} email - Email to validate
     * @returns {boolean} True if valid
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
};

// ============================================
// Supabase Storage Manager
// Replace StorageManager with this version for database operations
// ============================================

const SupabaseStorageManager = {
    /**
     * Save a check-in entry to Supabase
     * @param {Object} entry - Entry object with mood, sleep, stress, journal, activities
     * @returns {Promise<boolean>} Success status
     */
    async saveEntry(entry) {
        try {
            const userId = await SupabaseAuthManager.getUserId();
            if (!userId) {
                throw new Error('User not authenticated');
            }

            const result = await saveCheckIn(userId, {
                mood: entry.mood,
                stressLevel: entry.stress,
                sleepHours: entry.sleep,
                journalNotes: entry.journal,
                activities: entry.activities
            });

            if (!result.success) {
                throw new Error(result.error);
            }

            console.log('[SupabaseStorageManager] Entry saved successfully');
            return true;
        } catch (error) {
            console.error('[SupabaseStorageManager.saveEntry] Error:', error);
            throw error;
        }
    },

    /**
     * Get entries for the last N days
     * @param {number} days - Number of days
     * @returns {Promise<Array>} Array of entries
     */
    async getLastNDays(days) {
        try {
            const userId = await SupabaseAuthManager.getUserId();
            if (!userId) {
                throw new Error('User not authenticated');
            }

            const checkIns = await getUserCheckIns(userId);
            
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - days);

            return checkIns.filter(entry => 
                new Date(entry.created_at) >= cutoffDate
            );
        } catch (error) {
            console.error('[SupabaseStorageManager.getLastNDays] Error:', error);
            return [];
        }
    },

    /**
     * Get entry for a specific date
     * @param {string} date - Date in YYYY-MM-DD format
     * @returns {Promise<Object|null>} Entry object or null
     */
    async getEntry(date) {
        try {
            const userId = await SupabaseAuthManager.getUserId();
            if (!userId) {
                throw new Error('User not authenticated');
            }

            const checkIns = await getUserCheckIns(userId);
            
            // Find entry for the date
            const entry = checkIns.find(e => {
                const entryDate = e.created_at.split('T')[0];
                return entryDate === date;
            });

            return entry ? {
                date: entry.created_at.split('T')[0],
                mood: entry.mood,
                sleep: entry.sleep_hours,
                stress: entry.stress_level,
                journal: entry.journal_notes,
                activities: entry.activities || []
            } : null;
        } catch (error) {
            console.error('[SupabaseStorageManager.getEntry] Error:', error);
            return null;
        }
    },

    /**
     * Get all entries for current user
     * @returns {Promise<Array>} Array of all entries
     */
    async getAllEntries() {
        try {
            const userId = await SupabaseAuthManager.getUserId();
            if (!userId) {
                throw new Error('User not authenticated');
            }

            const checkIns = await getUserCheckIns(userId);
            
            return checkIns.map(e => ({
                date: e.created_at.split('T')[0],
                mood: e.mood,
                sleep: e.sleep_hours,
                stress: e.stress_level,
                journal: e.journal_notes,
                activities: e.activities || [],
                timestamp: e.created_at
            }));
        } catch (error) {
            console.error('[SupabaseStorageManager.getAllEntries] Error:', error);
            return [];
        }
    },

    /**
     * Calculate mood streak
     * @returns {Promise<number>} Streak count
     */
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

            console.log('[SupabaseStorageManager.calculateStreak] Current streak:', streak);
            return streak;
        } catch (error) {
            console.error('[SupabaseStorageManager.calculateStreak] Error:', error);
            return 0;
        }
    }
};
