/**
 * EuroCheck - Options Page Script (Optimized)
 * Handles settings and i18n for the options page
 * 
 * Optimizations:
 * - Cached DOM references
 * - Debounced storage writes
 * - Event delegation
 * - Single DOMContentLoaded with { once: true }
 */

// === CACHED DOM REFERENCES ===
const DOM = {};

// === CONFIGURATION ===
const DEBOUNCE_MS = 300;

// === STATE ===
let saveTimeout = null;
let pendingSettings = null;

/**
 * Cache all DOM references once
 */
function cacheDOMReferences() {
  DOM.showBadge = document.getElementById('showBadge');
  DOM.notifications = document.getElementById('notifications');
  DOM.form = document.querySelector('.settings-form');
}

/**
 * Localize all elements with data-i18n attribute
 */
function localizeUI() {
  const elements = document.querySelectorAll('[data-i18n]');
  const len = elements.length;
  
  for (let i = 0; i < len; i++) {
    const el = elements[i];
    const key = el.getAttribute('data-i18n');
    const message = chrome.i18n.getMessage(key);
    if (message) {
      el.textContent = message;
    }
  }
  
  // Update page title
  const titleKey = document.querySelector('title')?.getAttribute('data-i18n');
  if (titleKey) {
    const message = chrome.i18n.getMessage(titleKey);
    if (message) {
      document.title = message;
    }
  }
}

/**
 * Load saved settings
 */
async function loadSettings() {
  const defaults = {
    showBadge: true,
    notifications: true
  };
  
  try {
    const result = await chrome.storage.sync.get(defaults);
    DOM.showBadge.checked = result.showBadge;
    DOM.notifications.checked = result.notifications;
  } catch (error) {
    console.error('[EuroCheck] Failed to load settings:', error);
  }
}

/**
 * Save settings (debounced to batch rapid changes)
 */
function saveSettings() {
  // Clear existing timeout
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }
  
  // Capture current state
  pendingSettings = {
    showBadge: DOM.showBadge.checked,
    notifications: DOM.notifications.checked
  };
  
  // Debounce the actual save
  saveTimeout = setTimeout(async () => {
    try {
      await chrome.storage.sync.set(pendingSettings);
      pendingSettings = null;
    } catch (error) {
      console.error('[EuroCheck] Failed to save settings:', error);
    }
  }, DEBOUNCE_MS);
}

/**
 * Setup event delegation (single listener)
 */
function setupEventDelegation() {
  // Use change event on parent for delegation
  document.body.addEventListener('change', (e) => {
    const target = e.target;
    
    if (target.id === 'showBadge' || target.id === 'notifications') {
      saveSettings();
    }
  });
}

/**
 * Initialize options page
 */
function init() {
  // 1. Cache DOM references
  cacheDOMReferences();
  
  // 2. Localize UI
  localizeUI();
  
  // 3. Load settings
  loadSettings();
  
  // 4. Setup event delegation
  setupEventDelegation();
}

// Initialize when DOM is ready (with { once: true } to auto-remove listener)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}
