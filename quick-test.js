const puppeteer = require('puppeteer');
const path = require('path');

const EXTENSION_PATH = path.join(__dirname, 'dist/chrome');

(async () => {
  console.log('Launching Chrome with extension...');
  
  const browser = await puppeteer.launch({
    headless: false,
    args: [
      `--disable-extensions-except=${EXTENSION_PATH}`,
      `--load-extension=${EXTENSION_PATH}`,
      '--no-first-run',
    ]
  });

  await new Promise(r => setTimeout(r, 2000));
  
  // Find extension
  const targets = await browser.targets();
  const extTarget = targets.find(t => t.type() === 'service_worker');
  
  if (!extTarget) {
    console.log('No service worker found. Targets:', targets.map(t => t.type()));
    await browser.close();
    return;
  }
  
  const extId = extTarget.url().split('/')[2];
  console.log('Extension ID:', extId);

  const page = await browser.newPage();
  console.log('Navigating to amazon.de...');
  await page.goto('https://amazon.de', { waitUntil: 'domcontentloaded', timeout: 30000 });
  console.log('Page loaded');
  
  await new Promise(r => setTimeout(r, 2000));

  // Open popup directly
  console.log('Opening popup...');
  const popupPage = await browser.newPage();
  await popupPage.goto(`chrome-extension://${extId}/popup/popup.html`);
  await new Promise(r => setTimeout(r, 2000));

  const html = await popupPage.content();
  console.log('Popup HTML length:', html.length);
  
  const text = await popupPage.evaluate(() => document.body.innerText);
  console.log('Popup text:', text.substring(0, 500));

  await popupPage.screenshot({ path: '/tmp/eurocheck-popup.png' });
  console.log('Screenshot saved to /tmp/eurocheck-popup.png');

  await browser.close();
  console.log('Done!');
})();
