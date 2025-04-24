// ==UserScript==
// @name         X-Buster: The Twitter/X Ad Account Blocker
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Automatically block Twitter/X accounts that post ads
// @author       Chrispy
// @match        https://twitter.com/*
// @match        https://x.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

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

    const log = (message, isWarning = false) => {
        if (config.debug) {
            const prefix = `[x-Buster ${new Date().toLocaleTimeString()}]`;
            if (isWarning) {
                console.warn(`${prefix} ⚠️ ${message}`);
            } else {
                console.log(`${prefix} ${message}`);
            }
        }
    };

    let scrollInterval = null;

    const toggleScroll = () => {
        if (scrollInterval) {
            clearInterval(scrollInterval);
            scrollInterval = null;
            log('Auto-scroll disabled');
            return;
        }

        log('Auto-scroll enabled');
        scrollInterval = setInterval(() => {
            window.scrollBy(0, config.scroll.speed);
        }, 50);
    };

    const waitForElement = (selector, timeout = 3000, retries = config.maxRetries) => {
        return new Promise((resolve, reject) => {
            let attempts = 0;

            const checkElement = () => {
                const element = document.querySelector(selector);
                if (element) {
                    resolve(element);
                    return;
                }

                attempts++;
                if (attempts >= retries) {
                    reject(`Could not find element: ${selector} after ${retries} attempts`);
                    return;
                }

                setTimeout(checkElement, timeout / retries);
            };

            checkElement();
        });
    };

    const simulateClick = (element) => {
        if (!element) return false;

        try {
            element.click();
            return true;
        } catch (e) {
            try {
                const evt = new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    view: window
                });
                element.dispatchEvent(evt);
                return true;
            } catch (err) {
                log(`Click simulation failed: ${err}`, true);
                return false;
            }
        }
    };

    const findAdTweets = () => {
        const adTweets = [];

        // Method 1: Look for the specific Ad label structure
        document.querySelectorAll('article[role="article"]').forEach(tweet => {
            // First detection method - Ad in div with specific text
            const adLabels = Array.from(tweet.querySelectorAll('div[dir="ltr"]'));
            const adLabel = adLabels.find(el => el.textContent.trim() === 'Ad');
            if (adLabel) {
                adTweets.push(tweet);
                return;
            }
        });

        return adTweets;
    };

    const blockAdAccount = async (tweet) => {
        try {
            // extract username for logging
            const usernameEl = tweet.querySelector('a[role="link"] div[dir="ltr"] span span');
            const username = usernameEl ? usernameEl.textContent : 'unknown';
            log(`Processing ad from: ${username}`);
    
            // find more options button (three dots)
            const moreButton = tweet.querySelector('button[data-testid="caret"]') ||
                              tweet.querySelector('button[aria-label="More"]') ||
                              tweet.querySelector('button[aria-haspopup="menu"]');
    
            if (!moreButton) {
                log(`Could not find More button for user: ${username}`, true);
                return;
            }
    
            log(`Clicking More button for user: ${username}`);
            simulateClick(moreButton);
    
            // wait for dropdown menu
            await new Promise(resolve => setTimeout(resolve, config.actionDelay));
    
            // find block option in the dropdown
            const menuItems = document.querySelectorAll('div[role="menuitem"]');
            let blockMenuItem;
    
            for (const item of menuItems) {
                if (item.textContent.includes('Block @') || item.textContent.includes('Block')) {
                    blockMenuItem = item;
                    break;
                }
            }
    
            if (!blockMenuItem) {
                log(`Could not find Block option in menu for user: ${username}`, true);
                document.body.click(); // to close the menu
                return;
            }
    
            // click the block option
            log(`Clicking Block option for user: ${username}`);
            simulateClick(blockMenuItem);
            await new Promise(resolve => setTimeout(resolve, config.actionDelay));
    
            // confirm block in modal
            const confirmBlockButton = await waitForElement('button[data-testid="confirmationSheetConfirm"]')
                .catch(() => {
                    log(`Could not find confirmation button for user: ${username}`, true);
                    return null;
                });
    
            if (!confirmBlockButton) {
                document.body.click();
                return;
            }
    
            log(`Clicking Confirm Block button for user: ${username}`);
            simulateClick(confirmBlockButton);
            await new Promise(resolve => setTimeout(resolve, config.actionDelay * 1.5));
    
            // handle "Remove all ads" premium modal
            const closeButton = await waitForElement('button[data-testid="app-bar-close"]', 2000)
                .catch(() => {
                    log(`No premium modal appeared for user: ${username}`);
                    return null;
                });
    
            if (closeButton) {
                log(`Closing premium promotion modal for user: ${username}`);
                simulateClick(closeButton);
            }
    
            log(`Successfully blocked ad account: ${username}`);
        } catch (error) {
            log(`Error processing ad tweet: ${error.message}`, true);
            try {
                document.body.click();
            } catch (e) {
                log(`Error cleaning up: ${e.message}`, true);
            }
        }
    };

    const processAdTweets = async () => {
        const adTweets = findAdTweets();

        if (adTweets.length === 0) {
            return; // No need to log when no ads found - reduces console spam
        }

        log(`Found ${adTweets.length} ad tweets. Processing...`);

        // process one ad at a time to prevent UI conflicts
        for (const tweet of adTweets) {
            await blockAdAccount(tweet);
            // delay between processing different tweets
            await new Promise(resolve => setTimeout(resolve, config.actionDelay * 2));
        }
    };

    const createToggleButton = () => {
        const container = document.createElement('div');
        container.id = 'x-buster-toggle';
        container.style.cssText = `
            position: fixed;
            bottom: 60px;
            right: 20px;
            background-color: rgba(29, 155, 240, 0.9);
            border-radius: 30px;
            padding: 10px 15px;
            display: flex;
            align-items: center;
            z-index: 9999;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: white;
            cursor: pointer;
            transition: background-color 0.2s ease;
        `;

        const label = document.createElement('span');
        label.textContent = 'Auto-scroll';
        label.style.cssText = `
            margin-right: 10px;
            font-size: 14px;
            font-weight: bold;
        `;

        const COLORS = {
            ON: '#32cd32', 
            OFF: '#2F3336' 
        };

        const toggleSwitch = document.createElement('div');
        toggleSwitch.style.cssText = `
            width: 42px;
            height: 22px;
            border-radius: 11px;
            position: relative;
            transition: background-color 0.2s ease;
        `;
        
        toggleSwitch.style.backgroundColor = config.scroll.enabled ? COLORS.ON : COLORS.OFF;

        const toggleKnob = document.createElement('div');
        toggleKnob.style.cssText = `
            width: 18px;
            height: 18px;
            background-color: white;
            border-radius: 50%;
            position: absolute;
            top: 2px;
            left: ${config.scroll.enabled ? '22px' : '2px'};
            transition: left 0.2s ease;
        `;

        toggleSwitch.appendChild(toggleKnob);
        container.appendChild(label);
        container.appendChild(toggleSwitch);

        container.addEventListener('click', () => {
            config.scroll.enabled = !config.scroll.enabled;
            toggleScroll();
            toggleSwitch.style.backgroundColor = config.scroll.enabled ? COLORS.ON : COLORS.OFF;
            toggleKnob.style.left = config.scroll.enabled ? '22px' : '2px';
        });

        document.body.appendChild(container);
        
        return container;
    };

    const initAdBlocker = () => {
        log('X-Buster initialized');
        processAdTweets();
        setInterval(processAdTweets, config.blockCheckInterval);

        createToggleButton();

        if (config.scroll.enabled) {
            toggleScroll();
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setTimeout(initAdBlocker, config.initDelay));
    } else {
        setTimeout(initAdBlocker, config.initDelay);
    }
})();