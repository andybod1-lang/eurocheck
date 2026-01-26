/**
 * EuroCheck - Domain Utilities
 * Functions for extracting and looking up domains
 */

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
        /^\d+\.\d+\.\d+\.\d+$/.test(hostname) ||
        hostname.endsWith('.local')) {
      return null;
    }
    
    // Handle common country code TLDs (two-part TLDs)
    const twoPartTLDs = [
      '.co.uk', '.co.jp', '.co.kr', '.co.nz', '.co.za', '.co.in',
      '.com.au', '.com.br', '.com.cn', '.com.mx', '.com.sg', '.com.tw',
      '.org.uk', '.org.au', '.net.au', '.gov.uk', '.ac.uk',
      '.co.at', '.or.jp', '.ne.jp', '.gv.at', '.or.at'
    ];
    
    // Check if hostname ends with a two-part TLD
    let effectiveTLD = '';
    for (const tld of twoPartTLDs) {
      if (hostname.endsWith(tld)) {
        effectiveTLD = tld;
        break;
      }
    }
    
    let domain;
    if (effectiveTLD) {
      // Extract domain with two-part TLD
      const withoutTLD = hostname.slice(0, -effectiveTLD.length);
      const parts = withoutTLD.split('.');
      domain = parts[parts.length - 1] + effectiveTLD;
    } else {
      // Standard single TLD
      const parts = hostname.split('.');
      if (parts.length >= 2) {
        domain = parts.slice(-2).join('.');
      } else {
        domain = hostname;
      }
    }
    
    return domain;
  } catch (error) {
    console.error('[EuroCheck] Error extracting domain:', error);
    return null;
  }
}

/**
 * Look up a company by domain
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
  
  // Normalize domain for comparison
  const normalizedDomain = domain.toLowerCase();
  
  // Find domain entry
  const domainEntry = domainsData.domains.find(d => 
    d.domain.toLowerCase() === normalizedDomain
  );
  
  if (!domainEntry) {
    // Try without www prefix
    const withoutWww = normalizedDomain.replace(/^www\./, '');
    const altEntry = domainsData.domains.find(d => 
      d.domain.toLowerCase() === withoutWww
    );
    if (altEntry) {
      return findCompanyById(altEntry.company_id, companiesData);
    }
    
    // Try parent domain fallback (for subdomains like drive.google.com)
    const parts = withoutWww.split('.');
    if (parts.length > 2) {
      const parentDomain = parts.slice(-2).join('.');
      const parentEntry = domainsData.domains.find(d => 
        d.domain.toLowerCase() === parentDomain
      );
      if (parentEntry) {
        return findCompanyById(parentEntry.company_id, companiesData);
      }
    }
    
    return null;
  }
  
  return findCompanyById(domainEntry.company_id, companiesData);
}

/**
 * Find a company by ID
 * 
 * @param {string} companyId - Company ID to find
 * @param {Array} companiesData - Array of company objects
 * @returns {Object|null} - Company object or null if not found
 */
function findCompanyById(companyId, companiesData) {
  return companiesData.find(c => c.id === companyId) || null;
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
    if (!url.match(/^https?:\/\//i)) {
      url = 'https://' + url;
    }
    
    const urlObj = new URL(url);
    
    // Return normalized URL without trailing slash
    return urlObj.origin + urlObj.pathname.replace(/\/$/, '');
  } catch (error) {
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
  
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  
  return String.fromCodePoint(...codePoints);
}

/**
 * Check if a country is in the EU/EEA
 * 
 * @param {string} countryCode - ISO 3166-1 alpha-2 country code
 * @returns {boolean} - True if EU/EEA country
 */
export function isEUCountry(countryCode) {
  const euCountries = [
    // EU members
    'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
    'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
    'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
    // EEA (non-EU)
    'IS', 'LI', 'NO',
    // Associated (often treated as EU for business)
    'CH'
  ];
  
  return euCountries.includes(countryCode?.toUpperCase());
}
