const puppeteer = require('puppeteer');
const path = require('path');

const EXTENSION_PATH = path.join(__dirname, 'dist/firefox');

const TEST_CASES = [
  { domain: 'zalando.com', expected: 'eu', name: 'Zalando' },
  { domain: 'spotify.com', expected: 'eu', name: 'Spotify' },
  { domain: 'nokia.com', expected: 'eu', name: 'Nokia' },
  { domain: 'amazon.com', expected: 'non-eu', name: 'Amazon US' },
  { domain: 'amazon.de', expected: 'non-eu', name: 'Amazon DE' },
  { domain: 'google.com', expected: 'non-eu', name: 'Google' },
  { domain: 'wolt.com', expected: 'eu', name: 'Wolt' },
  { domain: 'klarna.com', expected: 'eu', name: 'Klarna' },
  { domain: 'temu.com', expected: 'non-eu', name: 'Temu' },
  { domain: 'hm.com', expected: 'eu', name: 'H&M' },
];

async function runTests() {
  console.log('🧪 EuroCheck E2E Test - Firefox\n');
  
  // Firefox requires different setup
  const browser = await puppeteer.launch({
    product: 'firefox',
    headless: false,
    args: ['--no-remote'],
    // Firefox temporary extensions need to be loaded differently
  });

  console.log('⚠️  Firefox Puppeteer doesn\'t support extension loading directly.');
  console.log('   Testing data file directly instead...\n');
  
  // For Firefox, we'll test the data file directly
  const fs = require('fs');
  const domainIndex = JSON.parse(
    fs.readFileSync(path.join(EXTENSION_PATH, 'data', 'domain-index.json'), 'utf8')
  );
  
  let passed = 0;
  
  for (const test of TEST_CASES) {
    const entry = domainIndex[test.domain];
    const status = entry?.s === 1 ? 'eu' : entry?.s === 2 ? 'european' : entry?.s === 0 ? 'non-eu' : 'unknown';
    const pass = status === test.expected;
    
    if (pass) {
      console.log(`✅ ${test.name.padEnd(15)} ${status.toUpperCase().padEnd(7)} ${entry?.n || 'N/A'}`);
      passed++;
    } else {
      console.log(`❌ ${test.name.padEnd(15)} expected ${test.expected}, got ${status}`);
    }
  }

  await browser.close();

  console.log('\n' + '─'.repeat(50));
  console.log(`\n✅ Firefox data: ${passed}/${TEST_CASES.length} passed`);
  
  return passed === TEST_CASES.length ? 0 : 1;
}

runTests().then(code => process.exit(code)).catch(e => {
  console.error(e);
  process.exit(1);
});
