/**
 * Store Screenshots Generator for EuroCheck
 * Creates screenshot-ready HTML mockups and captures them
 */

import puppeteer from 'puppeteer-core';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCREENSHOT_DIR = path.join(__dirname, 'store/screenshots');

// Country codes to flag emojis
const FLAGS = {
  SE: '🇸🇪', US: '🇺🇸', NL: '🇳🇱', DE: '🇩🇪', GB: '🇬🇧', FR: '🇫🇷',
  ES: '🇪🇸', IT: '🇮🇹', PL: '🇵🇱', CZ: '🇨🇿', BE: '🇧🇪', AT: '🇦🇹',
  CH: '🇨🇭', IE: '🇮🇪', DK: '🇩🇰', FI: '🇫🇮', NO: '🇳🇴', PT: '🇵🇹',
  EU: '🇪🇺'
};

// Company data for screenshots
const COMPANIES = {
  'spotify': {
    name: 'Spotify',
    country: 'SE',
    city: 'Stockholm, Sweden',
    status: 'eu',
    founded: 2006,
    confidence: 'High',
    lastVerified: '2025-01-15'
  },
  'amazon': {
    name: 'Amazon',
    country: 'US',
    city: 'Seattle, USA',
    status: 'non-eu',
    founded: 1994,
    confidence: 'High',
    lastVerified: '2025-01-15'
  },
  'booking': {
    name: 'Booking.com',
    country: 'NL',
    city: 'Amsterdam, Netherlands',
    status: 'mixed',
    founded: 1996,
    confidence: 'High',
    lastVerified: '2025-01-15',
    parent: 'Booking Holdings',
    parentCountry: 'US',
    parentCity: 'Norwalk, USA'
  },
  'unknown': {
    name: 'randomshop.fi',
    status: 'unknown',
    domain: 'randomshop.fi'
  }
};

function getStatusBadge(status) {
  switch(status) {
    case 'eu': return { class: 'eu', text: 'EU', fullText: 'European Company' };
    case 'non-eu': return { class: 'non-eu', text: 'NON-EU', fullText: 'Non-European Company' };
    case 'mixed': return { class: 'mixed', text: 'MIXED', fullText: 'EU Company, Non-EU Owned' };
    default: return { class: 'unknown', text: '?', fullText: 'Unknown' };
  }
}

function generateUnknownPopupHTML(domain) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    :root {
      --eu-blue: #003399;
      --eu-yellow: #FFCC00;
      --status-unknown: #6B7280;
      --bg-primary: #1f2937;
      --bg-secondary: #111827;
      --text-primary: #f9fafb;
      --text-secondary: #9ca3af;
      --border-color: #374151;
      --spacing-xs: 4px;
      --spacing-sm: 8px;
      --spacing-md: 12px;
      --spacing-lg: 16px;
      --spacing-xl: 24px;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      line-height: 1.5;
      color: var(--text-primary);
      background-color: var(--bg-primary);
      width: 320px;
    }
    #app {
      display: flex;
      flex-direction: column;
    }
    .header {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-md) var(--spacing-lg);
      border-bottom: 1px solid var(--border-color);
      background-color: var(--bg-secondary);
    }
    .logo {
      width: 24px;
      height: 24px;
      background: linear-gradient(135deg, var(--eu-blue), #001a66);
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
    }
    .title {
      font-weight: 600;
      font-size: 16px;
      color: var(--eu-yellow);
    }
    .unknown-state {
      padding: var(--spacing-xl);
      text-align: center;
    }
    .unknown-icon {
      font-size: 48px;
      margin-bottom: var(--spacing-md);
      opacity: 0.8;
    }
    .unknown-title {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: var(--spacing-sm);
      color: var(--status-unknown);
    }
    .unknown-domain {
      font-size: 14px;
      color: var(--text-secondary);
      margin-bottom: var(--spacing-lg);
      word-break: break-all;
    }
    .request-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-md) var(--spacing-lg);
      background: var(--eu-blue);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
    }
    .request-btn:hover {
      background: #002266;
    }
    .footer {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-md);
      border-top: 1px solid var(--border-color);
      margin-top: var(--spacing-lg);
    }
    .footer-link {
      color: var(--text-secondary);
      text-decoration: none;
      font-size: 12px;
    }
    .separator { color: var(--text-secondary); }
  </style>
