const fs = require('fs');
const domainIndex = JSON.parse(fs.readFileSync('./data/domain-index.json', 'utf8'));

const TEST_CASES = [
  { domain: 'zalando.com', expected: 1, name: 'Zalando' },
  { domain: 'spotify.com', expected: 1, name: 'Spotify' },
  { domain: 'nokia.com', expected: 1, name: 'Nokia' },
  { domain: 'amazon.com', expected: 0, name: 'Amazon' },
  { domain: 'amazon.de', expected: 0, name: 'Amazon' },
  { domain: 'google.com', expected: 0, name: 'Google' },
  { domain: 'wolt.com', expected: 1, name: 'Wolt' },
  { domain: 'bol.com', expected: 1, name: 'Bol.com' },
  { domain: 'klarna.com', expected: 1, name: 'Klarna' },
  { domain: 'temu.com', expected: 0, name: 'Temu' },
  { domain: 'booking.com', expected: null, name: 'Booking (mixed)' },
  { domain: 'hm.com', expected: 1, name: 'H&M' },
  { domain: 'zara.com', expected: 1, name: 'Zara' },
  { domain: 'microsoft.com', expected: 0, name: 'Microsoft' },
  { domain: 'apple.com', expected: 0, name: 'Apple' },
];

console.log('🧪 Domain Index Test\n');
console.log(`Index size: ${Object.keys(domainIndex).length} domains\n`);

let passed = 0;

for (const test of TEST_CASES) {
  const entry = domainIndex[test.domain];
  const status = entry?.s;
  const statusText = status === 1 ? 'EU' : status === 2 ? 'EUR' : status === 0 ? 'non-EU' : 'MISSING';
  
  // For mixed/null expected, just check it exists
  const pass = test.expected === null ? !!entry : status === test.expected;
  
  if (pass) {
    console.log(`✅ ${test.domain.padEnd(18)} ${statusText.padEnd(7)} ${entry?.n || 'N/A'}`);
    passed++;
  } else {
    console.log(`❌ ${test.domain.padEnd(18)} expected ${test.expected}, got ${status} (${entry?.n || 'N/A'})`);
  }
}

console.log('\n' + '─'.repeat(50));
console.log(`Results: ${passed}/${TEST_CASES.length} passed`);
