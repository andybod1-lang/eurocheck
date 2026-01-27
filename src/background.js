/**
 * EuroCheck - Background Service Worker (Optimized)
 * Handles tab updates and badge management
 * 
 * Optimizations:
 * - LRU cache with TTL and size limits
 * - Debounced badge updates
 * - Lazy data loading
 * - Cache persistence to storage
 * - Indexed domain lookup (O(1) vs O(n))
 */

import { extractDomain, lookupCompany } from './utils/domain.js';

// === CONFIGURATION ===
const CONFIG = {
  CACHE_MAX_SIZE: 500,          // Max cached domains
  CACHE_TTL_MS: 24 * 60 * 60 * 1000, // 24 hours
  CACHE_PERSIST_INTERVAL: 5 * 60 * 1000, // Persist every 5 minutes
  DEBOUNCE_MS: 150,             // Debounce badge updates
  CACHE_STORAGE_KEY: 'domainCache',
  DEBUG_STORAGE_KEY: 'debugMode'
};

// === DEBUG LOGGING ===
let debugMode = false;

function debugLog(category, message, data = null) {
  if (!debugMode) return;
  const timestamp = new Date().toISOString().slice(11, 23);
  const prefix = `[EuroCheck ${timestamp}] [${category}]`;
  if (data !== null) {
    console.log(prefix, message, data);
  } else {
    console.log(prefix, message);
  }
}

// Load debug mode setting
async function loadDebugMode() {
  try {
    const result = await chrome.storage.local.get(CONFIG.DEBUG_STORAGE_KEY);
    debugMode = result[CONFIG.DEBUG_STORAGE_KEY] === true;
    if (debugMode) {
      console.log('[EuroCheck] Debug mode enabled');
    }
  } catch (e) {
    // Ignore errors, default to false
  }
}

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

// === LRU CACHE WITH TTL AND STATISTICS ===
class LRUCache {
  constructor(maxSize, ttlMs) {
    this.maxSize = maxSize;
    this.ttlMs = ttlMs;
    this.cache = new Map();
    this.dirty = false;
    // Statistics
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      expirations: 0
    };
  }

  get(key) {
    const entry = this.cache.get(key);
    if (!entry) {
      this.stats.misses++;
      debugLog('CACHE', `MISS: ${key}`);
      return undefined;
    }
    
    // Check TTL
    if (Date.now() - entry.timestamp > this.ttlMs) {
      this.cache.delete(key);
      this.dirty = true;
      this.stats.expirations++;
      this.stats.misses++;
      debugLog('CACHE', `EXPIRED: ${key} (age: ${Math.round((Date.now() - entry.timestamp) / 1000 / 60)}min)`);
      return undefined;
    }
    
    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, entry);
    this.stats.hits++;
    debugLog('CACHE', `HIT: ${key}`, { status: entry.value?.eu_status, age: Math.round((Date.now() - entry.timestamp) / 1000) + 's' });
    return entry.value;
  }

  set(key, value) {
    // Remove oldest entries if at capacity
    while (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
      this.stats.evictions++;
      debugLog('CACHE', `EVICTED (LRU): ${oldestKey}`);
    }
    
    this.cache.set(key, { value, timestamp: Date.now() });
    this.dirty = true;
    debugLog('CACHE', `SET: ${key}`, { status: value?.eu_status });
  }

  has(key) {
    return this.get(key) !== undefined;
  }

  // Serialize for storage (only non-expired entries)
  toJSON() {
    const now = Date.now();
    const entries = [];
    for (const [key, entry] of this.cache) {
      if (now - entry.timestamp <= this.ttlMs) {
        entries.push([key, entry]);
      }
    }
    return entries;
  }

  // Restore from storage
  fromJSON(entries) {
    if (!Array.isArray(entries)) return;
    const now = Date.now();
    let restored = 0;
    let expired = 0;
    for (const [key, entry] of entries) {
      if (now - entry.timestamp <= this.ttlMs) {
        this.cache.set(key, entry);
        restored++;
      } else {
        expired++;
      }
    }
    debugLog('CACHE', `Restored from storage`, { restored, expired, total: entries.length });
  }

  clear() {
    const size = this.cache.size;
    this.cache.clear();
    this.dirty = true;
    this.stats = { hits: 0, misses: 0, evictions: 0, expirations: 0 };
    debugLog('CACHE', `CLEARED: ${size} entries removed`);
  }

  get size() {
    return this.cache.size;
  }

  getStats() {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? ((this.stats.hits / total) * 100).toFixed(1) : 0;
    return {
      ...this.stats,
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: `${hitRate}%`
    };
  }
}

// === STATE ===
const lookupCache = new LRUCache(CONFIG.CACHE_MAX_SIZE, CONFIG.CACHE_TTL_MS);
const pendingBadgeUpdates = new Map(); // tabId -> timeoutId
let companiesData = null;
let companiesMap = null; // Fast O(1) company lookup by ID
let domainsData = null;
let domainIndex = null; // Fast O(1) lookup map
let dataLoadPromise = null;
let persistTimeout = null;

