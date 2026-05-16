# GymKhanna - Premium AI Fitness Tracker 💪

A modern, mobile-first web application for tracking gym workouts, nutrition, and fitness progress with intelligent AI coaching. 

![GymKhanna App](https://img.shields.io/badge/Status-Active-success)
![Vanilla JS](https://img.shields.io/badge/Tech-Vanilla_JS-yellow)
![Firebase](https://img.shields.io/badge/Sync-Firebase-orange)

## 🌟 Key Features

### 🏋️ Workout & Program Management
- **Custom Program Builder**: Create multi-week training blocks with custom days and exercises.
- **Pre-built Templates**: Start instantly with Push/Pull/Legs, Upper/Lower, Bro Splits, and Full Body routines.
- **Progressive Overload**: Automatically suggests weight increases (+2.5kg) based on your past performance for each exercise.
- **Extensive Exercise Library**: Hundreds of categorized exercises built-in.

### 🤖 AI Coach (Powered by Gemini)
- **Smart Muscle Suggestions**: Analyzes your past 7 days of volume to tell you exactly what muscle group you should train today.
- **Deload Analysis**: Reviews your volume trends to warn you of overreaching and recommend rest weeks.
- **Exercise Alternatives**: Gym too busy? The AI will suggest 4 alternative exercises targeting the same muscle group if your machine is taken.

### 🍗 Nutrition & Progress
- **Barcode Food Scanner**: Instantly log food macros using your device camera (powered by OpenFoodFacts API).
- **Unlimited Progress Photos**: Snap and save unlimited comparison photos natively on your device using IndexedDB, bypassing storage limits.
- **Measurement Tracking**: Track weight, body fat %, and body measurements over time.

### 📊 Advanced Analytics
- **Volume Over Time**: Track your lifting volume across 14-day line charts.
- **Muscle Distribution**: Donut charts showing exactly where your volume is going.
- **Calories vs Activity**: Correlate your food intake with your training volume to ensure you are fueling properly.

## 🛠 Tech Stack
- **Frontend**: Vanilla HTML5, CSS3 (Glassmorphism design), Vanilla JS (ES6+ Module Pattern).
- **Charts**: Custom Canvas API implementations (no heavy external chart libraries).
- **Local Storage**: `IndexedDB` (for unlimited progress photos) and `localStorage`.
- **Cloud Sync**: Firebase Auth & Firestore (syncs workouts and nutrition across devices).
- **AI**: Google Gemini API integration.
- **APIs**: OpenFoodFacts (Barcode DB), HTML5-QRCode (Camera scanning).

## 🚀 Getting Started

### Local Development
1. Clone the repository:
   ```bash
   git clone https://github.com/Rajendra7250/GYM_KHANNA.git
   cd GYM_KHANNA
   ```
2. Start a local server (e.g. using VS Code Live Server or Python):
   ```bash
   python -m http.server 8000
   ```
3. Open `http://localhost:8000` in your browser.

### Deployment (Vercel)
This app is optimized for static hosting. The easiest way to deploy is via Vercel:
1. Push your code to GitHub.
2. Sign in to [Vercel](https://vercel.com/) and click **Add New Project**.
3. Import your GitHub repository.
4. Click **Deploy**. Your app will be live globally in seconds!

## 📁 File Structure
- `index.html` - Main application shell and UI modals.
- `css/styles.css` - Global design system and custom UI components.
- `js/app.js` - Main router and initialization.
- `js/storage.js` - Data formatting and Firebase Cloud Sync logic.
- `js/db.js` - Local IndexedDB management (for heavy media like photos).
- `js/ai.js` - Google Gemini integration logic.
- `js/programs.js` - Custom workout builder and active program tracking.
- `js/analytics.js` & `js/charts.js` - Data visualization.
- `js/firebase-init.js` - Database and Auth configuration.

---
*Built with ❤️ for fitness enthusiasts who want premium features without the premium price tag.*
