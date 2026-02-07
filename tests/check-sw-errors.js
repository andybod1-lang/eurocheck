const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.connect({
    browserURL: 'http://127.0.0.1:9333'
  });
  
  // Get all targets
  const targets = await browser.targets();
  const swTarget = targets.find(t => t.url().includes('background.js'));
  
  if (swTarget) {
    console.log('Found service worker:', swTarget.url());
    const worker = await swTarget.worker();
    if (worker) {
      // Get console logs
      worker.on('console', msg => console.log('SW LOG:', msg.text()));
      worker.on('pageerror', err => console.log('SW ERROR:', err.message));
      
      // Evaluate to check for errors
      try {
        const result = await worker.evaluate(() => {
          return {
            hasChrome: typeof chrome !== 'undefined',
            hasRuntime: typeof chrome?.runtime !== 'undefined',
            hasStorage: typeof chrome?.storage !== 'undefined'
          };
        });
        console.log('Worker state:', result);
      } catch (e) {
        console.log('Eval error:', e.message);
      }
    }
  } else {
    console.log('Service worker not found');
  }
  
  await new Promise(r => setTimeout(r, 1000));
  await browser.disconnect();
})();
