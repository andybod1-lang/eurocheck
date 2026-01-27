#!/usr/bin/env node
/**
 * Merge research markdown files into companies-merged.json
 */

const fs = require('fs');
const path = require('path');

const RESEARCH_DIR = path.join(__dirname, '../research');
const MERGED_FILE = path.join(__dirname, '../data/companies-merged.json');

// Map EU status from research format to database format
function mapEuStatus(status) {
  if (!status) return 'unknown';
  const s = status.toLowerCase();
  if (s.includes('🟢') || s.includes('european') || s.includes('eu/eea')) return 'eu';
  if (s.includes('🟡') || s.includes('mixed')) return 'mixed';
  if (s.includes('🔴') || s.includes('non-eu') || s.includes('non-european')) return 'non-eu';
  return 'unknown';
}

// Parse markdown table rows
function parseMarkdownTable(content) {
  const companies = [];
  const lines = content.split('\n');
  
  let inTable = false;
  let headers = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Detect table start
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const cells = trimmed.split('|').map(c => c.trim()).filter(c => c);
      
      // Skip separator rows
      if (cells.every(c => c.match(/^[-:]+$/))) {
        inTable = true;
        continue;
      }
      
      // Header row
      if (!inTable && cells.length >= 3) {
        headers = cells.map(h => h.toLowerCase());
        continue;
      }
      
      // Data row
      if (inTable && cells.length >= 3) {
        const company = {};
        
        cells.forEach((cell, i) => {
          const header = headers[i] || '';
          
          // Extract company name
          if (header.includes('company') || header.includes('name') || i === 1) {
            company.name = cell.replace(/\*\*/g, '').trim();
          }
          
          // Extract domain
          if (header.includes('domain') || header.includes('website')) {
            company.domains = cell.split(',').map(d => d.trim().replace(/`/g, ''));
          }
          
          // Extract HQ country
          if (header.includes('hq') || header.includes('country') || header.includes('headquarters')) {
            const countryMatch = cell.match(/([A-Z]{2})|🇺🇸|🇬🇧|🇩🇪|🇫🇷|🇳🇱|🇸🇪|🇫🇮|🇳🇴|🇩🇰|🇮🇪|🇧🇪|🇦🇹|🇨🇭|🇪🇸|🇮🇹|🇵🇱|🇨🇿|🇵🇹|🇬🇷/);
            if (countryMatch) {
              // Map emoji flags to country codes
              const flagMap = {
                '🇺🇸': 'US', '🇬🇧': 'GB', '🇩🇪': 'DE', '🇫🇷': 'FR', '🇳🇱': 'NL',
                '🇸🇪': 'SE', '🇫🇮': 'FI', '🇳🇴': 'NO', '🇩🇰': 'DK', '🇮🇪': 'IE',
                '🇧🇪': 'BE', '🇦🇹': 'AT', '🇨🇭': 'CH', '🇪🇸': 'ES', '🇮🇹': 'IT',
                '🇵🇱': 'PL', '🇨🇿': 'CZ', '🇵🇹': 'PT', '🇬🇷': 'GR'
              };
              company.country = flagMap[countryMatch[0]] || countryMatch[0];
            }
            company.headquarters = cell.replace(/🇺🇸|🇬🇧|🇩🇪|🇫🇷|🇳🇱|🇸🇪|🇫🇮|🇳🇴|🇩🇰|🇮🇪|🇧🇪|🇦🇹|🇨🇭|🇪🇸|🇮🇹|🇵🇱|🇨🇿|🇵🇹|🇬🇷/g, '').trim();
          }
          
          // Extract EU status
          if (header.includes('status') || header.includes('eu')) {
            company.eu_status = mapEuStatus(cell);
          }
          
          // Extract parent company
          if (header.includes('parent')) {
            const parent = cell.replace(/\*\*/g, '').trim();
            if (parent && parent !== '-' && parent !== 'Independent' && parent !== 'N/A') {
              company.ultimate_parent = parent;
            }
          }
          
          // Extract founded year
          if (header.includes('founded') || header.includes('year')) {
            const yearMatch = cell.match(/\d{4}/);
            if (yearMatch) {
              company.founded_year = parseInt(yearMatch[0]);
            }
          }
        });
        
        // Only add if we have at least a name
        if (company.name && company.name !== '#' && !company.name.match(/^\d+$/)) {
          companies.push(company);
        }
      }
    } else {
      inTable = false;
    }
  }
  
  return companies;
}

// Map file to industry
const industryMap = {
  'email-companies.md': { industry: 'Technology', sub_industry: 'Email Services' },
  'cloud-drive-companies.md': { industry: 'Technology', sub_industry: 'Cloud Storage' },
  'devtools-companies.md': { industry: 'Technology', sub_industry: 'Developer Tools' },
  'business-software-companies.md': { industry: 'Technology', sub_industry: 'Business Software' },
  'consumer-apps-companies.md': { industry: 'Technology', sub_industry: 'Consumer Apps' },
  'security-companies.md': { industry: 'Technology', sub_industry: 'Security' },
  'vertical-software-companies.md': { industry: 'Technology', sub_industry: 'Vertical SaaS' }
};

// Main
async function main() {
  console.log('Loading existing companies...');
  const existing = JSON.parse(fs.readFileSync(MERGED_FILE, 'utf-8'));
  const existingNames = new Set(existing.map(c => c.name?.toLowerCase()));
  console.log(`Loaded ${existing.length} existing companies`);
  
  let newCompanies = [];
  let duplicates = 0;
  
  // Process each research file
  const files = fs.readdirSync(RESEARCH_DIR).filter(f => f.endsWith('.md'));
  
  for (const file of files) {
    console.log(`\nProcessing ${file}...`);
    const content = fs.readFileSync(path.join(RESEARCH_DIR, file), 'utf-8');
    const companies = parseMarkdownTable(content);
    console.log(`  Found ${companies.length} companies in table`);
    
    const industryInfo = industryMap[file] || { industry: 'Technology', sub_industry: 'Other' };
    
    for (const company of companies) {
      const nameLower = company.name?.toLowerCase();
      if (nameLower && !existingNames.has(nameLower)) {
        existingNames.add(nameLower);
        newCompanies.push({
          ...company,
          ...industryInfo,
          confidence: 'medium',
          sources: ['eurocheck-research-2025-01']
        });
      } else {
        duplicates++;
      }
    }
  }
  
  console.log(`\n=== Summary ===`);
  console.log(`New companies to add: ${newCompanies.length}`);
  console.log(`Duplicates skipped: ${duplicates}`);
  
  // Merge
  const merged = [...existing, ...newCompanies];
  console.log(`Total after merge: ${merged.length}`);
  
  // Backup original
  const backupPath = MERGED_FILE.replace('.json', `-backup-${Date.now()}.json`);
  fs.copyFileSync(MERGED_FILE, backupPath);
  console.log(`Backup saved to: ${backupPath}`);
  
  // Write merged
  fs.writeFileSync(MERGED_FILE, JSON.stringify(merged, null, 2));
  console.log(`Merged file saved!`);
  
  return { added: newCompanies.length, total: merged.length };
}

main().then(result => {
  console.log(`\n✅ Done! Added ${result.added} companies. Total: ${result.total}`);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
