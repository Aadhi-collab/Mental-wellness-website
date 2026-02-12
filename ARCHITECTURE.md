# Architecture & Code Documentation

## 🏗️ Project Architecture

### System Overview

```
┌─────────────────────────────────────────────────────┐
│         Mental Health Tracker Application           │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │           UI Layer (index.html)              │  │
│  │  - 4 View Sections (Check-in, History,       │  │
│  │    Analytics, Resources)                     │  │
│  │  - Form Controls (sliders, buttons, inputs)  │  │
│  │  - Chart containers (for Chart.js)           │  │
│  └──────────────────────────────────────────────┘  │
│                      ↕ Events                      │
│  ┌──────────────────────────────────────────────┐  │
│  │      Logic Layer (app.js)                    │  │
│  │  - Event Handlers                            │  │
│  │  - Data Validation                           │  │
│  │  - Business Logic                            │  │
│  │  - Chart Creation (Chart.js wrapper)         │  │
│  │  - Export Functions                          │  │
│  └──────────────────────────────────────────────┘  │
│                      ↕ Data                        │
│  ┌──────────────────────────────────────────────┐  │
│  │      Storage Layer (LocalStorage)            │  │
│  │  - Data Persistence                          │  │
│  │  - JSON Serialization                        │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 📁 File Structure & Responsibilities

### 1. **index.html** (12.6 KB)
**Purpose**: HTML structure and semantic markup

**Key Sections**:
- `<navbar>`: Navigation and theme toggle
- `#check-in`: Daily check-in form and UI
- `#history`: Past entries display
- `#analytics`: Charts and visualizations
- `#resources`: Emergency resources and support

**Key Elements**:
```html
<!-- Mood Selection -->
<div class="mood-selector">
  <div class="mood-emoji" data-mood="1">😢</div>
  ...
</div>

<!-- Chart Containers -->
<canvas id="moodChart"></canvas>
<canvas id="sleepChart"></canvas>
<canvas id="stressChart"></canvas>

<!-- Form Inputs -->
<input type="number" id="sleepHours">
<textarea id="journalEntry"></textarea>
<input type="checkbox" value="exercise">
```

---

### 2. **styles.css** (15.7 KB)
**Purpose**: Complete styling with responsive design

**Key CSS Features**:
- CSS Variables for theming (light/dark mode)
- CSS Grid for layouts
- Flexbox for alignment
- Media queries for responsive design
- Smooth transitions and animations
- Gradient backgrounds for visual appeal

**CSS Variables**:
```css
:root {
    --primary-color: #667eea;
    --secondary-color: #764ba2;
    --success-color: #48bb78;
    --danger-color: #f56565;
    --bg-primary: #ffffff;
    --bg-secondary: #f7fafc;
    --text-primary: #2d3748;
    --text-secondary: #718096;
}

body.dark-mode {
    /* Dark mode overrides */
}
```

**Responsive Breakpoints**:
- Desktop: 1200px+
- Tablet: 768-1199px
- Mobile: 480-767px
- Small Phone: <480px

---

### 3. **app.js** (26.4 KB)
**Purpose**: Core application logic

**Module Structure**:

#### A. **StorageManager**
Handles all data persistence and retrieval.

```javascript
StorageManager = {
    storageKey: 'wellnessTrackerData',
    
    getAllEntries(),        // Get all mood entries
    getEntry(date),         // Get single entry by date
    saveEntry(entry),       // Save/update entry
    getLastNDays(days),     // Get entries for N days
    calculateStreak()       // Calculate consecutive days
}
```

**Key Methods**:
- Uses JSON serialization for LocalStorage
- Sorts entries chronologically
- Handles date string conversions (YYYY-MM-DD)

---

#### B. **UIManager**
Handles all UI updates and user interactions.

```javascript
UIManager = {
    updateDateDisplay(),           // Show today's date
    setupMoodEmojis(),             // Initialize emoji selection
    updateMoodValue(),             // Update mood display
    setupMoodSlider(),             // Initialize slider
    setupStressButtons(),          // Initialize stress buttons
    updateStreak(),                // Update streak display
    showWellnessSuggestion()       // Show tip based on mood
}
```

