const puppeteer = require('puppeteer');
const path = require('path');

const EXTENSION_PATH = path.join(__dirname, 'dist/chrome');

const TEST_CASES = [
  // EU Companies
  { url: 'https://www.zalando.com', expected: 'eu', name: 'Zalando', country: 'DE' },
  { url: 'https://www.spotify.com', expected: 'eu', name: 'Spotify', country: 'SE' },
  { url: 'https://www.nokia.com', expected: 'eu', name: 'Nokia', country: 'FI' },
  // Non-EU Companies
  { url: 'https://www.amazon.com', expected: 'non-eu', name: 'Amazon', country: 'US' },
  { url: 'https://www.amazon.de', expected: 'non-eu', name: 'Amazon', country: 'US' },
  { url: 'https://www.google.com', expected: 'non-eu', name: 'Google', country: 'US' },
  // Mixed
  { url: 'https://www.wolt.com', expected: 'mixed', name: 'Wolt', country: 'FI' },
];

async function runTests() {
  console.log('🧪 EuroCheck UAT - Launching Chrome with extension...\n');
  
  const browser = await puppeteer.launch({
    headless: false,
    args: [
      `--disable-extensions-except=${EXTENSION_PATH}`,
      `--load-extension=${EXTENSION_PATH}`,
      '--no-first-run',
      '--no-default-browser-check',
    ]
  });

  // Wait for extension to load and get its ID
  await new Promise(r => setTimeout(r, 2000));
  
  // Find extension ID from service worker
  const targets = await browser.targets();
  const extTarget = targets.find(t => t.type() === 'service_worker' && t.url().includes('chrome-extension://'));
  
  if (!extTarget) {
    console.log('❌ Extension not found!');
    await browser.close();
    return;
  }
  
  const extId = extTarget.url().split('/')[2];
  console.log(`✅ Extension loaded: ${extId}\n`);

  const results = [];
  const page = await browser.newPage();

  for (const test of TEST_CASES) {
    process.stdout.write(`Testing ${test.name} (${test.url})... `);
    
    try {
      await page.goto(test.url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await new Promise(r => setTimeout(r, 2000));

      // Get current tab ID
      const tabId = await page.evaluate(() => {
        return new Promise(resolve => {
          chrome.tabs?.query({ active: true, currentWindow: true }, tabs => {
            resolve(tabs?.[0]?.id || null);
          });
        });
      }).catch(() => null);

      // Open popup page to check results
      const popupPage = await browser.newPage();
      await popupPage.goto(`chrome-extension://${extId}/popup/popup.html`);
      await new Promise(r => setTimeout(r, 1500));

      const state = await popupPage.evaluate(() => {
        const statusText = document.getElementById('status-text')?.textContent?.toLowerCase() || '';
        const companyName = document.getElementById('company-name')?.textContent || '';
        const countryEl = document.getElementById('company-country');
        const loading = !document.getElementById('loading')?.classList.contains('hidden');
        const unknown = !document.getElementById('unknown-state')?.classList.contains('hidden');
        const error = !document.getElementById('error-state')?.classList.contains('hidden');
        
        return { statusText, companyName, loading, unknown, error };
      });

      await popupPage.close();

      let detected = 'unknown';
      if (state.statusText.includes('eu company') || state.statusText.includes('european')) detected = 'eu';
      else if (state.statusText.includes('non-eu') || state.statusText.includes('non-european')) detected = 'non-eu';
      else if (state.statusText.includes('mixed')) detected = 'mixed';
      else if (state.unknown) detected = 'unknown';

      const pass = detected === test.expected || 
                   (test.expected === 'mixed' && (detected === 'eu' || detected === 'mixed'));
      
      results.push({ ...test, detected, state, pass });
      console.log(pass ? '✅ PASS' : `❌ FAIL (got: ${detected})`);
      
    } catch (err) {
      results.push({ ...test, detected: 'error', error: err.message, pass: false });
      console.log(`❌ ERROR: ${err.message}`);
    }
  }

  await browser.close();

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('RESULTS SUMMARY');
  console.log('='.repeat(50));
  
  const passed = results.filter(r => r.pass).length;
  const failed = results.filter(r => !r.pass).length;
  
  console.log(`\n✅ Passed: ${passed}/${results.length}`);
  console.log(`❌ Failed: ${failed}/${results.length}`);
  
  if (failed > 0) {
    console.log('\nFailed tests:');
    results.filter(r => !r.pass).forEach(r => {
      console.log(`  - ${r.name}: expected ${r.expected}, got ${r.detected}`);
    });
  }
  
  return results;
}

runTests().catch(console.error);
