const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync('./data/companies-min.json', 'utf8'));

// Build domain index
const domainMap = new Map();
for (const company of data) {
  domainMap.set(company.id, company);
  if (company.id.includes('.')) {
    // Also index without TLD for common domains
    const base = company.id.split('.')[0];
    if (!domainMap.has(base)) domainMap.set(base, company);
  }
}

const TEST_CASES = [
  { domain: 'zalando.com', expected: 'eu', expectedName: 'Zalando' },
  { domain: 'spotify.com', expected: 'eu', expectedName: 'Spotify' },
  { domain: 'nokia.com', expected: 'eu', expectedName: 'Nokia' },
  { domain: 'amazon.com', expected: 'non-eu', expectedName: 'Amazon' },
  { domain: 'amazon.de', expected: 'non-eu', expectedName: 'Amazon' },
  { domain: 'google.com', expected: 'non-eu', expectedName: 'Google' },
  { domain: 'wolt.com', expected: 'mixed', expectedName: 'Wolt' },
  { domain: 'bol.com', expected: 'eu', expectedName: 'Bol.com' },
  { domain: 'klarna.com', expected: 'eu', expectedName: 'Klarna' },
  { domain: 'temu.com', expected: 'non-eu', expectedName: 'Temu' },
];

console.log('🧪 EuroCheck Database Test\n');
console.log(`Database: ${data.length} companies\n`);

let passed = 0;
let failed = 0;

for (const test of TEST_CASES) {
  const lookup = test.domain.replace('www.', '');
  const company = domainMap.get(lookup) || 
                  data.find(c => c.id === lookup || c.id.startsWith(lookup.split('.')[0]));
  
  if (!company) {
    console.log(`❌ ${test.domain.padEnd(20)} NOT FOUND`);
    failed++;
    continue;
  }
  
  const status = company.eu_status;
  const pass = status === test.expected || 
               (test.expected === 'mixed' && ['eu', 'mixed', 'european'].includes(status));
  
  if (pass) {
    console.log(`✅ ${test.domain.padEnd(20)} ${status.padEnd(8)} ${company.name}`);
    passed++;
  } else {
    console.log(`❌ ${test.domain.padEnd(20)} expected ${test.expected}, got ${status} (${company.name})`);
    failed++;
  }
}

console.log('\n' + '─'.repeat(50));
console.log(`Results: ${passed}/${TEST_CASES.length} passed`);

if (failed > 0) process.exit(1);
