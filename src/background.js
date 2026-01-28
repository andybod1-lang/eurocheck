/**
 * EuroCheck - Background Service Worker (Memory Optimized)
 * Handles tab updates and badge management
 * 
 * Memory Optimizations (v2):
 * - Hot/cold data split: domain-index.json (24KB) for badges, lazy-load details
 * - Minimal cache entries: status code (1 byte) instead of full objects
 * - Single Map lookup instead of array + Map duplication
 * - Lazy loading of full company data only when popup requests it
 * - Status codes: 1=EU, 0=non-EU, 2=mixed, 3=unknown
 */

import { extractDomain } from './utils/domain.js';

// === CONFIGURATION ===
const CONFIG = {
  CACHE_MAX_SIZE: 1000,         // Can store more with minimal entries
  CACHE_TTL_MS: 24 * 60 * 60 * 1000, // 24 hours
  CACHE_PERSIST_INTERVAL: 5 * 60 * 1000, // Persist every 5 minutes
  DEBOUNCE_MS: 150,             // Debounce badge updates
  CACHE_STORAGE_KEY: 'domainCacheV2',
  DEBUG_STORAGE_KEY: 'debugMode'
};

// Status code mapping (memory efficient)
// 0=non-eu, 1=eu, 2=european (non-EU European countries like UK, Switzerland, Norway)
const STATUS_CODES = { eu: 1, european: 2, 'non-eu': 0, unknown: 3 };
const STATUS_NAMES = ['non-eu', 'eu', 'european', 'unknown'];

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

// Hot data (always loaded, minimal ~24KB)
let domainIndex = null; // domain -> {id, s(status), n(name), c(country)}
let hotDataPromise = null;

// Cold data (lazy loaded on demand, ~130KB)
let companiesMap = null; // id -> full company object
let coldDataPromise = null;

let persistTimeout = null;

// === DATA LOADING ===

/**
 * Load hot path data (domain index) - minimal footprint
 * Only loads 24KB needed for badge display
 */
async function loadHotData() {
  if (domainIndex) {
    debugLog('DATA', 'Hot data already loaded');
    return true;
  }
  
  if (hotDataPromise) {
    debugLog('DATA', 'Hot data load in progress, reusing promise');
    return hotDataPromise;
  }
  
  debugLog('DATA', 'Loading hot path data (domain-index.json)...');
  const startTime = performance.now();
  
  hotDataPromise = (async () => {
    try {
      const response = await fetch(chrome.runtime.getURL('data/domain-index.json'));
      domainIndex = await response.json();
      
      const loadTime = Math.round(performance.now() - startTime);
      const domainCount = Object.keys(domainIndex).length;
      console.log(`[EuroCheck] Loaded ${domainCount} domain mappings in ${loadTime}ms`);
      debugLog('DATA', `Hot data loaded`, { domains: domainCount, timeMs: loadTime });
      return true;
    } catch (error) {
      console.error('[EuroCheck] Failed to load hot data:', error);
      debugLog('DATA', 'Hot data FAILED', { error: error.message });
      hotDataPromise = null;
      return false;
    }
  })();
  
  return hotDataPromise;
}

/**
 * Load cold path data (full company details) - lazy loaded
 * Only called when popup needs full company info
 */
async function loadColdData() {
  if (companiesMap) {
    debugLog('DATA', 'Cold data already loaded');
    return true;
  }
  
  if (coldDataPromise) {
    debugLog('DATA', 'Cold data load in progress, reusing promise');
    return coldDataPromise;
  }
  
  debugLog('DATA', 'Loading cold path data (companies-min.json)...');
  const startTime = performance.now();
  
  coldDataPromise = (async () => {
    try {
      const response = await fetch(chrome.runtime.getURL('data/companies-min.json'));
      const companies = await response.json();
      
      // Build Map for O(1) lookups
      companiesMap = new Map();
      for (const c of companies) {
        companiesMap.set(c.id, c);
      }
      
      const loadTime = Math.round(performance.now() - startTime);
      console.log(`[EuroCheck] Loaded ${companiesMap.size} company details in ${loadTime}ms`);
      debugLog('DATA', `Cold data loaded`, { companies: companiesMap.size, timeMs: loadTime });
      return true;
    } catch (error) {
      console.error('[EuroCheck] Failed to load cold data:', error);
      debugLog('DATA', 'Cold data FAILED', { error: error.message });
      coldDataPromise = null;
      return false;
    }
  })();
  
  return coldDataPromise;
}

