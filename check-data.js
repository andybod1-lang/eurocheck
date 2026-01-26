const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.connect({
    browserURL: 'http://127.0.0.1:9333'
  });
  
  // Create a page that can talk to the extension
  const page = await browser.newPage();
  await page.goto('https://amazon.de');
  await new Promise(r => setTimeout(r, 2000));
  
  // Use chrome.runtime.sendMessage from the page via content script
  // Actually, let's check the badge on the tab
  const targets = await browser.targets();
  console.log('Targets with extension:');
  targets.filter(t => t.url().includes('chrome-extension')).forEach(t => 
    console.log(`  ${t.type()}: ${t.url()}`)
  );
  
  // Let's check data files directly
  const dataPage = await browser.newPage();
  await dataPage.goto('chrome-extension://njoampcgeccjegcgjlcagpfoaomphdmj/data/companies.json');
  await new Promise(r => setTimeout(r, 500));
  const json = await dataPage.evaluate(() => {
    try {
      return JSON.parse(document.body.innerText);
    } catch {
      return document.body.innerText.slice(0, 200);
    }
  });
  
  if (Array.isArray(json)) {
    console.log(`Companies loaded: ${json.length} entries`);
    const amazon = json.find(c => c.id === 'amazon');
    console.log('Amazon entry:', JSON.stringify(amazon));
  } else {
    console.log('Data:', json);
  }
  
  await browser.disconnect();
})();
