const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.connect({
    browserURL: 'http://127.0.0.1:9333'
  });
  
  // Screenshot extensions page
  const pages = await browser.pages();
  let extPage = pages.find(p => p.url().includes('extensions'));
  if (extPage) {
    await extPage.bringToFront();
    await extPage.reload();
    await new Promise(r => setTimeout(r, 1500));
    await extPage.screenshot({ path: 'ext-final.png' });
    console.log('Extensions page saved');
  }
  
  // Go to Amazon and test
  const amazonPage = pages.find(p => p.url().includes('amazon'));
  if (amazonPage) {
    await amazonPage.bringToFront();
    await amazonPage.reload();
    await new Promise(r => setTimeout(r, 3000));
    console.log('Amazon reloaded');
  }
  
  await browser.disconnect();
})();
