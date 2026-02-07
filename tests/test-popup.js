const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.connect({
    browserURL: 'http://127.0.0.1:9333'
  });
  
  // Open the extension popup directly
  const popupUrl = 'chrome-extension://njoampcgeccjegcgjlcagpfoaomphdmj/popup/popup.html';
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('POPUP:', msg.text()));
  page.on('pageerror', err => console.log('POPUP ERROR:', err.message));
  
  await page.goto(popupUrl);
  await new Promise(r => setTimeout(r, 2000));
  
  await page.screenshot({ path: 'popup-test.png', fullPage: true });
  console.log('Popup screenshot saved');
  
  await browser.disconnect();
})();
