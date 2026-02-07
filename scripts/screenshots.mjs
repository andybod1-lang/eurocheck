/**
 * Store Screenshots Generator for EuroCheck
 * Captures extension popup in various states
 */

import puppeteer from 'puppeteer-core';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const CDP_PORT = 9333;
const SCREENSHOT_DIR = path.join(__dirname, 'store/screenshots');

// Test domains for different statuses
const TEST_CASES = [
  { domain: 'spotify.com', name: '1-eu-company', description: 'EU Company (Spotify)' },
  { domain: 'amazon.com', name: '2-non-eu-company', description: 'Non-EU Company (Amazon)' },
  { domain: 'booking.com', name: '3-mixed-ownership', description: 'Mixed Ownership (Booking)' },
];

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getExtensionIdFromServiceWorker(browser) {
  const cdpSession = await browser.target().createCDPSession();
  const { targetInfos } = await cdpSession.send('Target.getTargets');
  
  for (const info of targetInfos) {
    if (info.type === 'service_worker' && info.url.includes('chrome-extension://')) {
      const match = info.url.match(/chrome-extension:\/\/([^/]+)/);
      if (match) {
        console.log(`Found extension: ${info.title} (${match[1]})`);
        return match[1];
      }
    }
  }
  
  return null;
}

async function takePopupScreenshot(browser, extensionId, domain, outputName) {
  const popupUrl = `chrome-extension://${extensionId}/popup/popup.html?domain=${domain}`;
  console.log(`📸 ${domain} -> ${outputName}`);
  
  let page;
  try {
    page = await browser.newPage();
    
    // Set viewport to popup size
    await page.setViewport({ width: 320, height: 600 });
    
    // Force dark mode
    await page.emulateMediaFeatures([
      { name: 'prefers-color-scheme', value: 'dark' }
    ]);
    
    // Navigate with error handling
    await page.goto(popupUrl, { 
      waitUntil: 'domcontentloaded',
      timeout: 15000 
    });
    
    // Wait for content to render
    await delay(2500);
    
    // Get actual content dimensions
    const dimensions = await page.evaluate(() => {
      const app = document.querySelector('#app');
      if (!app) return { width: 320, height: 400 };
      return {
        width: Math.min(app.scrollWidth, 320),
        height: Math.min(app.scrollHeight + 10, 500)
      };
    });
    
    const screenshotPath = path.join(SCREENSHOT_DIR, `${outputName}.png`);
    await page.screenshot({
      path: screenshotPath,
      clip: {
        x: 0,
        y: 0,
        width: 320,
        height: dimensions.height
      }
    });
    
    console.log(`  ✅ ${screenshotPath}`);
    return screenshotPath;
    
  } catch (err) {
    console.log(`  ⚠️ Error: ${err.message}`);
    return null;
  } finally {
    if (page) {
      try {
        await page.close();
      } catch (e) {
        // Page already closed
      }
    }
    // Small delay between screenshots
    await delay(500);
  }
}

async function takeOptionsScreenshot(browser, extensionId) {
  const optionsUrl = `chrome-extension://${extensionId}/options/options.html`;
  console.log(`📸 Options page`);
  
  let page;
  try {
    page = await browser.newPage();
    await page.setViewport({ width: 640, height: 480 });
    
    await page.emulateMediaFeatures([
      { name: 'prefers-color-scheme', value: 'dark' }
    ]);
    
    await page.goto(optionsUrl, { 
      waitUntil: 'domcontentloaded',
      timeout: 15000 
    });
    
    await delay(1500);
    
    const screenshotPath = path.join(SCREENSHOT_DIR, '4-options.png');
    await page.screenshot({ path: screenshotPath });
    
    console.log(`  ✅ ${screenshotPath}`);
    return screenshotPath;
    
  } catch (err) {
    console.log(`  ⚠️ Error: ${err.message}`);
    return null;
  } finally {
    if (page) {
      try {
        await page.close();
      } catch (e) {}
    }
    await delay(500);
  }
}

