const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.connect({
    browserURL: 'http://127.0.0.1:9333'
  });
  
  // Go to extensions page
  const pages = await browser.pages();
  let extPage = pages.find(p => p.url().includes('extensions'));
  if (!extPage) {
    extPage = await browser.newPage();
    await extPage.goto('chrome://extensions');
  }
  await extPage.bringToFront();
  await new Promise(r => setTimeout(r, 1000));
  
  // Enable dev mode first
  await extPage.evaluate(() => {
    const mgr = document.querySelector('extensions-manager');
    const toolbar = mgr?.shadowRoot?.querySelector('extensions-toolbar');
    const toggle = toolbar?.shadowRoot?.querySelector('#devMode');
    if (toggle && !toggle.checked) toggle.click();
  });
  await new Promise(r => setTimeout(r, 500));
  
  // Click reload on EuroCheck extension
  await extPage.evaluate(() => {
    const mgr = document.querySelector('extensions-manager');
    const itemsList = mgr?.shadowRoot?.querySelector('extensions-item-list');
    const items = itemsList?.shadowRoot?.querySelectorAll('extensions-item');
    
    for (const item of items || []) {
      const name = item.shadowRoot?.querySelector('#name')?.textContent;
      if (name?.includes('EuroCheck')) {
        const reloadBtn = item.shadowRoot?.querySelector('#dev-reload-button');
        if (reloadBtn) {
          reloadBtn.click();
          return 'reloaded';
        }
        return 'no reload button';
      }
    }
    return 'not found';
  });
  
  console.log('Extension reloaded');
  await new Promise(r => setTimeout(r, 1000));
  
  // Now test on Amazon
  const amazonPage = pages.find(p => p.url().includes('amazon'));
  if (amazonPage) {
    await amazonPage.bringToFront();
    await amazonPage.reload();
    await new Promise(r => setTimeout(r, 2000));
    
    // Take screenshot of popup
    const popupUrl = 'chrome-extension://njoampcgeccjegcgjlcagpfoaomphdmj/popup/popup.html';
    const popupPage = await browser.newPage();
    popupPage.on('console', m => console.log('POPUP:', m.text()));
    await popupPage.goto(popupUrl);
    await new Promise(r => setTimeout(r, 2000));
    await popupPage.screenshot({ path: 'popup-amazon.png' });
    console.log('Popup screenshot saved');
  }
  
  await browser.disconnect();
})();
