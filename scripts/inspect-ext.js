const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.connect({
    browserURL: 'http://127.0.0.1:9333'
  });
  
  // Open the service worker inspector
  const page = await browser.newPage();
  page.on('console', m => console.log('CONSOLE:', m.text()));
  page.on('pageerror', e => console.log('ERROR:', e.message));
  
  // Navigate to inspect page for the extension
  await page.goto('chrome://inspect/#service-workers');
  await new Promise(r => setTimeout(r, 2000));
  
  const content = await page.evaluate(() => document.body.innerText);
  console.log('Inspect page content:');
  console.log(content.slice(0, 1500));
  
  await browser.disconnect();
})();
