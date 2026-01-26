const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.connect({
    browserURL: 'http://127.0.0.1:9333'
  });
  
  const pages = await browser.pages();
  let extPage = pages.find(p => p.url().includes('extensions'));
  if (!extPage) {
    extPage = await browser.newPage();
    await extPage.goto('chrome://extensions');
  }
  await extPage.bringToFront();
  await new Promise(r => setTimeout(r, 1000));
  
  // Enable developer mode
  const devEnabled = await extPage.evaluate(() => {
    const mgr = document.querySelector('extensions-manager');
    const toolbar = mgr?.shadowRoot?.querySelector('extensions-toolbar');
    const toggle = toolbar?.shadowRoot?.querySelector('#devMode');
    if (toggle && !toggle.checked) {
      toggle.click();
      return 'enabled dev mode';
    }
    return toggle?.checked ? 'already on' : 'not found';
  });
  console.log('Dev mode:', devEnabled);
  await new Promise(r => setTimeout(r, 500));
  
  // Enable the EuroCheck extension
  const extEnabled = await extPage.evaluate(() => {
    const mgr = document.querySelector('extensions-manager');
    const itemsList = mgr?.shadowRoot?.querySelector('extensions-item-list');
    const items = itemsList?.shadowRoot?.querySelectorAll('extensions-item');
    
    for (const item of items || []) {
      const name = item.shadowRoot?.querySelector('#name')?.textContent;
      if (name?.includes('EuroCheck')) {
        const toggle = item.shadowRoot?.querySelector('cr-toggle');
        if (toggle && !toggle.checked) {
          toggle.click();
          return 'enabled extension';
        }
        return toggle?.checked ? 'already enabled' : 'toggle not found';
      }
    }
    return 'extension not found';
  });
  console.log('Extension:', extEnabled);
  
  await new Promise(r => setTimeout(r, 1000));
  await extPage.screenshot({ path: 'ext-enabled.png' });
  console.log('Screenshot saved');
  
  await browser.disconnect();
})();
