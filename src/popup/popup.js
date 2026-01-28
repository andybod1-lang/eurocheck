/**
 * EuroCheck - Popup Script (Optimized)
 * Displays company information for the current tab
 * 
 * Optimizations:
 * - Single DOM query with cached element references
 * - DocumentFragment for batch DOM updates
 * - Event delegation instead of individual listeners
 * - Reused template elements
 * - Minimal reflows/repaints
 */

import { extractDomain, getCountryFlag, isEUCountry } from '../utils/domain.js';

// === CACHED DOM REFERENCES ===
// Queried once at startup, reused throughout
const DOM = {};

// === CONSTANTS ===
const FALLBACK_MESSAGES = {
  statusEu: 'European Company',
  statusNonEu: 'Non-European Company',
  statusMixed: 'Mixed Ownership',
  statusUnknown: 'Unknown',
  confidenceHigh: 'High',
  confidenceMedium: 'Medium',
  confidenceLow: 'Low',
  unknownNoData: 'No data available for this domain',
  badgeCurrent: 'Current',
  badgeParent: 'Parent',
  badgeUltimate: 'Ultimate',
  detailsTitle: 'Details',
  foundedLabel: 'Founded',
  confidenceLabel: 'Confidence',
  lastVerifiedLabel: 'Last verified',
  ownershipChain: 'Ownership Chain',
  requestCompany: 'Request this company',
  requestSubmitted: 'Requested ✓',
  settingsLink: 'Settings',
  errorCannotAccess: 'Cannot access this page',
  errorNotValid: 'Not a valid website',
  errorLoadFailed: 'Failed to load data',
  errorGeneric: 'Something went wrong'
};

const STATUS_CONFIG = {
  eu: { textKey: 'statusEu', badgeText: 'EU', class: 'eu' },
  european: { textKey: 'statusEuropean', badgeText: 'EUR', class: 'european' },
  'non-eu': { textKey: 'statusNonEu', badgeText: '!EU', class: 'non-eu' },
  unknown: { textKey: 'statusUnknown', badgeText: '?', class: 'unknown' }
};

const CONFIDENCE_KEYS = {
  high: 'confidenceHigh',
  medium: 'confidenceMedium',
  low: 'confidenceLow'
};

// Pre-built country name map (avoids object lookup overhead)
const COUNTRY_NAMES = new Map([
  ['US', 'United States'], ['GB', 'United Kingdom'], ['DE', 'Germany'],
  ['FR', 'France'], ['SE', 'Sweden'], ['NL', 'Netherlands'], ['FI', 'Finland'],
  ['NO', 'Norway'], ['DK', 'Denmark'], ['IE', 'Ireland'], ['ES', 'Spain'],
  ['IT', 'Italy'], ['BE', 'Belgium'], ['AT', 'Austria'], ['CH', 'Switzerland'],
  ['PL', 'Poland'], ['CZ', 'Czech Republic'], ['PT', 'Portugal'], ['LU', 'Luxembourg'],
  ['CN', 'China'], ['JP', 'Japan'], ['KR', 'South Korea'], ['IN', 'India'],
  ['AU', 'Australia'], ['CA', 'Canada'], ['BR', 'Brazil'], ['MX', 'Mexico'],
  ['SG', 'Singapore'], ['HK', 'Hong Kong'], ['TW', 'Taiwan'], ['IL', 'Israel'],
  ['RU', 'Russia'], ['ZA', 'South Africa'], ['AE', 'UAE']
]);

// === HELPERS ===

/**
 * Get localized message with fallback
 */
function getMessage(key, substitutions = []) {
  const msg = chrome.i18n?.getMessage(key, substitutions);
  return msg || FALLBACK_MESSAGES[key] || key;
}

/**
 * Get country name from code
 */
function getCountryName(code) {
  return COUNTRY_NAMES.get(code) || code;
}

/**
 * Format location string
 */
function formatLocation(city, country) {
  const countryName = getCountryName(country);
  return city && countryName ? `${city}, ${countryName}` : (countryName || country || 'Unknown');
}

/**
 * Format date string (cached formatter)
 */
