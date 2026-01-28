#!/usr/bin/env node
/**
 * Fix domain-index to include all companies from companies-min.json
 * Adds any company with a domain-like ID that's missing from domain-index
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

// Load existing data
const domainIndex = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'domain-index.json'), 'utf8'));
const companies = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'companies-min.json'), 'utf8'));

console.log(`Existing domain-index: ${Object.keys(domainIndex).length} entries`);
console.log(`Companies: ${companies.length} entries`);

let added = 0;
const missing = [];

for (const company of companies) {
  // Check if company ID looks like a domain
  const id = company.id.toLowerCase();
  
  // Add if it looks like a domain and isn't in index
  if (id.includes('.') || !id.includes('-')) {
    const domainVariants = [id];
    
    // If ID doesn't have TLD, try common ones
    if (!id.includes('.')) {
      domainVariants.push(`${id}.com`);
    }
    
    // Also add without www if it has it
    if (id.startsWith('www.')) {
      domainVariants.push(id.slice(4));
    }
    
    // If ID has .com, also add base name
    if (id.endsWith('.com')) {
      domainVariants.push(id.slice(0, -4));
    }
    
    for (const domain of domainVariants) {
      if (!domainIndex[domain]) {
        // Status codes: 1=EU, 2=European (non-EU), 0=Non-EU
        let statusCode = 0;
        if (company.eu_status === 'eu') statusCode = 1;
        else if (company.eu_status === 'european') statusCode = 2;
        
        domainIndex[domain] = {
          id: company.id,
          s: statusCode,
          n: company.name,
          c: company.hq_country
        };
        added++;
        
        if (missing.length < 20) {
          missing.push(`${domain} → ${company.name} (${company.eu_status})`);
        }
      }
    }
  }
}

console.log(`\nAdded ${added} new entries to domain-index`);
if (missing.length > 0) {
  console.log('\nSample additions:');
  missing.forEach(m => console.log(`  + ${m}`));
}

// Write updated index
const json = JSON.stringify(domainIndex);
fs.writeFileSync(path.join(DATA_DIR, 'domain-index.json'), json);
console.log(`\nUpdated domain-index.json: ${(json.length / 1024).toFixed(1)}KB (${Object.keys(domainIndex).length} entries)`);

// Also update dist
fs.copyFileSync(
  path.join(DATA_DIR, 'domain-index.json'),
  path.join(DATA_DIR, '..', 'dist', 'chrome', 'data', 'domain-index.json')
);
fs.copyFileSync(
  path.join(DATA_DIR, 'domain-index.json'),
  path.join(DATA_DIR, '..', 'dist', 'firefox', 'data', 'domain-index.json')
);
console.log('Copied to dist/chrome and dist/firefox');
