/**
 * EuroCheck - Options Page Script
 * Handles settings and i18n for the options page
 */

/**
 * Localize all elements with data-i18n attribute
 */
function localizeUI() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const message = chrome.i18n.getMessage(key);
    if (message) {
      el.textContent = message;
    }
  });
  
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
    document.getElementById('showBadge').checked = result.showBadge;
    document.getElementById('notifications').checked = result.notifications;
  } catch (error) {
    console.error('[EuroCheck] Failed to load settings:', error);
  }
}

/**
 * Save settings on change
 */
function setupSettingsListeners() {
  const showBadge = document.getElementById('showBadge');
  const notifications = document.getElementById('notifications');
  
  showBadge.addEventListener('change', () => {
    chrome.storage.sync.set({ showBadge: showBadge.checked });
  });
  
  notifications.addEventListener('change', () => {
    chrome.storage.sync.set({ notifications: notifications.checked });
  });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  localizeUI();
  loadSettings();
  setupSettingsListeners();
});