async function createStoreImage(browser, popupPath, outputName, width, height, label = '') {
  if (!popupPath) {
    console.log(`⏭️  Skipping ${outputName} (no source image)`);
    return;
  }
  
  console.log(`🖼️  Store image: ${outputName}`);
  
  let page;
  try {
    page = await browser.newPage();
    await page.setViewport({ width, height });
    
    // Read the popup image and convert to base64
    const imageBuffer = await fs.readFile(popupPath);
    const base64Image = imageBuffer.toString('base64');
    
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
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            position: relative;
          }
          .eu-decoration {
            position: absolute;
            top: 40px;
            left: 40px;
            font-size: 40px;
            opacity: 0.12;
          }
          .eu-decoration-2 {
            position: absolute;
            bottom: 40px;
            right: 40px;
            font-size: 40px;
            opacity: 0.12;
          }
          .popup-container {
            background: #1f2937;
            border-radius: 16px;
            box-shadow: 0 25px 80px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1);
            overflow: hidden;
            position: relative;
          }
          .popup-container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 30px;
            background: linear-gradient(to bottom, rgba(255,255,255,0.08), transparent);
            pointer-events: none;
          }
          .popup-container img {
            display: block;
          }
          .label {
            position: absolute;
            bottom: 35px;
            left: 0;
            right: 0;
            text-align: center;
            color: rgba(255, 255, 255, 0.85);
            font-size: 20px;
            font-weight: 500;
            text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
          }
        </style>
      </head>
      <body>
        <div class="eu-decoration">🇪🇺</div>
        <div class="eu-decoration-2">🇪🇺</div>
        <div class="popup-container">
          <img src="data:image/png;base64,${base64Image}" />
        </div>
        ${label ? `<div class="label">${label}</div>` : ''}
      </body>
      </html>
    `;
    
    await page.setContent(html);
    await delay(400);
    
    const outputPath = path.join(SCREENSHOT_DIR, `${outputName}.png`);
    await page.screenshot({ path: outputPath });
    
    console.log(`  ✅ ${outputPath}`);
    
  } catch (err) {
    console.log(`  ⚠️ Error: ${err.message}`);
  } finally {
    if (page) {
      try {
        await page.close();
      } catch (e) {}
    }
  }
}

async function createPromoTile(browser) {
  console.log(`🎨 Creating promotional tile (440x280)`);
  
  let page;
  try {
    page = await browser.newPage();
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
          .stars {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
          }
          .star {
            position: absolute;
            color: #FFCC00;
            font-size: 20px;
            opacity: 0.2;
          }
          .content {
            position: relative;
            z-index: 1;
            text-align: center;
          }
          .icon-container {
            width: 72px;
            height: 72px;
            background: linear-gradient(135deg, #FFCC00 0%, #e6b800 100%);
            border-radius: 18px;
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 0 auto 16px;
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
          }
          .icon {
            font-size: 36px;
          }
          .title {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 6px;
            text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
          }
          .tagline {
            font-size: 16px;
            color: #FFCC00;
            font-weight: 500;
            margin-bottom: 16px;
          }
          .badges {
            display: flex;
            gap: 10px;
            justify-content: center;
          }
          .badge {
            padding: 5px 14px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            color: white;
          }
          .badge.green { background: #10B981; }
          .badge.yellow { background: #F59E0B; color: #1f2937; }
          .badge.red { background: #EF4444; }
        </style>
      </head>
      <body>
        <div class="stars">
          <span class="star" style="top: 15px; left: 25px">★</span>
          <span class="star" style="top: 35px; right: 45px">★</span>
          <span class="star" style="bottom: 55px; left: 55px">★</span>
          <span class="star" style="bottom: 25px; right: 75px">★</span>
          <span class="star" style="top: 70px; left: 48%">★</span>
          <span class="star" style="top: 25px; left: 40%">★</span>
          <span class="star" style="bottom: 70px; right: 35%">★</span>
          <span class="star" style="top: 50px; left: 15%">★</span>
          <span class="star" style="bottom: 40px; left: 20%">★</span>
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
    
    const outputPath = path.join(__dirname, 'store/promo-tile.png');
    await page.screenshot({ path: outputPath });
    
    console.log(`  ✅ ${outputPath}`);
    
  } catch (err) {
    console.log(`  ⚠️ Error: ${err.message}`);
  } finally {
    if (page) {
      try {
        await page.close();
      } catch (e) {}
    }
  }
}

async function main() {
  console.log('🚀 EuroCheck Store Screenshot Generator\n');
  
  // Ensure directories exist
  await fs.mkdir(SCREENSHOT_DIR, { recursive: true });
  
  // Connect to Brave browser
  console.log(`Connecting to browser on port ${CDP_PORT}...`);
  
  const browser = await puppeteer.connect({
    browserURL: `http://127.0.0.1:${CDP_PORT}`,
    defaultViewport: null
  });
  
  console.log('✅ Connected!\n');
  
  // Find extension ID
  console.log('Looking for EuroCheck extension...');
  const extensionId = await getExtensionIdFromServiceWorker(browser);
  
  if (!extensionId) {
    console.log('\n⚠️  Extension not found. Please load it manually.');
    return;
  }
  
  console.log(`✅ Extension ID: ${extensionId}\n`);
  
  // Take popup screenshots
  console.log('--- Popup Screenshots ---\n');
  
  const popupPaths = {};
  for (const testCase of TEST_CASES) {
    const screenshotPath = await takePopupScreenshot(
      browser, 
      extensionId, 
      testCase.domain, 
      testCase.name
    );
    popupPaths[testCase.name] = screenshotPath;
  }
  
  // Options screenshot
  const optionsPath = await takeOptionsScreenshot(browser, extensionId);
  
  // Create store-ready images (1280x800)
  console.log('\n--- Store Screenshots (1280x800) ---\n');
  
  const labels = {
    '1-eu-company': 'European Company Detection',
    '2-non-eu-company': 'Non-EU Company Alert', 
    '3-mixed-ownership': 'Mixed Ownership Warning'
  };
  
  for (const testCase of TEST_CASES) {
    await createStoreImage(
      browser,
      popupPaths[testCase.name],
      `store-${testCase.name}`,
      1280,
      800,
      labels[testCase.name]
    );
  }
  
  // Store image for options
  await createStoreImage(
    browser,
    optionsPath,
    'store-4-options',
    1280,
    800,
    'Customizable Settings'
  );
  
  // Create promo tile
  console.log('\n--- Promotional Tile ---\n');
  await createPromoTile(browser);
  
  // Summary
  console.log('\n✅ Done! Generated files:\n');
  
  try {
    const files = await fs.readdir(SCREENSHOT_DIR);
    for (const file of files.sort()) {
      const stats = await fs.stat(path.join(SCREENSHOT_DIR, file));
      console.log(`  📷 screenshots/${file} (${Math.round(stats.size / 1024)}KB)`);
    }
  } catch (e) {}
  
  try {
    const promoStats = await fs.stat(path.join(__dirname, 'store/promo-tile.png'));
    console.log(`  🎨 promo-tile.png (${Math.round(promoStats.size / 1024)}KB)`);
  } catch (e) {}
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