**Event Handlers**:
- Click events for emojis (mood selection)
- Input events for slider (mood value)
- Click events for stress buttons
- Dynamic emoji selection based on slider

---

#### C. **Navigation**
Manages tab switching and view transitions.

```javascript
Navigation = {
    init(),          // Setup navigation listeners
    switchView(viewName)  // Switch active view
}
```

**Features**:
- Tab highlight (active state)
- View show/hide with animations
- Fade-in animation (300ms)

---

#### D. **CheckInView**
Handles daily check-in functionality.

```javascript
CheckInView = {
    init(),
    loadTodayData(),  // Load today's data if exists
    handleSubmit()    // Save check-in
}
```

**Submission Process**:
1. Collects all form data
2. Validates stress level required
3. Creates entry object with timestamp
4. Saves to storage
5. Updates UI (streak, suggestion)
6. Shows success message

**Entry Object Structure**:
```javascript
{
    date: "2024-02-10",           // YYYY-MM-DD
    mood: 8,                      // 1-10
    sleep: 7.5,                   // hours
    stress: 2,                    // 1-4
    journal: "...",               // optional text
    activities: ["exercise"],     // array of tags
    timestamp: "2024-02-10T14:30:00Z"
}
```

---

#### E. **HistoryView**
Manages history view and data display.

```javascript
HistoryView = {
    loadHistory(),           // Load filtered history
    getMoodEmoji(value)      // Helper: value to emoji
}
```

**Features**:
- Filters by day range (7, 14, 30)
- Shows all entry fields
- Formatted dates (weekday, month, day, year)
- Mood emojis for quick visual scan
- Activities and journal display

---

#### F. **AnalyticsView**
Manages analytics, charts, and exports.

```javascript
AnalyticsView = {
    charts: {},              // Stores chart instances
    
    loadAnalytics(),
    displaySummaries(entries),
    createCharts(entries),
    
    // Chart creation
    createMoodChart(dates, moodData),
    createSleepChart(dates, sleepData),
    createStressChart(dates, stressData),
    
    // Summary
    displayWeeklySummary(entries),
    
    // Export
    setupExportButtons(entries),
    exportCSV(entries),
    exportPDF(entries)
}
```

**Chart Implementation**:
- Uses Chart.js library
- Destroys old charts before creating new ones
- Responsive sizing with maintainAspectRatio
- Dynamic colors that respond to theme

**Chart Details**:

| Chart | Type | Data Range | Purpose |
|-------|------|-----------|---------|
| Mood | Line | 1-10 | Trend visualization |
| Sleep | Bar | 0-12 hours | Sleep pattern display |
| Stress | Line | 1-4 | Stress progression |

---

#### G. **Usage Functions**
Utility and initialization functions.

```javascript
setupThemeToggle()        // Dark mode toggle
setupHistoryFilter()      // History filter listener
// Main initialization
document.addEventListener('DOMContentLoaded', ...)
```

---

## 🔄 Data Flow Diagram

```
User Input (Form)
      ↓
CheckInView.handleSubmit()
      ↓
Validation
      ↓
Create Entry Object
      ↓
StorageManager.saveEntry()
      ↓
LocalStorage JSON
      ↓
UIManager Updates (Streak, Suggestion)
      ↓
History Tab: StorageManager.getLastNDays()
      ↓
HistoryView.loadHistory()
      ↓
Display History Items
      ↓
Analytics Tab: AnalyticsView.loadAnalytics()
      ↓
Calculate Summaries & Create Charts
      ↓
Display Visualizations
```

---

## 🎨 Styling Architecture