// === DATA LOADING ===

/**
 * Build domain index for O(1) lookups
 */
function buildDomainIndex(domains) {
  const index = new Map();
  const len = domains.length;
  for (let i = 0; i < len; i++) {
    const entry = domains[i];
    const domain = entry.domain.toLowerCase();
    index.set(domain, entry.company_id);
    // Also index without www
    if (domain.startsWith('www.')) {
      index.set(domain.slice(4), entry.company_id);
    }
  }
  return index;
}

/**
 * Build company ID -> company Map for O(1) lookups
 */
function buildCompaniesMap(companies) {
  const map = new Map();
  const len = companies.length;
  for (let i = 0; i < len; i++) {
    map.set(companies[i].id, companies[i]);
  }
  return map;
}

/**
 * Load company and domain data from bundled JSON
 * Uses singleton pattern to prevent multiple loads
 */
async function loadData() {
  if (companiesData && domainsData && domainIndex) {
    debugLog('DATA', 'Data already loaded, skipping');
    return true;
  }
  
  // Reuse in-flight promise if already loading
  if (dataLoadPromise) {
    debugLog('DATA', 'Data load in progress, reusing promise');
    return dataLoadPromise;
  }
  
  debugLog('DATA', 'Starting data load...');
  const startTime = performance.now();
  
  dataLoadPromise = (async () => {
    try {
      const [companiesResponse, domainsResponse] = await Promise.all([
        fetch(chrome.runtime.getURL('data/companies.json')),
        fetch(chrome.runtime.getURL('data/domains.json'))
      ]);
      
      companiesData = await companiesResponse.json();
      domainsData = await domainsResponse.json();
      
      // Build indexes for O(1) lookups
      domainIndex = buildDomainIndex(domainsData.domains);
      companiesMap = buildCompaniesMap(companiesData);
      
      const loadTime = Math.round(performance.now() - startTime);
      console.log(`[EuroCheck] Loaded ${companiesMap.size} companies, ${domainIndex.size} domain mappings`);
      debugLog('DATA', `Load complete in ${loadTime}ms`, { 
        companies: companiesData.length, 
        domains: domainIndex.size 
      });
      return true;
    } catch (error) {
      console.error('[EuroCheck] Failed to load data:', error);
      debugLog('DATA', 'Load FAILED', { error: error.message });
      dataLoadPromise = null; // Allow retry
      return false;
    }
  })();
  
  return dataLoadPromise;
}

/**
 * Fast company lookup using index
 */
function lookupCompanyFast(domain) {
  if (!domain || !domainIndex || !companiesData) {
    debugLog('LOOKUP', `Skipped: ${domain}`, { reason: !domain ? 'no domain' : 'data not loaded' });
    return null;
  }
  
  const normalizedDomain = domain.toLowerCase();
  
  // Direct lookup
  let companyId = domainIndex.get(normalizedDomain);
  let lookupMethod = 'direct';
  
  // Try parent domain for subdomains
  if (!companyId) {
    const parts = normalizedDomain.split('.');
    if (parts.length > 2) {
      const parentDomain = parts.slice(-2).join('.');
      companyId = domainIndex.get(parentDomain);
      if (companyId) {
        lookupMethod = 'parent';
        debugLog('LOOKUP', `Parent domain match: ${normalizedDomain} → ${parentDomain}`);
      }
    }
  }
  
  if (!companyId) {
    debugLog('LOOKUP', `No match: ${normalizedDomain}`);
    return null;
  }
  
  // Binary search would be faster with sorted data, but find is fine for <10k entries
  const company = companiesData.find(c => c.id === companyId) || null;
  
  if (company) {
    debugLog('LOOKUP', `Found: ${normalizedDomain}`, { 
      company: company.name, 
      status: company.eu_status,
      method: lookupMethod
    });
  }
  
  return company;
}

// === CACHE PERSISTENCE ===

/**
 * Save cache to storage
 */
async function persistCache() {
  if (!lookupCache.dirty) return;
  
  try {
    const cacheData = lookupCache.toJSON();
    await chrome.storage.local.set({ [CONFIG.CACHE_STORAGE_KEY]: cacheData });
    lookupCache.dirty = false;
  } catch (error) {
    console.error('[EuroCheck] Failed to persist cache:', error);
  }
}

/**
 * Load cache from storage
 */
async function loadCache() {
  try {
    const result = await chrome.storage.local.get(CONFIG.CACHE_STORAGE_KEY);
    if (result[CONFIG.CACHE_STORAGE_KEY]) {
      lookupCache.fromJSON(result[CONFIG.CACHE_STORAGE_KEY]);
      console.log(`[EuroCheck] Restored ${lookupCache.size} cached domains`);
    }
  } catch (error) {
    console.error('[EuroCheck] Failed to load cache:', error);
  }
}

/**
 * Schedule periodic cache persistence
 */
