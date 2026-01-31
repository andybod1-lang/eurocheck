const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs').promises;

// Device presets for responsive screenshots
const DEVICES = {
  desktop: { width: 1920, height: 1080 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 812 }
};

/**
 * Capture a screenshot of a URL
 * @param {string} url - The URL to capture
 * @param {object} options - Capture options
 * @returns {Promise<string>} - Path to saved screenshot
 */
async function captureScreenshot(url, options = {}) {
  const {
    output = 'screenshot.png',
    fullPage = false,
    width = 1920,
    height = 1080,
    device = null,
    delay = 1000
  } = options;

  // Get viewport dimensions
  let viewport = { width, height };
  if (device && DEVICES[device]) {
    viewport = DEVICES[device];
  }

  // Ensure output directory exists
  const outputDir = path.dirname(output);
  if (outputDir && outputDir !== '.') {
    await fs.mkdir(outputDir, { recursive: true });
  }

  // Launch browser
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({
      width: viewport.width,
      height: viewport.height,
      deviceScaleFactor: device === 'mobile' ? 2 : 1
    });

    // Navigate to URL
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Wait for any animations to settle
    if (delay > 0) {
      await new Promise(r => setTimeout(r, delay));
    }

    // Take screenshot
    await page.screenshot({
      path: output,
      fullPage,
      type: output.endsWith('.jpg') || output.endsWith('.jpeg') ? 'jpeg' : 'png'
    });

    return path.resolve(output);
  } finally {
    await browser.close();
  }
}

/**
 * Capture multiple responsive screenshots
 * @param {string} url - The URL to capture
 * @param {string} outputDir - Output directory
 * @returns {Promise<string[]>} - Paths to saved screenshots
 */
async function captureResponsive(url, outputDir = './screenshots') {
  const results = [];
  
  for (const [deviceName, viewport] of Object.entries(DEVICES)) {
    const output = path.join(outputDir, `${deviceName}.png`);
    const result = await captureScreenshot(url, {
      output,
      ...viewport,
      device: deviceName
    });
    results.push(result);
  }
  
  return results;
}

/**
 * Capture a specific element
 * @param {string} url - The URL
 * @param {string} selector - CSS selector
 * @param {string} output - Output path
 * @returns {Promise<string>} - Path to saved screenshot
 */
async function captureElement(url, selector, output = 'element.png') {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });
    
    const element = await page.$(selector);
    if (!element) {
      throw new Error(`Element not found: ${selector}`);
    }

    await element.screenshot({ path: output });
    return path.resolve(output);
  } finally {
    await browser.close();
  }
}

module.exports = {
  captureScreenshot,
  captureResponsive,
  captureElement,
  DEVICES
};