### Color Scheme
```css
Primary (Interactive):     #667eea (Purple-blue)
Secondary (Highlights):    #764ba2 (Deep purple)
Success (Positive):        #48bb78 (Green)
Warning (Caution):         #f6ad55 (Orange)
Danger (Crisis):          #f56565 (Red)

Light Theme:
- Background:             #ffffff, #f7fafc
- Text:                   #2d3748, #718096

Dark Theme:
- Background:             #1a202c, #2d3748
- Text:                   #f7fafc, #cbd5e0
```

### Component Styling Pattern
```css
/* Base Styles */
.component { }

/* States */
.component:hover { }
.component.active { }
.component.selected { }

/* Responsive */
@media (max-width: 768px) { }
@media (max-width: 480px) { }
```

---

## 💡 Key Algorithms

### 1. Streak Calculation
```javascript
calculateStreak() {
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 365; i++) {
        const dateStr = currentDate.toISOString().split('T')[0];
        if (entries.find(e => e.date === dateStr)) {
            streak++;
        } else {
            break;  // Breaks on first missing day
        }
        currentDate.setDate(currentDate.getDate() - 1);
    }
    return streak;
}
```

**Logic**:
- Starts from today
- Counts consecutive days with entries
- Stops at first gap
- Max 365 day check

### 2. Wellness Suggestion Algorithm
```javascript
showWellnessSuggestion(moodValue, activities) {
    let category = 'moderate';
    if (moodValue <= 3) category = 'low';
    else if (moodValue >= 7) category = 'high';
    
    const suggestion = suggestions[category][random];
    displaySuggestion(suggestion);
}
```

**Categories**:
- Low (≤3): Exercise, meditation, social connection
- Moderate (4-6): Breaks, journaling, music, gratitude
- High (≥7): Breathing, sleep, nature, talking

### 3. Mood to Emoji Mapping
```javascript
getMoodEmoji(value) {
    if (value <= 2) return '😢';    // Very sad
    if (value <= 4) return '😟';    // Sad
    if (value <= 6) return '😐';    // Neutral
    if (value <= 8) return '🙂';    // Happy
    return '😊';                    // Very happy
}
```

**Range Mapping**:
1-2 → 😢, 3-4 → 😟, 5-6 → 😐, 7-8 → 🙂, 9-10 → 😊

---

## 📊 Chart.js Integration

### Chart Configuration Pattern
```javascript
new Chart(ctx, {
    type: 'line',  // or 'bar'
    data: {
        labels: dates,
        datasets: [{
            label: 'Series Name',
            data: values,
            borderColor: color,
            backgroundColor: color,
            tension: 0.4,  // Smooth curves
            fill: true,    // Fill under line
            pointRadius: 5
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: { beginAtZero: true, max: maxValue },
            x: { /* axis config */ }
        }
    }
});
```

### Theme Awareness
```javascript
// Charts read CSS variables for colors
const color = getComputedStyle(document.documentElement)
    .getPropertyValue('--text-primary');
```

---

## 🔐 Data Security & Privacy

### Storage Safety
- **Local Only**: No data leaves the device
- **Not Encrypted**: For demo purposes (can be added)
- **User Control**: Users can clear anytime
- **No Analytics**: No tracking or telemetry

### Clearing Data
```javascript
// Programmatic clear
localStorage.removeItem('wellnessTrackerData');
localStorage.removeItem('theme');

// Or manual
localStorage.clear();
```

---

## 🚀 Performance Optimizations

### CSS Performance
- CSS Variables (faster than SCSS)
- GPU-accelerated transforms
- Minimal repaints with transitions
- Efficient selectors

### JavaScript Performance
- Event delegation where possible
- Chart instance caching (destroy and recreate)
- Efficient array operations
- Lazy loading of analytics

### Bundle Size
- No external dependencies except Chart.js
- ~26KB JavaScript (unminified)
- ~16KB CSS (unminified)
- ~13KB HTML (unminified)

---

## 🧪 Testing Approach

### Unit-Level Testing Ideas
```javascript
// Test StorageManager
const entry = { date: "2024-02-10", mood: 8, ... };
StorageManager.saveEntry(entry);
assert(StorageManager.getEntry("2024-02-10") === entry);

// Test streak
StorageManager.calculateStreak() === 1;

// Test filters
StorageManager.getLastNDays(7).length <= 7;
```

