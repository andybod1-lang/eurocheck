const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.connect({
    browserURL: 'http://127.0.0.1:9333'
  });
  
  const extId = 'njoampcgeccjegcgjlcagpfoaomphdmj';
  
  // Test 1: Subdomain fallback (drive.google.com should show Google)
  const popup1 = await browser.newPage();
  await popup1.goto(`chrome-extension://${extId}/popup/popup.html?domain=drive.google.com`);
  await new Promise(r => setTimeout(r, 2500));
  
  const result1 = await popup1.evaluate(() => ({
    company: document.getElementById('company-name')?.textContent,
    status: document.getElementById('status-text')?.textContent,
    isCompanyVisible: !document.getElementById('company-info')?.classList.contains('hidden')
  }));
  console.log('Test 1 - drive.google.com:', JSON.stringify(result1));
  await popup1.screenshot({ path: 'test-subdomain.png' });
  
  // Test 2: i18n fallbacks (check status text is readable)
  const popup2 = await browser.newPage();
  await popup2.goto(`chrome-extension://${extId}/popup/popup.html?domain=spotify.com`);
  await new Promise(r => setTimeout(r, 2500));
  
  const result2 = await popup2.evaluate(() => ({
    company: document.getElementById('company-name')?.textContent,
    status: document.getElementById('status-text')?.textContent,
    confidence: document.getElementById('confidence')?.textContent
  }));
  console.log('Test 2 - spotify.com:', JSON.stringify(result2));
  await popup2.screenshot({ path: 'test-i18n.png' });
  
  await browser.disconnect();
  console.log('Done!');
})();
