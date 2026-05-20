# Changelog

## [0.3.1] - 2026-05-20

### Bug Fixes

- Fixed tray icon click handling on Linux — platform-specific code paths for tray events (Linux lacks `MouseButtonState`, so click is handled without button state matching)

## [0.3.0] - 2026-05-19

### New Features

- **Popup Layout Settings** — 4 configurable layout options: Classic, Focus, Taskbar, Timeline
- **UI Size Setting** — choose between Small, Default, and Large popup size (replaces compact toggle)
- **Feature Toggles** — enable/disable note, tags, customer filter, and custom start time from Settings
- **Global Keyboard Shortcuts** — configurable hotkeys with shortcut hints in tray menu
- **Update Settings** — auto-update toggle and manual "Check for Updates" button
- **Linux Tray Support** — Show/Hide menu item for Linux compatibility
- **About Section Links** — GitHub repository and issue tracker links in About

### Bug Fixes

- Shortcuts now fire only on key press (not release)
- Popup correctly positions under the tray icon
- Shortcut hint displayed in tray menu

## [0.2.0] - 2025-12-15

### New Features

- Hide and delete actions for recent tasks
- Searchable select with filtering for task form dropdowns
- Show/Hide menu item for Linux tray compatibility
- Updater and process plugins for auto-updates

### Bug Fixes

- Improved text readability on transparent vibrancy theme
- Build trigger fixed to only run on tag push

## [0.1.1] - 2025-11-01

### Changes

- Renamed KimaiMate to KimaiTray across the application
- Initial time creation fix

## [0.1.0] - 2025-10-01

Initial release.

- Kimai API integration with secure token storage
- System tray with active timer display
- Start/stop/switch tasks from popup
- Recent tasks list
- Today's time tracking history
- Multi-language support
- Multi-connection support
- Tags support
- Fake-pause timer
- Idle detection
- Appearance and timer settings
- Edit current timer
