#!/usr/bin/env node
/**
 * EuroCheck Analytics Collector
 * Collects metrics from Chrome Web Store, Firefox Add-ons, and other sources
 * Run via cron job every 6 hours
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const DATA_DIR = path.join(__dirname, '../data');
const HISTORY_DIR = path.join(DATA_DIR, 'history');
const CURRENT_FILE = path.join(DATA_DIR, 'current.json');

// Extension IDs
const CHROME_EXTENSION_ID = process.env.CHROME_EXTENSION_ID || 'your-chrome-extension-id';
const FIREFOX_ADDON_ID = process.env.FIREFOX_ADDON_ID || 'eurocheck';

async function main() {
  console.log(`📊 EuroCheck Analytics Collector - ${new Date().toISOString()}`);
  
  // Ensure directories exist
  if (!fs.existsSync(HISTORY_DIR)) {
    fs.mkdirSync(HISTORY_DIR, { recursive: true });
  }
  
  // Load current data
  let current = {};
  if (fs.existsSync(CURRENT_FILE)) {
    current = JSON.parse(fs.readFileSync(CURRENT_FILE, 'utf-8'));
  }
  
  const today = new Date().toISOString().split('T')[0];
  
  // Collect metrics
  console.log('  Collecting Chrome Web Store metrics...');
  const chromeMetrics = await collectChromeMetrics();
  
  console.log('  Collecting Firefox Add-ons metrics...');
  const firefoxMetrics = await collectFirefoxMetrics();
  
  // Build daily snapshot
  const dailySnapshot = {
    date: today,
    timestamp: new Date().toISOString(),
    chrome: chromeMetrics,
    firefox: firefoxMetrics,
    edge: { users: 0, installs: 0, rating: 0, reviewCount: 0 }, // Future support
    totals: {
      totalUsers: (chromeMetrics.users || 0) + (firefoxMetrics.users || 0),
      totalInstalls: (chromeMetrics.installs || 0) + (firefoxMetrics.installs || 0),
      totalReviews: (chromeMetrics.reviewCount || 0) + (firefoxMetrics.reviewCount || 0),
      avgRating: calculateAvgRating([chromeMetrics, firefoxMetrics])
    }
  };
  
  // Save to history
  const historyFile = path.join(HISTORY_DIR, `${today}-daily.json`);
  fs.writeFileSync(historyFile, JSON.stringify(dailySnapshot, null, 2));
  console.log(`  ✅ Saved daily snapshot: ${historyFile}`);
  
  // Update current.json
  current.daily = current.daily || [];
  
  // Remove old entry for today if exists
  current.daily = current.daily.filter(d => d.date !== today);
  current.daily.push(dailySnapshot);
  
  // Keep only last 90 days
  current.daily = current.daily
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 90);
  
  current.meta = current.meta || {};
  current.meta.lastUpdated = new Date().toISOString();
  
  fs.writeFileSync(CURRENT_FILE, JSON.stringify(current, null, 2));
  console.log(`  ✅ Updated current.json`);
  
  // Check alerts
  await checkAlerts(current, dailySnapshot);
  
  console.log('✅ Collection complete!');
  console.log(`  Total users: ${dailySnapshot.totals.totalUsers}`);
  console.log(`  Total installs: ${dailySnapshot.totals.totalInstalls}`);
  console.log(`  Avg rating: ${dailySnapshot.totals.avgRating.toFixed(2)}`);
}

async function collectChromeMetrics() {
  // In production, this would call Chrome Web Store API
  // For now, return placeholder that can be filled by manual entry or API integration
  try {
    // Try to read from a Chrome API response cache if available
    const cacheFile = path.join(DATA_DIR, 'cache/chrome-latest.json');
    if (fs.existsSync(cacheFile)) {
      return JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
    }
  } catch (e) {
    // Ignore cache errors
  }
  
  return {
    users: null, // Will be populated by Chrome Web Store API integration
    installs: null,
    uninstalls: null,
    rating: null,
    reviewCount: null,
    version: null,
    _note: 'Populate via Chrome Web Store Developer Dashboard API'
  };
}

async function collectFirefoxMetrics() {
  // Firefox Add-ons API is public
  try {
    const data = await fetchJSON(`https://addons.mozilla.org/api/v5/addons/addon/${FIREFOX_ADDON_ID}/`);
    if (data) {
      return {
        users: data.average_daily_users || 0,
        installs: data.total_downloads || 0,
        rating: data.ratings?.average || 0,
        reviewCount: data.ratings?.count || 0,
        version: data.current_version?.version || null
      };
    }
  } catch (e) {
    console.warn(`  ⚠️ Firefox API error: ${e.message}`);
  }
  
  return {
    users: null,
    installs: null,
    rating: null,
    reviewCount: null,
    version: null
  };
}

function calculateAvgRating(platforms) {
  const valid = platforms.filter(p => p.rating && p.reviewCount);
  if (valid.length === 0) return 0;
  
  let totalWeightedRating = 0;
  let totalReviews = 0;
  
  for (const p of valid) {
    totalWeightedRating += p.rating * p.reviewCount;
    totalReviews += p.reviewCount;
  }
  
  return totalReviews > 0 ? totalWeightedRating / totalReviews : 0;
}

async function checkAlerts(current, snapshot) {
  const alerts = current.alerts || [];
  const previousDay = current.daily?.[1]; // Second item is yesterday after we added today
  
  for (const alert of alerts) {
    if (!alert.enabled) continue;
    
    const value = getNestedValue(snapshot, alert.metric);
    const prevValue = previousDay ? getNestedValue(previousDay, alert.metric) : null;
    
    let triggered = false;
    let message = '';
    
    switch (alert.condition) {
      case 'above':
        if (value > alert.threshold) {
          triggered = true;
          message = `🎉 ${alert.name}: ${alert.metric} is ${value} (above ${alert.threshold})`;
        }
        break;
      case 'below':
        if (value < alert.threshold) {
          triggered = true;
          message = `⚠️ ${alert.name}: ${alert.metric} is ${value} (below ${alert.threshold})`;
        }
        break;
      case 'change_above':
        if (prevValue !== null && value - prevValue > alert.threshold) {
          triggered = true;
          message = `📈 ${alert.name}: ${alert.metric} increased by ${value - prevValue}`;
        }
        break;
      case 'change_below':
        if (prevValue !== null && value - prevValue < alert.threshold) {
          triggered = true;
          message = `📉 ${alert.name}: ${alert.metric} decreased by ${prevValue - value}`;
        }
        break;
    }
    
    if (triggered) {
      console.log(`  🔔 ALERT: ${message}`);
      // In production, this would send to Telegram/email
      // For now, just log it
    }
  }
}

function getNestedValue(obj, path) {
  return path.split('.').reduce((o, k) => o?.[k], obj);
}

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'EuroCheck-Analytics/1.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

main().catch(err => {
  console.error('❌ Collection failed:', err);
  process.exit(1);
});
