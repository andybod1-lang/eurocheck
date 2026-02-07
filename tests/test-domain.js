const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.connect({
    browserURL: 'http://127.0.0.1:9333'
  });
  
  // Wait for extension to load
  await new Promise(r => setTimeout(r, 2000));
  
  // Get extension ID from targets
  const targets = await browser.targets();
  const extTarget = targets.find(t => t.url().includes('chrome-extension://') && t.url().includes('background'));
  const extId = extTarget?.url().match(/chrome-extension:\/\/([^/]+)/)?.[1] || 'njoampcgeccjegcgjlcagpfoaomphdmj';
  console.log('Extension ID:', extId);
  
  // Test with amazon.de (non-EU)
  const popup1 = await browser.newPage();
  popup1.on('console', m => console.log('Amazon:', m.text()));
  await popup1.goto(`chrome-extension://${extId}/popup/popup.html?domain=amazon.de`);
  await new Promise(r => setTimeout(r, 3000));
  
  const amazon = await popup1.evaluate(() => ({
    company: !document.getElementById('company-info')?.classList.contains('hidden'),
    name: document.getElementById('company-name')?.textContent,
    status: document.getElementById('status-text')?.textContent,
    unknown: document.getElementById('unknown-domain')?.textContent
  }));
  console.log('Amazon result:', JSON.stringify(amazon));
  await popup1.screenshot({ path: 'test-amazon.png' });
  
  // Test with spotify.com (EU)
  const popup2 = await browser.newPage();
  popup2.on('console', m => console.log('Spotify:', m.text()));
  await popup2.goto(`chrome-extension://${extId}/popup/popup.html?domain=spotify.com`);
  await new Promise(r => setTimeout(r, 3000));
  
  const spotify = await popup2.evaluate(() => ({
    company: !document.getElementById('company-info')?.classList.contains('hidden'),
    name: document.getElementById('company-name')?.textContent,
    status: document.getElementById('status-text')?.textContent,
    unknown: document.getElementById('unknown-domain')?.textContent
  }));
  console.log('Spotify result:', JSON.stringify(spotify));
  await popup2.screenshot({ path: 'test-spotify.png' });
  
  await browser.disconnect();
})();
