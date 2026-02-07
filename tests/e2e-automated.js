const puppeteer = require('puppeteer');
const path = require('path');

const EXTENSION_PATH = path.join(__dirname, 'dist/chrome');

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
  console.log('🧪 EuroCheck E2E Test - Chrome\n');
  
  const browser = await puppeteer.launch({
    headless: false,
    args: [
      `--disable-extensions-except=${EXTENSION_PATH}`,
      `--load-extension=${EXTENSION_PATH}`,
      '--no-first-run',
      '--no-default-browser-check',
    ]
  });

  // Wait for extension to load
  await new Promise(r => setTimeout(r, 2000));
  
  // Get extension ID from service worker
  const targets = await browser.targets();
  const swTarget = targets.find(t => t.type() === 'service_worker' && t.url().includes('chrome-extension://'));
  
  if (!swTarget) {
    console.log('❌ Extension service worker not found');
    await browser.close();
    return;
  }
  
  const extId = swTarget.url().split('/')[2];
  console.log(`✅ Extension: ${extId}\n`);

  const results = [];
  
  // Create a test page that can communicate with the extension
  const testPage = await browser.newPage();
  
  // Navigate to extension's background page context
  await testPage.goto(`chrome-extension://${extId}/popup/popup.html`);
  
  for (const test of TEST_CASES) {
    process.stdout.write(`${test.name.padEnd(15)} `);
    
    try {
      // Send message to background script via the popup page
      const result = await testPage.evaluate(async (domain) => {
        return new Promise((resolve) => {
          chrome.runtime.sendMessage(
            { type: 'GET_COMPANY_INFO', domain: domain },
            (response) => {
              resolve(response || { error: 'no response' });
            }
          );
          // Timeout after 5 seconds
          setTimeout(() => resolve({ error: 'timeout' }), 5000);
        });
      }, test.domain);

      if (result.error) {
        results.push({ ...test, detected: 'error', pass: false, error: result.error });
        console.log(`❌ ERROR: ${result.error}`);
      } else if (result.company) {
        const status = result.company.eu_status;
        const pass = status === test.expected;
        results.push({ ...test, detected: status, pass, company: result.company.name });
        console.log(pass ? `✅ ${status.toUpperCase().padEnd(7)} ${result.company.name}` : `❌ expected ${test.expected}, got ${status}`);
      } else {
        results.push({ ...test, detected: 'unknown', pass: false });
        console.log(`❌ NOT FOUND`);
      }
      
    } catch (err) {
      results.push({ ...test, detected: 'error', pass: false, error: err.message });
      console.log(`❌ ${err.message.substring(0, 40)}`);
    }
  }

  await browser.close();

  // Summary
  console.log('\n' + '─'.repeat(50));
  const passed = results.filter(r => r.pass).length;
  const failed = results.length - passed;
  
  console.log(`\n✅ Passed: ${passed}/${results.length}`);
  if (failed > 0) {
    console.log(`❌ Failed: ${failed}/${results.length}\n`);
    results.filter(r => !r.pass).forEach(r => {
      console.log(`   ${r.name}: expected ${r.expected}, got ${r.detected}`);
    });
  }
  
  return passed === results.length ? 0 : 1;
}

runTests().then(code => process.exit(code)).catch(e => {
  console.error(e);
  process.exit(1);
});
