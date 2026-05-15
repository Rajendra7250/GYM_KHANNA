# GYM KHANNA - Gym Workout Tracker

A modern, mobile-first web application for tracking gym workouts and fitness progress.

## Features

- **Dashboard** - Visual overview of workout streak, volume, and muscle group distribution.
- **Workout Logging** - Quick and easy logging of exercises with sets, reps, and weight.
- **Workout Presets** - Save and reuse your favorite workout routines.
- **Progress Tracking** - Track your weightlifting progress with line charts.
- **Muscle Group Stats** - Track your progress by muscle group with donut charts.
- **Data Persistence** - All data is stored locally in your browser (IndexedDB).
- **Dark Mode** - Beautiful dark theme with accent colors.
- **Responsive Design** - Optimized for both mobile and desktop.

## Tech Stack

- **HTML5** - Semantic markup.
- **CSS3** - Modern styling and animations with Sass-like variables.
- **JavaScript (Vanilla)** - Modern JavaScript ES6+ features.
- **IndexedDB** - Client-side database for data storage.
- **Chart.js** - Custom canvas-based charts for data visualization.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Rajendra7250/GYM_KHANNA.git
   ```
2. Navigate to the project directory:
   ```bash
   cd GYM_KHANNA
   ```
3. Open `index.html` in your web browser.

## Usage

### Logging a Workout
1. Go to the **Workouts** tab.
2. Click the **Add Exercise** button.
3. Select a preset exercise or enter a custom one.
4. Enter the number of sets, reps, and weight (optional).
5. Click **Log Exercise**.

### Viewing Stats
1. Go to the **Dashboard** tab.
2. View your workout streak, total volume, and muscle group distribution.
3. Check the **Progress** section to see your weightlifting trend.

## File Structure

- `index.html` - Main application entry point.
- `css/styles.css` - Application styles.
- `js/app.js` - Main application controller.
- `js/storage.js` - Handles IndexedDB operations.
- `js/dashboard.js` - Dashboard page logic.
- `js/workouts.js` - Workouts page logic.
- `js/charts.js` - Custom chart rendering logic.