</head>
<body>
  <div id="app">
    <header class="header">
      <div class="logo">🇪🇺</div>
      <span class="title">EuroCheck</span>
    </header>
    
    <main class="unknown-state">
      <div class="unknown-icon">❓</div>
      <h2 class="unknown-title">Unknown</h2>
      <p class="unknown-domain">No data available for <strong>${domain}</strong></p>
      <button class="request-btn">📝 Request this company</button>
    </main>

    <footer class="footer">
      <a href="#" class="footer-link">Settings</a>
      <span class="separator">•</span>
      <a href="#" class="footer-link">GitHub</a>
    </footer>
  </div>
</body>
</html>`;
}

function generatePopupHTML(company) {
  const badge = getStatusBadge(company.status);
  const flag = FLAGS[company.country] || '🌍';
  
  // Handle unknown status specially
  if (company.status === 'unknown') {
    return generateUnknownPopupHTML(company.domain || company.name);
  }
  
  // Ownership section for mixed status
  let ownershipSection = '';
  if (company.status === 'mixed' && company.parent) {
    const parentFlag = FLAGS[company.parentCountry] || '🌍';
    ownershipSection = `
      <details class="ownership-section" open>
        <summary>
          <span class="ownership-title">Ownership Chain</span>
          <span class="ownership-warning">⚠️ Non-EU owned</span>
        </summary>
        <div class="ownership-chain">
          <div class="chain-node is-non-eu">
            <span class="chain-node-icon">${parentFlag}</span>
            <div class="chain-node-content">
              <div class="chain-node-name">${company.parent}</div>
              <div class="chain-node-meta">
                <span class="chain-node-badge badge-ultimate">ULTIMATE</span>
                <span class="chain-node-country">${company.parentCity}</span>
              </div>
            </div>
          </div>
          <div class="chain-connector">
            <span class="chain-connector-arrow">↓</span>
          </div>
          <div class="chain-node is-eu">
            <span class="chain-node-icon">${flag}</span>
            <div class="chain-node-content">
              <div class="chain-node-name">${company.name}</div>
              <div class="chain-node-meta">
                <span class="chain-node-badge badge-current">CURRENT</span>
                <span class="chain-node-country">${company.city}</span>
              </div>
            </div>
          </div>
        </div>
      </details>
    `;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    :root {
      --eu-blue: #003399;
      --eu-yellow: #FFCC00;
      --status-eu: #10B981;
      --status-mixed: #F59E0B;
      --status-non-eu: #EF4444;
      --status-unknown: #6B7280;
      --bg-primary: #1f2937;
      --bg-secondary: #111827;
      --text-primary: #f9fafb;
      --text-secondary: #9ca3af;
      --border-color: #374151;
      --spacing-xs: 4px;
      --spacing-sm: 8px;
      --spacing-md: 12px;
      --spacing-lg: 16px;
      --spacing-xl: 24px;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      line-height: 1.5;
      color: var(--text-primary);
      background-color: var(--bg-primary);
      width: 320px;
    }
    #app {
      display: flex;
      flex-direction: column;
    }
    .header {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-md) var(--spacing-lg);
      border-bottom: 1px solid var(--border-color);
      background-color: var(--bg-secondary);
    }
    .logo {
      width: 24px;
      height: 24px;
      background: linear-gradient(135deg, var(--eu-blue), #001a66);
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
    }
    .title {
      font-weight: 600;
      font-size: 16px;
      color: var(--eu-yellow);
    }
    .company-info {
      padding: var(--spacing-lg);
    }
    .status-section {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      margin-bottom: var(--spacing-lg);
    }
    .status-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: var(--spacing-xs) var(--spacing-md);
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      color: white;
    }
    .status-badge.eu { background-color: var(--status-eu); }
    .status-badge.mixed { background-color: var(--status-mixed); }
    .status-badge.non-eu { background-color: var(--status-non-eu); }
    .status-text {
      font-size: 14px;
      color: var(--text-secondary);
    }
    .company-details {
      margin-bottom: var(--spacing-lg);
    }
    .company-name {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: var(--spacing-xs);
    }
    .location {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      color: var(--text-secondary);
    }
    .flag { font-size: 16px; }
    
    /* Ownership Section */
    .ownership-section,
    .details-section {
      border: 1px solid var(--border-color);
      border-radius: 8px;
      margin-bottom: var(--spacing-md);
    }
    .ownership-section summary,
    .details-section summary {
      padding: var(--spacing-md);
      font-weight: 500;
      cursor: pointer;
      user-select: none;
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      list-style: none;
    }
    .ownership-section summary::-webkit-details-marker,
    .details-section summary::-webkit-details-marker {
      display: none;
    }
    .ownership-title { flex: 1; }
    .ownership-warning {
      font-size: 11px;
      color: var(--status-non-eu);
      font-weight: 600;
    }
    .ownership-chain {
      padding: var(--spacing-md);
      padding-top: var(--spacing-sm);
    }
    .chain-node {
      display: flex;
      align-items: flex-start;
      gap: var(--spacing-sm);
      padding: var(--spacing-sm) var(--spacing-md);
      background: var(--bg-secondary);
      border-radius: 8px;
      border: 1px solid var(--border-color);
    }
    .chain-node.is-eu { border-left: 3px solid var(--status-eu); }
    .chain-node.is-non-eu { border-left: 3px solid var(--status-non-eu); }
    .chain-node-icon { font-size: 20px; line-height: 1; }
    .chain-node-content { flex: 1; min-width: 0; }
    .chain-node-name { font-weight: 600; font-size: 13px; }
    .chain-node-meta {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      margin-top: 2px;
    }
    .chain-node-badge {
      font-size: 9px;
      font-weight: 600;
      text-transform: uppercase;
      padding: 2px 6px;
      border-radius: 3px;
      background: var(--border-color);
      color: var(--text-secondary);
    }
    .chain-node-badge.badge-ultimate { background: #1d4ed8; color: white; }
    .chain-node-badge.badge-current { background: var(--status-eu); color: white; }
    .chain-node-country { font-size: 11px; color: var(--text-secondary); }
    .chain-connector {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 24px;
      position: relative;
    }
    .chain-connector::before {
      content: '';
      position: absolute;
      left: 24px;
      top: 0;
      bottom: 0;
      width: 2px;
      background: var(--border-color);
    }
    .chain-connector-arrow {
      font-size: 12px;
      color: var(--text-secondary);
      background: var(--bg-primary);
      padding: 0 4px;
      z-index: 1;
    }
    
    .details-content {
      padding: var(--spacing-md);
      padding-top: 0;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: var(--spacing-xs) 0;
      border-bottom: 1px solid var(--border-color);
    }
    .detail-row:last-child { border-bottom: none; }
    .detail-row .label { color: var(--text-secondary); }
    .detail-row .value { font-weight: 500; }
    .footer {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-md);
      border-top: 1px solid var(--border-color);
      margin-top: auto;
    }
    .footer-link {
      color: var(--text-secondary);
      text-decoration: none;
      font-size: 12px;
    }
    .separator { color: var(--text-secondary); }
  </style>
</head>
<body>
  <div id="app">
    <header class="header">
      <div class="logo">🇪🇺</div>
      <span class="title">EuroCheck</span>
    </header>
    
    <main class="company-info">
      <div class="status-section">
        <span class="status-badge ${badge.class}">${badge.text}</span>
        <span class="status-text">${badge.fullText}</span>
      </div>

      <div class="company-details">
        <h2 class="company-name">${company.name}</h2>
        <div class="location">
          <span class="flag">${flag}</span>
          <span>${company.city}</span>
        </div>
      </div>

      ${ownershipSection}

      <details class="details-section" open>
        <summary>Details</summary>
        <div class="details-content">
          <div class="detail-row">
            <span class="label">Founded:</span>
            <span class="value">${company.founded}</span>
          </div>
          <div class="detail-row">
            <span class="label">Confidence:</span>
            <span class="value">${company.confidence}</span>
          </div>
          <div class="detail-row">
            <span class="label">Last verified:</span>
            <span class="value">${company.lastVerified}</span>
          </div>
        </div>
      </details>
    </main>

    <footer class="footer">
      <a href="#" class="footer-link">Settings</a>
      <span class="separator">•</span>
      <a href="#" class="footer-link">GitHub</a>
    </footer>
  </div>
</body>
</html>`;
}

function generateOptionsHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    :root {
      --eu-blue: #003399;
      --eu-yellow: #FFCC00;
      --bg-primary: #1f2937;
      --bg-secondary: #111827;
      --text-primary: #f9fafb;
      --text-secondary: #9ca3af;
      --border-color: #374151;
      --accent: #3b82f6;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      line-height: 1.5;
      color: var(--text-primary);
      background-color: var(--bg-primary);
      width: 500px;
      padding: 24px;
    }
    .header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--border-color);
    }
    .logo {
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, var(--eu-blue), #001a66);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
    }
    .title {
      font-weight: 600;
      font-size: 20px;
      color: var(--eu-yellow);
    }
    .subtitle {
      color: var(--text-secondary);
      font-size: 13px;
    }
    .section {
      margin-bottom: 24px;
    }
    .section-title {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--text-secondary);
    }
    .option-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background: var(--bg-secondary);
      border-radius: 8px;
      margin-bottom: 8px;
    }
    .option-label {
      font-weight: 500;
    }
    .option-desc {
      font-size: 12px;
      color: var(--text-secondary);
      margin-top: 2px;
    }
    .toggle {
      width: 44px;
      height: 24px;
      background: var(--accent);
      border-radius: 12px;
      position: relative;
    }
    .toggle::after {
      content: '';
      position: absolute;
      width: 20px;
      height: 20px;
      background: white;
      border-radius: 50%;
      top: 2px;
      right: 2px;
      transition: transform 0.2s;
    }
    .toggle.off {
      background: var(--border-color);
    }
    .toggle.off::after {
      right: auto;
      left: 2px;
    }
    .version {
      text-align: center;
      color: var(--text-secondary);
      font-size: 12px;
      margin-top: 24px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">🇪🇺</div>
    <div>
      <div class="title">EuroCheck Settings</div>
      <div class="subtitle">Customize your experience</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Display</div>
    <div class="option-row">
      <div>
        <div class="option-label">Show badge on icon</div>
        <div class="option-desc">Display EU status on toolbar icon</div>
      </div>
      <div class="toggle"></div>
    </div>
    <div class="option-row">
      <div>
        <div class="option-label">Show notifications</div>
        <div class="option-desc">Alert when visiting non-EU sites</div>
      </div>
      <div class="toggle off"></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Privacy</div>
    <div class="option-row">
      <div>
        <div class="option-label">Send anonymous usage data</div>
        <div class="option-desc">Help improve EuroCheck</div>
      </div>
      <div class="toggle off"></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Data</div>
    <div class="option-row">
      <div>
        <div class="option-label">Auto-update company data</div>
        <div class="option-desc">Check for updates weekly</div>
      </div>
      <div class="toggle"></div>
    </div>
  </div>

  <div class="version">EuroCheck v1.0.0</div>
</body>
</html>`;
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('🚀 EuroCheck Store Screenshot Generator\n');
  
  // Create directories
  await fs.mkdir(SCREENSHOT_DIR, { recursive: true });
  const tmpDir = path.join(__dirname, 'store/.tmp');
  await fs.mkdir(tmpDir, { recursive: true });
  
  // Find Chrome/Brave executable
  const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  const bravePath = '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser';
  
  let browserPath = chromePath;
  try {
    await fs.access(chromePath);
  } catch {
    browserPath = bravePath;
  }
  
  console.log(`Using browser: ${browserPath}\n`);
  
  // Launch browser
  const browser = await puppeteer.launch({
    executablePath: browserPath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  console.log('--- Creating Popup Screenshots ---\n');
  
  const screenshotPaths = {};
  const cases = [
    { id: 'spotify', name: '1-eu-company', label: 'European Company Detection' },
    { id: 'amazon', name: '2-non-eu-company', label: 'Non-EU Company Alert' },
    { id: 'booking', name: '3-mixed-ownership', label: 'Mixed Ownership Warning' },
    { id: 'unknown', name: '5-unknown-domain', label: 'Unknown Domain - Request Data' }
  ];
  
  for (const { id, name, label } of cases) {
    const company = COMPANIES[id];
    const html = generatePopupHTML(company);
    const htmlPath = path.join(tmpDir, `${name}.html`);
    await fs.writeFile(htmlPath, html);
    
    const page = await browser.newPage();
    await page.setViewport({ width: 320, height: 600 });
    await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });
    await delay(300);
    
    // Get actual height
    const height = await page.evaluate(() => document.querySelector('#app').scrollHeight);
    
    const screenshotPath = path.join(SCREENSHOT_DIR, `${name}.png`);
    await page.screenshot({
      path: screenshotPath,
      clip: { x: 0, y: 0, width: 320, height: Math.min(height + 5, 500) }
    });
    
    console.log(`📸 ${name}.png - ${company.name} (${company.status})`);
    screenshotPaths[name] = screenshotPath;
    await page.close();
  }
  
  // Options screenshot
  const optionsHtml = generateOptionsHTML();
  const optionsHtmlPath = path.join(tmpDir, 'options.html');
  await fs.writeFile(optionsHtmlPath, optionsHtml);
  
  const optionsPage = await browser.newPage();
  await optionsPage.setViewport({ width: 500, height: 450 });
  await optionsPage.goto(`file://${optionsHtmlPath}`, { waitUntil: 'networkidle0' });
  await delay(300);
  
  const optionsPath = path.join(SCREENSHOT_DIR, '4-options.png');
  await optionsPage.screenshot({ path: optionsPath });
  console.log(`📸 4-options.png - Settings page`);
  screenshotPaths['4-options'] = optionsPath;
  await optionsPage.close();
  
  console.log('\n--- Creating Store Screenshots (1280x800) ---\n');
  
  // Create store-ready versions
  for (const { name, label } of cases) {
    const imageBuffer = await fs.readFile(screenshotPaths[name]);
    const base64 = imageBuffer.toString('base64');
    
    const storeHtml = `<!DOCTYPE html>
<html>
<head>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 1280px;
      height: 800px;
      display: flex;
      justify-content: center;
      align-items: center;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      position: relative;
    }
    .eu-decoration {
      position: absolute;
      font-size: 48px;
      opacity: 0.1;
    }
    .eu-decoration.tl { top: 50px; left: 50px; }
    .eu-decoration.br { bottom: 50px; right: 50px; }
    .popup-container {
      background: #1f2937;
      border-radius: 16px;
      box-shadow: 0 25px 80px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1);
      overflow: hidden;
    }
    .popup-container img { display: block; }
    .label {
      position: absolute;
      bottom: 45px;
      left: 0;
      right: 0;
      text-align: center;
      color: rgba(255, 255, 255, 0.85);
      font-size: 22px;
      font-weight: 500;
      text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
    }
  </style>
</head>
<body>
  <div class="eu-decoration tl">🇪🇺</div>
  <div class="eu-decoration br">🇪🇺</div>
  <div class="popup-container">
    <img src="data:image/png;base64,${base64}" />
  </div>
  <div class="label">${label}</div>
</body>
</html>`;
    
    const storeHtmlPath = path.join(tmpDir, `store-${name}.html`);
    await fs.writeFile(storeHtmlPath, storeHtml);
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto(`file://${storeHtmlPath}`, { waitUntil: 'networkidle0' });
    await delay(200);
    
    const storePath = path.join(SCREENSHOT_DIR, `store-${name}.png`);
    await page.screenshot({ path: storePath });
    console.log(`🖼️  store-${name}.png`);
    await page.close();
  }
  
  // Store options
  const optionsBuffer = await fs.readFile(optionsPath);
  const optionsBase64 = optionsBuffer.toString('base64');
  
  const storeOptionsHtml = `<!DOCTYPE html>
<html>
<head>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 1280px;
      height: 800px;
      display: flex;
      justify-content: center;
      align-items: center;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      position: relative;
    }
    .eu-decoration {
      position: absolute;
      font-size: 48px;
      opacity: 0.1;
    }
    .eu-decoration.tl { top: 50px; left: 50px; }
    .eu-decoration.br { bottom: 50px; right: 50px; }
    .popup-container {
      background: #1f2937;
      border-radius: 16px;
      box-shadow: 0 25px 80px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1);
      overflow: hidden;
    }
    .popup-container img { display: block; }
    .label {
      position: absolute;
      bottom: 45px;
      left: 0;
      right: 0;
      text-align: center;
      color: rgba(255, 255, 255, 0.85);
      font-size: 22px;
      font-weight: 500;
      text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
    }
  </style>
</head>
<body>
  <div class="eu-decoration tl">🇪🇺</div>
  <div class="eu-decoration br">🇪🇺</div>
  <div class="popup-container">
    <img src="data:image/png;base64,${optionsBase64}" />
  </div>
  <div class="label">Customizable Settings</div>
</body>
</html>`;
  
  const storeOptionsPath = path.join(tmpDir, 'store-4-options.html');
  await fs.writeFile(storeOptionsPath, storeOptionsHtml);
  
  const optPage = await browser.newPage();
  await optPage.setViewport({ width: 1280, height: 800 });
  await optPage.goto(`file://${storeOptionsPath}`, { waitUntil: 'networkidle0' });
  await delay(200);
  
  await optPage.screenshot({ path: path.join(SCREENSHOT_DIR, 'store-4-options.png') });
  console.log(`🖼️  store-4-options.png`);
  await optPage.close();
  
  console.log('\n--- Creating Promotional Tile (440x280) ---\n');
  
  const promoHtml = `<!DOCTYPE html>
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
    .icon { font-size: 36px; }
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
  <span class="star" style="top: 15px; left: 25px">★</span>
  <span class="star" style="top: 35px; right: 45px">★</span>
  <span class="star" style="bottom: 55px; left: 55px">★</span>
  <span class="star" style="bottom: 25px; right: 75px">★</span>
  <span class="star" style="top: 70px; left: 48%">★</span>
  <span class="star" style="top: 25px; left: 40%">★</span>
  <span class="star" style="bottom: 70px; right: 35%">★</span>
  <span class="star" style="top: 50px; left: 15%">★</span>
  <span class="star" style="bottom: 40px; left: 20%">★</span>
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
</html>`;
  
  const promoHtmlPath = path.join(tmpDir, 'promo.html');
  await fs.writeFile(promoHtmlPath, promoHtml);
  
  const promoPage = await browser.newPage();
  await promoPage.setViewport({ width: 440, height: 280 });
  await promoPage.goto(`file://${promoHtmlPath}`, { waitUntil: 'networkidle0' });
  await delay(200);
  
  const promoPath = path.join(__dirname, 'store/promo-tile.png');
  await promoPage.screenshot({ path: promoPath });
  console.log(`🎨 promo-tile.png`);
  await promoPage.close();
  
  await browser.close();
  
  // Cleanup tmp
  await fs.rm(tmpDir, { recursive: true });
  
  console.log('\n✅ Done! Generated files:\n');
  
  const files = await fs.readdir(SCREENSHOT_DIR);
  for (const file of files.sort()) {
    const stats = await fs.stat(path.join(SCREENSHOT_DIR, file));
    console.log(`  📷 screenshots/${file} (${Math.round(stats.size / 1024)}KB)`);
  }
  
  const promoStats = await fs.stat(promoPath);
  console.log(`  🎨 promo-tile.png (${Math.round(promoStats.size / 1024)}KB)`);
}

main().catch(console.error);
