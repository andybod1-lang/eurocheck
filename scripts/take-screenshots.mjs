/**
 * Store Screenshots Generator for EuroCheck
 * Takes screenshots of the popup for various company statuses
 */

import puppeteer from 'puppeteer-core';
import fs from 'fs/promises';
import path from 'path';

const EXTENSION_ID = 'njoampcgeccjegcgjlcagpfoaomphdmj';
const CDP_PORT = 9333;
const SCREENSHOT_DIR = './store/screenshots';

// Test domains for different statuses
const TEST_CASES = [
  { domain: 'spotify.com', name: 'eu-company', description: 'EU Company (Spotify)' },
  { domain: 'amazon.com', name: 'non-eu-company', description: 'Non-EU Company (Amazon)' },
  { domain: 'booking.com', name: 'mixed-ownership', description: 'Mixed Ownership (Booking)' },
];

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function takePopupScreenshot(browser, domain, outputName) {
  const popupUrl = `chrome-extension://${EXTENSION_ID}/popup/popup.html?domain=${domain}`;
  console.log(`📸 Taking screenshot: ${domain} -> ${outputName}`);
  
  const page = await browser.newPage();
  
  // Set viewport to match popup dimensions
  await page.setViewport({ width: 320, height: 500 });
  
  // Force dark mode for cleaner screenshots
  await page.emulateMediaFeatures([
    { name: 'prefers-color-scheme', value: 'dark' }
  ]);
  
  await page.goto(popupUrl, { waitUntil: 'networkidle0' });
  
  // Wait for loading to complete
  await delay(1500);
  
  // Wait for company info to appear or loading to finish
  try {
    await page.waitForSelector('#company-info:not(.hidden), #unknown-state:not(.hidden), #error-state:not(.hidden)', { 
      timeout: 5000 
    });
  } catch (e) {
    console.log('  ⚠️ Timeout waiting for content, taking screenshot anyway');
  }
  
  await delay(500);
  
  // Get actual content height
  const bodyHeight = await page.evaluate(() => {
    return document.querySelector('#app').scrollHeight;
  });
  
  // Screenshot just the content at exact size
  const screenshotPath = path.join(SCREENSHOT_DIR, `${outputName}.png`);
  await page.screenshot({
    path: screenshotPath,
    clip: {
      x: 0,
      y: 0,
      width: 320,
      height: Math.min(bodyHeight, 500)
    }
  });
  
  console.log(`  ✅ Saved: ${screenshotPath} (${bodyHeight}px height)`);
  
  await page.close();
  return screenshotPath;
}

async function takeOptionsScreenshot(browser) {
  const optionsUrl = `chrome-extension://${EXTENSION_ID}/options/options.html`;
  console.log(`📸 Taking screenshot: Options page`);
  
  const page = await browser.newPage();
  
  // Options page is wider
  await page.setViewport({ width: 640, height: 480 });
  
  // Force dark mode
  await page.emulateMediaFeatures([
    { name: 'prefers-color-scheme', value: 'dark' }
  ]);
  
  await page.goto(optionsUrl, { waitUntil: 'networkidle0' });
  await delay(1000);
  
  const screenshotPath = path.join(SCREENSHOT_DIR, 'options.png');
  await page.screenshot({
    path: screenshotPath,
  });
  
  console.log(`  ✅ Saved: ${screenshotPath}`);
  await page.close();
  return screenshotPath;
}

