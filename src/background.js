/**
 * EuroCheck - Background Service Worker
 * Handles tab updates and badge management
 */

import { extractDomain, lookupCompany } from './utils/domain.js';

// Badge colors for different EU statuses
const BADGE_COLORS = {
  eu: '#10B981',      // Green
  mixed: '#F59E0B',   // Yellow
  'non-eu': '#EF4444', // Red
  unknown: '#6B7280'  // Gray
};

// Badge text for different statuses
const BADGE_TEXT = {
  eu: 'EU',
  mixed: 'MIX',
  'non-eu': '!EU',
  unknown: '?'
};

// Cache for company lookups (domain -> company data)
const lookupCache = new Map();

// Company and domain data (loaded on startup)
let companiesData = null;
let domainsData = null;

/**
 * Load company and domain data from bundled JSON
 */
async function loadData() {
  try {
    const [companiesResponse, domainsResponse] = await Promise.all([
      fetch(chrome.runtime.getURL('data/companies.json')),
      fetch(chrome.runtime.getURL('data/domains.json'))
    ]);
    
    companiesData = await companiesResponse.json();
    domainsData = await domainsResponse.json();
    
    console.log(`[EuroCheck] Loaded ${companiesData.length} companies and ${domainsData.domains.length} domains`);
  } catch (error) {
    console.error('[EuroCheck] Failed to load data:', error);
  }
}

/**
 * Update the extension badge for a tab
 */
async function updateBadge(tabId, url) {
  if (!url || url.startsWith('chrome://') || url.startsWith('about:') || url.startsWith('moz-extension://')) {
    // Clear badge for browser internal pages
    await chrome.action.setBadgeText({ tabId, text: '' });
    return;
  }

  // Show loading state
  await chrome.action.setBadgeText({ tabId, text: '...' });
  await chrome.action.setBadgeBackgroundColor({ tabId, color: BADGE_COLORS.unknown });

  try {
    const domain = extractDomain(url);
    if (!domain) {
      await setBadgeStatus(tabId, 'unknown');
      return;
    }

    // Check cache first
    if (lookupCache.has(domain)) {
      const cached = lookupCache.get(domain);
      await setBadgeStatus(tabId, cached.eu_status || 'unknown');
      return;
    }

    // Ensure data is loaded
    if (!companiesData || !domainsData) {
      await loadData();
    }

    // Look up company
    const company = lookupCompany(domain, domainsData, companiesData);
    
    if (company) {
      lookupCache.set(domain, company);
      await setBadgeStatus(tabId, company.eu_status);
    } else {
      lookupCache.set(domain, { eu_status: 'unknown' });
      await setBadgeStatus(tabId, 'unknown');
    }
  } catch (error) {
    console.error('[EuroCheck] Error updating badge:', error);
    await setBadgeStatus(tabId, 'unknown');
  }
}

/**
 * Set badge to a specific status
 */
async function setBadgeStatus(tabId, status) {
  const text = BADGE_TEXT[status] || BADGE_TEXT.unknown;
  const color = BADGE_COLORS[status] || BADGE_COLORS.unknown;
  
  await chrome.action.setBadgeText({ tabId, text });
  await chrome.action.setBadgeBackgroundColor({ tabId, color });
}

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    updateBadge(tabId, tab.url);
  }
});

// Listen for tab activation (switching tabs)
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (tab.url) {
      updateBadge(activeInfo.tabId, tab.url);
    }
  } catch (error) {
    console.error('[EuroCheck] Error on tab activation:', error);
  }
});

// Handle messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_COMPANY_INFO') {
    const domain = message.domain;
    
    if (lookupCache.has(domain)) {
      sendResponse({ company: lookupCache.get(domain) });
    } else if (companiesData && domainsData) {
      const company = lookupCompany(domain, domainsData, companiesData);
      if (company) {
        lookupCache.set(domain, company);
      }
      sendResponse({ company: company || null });
    } else {
      sendResponse({ company: null, error: 'Data not loaded' });
    }
    
    return true; // Keep channel open for async response
  }
});

// Load data on startup
loadData();

console.log('[EuroCheck] Background service worker initialized');
