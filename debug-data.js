const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.connect({
    browserURL: 'http://127.0.0.1:9333'
  });
  
  const targets = await browser.targets();
  const swTarget = targets.find(t => t.url().includes('background.js'));
  
  if (swTarget) {
    console.log('Found service worker');
    const worker = await swTarget.worker();
    
    if (worker) {
      // Try to manually load data and see what happens
      const result = await worker.evaluate(async () => {
        try {
          const url = chrome.runtime.getURL('data/companies.json');
          console.log('Fetching:', url);
          const response = await fetch(url);
          const data = await response.json();
          return { success: true, count: data.length, sample: data[0]?.name };
        } catch (e) {
          return { error: e.message, stack: e.stack };
        }
      });
      console.log('Load result:', JSON.stringify(result, null, 2));
    }
  } else {
    console.log('Service worker not found');
  }
  
  await browser.disconnect();
})();
