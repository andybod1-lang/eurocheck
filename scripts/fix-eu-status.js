#!/usr/bin/env node
/**
 * Fix EU Status - Correct eu_status based on hq_country
 */

const fs = require('fs');

const EU_COUNTRIES = new Set([
  // EU members (27)
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
  'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
  'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
  // EEA (non-EU but treated as EU)
  'IS', 'LI', 'NO',
  // Associated (often treated as EU for business)
  'CH'
]);

function isEUCountry(code) {
  return code ? EU_COUNTRIES.has(code.toUpperCase()) : false;
}

function determineEUStatus(company) {
  const hqCountry = company.hq_country?.toUpperCase();
  
  // Check ownership chain if exists
  if (company.ownership) {
    const countries = [hqCountry];
    if (company.ownership.parent?.country) countries.push(company.ownership.parent.country.toUpperCase());
    if (company.ownership.ultimate?.country) countries.push(company.ownership.ultimate.country.toUpperCase());
    
    const hasEU = countries.some(c => isEUCountry(c));
    const hasNonEU = countries.some(c => c && !isEUCountry(c));
    
    if (hasEU && hasNonEU) return 'mixed';
    if (hasEU) return 'eu';
    return 'non-eu';
  }
  
  // Simple case: just HQ country
  return isEUCountry(hqCountry) ? 'eu' : 'non-eu';
}

// Fix companies-min.json
const minPath = 'data/companies-min.json';
if (fs.existsSync(minPath)) {
  const data = JSON.parse(fs.readFileSync(minPath, 'utf8'));
  let fixed = 0;
  
  data.forEach(company => {
    const correctStatus = determineEUStatus(company);
    if (company.eu_status !== correctStatus) {
      console.log(`Fix: ${company.name} (${company.hq_country}): ${company.eu_status} -> ${correctStatus}`);
      company.eu_status = correctStatus;
      fixed++;
    }
  });
  
  fs.writeFileSync(minPath, JSON.stringify(data));
  console.log(`\n✅ Fixed ${fixed} companies in ${minPath}`);
}

// Fix domain-index.json if it has eu_status
const indexPath = 'data/domain-index.json';
if (fs.existsSync(indexPath)) {
  const data = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
  // Just rebuild from companies-min
  console.log(`\n📦 domain-index.json exists - may need separate rebuild`);
}

console.log('\nDone! Run build to rebuild extension.');