async function createStoreScreenshot(browser, popupPath, outputName, width, height) {
  console.log(`🖼️ Creating store screenshot: ${outputName} (${width}x${height})`);
  
  const page = await browser.newPage();
  await page.setViewport({ width, height });
  
  // Create an HTML page that displays the popup centered with a nice background
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          width: ${width}px;
          height: ${height}px;
          display: flex;
          justify-content: center;
          align-items: center;
          background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        .popup-container {
          background: #1f2937;
          border-radius: 12px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          overflow: hidden;
          border: 1px solid #374151;
        }
        .popup-container img {
          display: block;
          max-width: 320px;
        }
        .label {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
          font-weight: 500;
        }
      </style>
    </head>
    <body>
      <div class="popup-container">
        <img src="file://${path.resolve(popupPath)}" />
      </div>
    </body>
    </html>
  `;
  
  await page.setContent(html);
  await delay(500);
  
  const outputPath = path.join(SCREENSHOT_DIR, `${outputName}.png`);
  await page.screenshot({ path: outputPath });
  
  console.log(`  ✅ Saved: ${outputPath}`);
  await page.close();
  return outputPath;
}

async function createPromoTile(browser) {
  console.log(`🎨 Creating promotional tile (440x280)`);
  
  const page = await browser.newPage();
  await page.setViewport({ width: 440, height: 280 });
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          width: 440px;
          height: 280px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          background: linear-gradient(135deg, #003399 0%, #001a4d 100%);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          color: white;
          position: relative;
          overflow: hidden;
        }
        /* EU Stars decoration */
        .stars {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          opacity: 0.1;
        }
        .star {
          position: absolute;
          color: #FFCC00;
          font-size: 24px;
        }
        .content {
          position: relative;
          z-index: 1;
          text-align: center;
        }
        .icon-container {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #FFCC00 0%, #e6b800 100%);
          border-radius: 20px;
          display: flex;
          justify-content: center;
          align-items: center;
          margin: 0 auto 20px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }
        .icon {
          font-size: 40px;
        }
        .title {
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 8px;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        }
        .tagline {
          font-size: 18px;
          color: #FFCC00;
          font-weight: 500;
        }
        .badges {
          display: flex;
          gap: 12px;
          margin-top: 16px;
        }
        .badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }
        .badge.green { background: #10B981; }
        .badge.yellow { background: #F59E0B; }
        .badge.red { background: #EF4444; }
      </style>
    </head>
    <body>
      <div class="stars">
        <span class="star" style="top: 20px; left: 30px">★</span>
        <span class="star" style="top: 40px; right: 50px">★</span>
        <span class="star" style="bottom: 60px; left: 60px">★</span>
        <span class="star" style="bottom: 30px; right: 80px">★</span>
        <span class="star" style="top: 80px; left: 50%">★</span>
        <span class="star" style="top: 30px; left: 45%">★</span>
        <span class="star" style="bottom: 80px; right: 40%">★</span>
      </div>
      <div class="content">
        <div class="icon-container">
          <span class="icon">🇪🇺</span>
        </div>
        <div class="title">EuroCheck</div>
        <div class="tagline">Know if it's European</div>
        <div class="badges">
          <span class="badge green">EU ✓</span>
          <span class="badge yellow">MIXED</span>
          <span class="badge red">NON-EU</span>
        </div>
      </div>
    </body>
    </html>
  `;
  
  await page.setContent(html);
  await delay(300);
  
  const outputPath = './store/promo-tile.png';
  await page.screenshot({ path: outputPath });
  
  console.log(`  ✅ Saved: ${outputPath}`);
  await page.close();
  return outputPath;
}

async function main() {
  console.log('🚀 EuroCheck Store Screenshot Generator\n');
  
  // Ensure screenshot directory exists
  await fs.mkdir(SCREENSHOT_DIR, { recursive: true });
  
  // Connect to Brave browser
  console.log(`Connecting to Brave on CDP port ${CDP_PORT}...`);
  const browser = await puppeteer.connect({
    browserURL: `http://127.0.0.1:${CDP_PORT}`,
    defaultViewport: null
  });
  console.log('✅ Connected to browser\n');
  
  const popupScreenshots = {};
  
  // Take popup screenshots for each test case
  for (const testCase of TEST_CASES) {
    const screenshotPath = await takePopupScreenshot(browser, testCase.domain, testCase.name);
    popupScreenshots[testCase.name] = screenshotPath;
  }
  
  // Take options screenshot
  await takeOptionsScreenshot(browser);
  
  console.log('\n--- Creating Store-Ready Screenshots (1280x800) ---\n');
  
  // Create store-ready versions (popup centered in larger canvas)
  for (const testCase of TEST_CASES) {
    await createStoreScreenshot(
      browser, 
      popupScreenshots[testCase.name],
      `store-${testCase.name}`,
      1280,
      800
    );
  }
  
  // Create options store screenshot
  await createStoreScreenshot(
    browser,
    path.join(SCREENSHOT_DIR, 'options.png'),
    'store-options',
    1280,
    800
  );
  
  console.log('\n--- Creating Promotional Tile ---\n');
  
  // Create promo tile
  await createPromoTile(browser);
  
  console.log('\n✅ All screenshots generated!\n');
  console.log('Files in store/screenshots/:');
  const files = await fs.readdir(SCREENSHOT_DIR);
  for (const file of files) {
    const stats = await fs.stat(path.join(SCREENSHOT_DIR, file));
    console.log(`  - ${file} (${Math.round(stats.size / 1024)}KB)`);
  }
  
  console.log('\nFiles in store/:');
  console.log('  - promo-tile.png');
  
  // Don't disconnect - leave browser running
  console.log('\n✨ Done!');
}

main().catch(console.error);
