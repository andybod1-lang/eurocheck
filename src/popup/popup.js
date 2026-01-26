/**
 * EuroCheck - Popup Script
 * Displays company information for the current tab
 */

import { extractDomain, getCountryFlag, isEUCountry } from '../utils/domain.js';

// DOM Elements
const loadingEl = document.getElementById('loading');
const companyInfoEl = document.getElementById('company-info');
const unknownStateEl = document.getElementById('unknown-state');
const errorStateEl = document.getElementById('error-state');

// Company info elements
const statusBadgeEl = document.getElementById('status-badge');
const statusTextEl = document.getElementById('status-text');
const companyNameEl = document.getElementById('company-name');
const countryFlagEl = document.getElementById('country-flag');
const companyLocationEl = document.getElementById('company-location');
const ownershipSectionEl = document.getElementById('ownership-section');
const ownershipChainEl = document.getElementById('ownership-chain');
const foundedYearEl = document.getElementById('founded-year');
const confidenceEl = document.getElementById('confidence');
const lastVerifiedEl = document.getElementById('last-verified');

// Unknown state elements
const unknownDomainEl = document.getElementById('unknown-domain');
const requestBtnEl = document.getElementById('request-btn');

// Error elements
const errorMessageEl = document.getElementById('error-message');

// Fallback translations when chrome.i18n is unavailable
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
  settingsLink: 'Settings',
  errorCannotAccess: 'Cannot access this page',
  errorNotValid: 'Not a valid website',
  errorLoadFailed: 'Failed to load data',
  errorGeneric: 'Something went wrong'
};

/**
 * Get localized message with optional substitutions
 */
function getMessage(key, substitutions = []) {
  const msg = chrome.i18n?.getMessage(key, substitutions);
  return msg || FALLBACK_MESSAGES[key] || key;
}

/**
 * Localize all elements with data-i18n attribute
 */
function localizeUI() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const message = getMessage(key);
    if (message && message !== key) {
      el.textContent = message;
    }
  });
}

// Status configurations with i18n keys
const STATUS_CONFIG = {
  eu: {
    textKey: 'statusEu',
    badgeText: 'EU',
    class: 'eu'
  },
  mixed: {
    textKey: 'statusMixed',
    badgeText: 'MIX',
    class: 'mixed'
  },
  'non-eu': {
    textKey: 'statusNonEu',
    badgeText: '!EU',
    class: 'non-eu'
  },
  unknown: {
    textKey: 'statusUnknown',
    badgeText: '?',
    class: 'unknown'
  }
};

// Confidence level i18n keys
const CONFIDENCE_KEYS = {
  high: 'confidenceHigh',
  medium: 'confidenceMedium',
  low: 'confidenceLow'
};

/**
 * Show a specific state, hide others
 */
function showState(state) {
  loadingEl.classList.toggle('hidden', state !== 'loading');
  companyInfoEl.classList.toggle('hidden', state !== 'company');
  unknownStateEl.classList.toggle('hidden', state !== 'unknown');
  errorStateEl.classList.toggle('hidden', state !== 'error');
}

/**
 * Display company information
 */
function displayCompany(company, domain) {
  const status = company.eu_status || 'unknown';
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.unknown;
  
  // Update status badge
  statusBadgeEl.textContent = config.badgeText;
  statusBadgeEl.className = `status-badge ${config.class}`;
  statusTextEl.textContent = getMessage(config.textKey);
  
  // Update company details
  companyNameEl.textContent = company.name;
  countryFlagEl.textContent = getCountryFlag(company.hq_country);
  companyLocationEl.textContent = formatLocation(company.hq_city, company.hq_country);
  
  // Update ownership chain
  if (company.parent_company || company.ultimate_parent) {
    ownershipSectionEl.classList.remove('hidden');
    ownershipChainEl.innerHTML = buildOwnershipChain(company);
  } else {
    ownershipSectionEl.classList.add('hidden');
  }
  
  // Update additional details
  foundedYearEl.textContent = company.founded_year || '-';
  
  // Localize confidence level
  const confidenceKey = CONFIDENCE_KEYS[company.confidence?.toLowerCase()];
  confidenceEl.textContent = confidenceKey ? getMessage(confidenceKey) : capitalizeFirst(company.confidence || 'unknown');
  
  lastVerifiedEl.textContent = formatDate(company.last_verified);
  
  showState('company');
}

/**
 * Display unknown domain state
 */
