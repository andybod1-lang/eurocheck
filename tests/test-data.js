const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.connect({
    browserURL: 'http://127.0.0.1:9333'
  });
  
  // Check if data files are loading
  const page = await browser.newPage();
  page.on('console', m => console.log('Console:', m.text()));
  
  await page.goto('chrome-extension://njoampcgeccjegcgjlcagpfoaomphdmj/popup/popup.html?domain=google.com');
  await new Promise(r => setTimeout(r, 3000));
  
  const state = await page.evaluate(() => {
    return {
      loading: !document.getElementById('loading')?.classList.contains('hidden'),
      company: !document.getElementById('company-info')?.classList.contains('hidden'),
      unknown: !document.getElementById('unknown-state')?.classList.contains('hidden'),
      error: !document.getElementById('error-state')?.classList.contains('hidden'),
      companyName: document.getElementById('company-name')?.textContent,
      statusText: document.getElementById('status-text')?.textContent,
      unknownText: document.getElementById('unknown-domain')?.textContent
    };
  });
  
  console.log('State:', JSON.stringify(state, null, 2));
  await page.screenshot({ path: 'test-debug.png' });
  
  await browser.disconnect();
})();