const dateFormatter = new Intl.DateTimeFormat(undefined, { 
  year: 'numeric', 
  month: 'short', 
  day: 'numeric' 
});

function formatDate(dateStr) {
  if (!dateStr) return '-';
  try {
    return dateFormatter.format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

/**
 * Capitalize first letter
 */
function capitalizeFirst(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}

// === DOM OPERATIONS ===

/**
 * Cache all DOM references once
 */
function cacheDOMReferences() {
  // Get all elements in a single query batch
  const ids = [
    'loading', 'company-info', 'unknown-state', 'error-state',
    'status-badge', 'status-text', 'company-name', 'country-flag',
    'company-location', 'ownership-section', 'ownership-chain',
    'founded-year', 'confidence', 'last-verified',
    'unknown-domain', 'request-btn', 'error-message', 'settings-link'
  ];
  
  for (const id of ids) {
    const key = id.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    DOM[key] = document.getElementById(id);
  }
  
  // Cache states array for quick toggling
  DOM.states = [DOM.loading, DOM.companyInfo, DOM.unknownState, DOM.errorState];
  DOM.stateMap = {
    loading: 0,
    company: 1,
    unknown: 2,
    error: 3
  };
}

/**
 * Show a specific state (optimized - single reflow)
 */
function showState(stateName) {
  const activeIndex = DOM.stateMap[stateName];
  
  // Batch class changes
  requestAnimationFrame(() => {
    for (let i = 0; i < DOM.states.length; i++) {
      const el = DOM.states[i];
      if (el) {
        if (i === activeIndex) {
          el.classList.remove('hidden');
        } else {
          el.classList.add('hidden');
        }
      }
    }
  });
}

/**
 * Localize UI elements (optimized - single querySelectorAll)
 */
function localizeUI() {
  const elements = document.querySelectorAll('[data-i18n]');
  const len = elements.length;
  
  for (let i = 0; i < len; i++) {
    const el = elements[i];
    const key = el.getAttribute('data-i18n');
    const message = getMessage(key);
    if (message && message !== key) {
      el.textContent = message;
    }
  }
}

/**
 * Build ownership chain using DocumentFragment (no innerHTML)
 */
function buildOwnershipChain(company) {
  const fragment = document.createDocumentFragment();
  
  // Helper to create ownership item
  const createItem = (flag, name, badgeKey) => {
    const item = document.createElement('div');
    item.className = 'ownership-item';
    
    const flagSpan = document.createElement('span');
    flagSpan.className = 'flag';
    flagSpan.textContent = flag;
    
    const nameSpan = document.createElement('span');
    nameSpan.className = 'name';
    nameSpan.textContent = name;
    
    const badgeSpan = document.createElement('span');
    badgeSpan.className = 'badge';
    badgeSpan.textContent = getMessage(badgeKey);
    
    item.append(flagSpan, nameSpan, badgeSpan);
    return item;
  };
  
  // Current company
  fragment.appendChild(createItem(
    getCountryFlag(company.hq_country),
    company.name,
    'badgeCurrent'
  ));
  
  // Parent company
  if (company.parent_company) {
    fragment.appendChild(createItem('🏢', company.parent_company, 'badgeParent'));
  }
  
  // Ultimate parent
  if (company.ultimate_parent && company.ultimate_parent !== company.parent_company) {
    fragment.appendChild(createItem('🏛️', company.ultimate_parent, 'badgeUltimate'));
  }
  
  return fragment;
}

/**
 * Display company information (batched DOM updates)
 */
function displayCompany(company) {
  const status = company.eu_status || 'unknown';
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.unknown;
  
  // Batch all DOM updates in a single frame
  requestAnimationFrame(() => {
    // Status badge
    DOM.statusBadge.textContent = config.badgeText;
    DOM.statusBadge.className = `status-badge ${config.class}`;
    DOM.statusText.textContent = getMessage(config.textKey);
    
    // Company details
    DOM.companyName.textContent = company.name;
    DOM.countryFlag.textContent = getCountryFlag(company.hq_country);
    DOM.companyLocation.textContent = formatLocation(company.hq_city, company.hq_country);
    
    // Ownership chain
    if (company.parent_company || company.ultimate_parent) {
      DOM.ownershipSection.classList.remove('hidden');
      // Clear and append new fragment
      DOM.ownershipChain.textContent = '';
      DOM.ownershipChain.appendChild(buildOwnershipChain(company));
    } else {
      DOM.ownershipSection.classList.add('hidden');
    }
    
    // Additional details
    DOM.foundedYear.textContent = company.founded_year || '-';
    
    const confidenceKey = CONFIDENCE_KEYS[company.confidence?.toLowerCase()];
    DOM.confidence.textContent = confidenceKey 
      ? getMessage(confidenceKey) 
      : capitalizeFirst(company.confidence || 'unknown');
    
    DOM.lastVerified.textContent = formatDate(company.last_verified);
    
    showState('company');
  });
}

/**
 * Display unknown domain state
 */
function displayUnknown(domain) {
  DOM.unknownDomain.textContent = getMessage('unknownNoData', [domain]);
  showState('unknown');
}

/**
 * Display error state
 */
function displayError(messageKey) {
  DOM.errorMessage.textContent = getMessage(messageKey);
  showState('error');
}

// === EVENT HANDLERS ===

/**
 * Handle request button click
 */
async function handleRequestClick() {
  const btn = DOM.requestBtn;
  if (btn.disabled) return;
  
  btn.disabled = true;
  btn.textContent = getMessage('requestSubmitted');
  
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.url) return;
    
    const domain = extractDomain(tab.url);
    if (!domain) return;
    
    // Use chrome.storage.local.get with callback for better compatibility
    const result = await chrome.storage.local.get(['pendingRequests']);
    const requests = result.pendingRequests || [];
    
    if (!requests.includes(domain)) {
      requests.push(domain);
      await chrome.storage.local.set({ pendingRequests: requests });
    }
  } catch (error) {
    console.error('[EuroCheck] Request error:', error);
  }
}

