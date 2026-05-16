# Changelog

## v1.0.2 - Full Responsive Overhaul
**Critical Fixes:**
- **Fixed 4 missing CSS variables** (`--primary`, `--border`, `--transition`, `--bg-tertiary`) that caused invisible UI elements (superset lines, onboarding dots, session timer borders, water gauge backgrounds).
- **Fixed `confirm()` name collision** — The "Reset App Cache" button was silently failing because the custom `App.confirm()` modal was shadowing the native `window.confirm()`.
- **Removed duplicate toast CSS** — Two conflicting `.toast-container` definitions were fighting each other, causing toasts to hide behind the bottom nav on mobile.
- **Mobile toasts now appear above the bottom nav** instead of being hidden behind it.
- **Bottom nav touch targets increased to 48px** minimum height (Apple/Google recommend 44px+).
- **Added `touch-action: manipulation`** globally to eliminate the 300ms tap delay on all interactive elements.
- **Added tablet breakpoint** (769px–1024px) with a narrower sidebar and 3-column stat cards for proper iPad/tablet display.
- **Fixed `.main-content` centering** on ultrawide monitors so content doesn't float left.

## v1.0.1 - Offline-First & UI Fixes
**Enhancements:**
- **Offline-First Resilience**: Improved Service Worker (`sw.js`) with a Stale-While-Revalidate caching strategy.
- **Offline Banner**: The app now displays a prominent banner when you lose internet connection.
- **Auto-Sync Queueing**: Workouts and data logged while offline are queued and automatically synced to the cloud the moment the device reconnects.
- **Mobile Overflow Fix**: Fixed a visual bug where the "Logout" text caused horizontal overflow on mobile devices, which resulted in an invisible touch layer blocking buttons from working.
- **Async Asset Loading**: Moved heavy external scripts (HTML2Canvas, HTML5-QRCode) to load asynchronously to prevent them from blocking app initialization on slow connections or when blocked by ad-blockers.
