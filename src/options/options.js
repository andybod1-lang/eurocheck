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
  DOM.debugMode = document.getElementById('debugMode');
  DOM.refreshStats = document.getElementById('refreshStats');
  DOM.clearCache = document.getElementById('clearCache');
  DOM.form = document.querySelector('.settings-form');
  // Cache stats elements
  DOM.statSize = document.getElementById('statSize');
  DOM.statHitRate = document.getElementById('statHitRate');
  DOM.statHits = document.getElementById('statHits');
  DOM.statMisses = document.getElementById('statMisses');
  DOM.statEvictions = document.getElementById('statEvictions');
  DOM.statExpirations = document.getElementById('statExpirations');
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
  
  // Load debug mode
  try {
    const response = await sendMessage({ type: 'GET_DEBUG_MODE' });
    DOM.debugMode.checked = response?.debugMode === true;
  } catch (error) {
    console.error('[EuroCheck] Failed to get debug mode:', error);
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
 * Send message to background script
 */
function sendMessage(message) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        console.error('[EuroCheck]', chrome.runtime.lastError);
        resolve(null);
        return;
      }
      resolve(response);
    });
  });
}

/**
 * Refresh and display cache statistics
 */
async function refreshCacheStats() {
  try {
    const stats = await sendMessage({ type: 'GET_CACHE_STATS' });
    if (!stats) return;
    
    DOM.statSize.textContent = `${stats.size} / ${stats.maxSize}`;
    DOM.statHitRate.textContent = stats.hitRate;
    DOM.statHitRate.className = `value ${parseFloat(stats.hitRate) > 50 ? 'good' : 'warning'}`;
    DOM.statHits.textContent = stats.hits;
    DOM.statMisses.textContent = stats.misses;
    DOM.statEvictions.textContent = stats.evictions;
    DOM.statExpirations.textContent = stats.expirations;
  } catch (error) {
    console.error('[EuroCheck] Failed to get cache stats:', error);
  }
}

/**
 * Toggle debug mode
 */
async function toggleDebugMode() {
  try {
    const enabled = DOM.debugMode.checked;
    await sendMessage({ type: 'SET_DEBUG_MODE', enabled });
    console.log(`[EuroCheck] Debug mode ${enabled ? 'enabled' : 'disabled'}`);
  } catch (error) {
    console.error('[EuroCheck] Failed to set debug mode:', error);
  }
}

/**
 * Clear the lookup cache
 */
async function clearCache() {
  if (!confirm('Clear all cached domain lookups? This will not affect your settings.')) {
    return;
  }
  
  try {
    await sendMessage({ type: 'CLEAR_CACHE' });
    refreshCacheStats();
    console.log('[EuroCheck] Cache cleared');
  } catch (error) {
    console.error('[EuroCheck] Failed to clear cache:', error);
  }
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
    
    if (target.id === 'debugMode') {
      toggleDebugMode();
    }
  });
  
  // Click events
  document.body.addEventListener('click', (e) => {
    const target = e.target;
    
    if (target.id === 'refreshStats') {
      refreshCacheStats();
    }
    
    if (target.id === 'clearCache') {
      clearCache();
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
  
  // 5. Load initial cache stats
  refreshCacheStats();
}

// Initialize when DOM is ready (with { once: true } to auto-remove listener)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}
