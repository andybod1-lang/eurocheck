const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.connect({
    browserURL: 'http://127.0.0.1:9333'
  });
  
  // Go to Amazon first
  const pages = await browser.pages();
  let amazonPage = pages.find(p => p.url().includes('amazon'));
  
  if (!amazonPage) {
    amazonPage = await browser.newPage();
    await amazonPage.goto('https://amazon.de');
  }
  await amazonPage.bringToFront();
  await new Promise(r => setTimeout(r, 2000));
  
  // Now open popup in context of this tab
  const popupPage = await browser.newPage();
  popupPage.on('console', m => console.log('POPUP:', m.text()));
  popupPage.on('pageerror', e => console.log('POPUP ERROR:', e.message));
  
  await popupPage.goto('chrome-extension://njoampcgeccjegcgjlcagpfoaomphdmj/popup/popup.html');
  await new Promise(r => setTimeout(r, 2000));
  
  // Get popup content
  const content = await popupPage.evaluate(() => document.body.innerText);
  console.log('Popup content:', content);
  
  await popupPage.screenshot({ path: 'popup-live.png' });
  console.log('Screenshot saved');
  
  await browser.disconnect();
})();
