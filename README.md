<div align="center">
  <img src="assets/banner.png" alt="X-Buster Banner">
</div>

# X-Buster: The Twitter/X Ad Account Blocker

## Overview
X-Buster is a Tampermonkey userscript that automatically detects and blocks Twitter/X accounts posting advertisements. It enhances your experience by reducing unwanted promotional content in your feed. 

## Installation
1. Install the [Tampermonkey extension](https://www.tampermonkey.net/) for your browser.
2. Open Tampermonkey and create a new script.
3. Copy the contents of [`src/script.js`](src/script.js) into the new script editor.
4. Save the script and ensure it is enabled.

## Configuration
You can customize the script by modifying the `config` object in `script.js`:

```javascript
const config = {
    blockCheckInterval: 1000,  // Scan frequency in milliseconds
    actionDelay: 300,          // Delay between actions
    initDelay: 1500,           // Delay before initializing the script (only modify if Twitter/X is slow to load)
    debug: true,               // Enable console logs
    maxRetries: 3,             // Maximum retries for finding elements
    scroll: {
        enabled: false,        // Enable auto-scrolling
        speed: 100,            // Pixels per scroll tick
        resetMethod: 'home',   // 'home', 'refresh', or 'none'
        checkInterval: 3000,   // How often to check if scrolling is stuck (ms)
        stuckThreshold: 500    // Consider stuck if less than this many pixels scrolled
    }
};
```

## Usage
Once installed and enabled, the script will automatically:
1. Detect tweets marked as ads in your Twitter/X feed.
2. Block the accounts posting these ads.
3. Auto-scroll through your feed (if enabled).

### Auto-Scroll Controls
- Click the **Auto-scroll** toggle button in the bottom-right corner to enable/disable scrolling
- Next to the toggle, use the **Reset** dropdown to select how scrolling should reset when stuck:
  - `home`: Click the Home button and return to the top of the feed (default)
  - `refresh`: Refresh the page to reset scrolling
  - `none`: Do not reset scrolling at all
- Adjust scroll settings in the config:
  - `enabled`: Turn auto-scroll on/off by default
  - `speed`: The number of pixels to scroll per tick (higher = faster)
  - `resetMethod`: Default reset method for scrolling
  - `checkInterval`: How often to check if scrolling is stuck (in milliseconds)
  - `stuckThreshold`: Consider scrolling stuck if moved less than this many pixels since the last check

### Theme Integration & Settings Persistence
- The control panel automatically adapts to your Twitter/X theme color for a seamless experience
- X-Buster detects your theme color by analyzing color patterns in the Twitter/X interface
- All your preferences (auto-scroll state and reset method) are saved to your browser's localStorage
- Your settings will persist across page refreshes and browser sessions
- No need to reconfigure each time you visit Twitter/X

The script runs in the background and requires no manual intervention. It's that easy!