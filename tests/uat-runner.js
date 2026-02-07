const puppeteer = require('puppeteer');
const path = require('path');

const EXTENSION_PATH = path.join(__dirname, 'dist/chrome');

const TEST_CASES = [
  { url: 'https://www.zalando.com', expected: 'eu', name: 'Zalando' },
  { url: 'https://www.spotify.com', expected: 'eu', name: 'Spotify' },
  { url: 'https://www.nokia.com', expected: 'eu', name: 'Nokia' },
  { url: 'https://www.amazon.com', expected: 'non-eu', name: 'Amazon US' },
  { url: 'https://www.amazon.de', expected: 'non-eu', name: 'Amazon DE' },
  { url: 'https://www.google.com', expected: 'non-eu', name: 'Google' },
  { url: 'https://www.wolt.com', expected: 'mixed', name: 'Wolt' },
];

(async () => {
  console.log('🧪 EuroCheck UAT - Chrome\n');
  
  const browser = await puppeteer.launch({
    headless: false,
    args: [
      `--disable-extensions-except=${EXTENSION_PATH}`,
      `--load-extension=${EXTENSION_PATH}`,
      '--no-first-run',
      '--no-default-browser-check',
    ]
  });

  await new Promise(r => setTimeout(r, 2000));
  
  const targets = await browser.targets();
  const extTarget = targets.find(t => t.type() === 'service_worker');
  const extId = extTarget?.url()?.split('/')[2];
  
  if (!extId) {
    console.log('❌ Extension not found');
    await browser.close();
    return;
  }
  
  console.log(`✅ Extension: ${extId}\n`);

  const results = [];
  const page = await browser.newPage();

  for (const test of TEST_CASES) {
    process.stdout.write(`${test.name.padEnd(15)} `);
    
    try {
      // Navigate to the test URL
      await page.goto(test.url, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await new Promise(r => setTimeout(r, 1500));

      // Use page.evaluate to click extension popup and get state
      // Actually, let's query the background worker directly
      const swTarget = await browser.waitForTarget(
        t => t.type() === 'service_worker' && t.url().includes(extId),
        { timeout: 5000 }
      );
      const sw = await swTarget.worker();
      
      // Extract domain from URL
      const domain = new URL(test.url).hostname.replace('www.', '');
      
      // Query the service worker
      const result = await sw.evaluate(async (domain) => {
        // Access the database directly
        const data = await import('./data/companies-min.json', { assert: { type: 'json' } }).catch(() => null);
        if (!data) return { error: 'no data' };
        
        const company = data.default?.find(c => 
          c.id === domain || 
          c.domains?.includes(domain) ||
          c.id?.includes(domain.split('.')[0])
        );
        
        return company || { notFound: true, domain };
      }, domain).catch(e => ({ error: e.message }));

      if (result.error || result.notFound) {
        // Fallback: check via the popup
        const popupPage = await browser.newPage();
        await popupPage.goto(`chrome-extension://${extId}/popup/popup.html`);
        await new Promise(r => setTimeout(r, 1500));
        
        const popupState = await popupPage.evaluate(() => {
          return {
            status: document.getElementById('status-text')?.textContent || '',
            company: document.getElementById('company-name')?.textContent || '',
            loading: !document.getElementById('loading')?.classList.contains('hidden'),
            unknown: !document.getElementById('unknown-state')?.classList.contains('hidden'),
          };
        });
        await popupPage.close();
        
        let detected = 'unknown';
        const statusLower = popupState.status.toLowerCase();
        if (statusLower.includes('european company') && !statusLower.includes('non')) detected = 'eu';
        else if (statusLower.includes('non-european')) detected = 'non-eu';
        else if (statusLower.includes('mixed')) detected = 'mixed';
        
        const pass = detected === test.expected || 
                     (test.expected === 'mixed' && detected !== 'unknown');
        
        results.push({ ...test, detected, pass, via: 'popup' });
        console.log(pass ? `✅ ${detected.toUpperCase()}` : `❌ got ${detected}`);
      } else {
        const detected = result.eu_status || 'unknown';
        const pass = detected === test.expected || 
                     (test.expected === 'mixed' && detected !== 'unknown');
        results.push({ ...test, detected, pass, company: result.name, via: 'db' });
        console.log(pass ? `✅ ${detected.toUpperCase()} (${result.name})` : `❌ got ${detected}`);
      }
      
    } catch (err) {
      results.push({ ...test, detected: 'error', pass: false, error: err.message });
      console.log(`❌ ERROR: ${err.message.substring(0, 50)}`);
    }
  }

  await browser.close();

  // Summary
  console.log('\n' + '─'.repeat(40));
  const passed = results.filter(r => r.pass).length;
  console.log(`Results: ${passed}/${results.length} passed`);
  
  if (passed < results.length) {
    console.log('\nFailed:');
    results.filter(r => !r.pass).forEach(r => {
      console.log(`  ${r.name}: expected ${r.expected}, got ${r.detected}`);
    });
  }
})();
