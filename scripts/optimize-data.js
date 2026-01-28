#!/usr/bin/env node
/**
 * EuroCheck Data Optimization Script
 * Generates memory-optimized data files for production use
 * 
 * Optimizations:
 * - Removes null values to reduce JSON size
 * - Creates minimal "hot" data for badge lookups (eu_status only)
 * - Creates lookup index combining domains → minimal company info
 * - Separates "cold" data (sources, full details) for lazy loading
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

// Read source files
const companies = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'companies.json'), 'utf8'));
const domainsData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'domains.json'), 'utf8'));

console.log(`Processing ${companies.length} companies and ${domainsData.domains.length} domains...`);

// === 1. Create optimized domain index ===
// Combines domain lookup + minimal company data in one structure
// This is the "hot path" data needed for badge display
const domainIndex = {};

for (const domainEntry of domainsData.domains) {
  const domain = domainEntry.domain.toLowerCase();
  const company = companies.find(c => c.id === domainEntry.company_id);
  
  if (company) {
    // Store only what's needed for badge display
    // Status codes: 1=EU, 2=European (non-EU), 0=Non-EU
    let statusCode = 0;
    if (company.eu_status === 'eu') statusCode = 1;
    else if (company.eu_status === 'european') statusCode = 2;
    else statusCode = 0; // non-eu
    
    domainIndex[domain] = {
      id: company.id,
      s: statusCode,
      n: company.name,
      c: company.hq_country
    };
  }
}

// === 2. Create minimal companies file (without sources) ===
const companiesMinimal = companies.map(c => {
  const minimal = {
    id: c.id,
    name: c.name,
    hq_country: c.hq_country,
    eu_status: c.eu_status
  };
  
  // Only include non-null optional fields
  if (c.hq_city) minimal.hq_city = c.hq_city;
  if (c.founded_year) minimal.founded_year = c.founded_year;
  if (c.parent_company) minimal.parent_company = c.parent_company;
  if (c.ultimate_parent) minimal.ultimate_parent = c.ultimate_parent;
  if (c.confidence) minimal.confidence = c.confidence;
  if (c.last_verified) minimal.last_verified = c.last_verified;
  
  return minimal;
});

// === 3. Create sources lookup (cold data, loaded on demand) ===
const sourcesLookup = {};
for (const c of companies) {
  if (c.sources && c.sources.length > 0) {
    sourcesLookup[c.id] = c.sources;
  }
}

// === 4. Write optimized files ===

// Domain index (hot path - used for badge lookups)
const domainIndexJson = JSON.stringify(domainIndex);
fs.writeFileSync(path.join(DATA_DIR, 'domain-index.json'), domainIndexJson);
console.log(`domain-index.json: ${(domainIndexJson.length / 1024).toFixed(1)}KB (${Object.keys(domainIndex).length} domains)`);

// Minimal companies (popup details)
const companiesMinimalJson = JSON.stringify(companiesMinimal);
fs.writeFileSync(path.join(DATA_DIR, 'companies-min.json'), companiesMinimalJson);
console.log(`companies-min.json: ${(companiesMinimalJson.length / 1024).toFixed(1)}KB (${companiesMinimal.length} companies)`);

// Sources lookup (cold data)
const sourcesJson = JSON.stringify(sourcesLookup);
fs.writeFileSync(path.join(DATA_DIR, 'sources.json'), sourcesJson);
console.log(`sources.json: ${(sourcesJson.length / 1024).toFixed(1)}KB (${Object.keys(sourcesLookup).length} entries)`);

// === 5. Calculate savings ===
const originalSize = fs.statSync(path.join(DATA_DIR, 'companies.json')).size + 
                     fs.statSync(path.join(DATA_DIR, 'domains.json')).size;
const optimizedSize = domainIndexJson.length + companiesMinimalJson.length;

console.log('\n=== Memory Optimization Results ===');
console.log(`Original (companies + domains): ${(originalSize / 1024).toFixed(1)}KB`);
console.log(`Optimized (domain-index + companies-min): ${(optimizedSize / 1024).toFixed(1)}KB`);
console.log(`Hot path only (domain-index): ${(domainIndexJson.length / 1024).toFixed(1)}KB`);
console.log(`Savings: ${((1 - optimizedSize / originalSize) * 100).toFixed(1)}%`);
console.log(`\nNote: sources.json (${(sourcesJson.length / 1024).toFixed(1)}KB) is lazy-loaded only when needed`);
