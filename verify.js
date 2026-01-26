const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.connect({
    browserURL: 'http://127.0.0.1:9333'
  });
  
  // Open extensions page
  const extPage = await browser.newPage();
  await extPage.goto('chrome://extensions');
  await new Promise(r => setTimeout(r, 1500));
  await extPage.screenshot({ path: 'verify-ext.png' });
  console.log('Extensions screenshot saved');
  
  // Check Amazon page
  const pages = await browser.pages();
  const amazonPage = pages.find(p => p.url().includes('amazon'));
  if (amazonPage) {
    await amazonPage.bringToFront();
    await new Promise(r => setTimeout(r, 1000));
    console.log('On Amazon page');
  }
  
  await browser.disconnect();
})();
