# Changelog

## v1.0.1 - Offline-First & UI Fixes
**Enhancements:**
- **Offline-First Resilience**: Improved Service Worker (`sw.js`) with a Stale-While-Revalidate caching strategy.
- **Offline Banner**: The app now displays a prominent banner when you lose internet connection.
- **Auto-Sync Queueing**: Workouts and data logged while offline are queued and automatically synced to the cloud the moment the device reconnects.
- **Mobile Overflow Fix**: Fixed a visual bug where the "Logout" text caused horizontal overflow on mobile devices, which resulted in an invisible touch layer blocking buttons from working.
- **Async Asset Loading**: Moved heavy external scripts (HTML2Canvas, HTML5-QRCode) to load asynchronously to prevent them from blocking app initialization on slow connections or when blocked by ad-blockers.
