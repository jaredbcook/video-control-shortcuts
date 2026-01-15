# Media Control Shortcuts - Agent Instructions

## Project Overview

A Chrome/Firefox/Safari browser extension that adds keyboard shortcuts for controlling HTML5 media playback. The extension is intended to work across the entire web, including media in iframes and Shadow DOMs.

## Architecture

**Content Script** (`src/scripts/content.js`):
- Runs on every page, injected into all frames
- Detects `<video>` and `<audio>` elements dynamically (including Shadow DOM)
- Listens for keyboard events and translates them to media control actions
- Communicates with iframes via `postMessage` API for cross-frame control
- Tracks "last interacted media" to intelligently select which media element to control
- Renders temporary overlays with icons to provide visual feedback

**Smart Media Selection** (priority order):
1. Active focused element (if it's a media element)
2. Currently playing media
3. Most recently interacted media
4. First media element on the page

**Action System**:
- Actions are constants like `ACTION_PLAY_PAUSE`, `ACTION_SEEK_FWD_LARGE`
- Mapped from keys via `mapKeyToAction()` → applied via `runAction()`
- Settings (min/max speed, step amounts) should be loaded from `chrome.storage.sync` (not implemented yet)

**Options Page** (`src/options.html`, `options.js`):
- Configurable playback speed bounds and step size
- Syncs to `chrome.storage` for cross-device persistence

## Key Design Patterns

**Dynamic Media Detection**:
- `findMedia(root)` recursively searches DOM and Shadow DOMs
- `MutationObserver` watches for newly added video/audio/iframe elements
- Lazy listener activation—only enabled if media or iframes exist

**Cross-Frame Communication**:
- Uses `postMessage` to forward keyboard commands to iframe content scripts
- Each frame runs its own content script instance independently
- Frame isolation by design (per Manifest V3 security model)

**Overlay System**:
- Creates temporary, absolutely positioned `<div>` over media elements
- Auto-removes after brief fade-out animation
- Displays action icons (Material Symbols) + numeric values (speed, seek duration)

## General Instructions

Before writing any code:
1. State how you will verify each change works (test, bash command, browser check, etc.)
2. Write the test for the verification first
3. Implement the code
4. Run verification and iterate until it passes

Other general instructions:
- Keep AGENTS.md and README.md updated when you make other changes to the codebase
- Refer to official documentation and examples for Chrome, Firefox, and Safari extension development
- Prefer the latest versions of modern, popular, well-documented libraries and tools
- Make recommendations for different technologies or architecture patterns when appropriate

## Code Style

- Use consistent naming conventions and variable names
- Add JSDoc-style comments for documentation and type annotations for all functions and classes

## Testing

- Add or update unit tests and functional tests for all features you create or modify
- Use Vitest, TestingLibrary, and JSDOM

## Build & Release Workflow

```bash
npm run build    # Copies src/ to dist/{chrome,firefox,safari}
npm run release  # Zips dist folders to releases/ (except Safari)
```

**Multi-browser Support**:
- Build script prepares separate distributions per browser
- Firefox gets manifest adjustments (see `adjustManifestForFirefox()`)
- Safari requires manual Xcode build (not automated)

## Configuration

Settings stored in `chrome.storage.sync` with defaults:
```javascript
{ minSpeed: 0.25, maxSpeed: 4.0, speedStep: 0.25 }
```

Hard-coded in content.js but should be loaded dynamically in the future (see `TODO` comments).

## Extension Permissions & APIs

- `storage` permission for synced settings
- `content_scripts` runs on `<all_urls>` with `all_frames: true`
- `run_at: document_end` ensures DOM is ready

## Common Tasks

- **Add new keyboard shortcut**: Add constant + `mapKeyToAction()` case + action handler in `runAction()`
- **Add new overlay icon**: Embed SVG constant at top of content.js, use in `showOverlay()`
- **Change default settings**: Edit `DEFAULTS` in `options.js` and corresponding vars in `content.js`
- **Test cross-frame**: Check `test-iframe.html` and `test.html` for iframe scenarios
- **Fix media element detection**: Enhance `findMedia()` or `MutationObserver` logic

## Known Limitations & TODOs

- Volume up/down not yet implemented (see `TODO` at line 1)
- Settings not loaded from storage in content script yet
- Keyboard shortcuts and overlay display not configurable via UI
- No service worker (manifest V3 doesn't require background scripts for this extension)
- Safari build process not automated (requires manual Xcode project setup)
- Need automated unit and functional tests
- Need to check conflicts with site-specific keyboard shortcuts (e.g. YouTube, Netflix, Vimeo, etc.) and consider adding a "disable on this site" option
- Consider adding support for more media control actions (e.g. volume up/down, toggle captions, full screen,etc.)
- Consider storing playback speed and other settings per domain automatically and restoring them when the user revisits the site