### Integration Testing
- Form submission flow
- Data persistence check
- Chart rendering
- Theme toggle

### UI Testing
- Navigation between tabs
- Form validation
- Button states
- Responsive layouts

---

## 🔮 Future Enhancement Architecture

### Suggested Improvements

1. **IndexedDB for Larger Data**
   ```javascript
   // When data grows beyond localStorage limit
   const db = await openDB('wellnessDB');
   ```

2. **Service Workers for Offline**
   ```javascript
   navigator.serviceWorker.register('sw.js');
   ```

3. **Data Encryption**
   ```javascript
   // Add crypto library
   const encrypted = encrypt(data, password);
   ```

4. **Notifications API**
   ```javascript
   if ('Notification' in window) {
       new Notification('Time for your daily check-in!');
   }
   ```

5. **Web Workers for Analytics**
   ```javascript
   // Offload chart calculations
   const worker = new Worker('analytics-worker.js');
   ```

---

## 📚 Code Quality Metrics

### Maintainability
- ✅ Modular architecture (6 main modules)
- ✅ Clear function names and purposes
- ✅ Consistent code style
- ✅ Minimal code duplication
- ✅ Well-commented logic

### Scalability
- ✅ Easy to add new chart types
- ✅ Wellness suggestion system is extensible
- ✅ Storage can be upgraded to IndexedDB
- ✅ Theme system supports unlimited colors

### Accessibility
- ✅ Semantic HTML structure
- ✅ ARIA labels on interactive elements
- ✅ Keyboard navigation support
- ✅ Color contrast meets WCAG standards
- ✅ Emojis supplement rather than replace text

---

## 🎓 Learning Outcomes Demonstrated

### JavaScript Fundamentals
- ✅ Objects and array manipulation
- ✅ Event handling and listeners
- ✅ DOM manipulation
- ✅ JSON serialization/deserialization
- ✅ String and date operations
- ✅ Conditional logic and loops
- ✅ Function organization and scope

### Web APIs
- ✅ LocalStorage API
- ✅ Date API
- ✅ Document API (DOM)
- ✅ Chart.js library usage

### UI/UX Design
- ✅ Responsive design principles
- ✅ User feedback mechanisms
- ✅ Color theory and theming
- ✅ Accessibility considerations
- ✅ Animation and transitions

### Software Engineering
- ✅ Modular architecture
- ✅ Separation of concerns
- ✅ Data flow design
- ✅ Error handling
- ✅ Code reusability

---

## 📝 Comments & Documentation Example

```javascript
/**
 * Calculates mood streak - consecutive days with entries
 * @returns {number} Number of consecutive days with mood entries
 * 
 * Example: If user logged mood on 2/8, 2/9, 2/10 but missed
 * 2/7, streak would be 3 (starting from 2/10 going backwards)
 */
calculateStreak() {
    const entries = this.getAllEntries();
    if (entries.length === 0) return 0;
    
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    // Check each day going backwards from today
    for (let i = 0; i < 365; i++) {
        const dateStr = currentDate.toISOString().split('T')[0];
        if (entries.find(e => e.date === dateStr)) {
            streak++;
        } else {
            break;  // Streak ends on first missing day
        }
        currentDate.setDate(currentDate.getDate() - 1);
    }
    
    return streak;
}
```

---

## 🎯 Key Takeaways

1. **Architecture**: Clean separation between data, logic, and UI layers
2. **Responsiveness**: Works seamlessly across all device sizes
3. **User Experience**: Intuitive interactions with visual feedback
4. **Data Privacy**: All data stays on the user's device
5. **Extensibility**: Easy to add features without major refactoring
6. **Code Quality**: Professional-grade code suitable for learning or production

---

For questions about specific implementations, refer to the inline comments in `app.js` or examine the HTML structure in `index.html`.
