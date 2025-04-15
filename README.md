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
    }
};
```

## Usage
Once installed and enabled, the script will automatically:
1. Detect tweets marked as ads in your Twitter/X feed.
2. Block the accounts posting these ads.
3. Auto-scroll through your feed (if enabled)

### Auto-Scroll Controls
- Press 'S' to toggle auto-scrolling on/off
- Adjust scroll settings in the config:
  - `enabled`: Turn auto-scroll on/off by default
  - `speed`: The number of pixels to scroll per tick (higher = faster)

The script runs in the background and requires no manual intervention. It's that easy! 