// ============================================
// Supabase Configuration
// ============================================

const SUPABASE_URL = 'https://yojmijdzuysuhtqxnctb.supabase.co'; // Replace with your Supabase URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlvam1pamR6dXlzdWh0cXhuY3RiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NjcxNTEsImV4cCI6MjA4NjQ0MzE1MX0.uhONf9aOapQ5fTYDXviPtv95GfPy8SObjz0jDdWU5mY'; // Replace with your Anon Key

// Initialize Supabase client
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Get Supabase client instance
 * @returns {Object} Supabase client
 */
function getSupabaseClient() {
    return supabaseClient;
}

/**
 * Create user profile in database
 * @param {String} userId - User ID from Supabase auth
 * @param {Object} userData - User data object
 * @returns {Promise<Object>} Result with success status
 */
async function createUserProfile(userId, userData) {
    try {
        const { data, error } = await supabaseClient
            .from('user_profiles')
            .insert([
                {
                    id: userId,
                    name: userData.name,
                    email: userData.email,
                    created_at: new Date().toISOString()
                }
            ]);

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Error creating user profile:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get user profile from database
 * @param {String} userId - User ID
 * @returns {Promise<Object>} User profile data
 */
async function getUserProfile(userId) {
    try {
        const { data, error } = await supabaseClient
            .from('user_profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return null;
    }
}

/**
 * Save wellness check-in data
 * @param {String} userId - User ID
 * @param {Object} checkInData - Check-in data (mood, stress, sleep, notes)
 * @returns {Promise<Object>} Result with success status
 */
async function saveCheckIn(userId, checkInData) {
    try {
        const { data, error } = await supabaseClient
            .from('wellness_checkins')
            .insert([
                {
                    user_id: userId,
                    mood: checkInData.mood,
                    stress_level: checkInData.stressLevel,
                    sleep_hours: checkInData.sleepHours,
                    journal_notes: checkInData.journalNotes,
                    created_at: new Date().toISOString()
                }
            ]);

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Error saving check-in:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get user's wellness check-ins
 * @param {String} userId - User ID
 * @returns {Promise<Array>} Array of check-in records
 */
async function getUserCheckIns(userId) {
    try {
        const { data, error } = await supabaseClient
            .from('wellness_checkins')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching check-ins:', error);
        return [];
    }
}

/**
 * Update user profile
 * @param {String} userId - User ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Result with success status
 */
async function updateUserProfile(userId, updates) {
    try {
        const { data, error } = await supabaseClient
            .from('user_profiles')
            .update(updates)
            .eq('id', userId);

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Error updating user profile:', error);
        return { success: false, error: error.message };
    }
}