/**
 * Fast domain lookup using hot data index
 * Returns minimal info: {id, status, name, country}
 */
function lookupDomainFast(domain) {
  if (!domain || !domainIndex) {
    debugLog('LOOKUP', `Skipped: ${domain}`, { reason: !domain ? 'no domain' : 'data not loaded' });
    return null;
  }
  
  const normalizedDomain = domain.toLowerCase();
  
  // Direct lookup (O(1))
  let entry = domainIndex[normalizedDomain];
  let lookupMethod = 'direct';
  
  // Try without www
  if (!entry && normalizedDomain.startsWith('www.')) {
    entry = domainIndex[normalizedDomain.slice(4)];
    if (entry) lookupMethod = 'no-www';
  }
  
  // Try parent domain for subdomains (O(1))
  if (!entry) {
    const dotIndex = normalizedDomain.indexOf('.');
    if (dotIndex > 0) {
      const afterFirst = normalizedDomain.slice(dotIndex + 1);
      if (afterFirst.includes('.')) {
        entry = domainIndex[afterFirst];
        if (entry) {
          lookupMethod = 'parent';
          debugLog('LOOKUP', `Parent domain match: ${normalizedDomain} → ${afterFirst}`);
        }
      }
    }
  }
  
  if (!entry) {
    debugLog('LOOKUP', `No match: ${normalizedDomain}`);
    return null;
  }
  
  // Convert status code to name
  const status = STATUS_NAMES[entry.s] || 'unknown';
  
  debugLog('LOOKUP', `Found: ${normalizedDomain}`, { 
    company: entry.n, 
    status,
    method: lookupMethod
  });
  
  return {
    id: entry.id,
    eu_status: status,
    name: entry.n,
    hq_country: entry.c
  };
}

/**
 * Get full company details (lazy loads cold data)
 */
async function getFullCompanyDetails(companyId) {
  await loadColdData();
  return companiesMap?.get(companyId) || null;
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
 * Memory optimized: caches only status code (1 byte per domain)
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

  // Check cache first - stores only status code for minimal memory
  const cachedStatus = lookupCache.get(domain);
  if (cachedStatus !== undefined) {
    setBadgeStatus(tabId, STATUS_NAMES[cachedStatus] || 'unknown');
    return;
  }

  // Show loading state only for uncached lookups
  chrome.action.setBadgeText({ tabId, text: '...' });
  chrome.action.setBadgeBackgroundColor({ tabId, color: BADGE_COLORS.unknown });

  // Ensure hot data is loaded (only 24KB)
  const loaded = await loadHotData();
  if (!loaded) {
    setBadgeStatus(tabId, 'unknown');
    return;
  }

  // Look up using fast domain index
  const info = lookupDomainFast(domain);
  
  if (info) {
    // Cache only the status code (1 byte vs ~200 bytes for full object)
    const statusCode = STATUS_CODES[info.eu_status] ?? 3;
    lookupCache.set(domain, statusCode);
    setBadgeStatus(tabId, info.eu_status);
  } else {
    lookupCache.set(domain, 3); // unknown
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
 * Lazy loads full company details only when needed
 */
async function handleGetCompanyInfo(domain) {
  // First, get minimal info from hot data
  await loadHotData();
  const minimalInfo = lookupDomainFast(domain);
  
  if (!minimalInfo) {
    return { company: null };
  }
  
  // Load cold data for full details (popup needs them)
  const fullCompany = await getFullCompanyDetails(minimalInfo.id);
  
  if (fullCompany) {
    return { company: fullCompany, fromCache: false };
  }
  
  // Fallback to minimal info if cold data unavailable
  return { company: minimalInfo, fromCache: false };
}

// === INITIALIZATION ===

async function init() {
  // Load debug mode setting first
  await loadDebugMode();
  
  // Load persisted cache (fast startup)
  await loadCache();
  
  // Schedule periodic persistence
  schedulePersistence();
  
  // Preload only hot data in background (24KB, fast)
  // Cold data (130KB) loads lazily when popup opens
  loadHotData();
  
  console.log('[EuroCheck] Background service worker initialized (memory optimized)');
  debugLog('INIT', 'Service worker ready', { 
    cacheSize: lookupCache.size, 
    debugMode,
    memoryMode: 'hot/cold split'
  });
}

init();
