const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.connect({
    browserURL: 'http://127.0.0.1:9333'
  });
  
  // Check if data files are accessible
  const dataPage = await browser.newPage();
  dataPage.on('console', m => console.log('DATA:', m.text()));
  
  await dataPage.goto('chrome-extension://njoampcgeccjegcgjlcagpfoaomphdmj/data/companies.json');
  await new Promise(r => setTimeout(r, 1000));
  
  const companies = await dataPage.evaluate(() => {
    try {
      const data = JSON.parse(document.body.innerText);
      return { count: data.length, first: data[0]?.id };
    } catch (e) {
      return { error: e.message, body: document.body.innerText.slice(0, 100) };
    }
  });
  console.log('Companies:', companies);
  
  await dataPage.goto('chrome-extension://njoampcgeccjegcgjlcagpfoaomphdmj/data/domains.json');
  await new Promise(r => setTimeout(r, 1000));
  
  const domains = await dataPage.evaluate(() => {
    try {
      const data = JSON.parse(document.body.innerText);
      return { count: data.domains?.length, first: data.domains?.[0]?.domain };
    } catch (e) {
      return { error: e.message, body: document.body.innerText.slice(0, 100) };
    }
  });
  console.log('Domains:', domains);
  
  // Now check if popup can message background
  const popup = await browser.newPage();
  popup.on('console', m => console.log('POPUP:', m.text()));
  await popup.goto('chrome-extension://njoampcgeccjegcgjlcagpfoaomphdmj/popup/popup.html?domain=amazon.de');
  await new Promise(r => setTimeout(r, 5000));  // Wait longer
  
  await popup.screenshot({ path: 'debug-popup.png' });
  console.log('Screenshot saved');
  
  await browser.disconnect();
})();