function schedulePersistence() {
  if (persistTimeout) return;
  
  persistTimeout = setTimeout(() => {
    persistTimeout = null;
    persistCache();
    schedulePersistence();
  }, CONFIG.CACHE_PERSIST_INTERVAL);
}

// === BADGE UPDATES ===

/**
 * Set badge to a specific status (batched)
 */
function setBadgeStatus(tabId, status) {
  const text = BADGE_TEXT[status] || BADGE_TEXT.unknown;
  const color = BADGE_COLORS[status] || BADGE_COLORS.unknown;
  
  // Batch badge updates
  chrome.action.setBadgeText({ tabId, text });
  chrome.action.setBadgeBackgroundColor({ tabId, color });
}

/**
 * Update the extension badge for a tab (debounced)
 */
function updateBadge(tabId, url) {
  // Cancel pending update for this tab
  if (pendingBadgeUpdates.has(tabId)) {
    clearTimeout(pendingBadgeUpdates.get(tabId));
  }
  
  // Debounce updates
  const timeoutId = setTimeout(() => {
    pendingBadgeUpdates.delete(tabId);
    updateBadgeImmediate(tabId, url);
  }, CONFIG.DEBOUNCE_MS);
  
  pendingBadgeUpdates.set(tabId, timeoutId);
}

/**
 * Immediate badge update (internal)
 */
async function updateBadgeImmediate(tabId, url) {
  if (!url || url.startsWith('chrome://') || url.startsWith('about:') || 
      url.startsWith('moz-extension://') || url.startsWith('chrome-extension://')) {
    chrome.action.setBadgeText({ tabId, text: '' });
    return;
  }

  const domain = extractDomain(url);
  if (!domain) {
    setBadgeStatus(tabId, 'unknown');
    return;
  }

  // Check cache first (fastest path)
  const cached = lookupCache.get(domain);
  if (cached) {
    setBadgeStatus(tabId, cached.eu_status || 'unknown');
    return;
  }

  // Show loading state only for uncached lookups
  chrome.action.setBadgeText({ tabId, text: '...' });
  chrome.action.setBadgeBackgroundColor({ tabId, color: BADGE_COLORS.unknown });

  // Ensure data is loaded
  const loaded = await loadData();
  if (!loaded) {
    setBadgeStatus(tabId, 'unknown');
    return;
  }

  // Look up company using fast index
  const company = lookupCompanyFast(domain);
  
  if (company) {
    // Cache with minimal data (memory optimization)
    lookupCache.set(domain, { 
      eu_status: company.eu_status,
      name: company.name,
      hq_country: company.hq_country
    });
    setBadgeStatus(tabId, company.eu_status);
  } else {
    lookupCache.set(domain, { eu_status: 'unknown' });
    setBadgeStatus(tabId, 'unknown');
  }
}

// === EVENT LISTENERS ===

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
    // Tab might have been closed
  }
});

// Clean up when tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
  if (pendingBadgeUpdates.has(tabId)) {
    clearTimeout(pendingBadgeUpdates.get(tabId));
    pendingBadgeUpdates.delete(tabId);
  }
});

// Handle messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_COMPANY_INFO') {
    handleGetCompanyInfo(message.domain).then(sendResponse);
    return true; // Keep channel open for async response
  }
  
  if (message.type === 'CLEAR_CACHE') {
    lookupCache.clear();
    persistCache();
    sendResponse({ success: true });
    return true;
  }
  
  if (message.type === 'GET_CACHE_STATS') {
    sendResponse(lookupCache.getStats());
    return true;
  }
  
  if (message.type === 'SET_DEBUG_MODE') {
    debugMode = message.enabled === true;
    chrome.storage.local.set({ [CONFIG.DEBUG_STORAGE_KEY]: debugMode });
    console.log(`[EuroCheck] Debug mode ${debugMode ? 'enabled' : 'disabled'}`);
    sendResponse({ success: true, debugMode });
    return true;
  }
  
  if (message.type === 'GET_DEBUG_MODE') {
    sendResponse({ debugMode });
    return true;
  }
});

/**
 * Handle company info request from popup
 */
async function handleGetCompanyInfo(domain) {
  // Check cache first
  const cached = lookupCache.get(domain);
  if (cached && cached.name) {
    return { company: cached, fromCache: true };
  }
  
  // Load data if needed
  const loaded = await loadData();
  if (!loaded) {
    return { company: null, error: 'Data not loaded' };
  }
  
  // Full company lookup
  const company = lookupCompanyFast(domain);
  
  if (company) {
    // Cache full company data for popup
    lookupCache.set(domain, company);
    return { company, fromCache: false };
  }
  
  return { company: null };
}

// === INITIALIZATION ===

async function init() {
  // Load debug mode setting first
  await loadDebugMode();
  
  // Load persisted cache (fast startup)
  await loadCache();
  
  // Schedule periodic persistence
  schedulePersistence();
  
  // Preload data in background
  loadData();
  
  console.log('[EuroCheck] Background service worker initialized');
  debugLog('INIT', 'Service worker ready', { 
    cacheSize: lookupCache.size, 
    debugMode 
  });
}

init();