function displayUnknown(domain) {
  unknownDomainEl.textContent = getMessage('unknownNoData', [domain]);
  showState('unknown');
}

/**
 * Display error state
 */
function displayError(messageKey) {
  errorMessageEl.textContent = getMessage(messageKey);
  showState('error');
}

/**
 * Format location string
 */
function formatLocation(city, country) {
  const countryName = getCountryName(country);
  if (city && countryName) {
    return `${city}, ${countryName}`;
  }
  return countryName || country || 'Unknown';
}

/**
 * Get full country name from code
 */
function getCountryName(code) {
  const countries = {
    'US': 'United States', 'GB': 'United Kingdom', 'DE': 'Germany',
    'FR': 'France', 'SE': 'Sweden', 'NL': 'Netherlands', 'FI': 'Finland',
    'NO': 'Norway', 'DK': 'Denmark', 'IE': 'Ireland', 'ES': 'Spain',
    'IT': 'Italy', 'BE': 'Belgium', 'AT': 'Austria', 'CH': 'Switzerland',
    'PL': 'Poland', 'CZ': 'Czech Republic', 'PT': 'Portugal', 'LU': 'Luxembourg',
    'CN': 'China', 'JP': 'Japan', 'KR': 'South Korea', 'IN': 'India',
    'AU': 'Australia', 'CA': 'Canada', 'BR': 'Brazil', 'MX': 'Mexico',
    'SG': 'Singapore', 'HK': 'Hong Kong', 'TW': 'Taiwan', 'IL': 'Israel',
    'RU': 'Russia', 'ZA': 'South Africa', 'AE': 'UAE'
  };
  return countries[code] || code;
}

/**
 * Build ownership chain HTML
 */
function buildOwnershipChain(company) {
  let html = '';
  
  // Current company
  html += `
    <div class="ownership-item">
      <span class="flag">${getCountryFlag(company.hq_country)}</span>
      <span class="name">${company.name}</span>
      <span class="badge">${getMessage('badgeCurrent')}</span>
    </div>
  `;
  
  // Parent company
  if (company.parent_company) {
    html += `
      <div class="ownership-item">
        <span class="flag">🏢</span>
        <span class="name">${company.parent_company}</span>
        <span class="badge">${getMessage('badgeParent')}</span>
      </div>
    `;
  }
  
  // Ultimate parent
  if (company.ultimate_parent && company.ultimate_parent !== company.parent_company) {
    html += `
      <div class="ownership-item">
        <span class="flag">🏛️</span>
        <span class="name">${company.ultimate_parent}</span>
        <span class="badge">${getMessage('badgeUltimate')}</span>
      </div>
    `;
  }
  
  return html;
}

/**
 * Format date string
 */
function formatDate(dateStr) {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  } catch {
    return dateStr;
  }
}

/**
 * Capitalize first letter
 */
function capitalizeFirst(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Handle request button click
 */
function handleRequestClick() {
  // Store request locally
  chrome.storage.local.get(['pendingRequests'], (result) => {
    const requests = result.pendingRequests || [];
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.url) {
        const domain = extractDomain(tabs[0].url);
        if (domain && !requests.includes(domain)) {
          requests.push(domain);
          chrome.storage.local.set({ pendingRequests: requests });
        }
      }
    });
  });
  
  // Update button with localized text
  requestBtnEl.textContent = getMessage('requestSubmitted');
  requestBtnEl.disabled = true;
}

/**
 * Initialize popup
 */
async function init() {
  // Localize UI first
  localizeUI();
  
  showState('loading');
  
  // Add event listeners
  requestBtnEl.addEventListener('click', handleRequestClick);
  
  // Check for test mode (URL parameter)
  const urlParams = new URLSearchParams(window.location.search);
  const testDomain = urlParams.get('domain');
  
  // Get current tab (or use test domain)
  try {
    let domain;
    
    if (testDomain) {
      // Test mode - use provided domain
      domain = testDomain;
    } else {
      // Normal mode - get from active tab
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
    
    // Request company info from background
    chrome.runtime.sendMessage(
      { type: 'GET_COMPANY_INFO', domain },
      (response) => {
        if (chrome.runtime.lastError) {
          displayError('errorFailedToLoad');
          return;
        }
        
        if (response?.company && response.company.eu_status !== 'unknown') {
          displayCompany(response.company, domain);
        } else {
          displayUnknown(domain);
        }
      }
    );
  } catch (error) {
    console.error('[EuroCheck] Popup error:', error);
    displayError('errorGeneric');
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
