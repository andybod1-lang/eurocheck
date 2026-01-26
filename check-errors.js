const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.connect({
    browserURL: 'http://127.0.0.1:9333'
  });
  
  // Go to extension's service worker page
  const page = await browser.newPage();
  await page.goto('chrome://extensions');
  await new Promise(r => setTimeout(r, 1000));
  
  // Enable developer mode and click on errors
  const devMode = await page.evaluate(() => {
    const toggle = document.querySelector('extensions-manager')?.shadowRoot
      ?.querySelector('extensions-toolbar')?.shadowRoot
      ?.querySelector('#devMode');
    if (toggle && !toggle.checked) toggle.click();
    return toggle?.checked;
  });
  console.log('Dev mode:', devMode);
  
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: 'ext-devmode.png' });
  
  await browser.disconnect();
})();
