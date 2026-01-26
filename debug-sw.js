const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.connect({
    browserURL: 'http://127.0.0.1:9333'
  });
  
  // Get service worker target
  const targets = await browser.targets();
  console.log('All targets:');
  targets.forEach(t => console.log(`  ${t.type()}: ${t.url()}`));
  
  // Find background/service worker
  const swTarget = targets.find(t => 
    t.type() === 'service_worker' || 
    t.url().includes('background.js')
  );
  
  if (swTarget) {
    console.log('\nService worker found:', swTarget.url());
  }
  
  // Open extension errors page
  const page = await browser.newPage();
  page.on('console', m => console.log('PAGE:', m.text()));
  
  // Go to extension details to see errors
  await page.goto('chrome://extensions/?id=njoampcgeccjegcgjlcagpfoaomphdmj');
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: 'ext-details.png' });
  
  await browser.disconnect();
})();
