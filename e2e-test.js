const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.connect({
    browserURL: 'http://127.0.0.1:9333'
  });
  
  // Create a new page and go to Amazon
  const page = await browser.newPage();
  await page.goto('https://spotify.com');  // EU company
  await new Promise(r => setTimeout(r, 2000));
  
  // Open popup.html in same browser
  const popup = await browser.newPage();
  popup.on('console', m => console.log('POPUP:', m.text()));
  
  await popup.goto('chrome-extension://njoampcgeccjegcgjlcagpfoaomphdmj/popup/popup.html');
  await new Promise(r => setTimeout(r, 3000));
  
  // Get what the popup shows
  const state = await popup.evaluate(() => {
    const loading = document.getElementById('loading');
    const companyInfo = document.getElementById('company-info');
    const unknown = document.getElementById('unknown-state');
    const error = document.getElementById('error-state');
    
    return {
      loading: !loading?.classList.contains('hidden'),
      company: !companyInfo?.classList.contains('hidden'),
      unknown: !unknown?.classList.contains('hidden'),
      error: !error?.classList.contains('hidden'),
      companyName: document.getElementById('company-name')?.textContent,
      statusText: document.getElementById('status-text')?.textContent,
      unknownText: document.getElementById('unknown-domain')?.textContent,
      errorText: document.getElementById('error-message')?.textContent
    };
  });
  
  console.log('Popup state:', JSON.stringify(state, null, 2));
  await popup.screenshot({ path: 'popup-final.png' });
  
  await browser.disconnect();
})();