/**
 * Handle settings link click
 */
function handleSettingsClick(e) {
  e.preventDefault();
  chrome.runtime.openOptionsPage?.() || 
    chrome.tabs.create({ url: chrome.runtime.getURL('options/options.html') });
}

/**
 * Setup event delegation (single listener on container)
 */
function setupEventDelegation() {
  const app = document.getElementById('app');
  
  app.addEventListener('click', (e) => {
    const target = e.target;
    
    // Request button
    if (target.id === 'request-btn' || target.closest('#request-btn')) {
      handleRequestClick();
      return;
    }
    
    // Settings link
    if (target.id === 'settings-link' || target.closest('#settings-link')) {
      handleSettingsClick(e);
      return;
    }
  });
}

// === INITIALIZATION ===

/**
 * Fetch company info from background
 */
function fetchCompanyInfo(domain) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      { type: 'GET_COMPANY_INFO', domain },
      (response) => {
        if (chrome.runtime.lastError) {
          resolve({ error: 'errorFailedToLoad' });
          return;
        }
        resolve(response || {});
      }
    );
  });
}

/**
 * Initialize popup
 */
async function init() {
  // 1. Cache DOM references (single querySelectorAll)
  cacheDOMReferences();
  
  // 2. Localize UI
  localizeUI();
  
  // 3. Show loading state
  showState('loading');
  
  // 4. Setup event delegation (single listener)
  setupEventDelegation();
  
  // 5. Get domain and fetch company info
  try {
    // Check for test mode
    const urlParams = new URLSearchParams(window.location.search);
    const testDomain = urlParams.get('domain');
    
    let domain;
    
    if (testDomain) {
      domain = testDomain;
    } else {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab?.url) {
        displayError('errorCannotAccess');
        return;
      }
      
      domain = extractDomain(tab.url);
    }
    
    if (!domain) {
      displayError('errorNotValidSite');
      return;
    }
    
    // Fetch from background
    const response = await fetchCompanyInfo(domain);
    
    if (response.error) {
      displayError(response.error);
      return;
    }
    
    if (response.company && response.company.eu_status !== 'unknown') {
      displayCompany(response.company);
    } else {
      displayUnknown(domain);
    }
  } catch (error) {
    console.error('[EuroCheck] Popup error:', error);
    displayError('errorGeneric');
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}
