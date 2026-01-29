/* eslint-disable no-console */
'use strict';

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');

const DATA_PATH = path.resolve(__dirname, '..', 'data', 'chrome-stats.json');

function nowIso() {
  return new Date().toISOString();
}

function toNumber(value) {
  if (value == null) return null;
  const cleaned = String(value).replace(/[, ]/g, '').trim();
  if (!cleaned) return null;
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : null;
}

function parseCompactNumber(raw) {
  if (!raw) return null;
  const s = String(raw).toLowerCase().replace(/,/g, '').trim();
  const m = s.match(/([0-9]*\.?[0-9]+)\s*([kmb])?/i);
  if (!m) return toNumber(s);
  const n = Number(m[1]);
  if (!Number.isFinite(n)) return null;
  const unit = m[2];
  if (unit === 'k') return Math.round(n * 1e3);
  if (unit === 'm') return Math.round(n * 1e6);
  if (unit === 'b') return Math.round(n * 1e9);
  return Math.round(n);
}

function readJsonSafe(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.warn('[chrome-store] Failed to read existing JSON:', err.message);
    return null;
  }
}

function writeJsonSafe(filePath, data) {
  try {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
    return true;
  } catch (err) {
    console.error('[chrome-store] Failed to write JSON:', err.message);
    return false;
  }
}

function extractFromJsonLd($) {
  const script = $('script[type="application/ld+json"]').first().text();
  if (!script) return {};
  try {
    const json = JSON.parse(script);
    const aggregate = json.aggregateRating || {};
    return {
      rating: toNumber(aggregate.ratingValue),
      reviewCount: toNumber(aggregate.reviewCount),
    };
  } catch {
    return {};
  }
}

function extractFromText($) {
  const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
  const out = {};

  // Install count / users (best-effort)
  // Look for patterns like "1,234,567 users" or "1.2M users"
  const usersMatch =
    bodyText.match(/([0-9][0-9,\.]*\s*[kmb]?)\s+users?/i) ||
    bodyText.match(/users?\s*:\s*([0-9][0-9,\.]*\s*[kmb]?)/i);

  if (usersMatch) {
    out.activeUsersEstimate = parseCompactNumber(usersMatch[1]);
  }

  // Install count is often "downloads" or "installs"
  const installsMatch =
    bodyText.match(/([0-9][0-9,\.]*\s*[kmb]?)\s+(installs|downloads)/i) ||
    bodyText.match(/(installs|downloads)\s*:\s*([0-9][0-9,\.]*\s*[kmb]?)/i);

  if (installsMatch) {
    const val = installsMatch[1] && installsMatch[2] ? installsMatch[2] : installsMatch[1];
    out.installCount = parseCompactNumber(val);
  }

  // Rating (fallback, if JSON-LD not present)
  const ratingMatch =
    bodyText.match(/([0-9]\.?[0-9]*)\s+out\s+of\s+5/i) ||
    bodyText.match(/rating\s*:\s*([0-9]\.?[0-9]*)/i);

  if (ratingMatch) {
    out.rating = toNumber(ratingMatch[1]);
  }

  // Review count
  const reviewsMatch =
    bodyText.match(/([0-9][0-9,\.]*)\s+ratings?/i) ||
    bodyText.match(/([0-9][0-9,\.]*)\s+reviews?/i);

  if (reviewsMatch) {
    out.reviewCount = toNumber(reviewsMatch[1]);
  }

  return out;
}

function buildUrl(extensionId) {
  if (process.env.CWS_URL) return process.env.CWS_URL;
  // If extensionId already includes a slash, treat it as path after /detail/
  if (extensionId.includes('/')) {
    return `https://chromewebstore.google.com/detail/${extensionId}`;
  }
  return `https://chromewebstore.google.com/detail/${extensionId}`;
}

async function fetchStats(extensionId) {
  const url = buildUrl(extensionId);
  const res = await axios.get(url, {
    headers: {
      'user-agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36',
      accept: 'text/html,application/xhtml+xml',
    },
    timeout: 15000,
  });

  const $ = cheerio.load(res.data);
  const fromJsonLd = extractFromJsonLd($);
  const fromText = extractFromText($);

  return {
    sourceUrl: url,
    rating: fromJsonLd.rating ?? fromText.rating ?? null,
    reviewCount: fromJsonLd.reviewCount ?? fromText.reviewCount ?? null,
    installCount: fromText.installCount ?? null,
    activeUsersEstimate: fromText.activeUsersEstimate ?? null,
  };
}

async function main() {
  const extensionId = process.env.EXTENSION_ID || process.argv[2] || 'eurocheck';
  const timestamp = nowIso();

  try {
    const stats = await fetchStats(extensionId);

    const entry = {
      timestamp,
      extensionId,
      ...stats,
    };

    const existing = readJsonSafe(DATA_PATH) || {};
    const history = Array.isArray(existing.history) ? existing.history : [];

    history.push(entry);

    const output = {
      extensionId,
      sourceUrl: stats.sourceUrl,
      lastUpdated: timestamp,
      latest: entry,
      history,
    };

    if (writeJsonSafe(DATA_PATH, output)) {
      console.log('[chrome-store] Stats collected:', entry);
    } else {
      process.exitCode = 1;
    }
  } catch (err) {
    console.error('[chrome-store] Failed to collect stats:', err.message);
    process.exitCode = 1;
  }
}

main();
