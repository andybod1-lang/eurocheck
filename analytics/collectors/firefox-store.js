/* eslint-disable no-console */
'use strict';

const fs = require('fs');
const path = require('path');
const axios = require('axios');

const DATA_PATH = path.resolve(__dirname, '..', 'data', 'firefox-stats.json');
const BASE_URL = 'https://addons.mozilla.org/api/v5/addons/addon/';

function nowIso() {
  return new Date().toISOString();
}

function toNumber(value) {
  if (value == null) return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function readJsonSafe(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.warn('[firefox-store] Failed to read existing JSON:', err.message);
    return null;
  }
}

function writeJsonSafe(filePath, data) {
  try {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
    return true;
  } catch (err) {
    console.error('[firefox-store] Failed to write JSON:', err.message);
    return false;
  }
}

function buildUrl(slug) {
  return `${BASE_URL}${encodeURIComponent(slug)}/`;
}

async function fetchStats(slug) {
  const url = buildUrl(slug);
  const res = await axios.get(url, {
    headers: {
      'user-agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36',
      accept: 'application/json',
    },
    timeout: 15000,
  });

  const data = res.data || {};
  const ratings = data.ratings || {};

  return {
    sourceUrl: url,
    dailyActiveUsers: toNumber(data.average_daily_users),
    downloads: toNumber(data.weekly_downloads),
    averageRating: toNumber(ratings.average),
    reviewCount: toNumber(ratings.text_count ?? ratings.count),
  };
}

async function main() {
  const addonSlug = process.env.ADDON_SLUG || process.argv[2] || 'eurocheck';
  const timestamp = nowIso();

  try {
    const stats = await fetchStats(addonSlug);

    const entry = {
      timestamp,
      addonSlug,
      ...stats,
    };

    const existing = readJsonSafe(DATA_PATH) || {};
    const history = Array.isArray(existing.history) ? existing.history : [];

    history.push(entry);

    const output = {
      addonSlug,
      sourceUrl: stats.sourceUrl,
      lastUpdated: timestamp,
      latest: entry,
      history,
    };

    if (writeJsonSafe(DATA_PATH, output)) {
      console.log('[firefox-store] Stats collected:', entry);
    } else {
      process.exitCode = 1;
    }
  } catch (err) {
    console.error('[firefox-store] Failed to collect stats:', err.message);
    process.exitCode = 1;
  }
}

main();
