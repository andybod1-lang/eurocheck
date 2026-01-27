/**
 * EuroCheck - Domain Utilities (Optimized)
 * Functions for extracting and looking up domains
 * 
 * Optimizations:
 * - Pre-compiled regex patterns
 * - Set for O(1) TLD lookup
 * - Cached country flag code points
 * - Set for O(1) EU country check
 */

// === PRE-COMPILED PATTERNS ===
const IP_PATTERN = /^\d+\.\d+\.\d+\.\d+$/;
const PROTOCOL_PATTERN = /^https?:\/\//i;
const WWW_PATTERN = /^www\./;

// === PRE-BUILT SETS FOR O(1) LOOKUP ===
// Stored without leading dot for faster suffix extraction
const TWO_PART_TLDS = new Set([
  'co.uk', 'co.jp', 'co.kr', 'co.nz', 'co.za', 'co.in',
  'com.au', 'com.br', 'com.cn', 'com.mx', 'com.sg', 'com.tw',
  'org.uk', 'org.au', 'net.au', 'gov.uk', 'ac.uk',
  'co.at', 'or.jp', 'ne.jp', 'gv.at', 'or.at'
]);

// === DOMAIN INDEX CACHE ===
// Lazily built Map for O(1) domain->company lookups
let domainIndexCache = null;
let companiesMapCache = null;

const EU_COUNTRIES = new Set([
  // EU members
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
  'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
  'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
  // EEA (non-EU)
  'IS', 'LI', 'NO',
  // Associated (often treated as EU for business)
  'CH'
]);

// Regional indicator base for flag emojis (cached)
const REGIONAL_INDICATOR_BASE = 127397;

/**
 * Extract the registered domain from a URL
 * Handles subdomains and country TLDs
 * 
 * @param {string} url - Full URL to extract domain from
 * @returns {string|null} - Registered domain or null if invalid
 */
export function extractDomain(url) {
  if (!url) return null;
  
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    // Skip localhost, IPs, and browser internal URLs
    if (hostname === 'localhost' || 
        IP_PATTERN.test(hostname) ||
        hostname.endsWith('.local')) {
      return null;
    }
    
    const parts = hostname.split('.');
    const partsLen = parts.length;
    
    // Check for two-part TLD using direct Set lookup (O(1) vs O(n) iteration)
    if (partsLen >= 3) {
      const potentialTwoPartTLD = parts[partsLen - 2] + '.' + parts[partsLen - 1];
      if (TWO_PART_TLDS.has(potentialTwoPartTLD)) {
        // Return domain + two-part TLD
        return parts[partsLen - 3] + '.' + potentialTwoPartTLD;
      }
    }
    
    // Standard single TLD - return last two parts
    if (partsLen >= 2) {
      return parts[partsLen - 2] + '.' + parts[partsLen - 1];
    }
    return hostname;
    
  } catch {
    return null;
  }
}

/**
 * Build domain index for O(1) lookups (cached)
 * @private
 */
function buildDomainIndex(domainsData) {
  if (domainIndexCache && domainIndexCache._source === domainsData) {
    return domainIndexCache;
  }
  
  const index = new Map();
  const domains = domainsData.domains;
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
  
  index._source = domainsData; // Track source for cache invalidation
  domainIndexCache = index;
  return index;
}

/**
 * Build companies Map for O(1) lookups (cached)
 * @private
 */
function buildCompaniesMap(companiesData) {
  if (companiesMapCache && companiesMapCache._source === companiesData) {
    return companiesMapCache;
  }
  
  const map = new Map();
  const len = companiesData.length;
  
  for (let i = 0; i < len; i++) {
    map.set(companiesData[i].id, companiesData[i]);
  }
  
  map._source = companiesData;
  companiesMapCache = map;
  return map;
}

/**
 * Look up a company by domain
 * Optimized with indexed lookups: O(1) instead of O(n)
 * 
 * @param {string} domain - Domain to look up
 * @param {Object} domainsData - Domain mapping data {domains: [{domain, company_id, is_primary}]}
 * @param {Array} companiesData - Array of company objects
 * @returns {Object|null} - Company object or null if not found
 */
export function lookupCompany(domain, domainsData, companiesData) {
  if (!domain || !domainsData || !companiesData) {
    return null;
  }
  
  // Build/retrieve cached indexes
  const domainIndex = buildDomainIndex(domainsData);
  const companiesMap = buildCompaniesMap(companiesData);
  
  const normalizedDomain = domain.toLowerCase();
  
  // Direct lookup (O(1))
  let companyId = domainIndex.get(normalizedDomain);
  
  // Try without www prefix (O(1))
  if (!companyId) {
    const withoutWww = normalizedDomain.replace(WWW_PATTERN, '');
    if (withoutWww !== normalizedDomain) {
      companyId = domainIndex.get(withoutWww);
    }
  }
  
  // Try parent domain fallback (O(1))
  if (!companyId) {
    const dotIndex = normalizedDomain.indexOf('.');
    if (dotIndex > 0) {
      const afterFirst = normalizedDomain.slice(dotIndex + 1);
      // Only try if there's still a dot (subdomain scenario)
      if (afterFirst.includes('.')) {
        companyId = domainIndex.get(afterFirst);
      }
    }
  }
  
  if (!companyId) return null;
  
  // Find company by ID (O(1))
  return companiesMap.get(companyId) || null;
}

/**
 * Normalize a URL for consistent handling
 * 
 * @param {string} url - URL to normalize
 * @returns {string|null} - Normalized URL or null if invalid
 */
export function normalizeUrl(url) {
  if (!url) return null;
  
  try {
    // Add protocol if missing
    if (!PROTOCOL_PATTERN.test(url)) {
      url = 'https://' + url;
    }
    
    const urlObj = new URL(url);
    
    // Return normalized URL without trailing slash
    const pathname = urlObj.pathname;
    return urlObj.origin + (pathname.endsWith('/') ? pathname.slice(0, -1) : pathname);
  } catch {
    return null;
  }
}

/**
 * Get country flag emoji from ISO country code
 * 
 * @param {string} countryCode - ISO 3166-1 alpha-2 country code
 * @returns {string} - Flag emoji
 */
export function getCountryFlag(countryCode) {
  if (!countryCode || countryCode.length !== 2) return '🏳️';
  
  const upper = countryCode.toUpperCase();
  const first = REGIONAL_INDICATOR_BASE + upper.charCodeAt(0);
  const second = REGIONAL_INDICATOR_BASE + upper.charCodeAt(1);
  
  return String.fromCodePoint(first, second);
}

/**
 * Check if a country is in the EU/EEA
 * 
 * @param {string} countryCode - ISO 3166-1 alpha-2 country code
 * @returns {boolean} - True if EU/EEA country
 */
export function isEUCountry(countryCode) {
  return countryCode ? EU_COUNTRIES.has(countryCode.toUpperCase()) : false;
}
