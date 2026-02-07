const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.connect({
    browserURL: 'http://127.0.0.1:9333'
  });
  
  const pages = await browser.pages();
  const extPage = pages.find(p => p.url().includes('extensions'));
  
  if (extPage) {
    await extPage.bringToFront();
    await new Promise(r => setTimeout(r, 1000));
    await extPage.screenshot({ path: 'extensions-page.png' });
    console.log('Screenshot saved');
  }
  
  // Also screenshot amazon page to see toolbar
  const amazonPage = pages.find(p => p.url().includes('amazon'));
  if (amazonPage) {
    await amazonPage.bringToFront();
    await new Promise(r => setTimeout(r, 500));
    await amazonPage.screenshot({ path: 'amazon-page.png' });
    console.log('Amazon screenshot saved');
  }
  
  await browser.disconnect();
})();
