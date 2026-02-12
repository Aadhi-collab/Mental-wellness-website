# Quick Start Guide - Mental Health Check-In & Wellness Tracker

## 🚀 Quick Setup (Under 1 Minute)

### Step 1: Open the Application
Simply open `index.html` in any modern web browser. No installation needed!

### Step 2: Load Sample Data (Optional)
If you want to test with sample data immediately:

1. Open the browser Developer Console (F12 or Cmd+Option+I)
2. Paste this code and press Enter:

```javascript
const sampleData = [
    { date: "2024-02-03", mood: 5, sleep: 6, stress: 3, journal: "Stressful day", activities: ["study"], timestamp: "2024-02-03T12:00:00Z" },
    { date: "2024-02-04", mood: 6, sleep: 7.5, stress: 2, journal: "Better today", activities: ["exercise", "socializing"], timestamp: "2024-02-04T12:00:00Z" },
    { date: "2024-02-05", mood: 8, sleep: 8, stress: 1, journal: "Great day!", activities: ["meditation", "hobby"], timestamp: "2024-02-05T12:00:00Z" },
    { date: "2024-02-06", mood: 7, sleep: 7, stress: 2, journal: "Productive", activities: ["study", "exercise"], timestamp: "2024-02-06T12:00:00Z" },
    { date: "2024-02-07", mood: 5, sleep: 5.5, stress: 4, journal: "Tired", activities: ["rest"], timestamp: "2024-02-07T12:00:00Z" },
    { date: "2024-02-08", mood: 9, sleep: 8.5, stress: 1, journal: "Excellent!", activities: ["socializing", "hobby"], timestamp: "2024-02-08T12:00:00Z" },
    { date: "2024-02-09", mood: 7, sleep: 7.5, stress: 2, journal: "Good day", activities: ["exercise", "meditation"], timestamp: "2024-02-09T12:00:00Z" },
    { date: "2024-02-10", mood: 8, sleep: 8, stress: 1, journal: "Feeling great", activities: ["hobby", "socializing"], timestamp: "2024-02-10T12:00:00Z" }
];
localStorage.setItem('wellnessTrackerData', JSON.stringify(sampleData));
location.reload();
```

The page will refresh and display all sample data!

## 🎯 Feature Walkthrough

### 📊 Daily Check-in (Main Tab)
**What to do:**
1. Select your mood using emojis or the slider (1-10 scale)
2. Enter hours slept (0-24)
3. Click one stress level button (Low, Moderate, High, Very High)
4. Write optional journal notes
5. Check activities you did today
6. Click "Save Check-in"

**What you'll see:**
- ✅ Success message
- 🔥 Updated streak counter
- 💡 Personalized wellness suggestion

### 📖 History Tab
**What to do:**
1. Select time period (7, 14, or 30 days)
2. Scroll through past entries

**What you'll see:**
- Date and mood emoji for each entry
- Sleep hours and stress level
- Activities logged
- Journal notes if filled in

### 📊 Analytics Tab
**What to do:**
1. Just navigate to the tab - data loads automatically

**What you'll see:**
- 📈 **Three different charts:**
  1. **Mood Line Chart** - Shows mood trends (1-10)
  2. **Sleep Bar Chart** - Shows hours slept each night
  3. **Stress Line Chart** - Shows stress levels (1-4)

- 📊 **Summary Cards:**
  - Average Mood
  - Average Sleep
  - Average Stress

- 📅 **Weekly Summary:**
  - Grid showing average mood by day
  - Emoji representation of mood

- 💾 **Export Options:**
  - CSV export for use in Excel/Google Sheets
  - PDF suggestion (use browser Print feature)

### 🆘 Resources Tab
**Contains:**
- Crisis hotline numbers and texting services
- Campus mental health resources
- Self-care tips and strategies
- Links to mental health organizations

## 💡 Tips for Best Results

1. **Consistency**: Check in daily for best data patterns
2. **Honesty**: Accurate mood ratings help identify real trends
3. **Details**: Journal notes help you remember context
4. **Actions**: Log activities to see what impacts your mood
5. **Review**: Check analytics weekly to spot patterns

## 🎨 Theme & Customization

### Dark Mode
- Click the moon icon (🌙) in the top-right corner
- Your preference is saved automatically
- Toggle back with the sun icon (☀️)

## 📱 Works on Your Device

- **Desktop**: Full-featured experience
- **Tablet**: Optimized layout with touch support
- **Phone**: Responsive design, easy to use one-handed

## 🧹 Data Management

### View Your Data (JSON format)
Open browser console and run:
```javascript
console.log(JSON.parse(localStorage.getItem('wellnessTrackerData')));
```

### Clear All Data
If you want to start fresh:
```javascript
localStorage.removeItem('wellnessTrackerData');
localStorage.removeItem('theme');
location.reload();
```

## ❓ Common Questions

**Q: Where is my data stored?**
A: In your browser's local storage. It stays on your device and never leaves.

**Q: Can I use this on multiple devices?**
A: Data syncs within the same browser/device. Each device has separate data.

**Q: What if I clear my browser data?**
A: Your wellness data will be deleted. Consider exporting to CSV first!

**Q: Does it work offline?**
A: Yes! It's completely offline-first and works without internet.

**Q: Can others see my data?**
A: No. Everything is private and stored locally on your device.

## 🎬 Demo Script (For Presentations)

### Intro (30 seconds)
"This is a Mental Health Check-In tracker designed for students. It helps you monitor mood, sleep, and stress daily, identifying patterns to improve wellness."

### Daily Check-in Demo (1 minute)
1. Show the mood selector with emojis
2. Set mood to 8
3. Enter 7 hours of sleep
4. Select "Low" stress
5. Write a quick note
6. Select activities
7. Click save and show success message + wellness tip

### History Viewing (30 seconds)
1. Go to History tab
2. Show filtered entries from last 7 days
3. Point out mood emojis and data details

### Analytics Demo (1.5 minutes)
1. Navigate to Analytics
2. Show summary cards (average values)
3. Point to three different charts:
   - "This line chart shows my mood improving over the week"
   - "The bar chart shows my sleep patterns"
   - "The stress line chart shows stress decreasing"
4. Show weekly summary with emoji mood for each day

### Resources (30 seconds)
1. Go to Resources tab
2. Mention crisis hotlines and support options
3. Highlight self-care tips

### Wrap-up (30 seconds)
"This data stays private on your device, you can export to CSV, switch between dark and light mode, and the app works on any device. It's designed to be simple but powerful for mental health awareness."

## 🚀 Next Steps

1. ✅ Try entering today's check-in
2. ✅ Load sample data to see analytics
3. ✅ Export data as CSV
4. ✅ Toggle dark mode
5. ✅ Review resources section

## 📧 Feedback

This app is designed by students for students. Your mental health matters! 💚

---

**Remember**: This tool is a supplement, not a replacement for professional mental health support. If you're in crisis, please reach out to one of the resource hotlines in the Resources section.
