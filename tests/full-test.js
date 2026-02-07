const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.connect({
    browserURL: 'http://127.0.0.1:9333'
  });
  
  // Go to Amazon
  const pages = await browser.pages();
  let amazonPage = pages.find(p => p.url().includes('amazon'));
  if (!amazonPage) {
    amazonPage = await browser.newPage();
  }
  await amazonPage.goto('https://amazon.de', { waitUntil: 'networkidle2' });
  await amazonPage.bringToFront();
  console.log('On Amazon.de');
  
  // Wait for extension to process
  await new Promise(r => setTimeout(r, 3000));
  
  // Now simulate opening popup by injecting into extension context
  // Get the popup page that's already open or create new one
  const popupUrl = 'chrome-extension://njoampcgeccjegcgjlcagpfoaomphdmj/popup/popup.html';
  
  // Close any existing popup pages first
  for (const p of await browser.pages()) {
    if (p.url().includes('popup.html')) await p.close();
  }
  
  // Open popup - but we need to simulate the correct context
  // Let's use executeScript in the Amazon page to message the background
  const result = await amazonPage.evaluate(async () => {
    return new Promise((resolve) => {
      // Try to get extension ID and send message
      try {
        chrome.runtime.sendMessage(
          'njoampcgeccjegcgjlcagpfoaomphdmj',
          { type: 'GET_COMPANY_INFO', domain: 'amazon.de' },
          (response) => {
            resolve(response || { error: 'no response' });
          }
        );
        // Timeout fallback
        setTimeout(() => resolve({ error: 'timeout' }), 2000);
      } catch (e) {
        resolve({ error: e.message });
      }
    });
  });
  console.log('Direct message result:', result);
  
  // Alternative: check via background page evaluation
  const targets = await browser.targets();
  const swTarget = targets.find(t => t.url().includes('background.js'));
  
  if (swTarget) {
    const worker = await swTarget.worker();
    if (worker) {
      const data = await worker.evaluate(() => {
        // Access the lookupCache or test the lookup
        return {
          companiesLoaded: typeof companiesData !== 'undefined' && companiesData?.length,
          domainsLoaded: typeof domainsData !== 'undefined' && domainsData?.domains?.length,
          cacheSize: typeof lookupCache !== 'undefined' ? lookupCache.size : 0
        };
      }).catch(e => ({ error: e.message }));
      console.log('Service worker state:', data);
    }
  }
  
  await browser.disconnect();
})();
