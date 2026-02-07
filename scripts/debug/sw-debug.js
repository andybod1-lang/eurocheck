const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.connect({
    browserURL: 'http://127.0.0.1:9333'
  });
  
  // List all targets with their types
  const targets = await browser.targets();
  console.log('All targets:');
  for (const t of targets) {
    console.log(`  ${t.type().padEnd(15)} ${t.url().slice(0, 80)}`);
  }
  
  // Find the service worker specifically
  const sw = targets.find(t => 
    t.type() === 'service_worker' && 
    t.url().includes('background.js')
  );
  
  if (sw) {
    console.log('\nConnecting to service worker...');
    try {
      const worker = await sw.worker();
      console.log('Worker connected:', !!worker);
      
      if (worker) {
        worker.on('console', m => console.log('SW LOG:', m.text()));
        
        const result = await worker.evaluate(() => {
          return 'Worker is alive: ' + (typeof chrome !== 'undefined');
        });
        console.log(result);
      }
    } catch (e) {
      console.log('Worker error:', e.message);
    }
  } else {
    console.log('\nNo service_worker target found');
    console.log('Types present:', [...new Set(targets.map(t => t.type()))]);
  }
  
  await browser.disconnect();
})();
