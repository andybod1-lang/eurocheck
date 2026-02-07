#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require("node:fs/promises");
const path = require("node:path");

const METRICS_PATH = path.join("data", "metrics-history.json");

const DEFAULT_HEADERS = {
  "user-agent":
    "EuroCheckMetricsTracker/1.0 (+https://github.com/pekka-eu/eurocheck)",
  "accept-language": "en-US,en;q=0.9",
  accept: "text/html,application/json;q=0.9,*/*;q=0.8",
};

const RETRY_LIMIT = 4;
const RETRY_BASE_DELAY_MS = 1200;
const REQUEST_TIMEOUT_MS = 15000;
const RATE_LIMIT_DELAY_MS = 600;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isFiniteNumber(value) {
  return Number.isFinite(value);
}

function toNumber(value) {
  if (value == null) return null;
  const cleaned = String(value).replace(/[^\d.]/g, "");
  if (!cleaned) return null;
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : null;
}

function formatNumber(value) {
  if (!isFiniteNumber(value)) return "n/a";
  return new Intl.NumberFormat("en-US").format(value);
}

function formatRating(value) {
  if (!isFiniteNumber(value)) return "n/a";
  return value.toFixed(2);
}

async function fetchWithRetry(url, options = {}) {
  let attempt = 0;
  let lastErr;

  while (attempt <= RETRY_LIMIT) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const res = await fetch(url, {
        headers: DEFAULT_HEADERS,
        redirect: "follow",
        signal: controller.signal,
        ...options,
      });

      clearTimeout(timeoutId);

      if (res.status === 429 || res.status === 503 || res.status === 502) {
        const retryAfter = res.headers.get("retry-after");
        const retryMs = retryAfter
          ? Number(retryAfter) * 1000
          : RETRY_BASE_DELAY_MS * Math.pow(2, attempt);
        await sleep(retryMs + Math.floor(Math.random() * 250));
        attempt += 1;
        continue;
      }

      if (!res.ok) {
        throw new Error(`HTTP ${res.status} for ${url}`);
      }

      await sleep(RATE_LIMIT_DELAY_MS + Math.floor(Math.random() * 150));
      return res;
    } catch (err) {
      clearTimeout(timeoutId);
      lastErr = err;
      const backoff = RETRY_BASE_DELAY_MS * Math.pow(2, attempt);
      await sleep(backoff + Math.floor(Math.random() * 250));
      attempt += 1;
    }
  }

  throw lastErr || new Error(`Failed to fetch ${url}`);
}

function extractJsonLd(html) {
  const scripts = [];
  const regex =
    /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const raw = match[1].trim();
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        scripts.push(...parsed);
      } else {
        scripts.push(parsed);
      }
    } catch {
      // ignore invalid JSON-LD
    }
  }
  return scripts;
}

function pickJsonLdByType(jsonLds, types) {
  for (const item of jsonLds) {
    const itemType = item["@type"];
    if (!itemType) continue;
    if (Array.isArray(itemType) && itemType.some((t) => types.includes(t))) {
      return item;
    }
    if (types.includes(itemType)) return item;
  }
  return null;
}

function extractChromeUsers(html) {
  const m = html.match(/([\d,.]+)\+?\s+users/i);
  return m ? toNumber(m[1]) : null;
}

function extractChromeRating(html, appLd) {
  const fromLd =
    appLd &&
    appLd.aggregateRating &&
    appLd.aggregateRating.ratingValue &&
    Number(appLd.aggregateRating.ratingValue);
  if (isFiniteNumber(fromLd)) return fromLd;
  const m = html.match(/"ratingValue"\s*:\s*"([\d.]+)"/i);
  return m ? toNumber(m[1]) : null;
}

function extractChromeVersion(html, appLd) {
  const fromLd = appLd && (appLd.softwareVersion || appLd.version);
  if (fromLd) return String(fromLd).trim();
  const itemprop = html.match(
    /itemprop="softwareVersion"[^>]*>([^<]+)</i
  );
  if (itemprop) return itemprop[1].trim();
  const labelMatch = html.match(/Version<\/[^>]*>\s*<[^>]*>([^<]+)</i);
  if (labelMatch) return labelMatch[1].trim();
  const jsonMatch = html.match(/"version"\s*:\s*"([^"]+)"/i);
  return jsonMatch ? jsonMatch[1].trim() : null;
}

async function fetchChromeMetrics() {
  const chromeUrl = process.env.CHROME_WEBSTORE_URL;
  const chromeId = process.env.CHROME_EXTENSION_ID;
  const chromeSlug = process.env.CHROME_EXTENSION_SLUG;

  const candidates = [];
  if (chromeUrl) candidates.push(chromeUrl);
  if (chromeId && chromeSlug) {
    candidates.push(
      `https://chromewebstore.google.com/detail/${chromeSlug}/${chromeId}`,
      `https://chrome.google.com/webstore/detail/${chromeSlug}/${chromeId}`
    );
  } else if (chromeId) {
    candidates.push(
      `https://chromewebstore.google.com/detail/${chromeId}`,
      `https://chrome.google.com/webstore/detail/${chromeId}`
    );
  }

  if (candidates.length === 0) {
    throw new Error(
      "Missing Chrome config. Set CHROME_WEBSTORE_URL or CHROME_EXTENSION_ID (and optional CHROME_EXTENSION_SLUG)."
    );
  }

  let lastErr;
  for (const url of candidates) {
    try {
      const res = await fetchWithRetry(url);
      const html = await res.text();
      const jsonLds = extractJsonLd(html);
      const appLd = pickJsonLdByType(jsonLds, [
        "SoftwareApplication",
        "WebApplication",
      ]);
      return {
        source: url,
        users: extractChromeUsers(html),
        rating: extractChromeRating(html, appLd),
        version: extractChromeVersion(html, appLd),
      };
    } catch (err) {
      lastErr = err;
    }
  }

  throw lastErr || new Error("Failed to fetch Chrome metrics.");
}

async function fetchFirefoxMetrics() {
  const firefoxId = process.env.FIREFOX_ADDON_ID;
  const firefoxSlug = process.env.FIREFOX_ADDON_SLUG;
  const identifier = firefoxId || firefoxSlug;

  if (!identifier) {
    throw new Error(
      "Missing Firefox config. Set FIREFOX_ADDON_ID or FIREFOX_ADDON_SLUG."
    );
  }

  const url = `https://addons.mozilla.org/api/v5/addons/addon/${identifier}/`;
  const res = await fetchWithRetry(url, {
    headers: {
      ...DEFAULT_HEADERS,
      accept: "application/json",
    },
  });
  const data = await res.json();

  return {
    source: url,
    users: isFiniteNumber(data.average_daily_users)
      ? Number(data.average_daily_users)
      : null,
    rating: isFiniteNumber(data.ratings && data.ratings.average)
      ? Number(data.ratings.average)
      : null,
    version: data.current_version && data.current_version.version
      ? String(data.current_version.version)
      : null,
  };
}

async function loadHistory() {
  try {
    const raw = await fs.readFile(METRICS_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    if (parsed && Array.isArray(parsed.history)) return parsed.history;
    return [];
  } catch (err) {
    if (err.code === "ENOENT") return [];
    console.warn(`Failed to read metrics history: ${err.message}`);
    return [];
  }
}

async function writeHistory(history) {
  await fs.mkdir(path.dirname(METRICS_PATH), { recursive: true });
  const tmpPath = `${METRICS_PATH}.tmp`;
  await fs.writeFile(tmpPath, JSON.stringify(history, null, 2), "utf-8");
  await fs.rename(tmpPath, METRICS_PATH);
}

function summarize(history) {
  if (!history.length) {
    console.log("No metrics history found.");
    return;
  }

  const latest = history[history.length - 1];
  const previous = history.length > 1 ? history[history.length - 2] : null;

  const start = history[0];
  const end = latest;

  console.log(
    `Metrics report (${history.length} records, ${start.timestamp} → ${end.timestamp})`
  );
  console.log(
    `Latest: Chrome users ${formatNumber(
      latest.chrome_users
    )}, rating ${formatRating(latest.chrome_rating)}, version ${
      latest.chrome_version || "n/a"
    }`
  );
  console.log(
    `        Firefox users ${formatNumber(
      latest.firefox_users
    )}, rating ${formatRating(latest.firefox_rating)}, version ${
      latest.firefox_version || "n/a"
    }`
  );
  console.log(`        Total users ${formatNumber(latest.total_users)}`);

  if (previous) {
    const deltaChromeUsers = isFiniteNumber(latest.chrome_users)
      ? latest.chrome_users - (previous.chrome_users || 0)
      : null;
    const deltaFirefoxUsers = isFiniteNumber(latest.firefox_users)
      ? latest.firefox_users - (previous.firefox_users || 0)
      : null;
    const deltaTotalUsers = isFiniteNumber(latest.total_users)
      ? latest.total_users - (previous.total_users || 0)
      : null;
    const deltaChromeRating = isFiniteNumber(latest.chrome_rating)
      ? latest.chrome_rating - (previous.chrome_rating || 0)
      : null;
    const deltaFirefoxRating = isFiniteNumber(latest.firefox_rating)
      ? latest.firefox_rating - (previous.firefox_rating || 0)
      : null;

    console.log(
      `Change since previous (${previous.timestamp}): Chrome users ${formatNumber(
        deltaChromeUsers
      )}, rating ${formatRating(deltaChromeRating)}`
    );
    console.log(
      `                                   Firefox users ${formatNumber(
        deltaFirefoxUsers
      )}, rating ${formatRating(deltaFirefoxRating)}`
    );
    console.log(
      `                                   Total users ${formatNumber(
        deltaTotalUsers
      )}`
    );
  }
}

function buildRecord({ chrome, firefox }) {
  const chromeUsers = isFiniteNumber(chrome.users) ? chrome.users : null;
  const firefoxUsers = isFiniteNumber(firefox.users) ? firefox.users : null;
  const totalUsers =
    chromeUsers != null || firefoxUsers != null
      ? (chromeUsers || 0) + (firefoxUsers || 0)
      : null;

  return {
    timestamp: new Date().toISOString(),
    chrome_users: chromeUsers,
    chrome_rating: isFiniteNumber(chrome.rating) ? chrome.rating : null,
    chrome_version: chrome.version || null,
    firefox_users: firefoxUsers,
    firefox_rating: isFiniteNumber(firefox.rating) ? firefox.rating : null,
    firefox_version: firefox.version || null,
    total_users: totalUsers,
  };
}

function parseArgs(argv) {
  const flags = new Set(argv.slice(2));
  return {
    report: flags.has("--report"),
    fetch: flags.has("--fetch"),
    help: flags.has("--help") || flags.has("-h"),
  };
}

async function main() {
  const { report, fetch, help } = parseArgs(process.argv);

  if (help) {
    console.log(
      "Usage: node scripts/metrics-tracker.js [--report] [--fetch]\n" +
        "  --report  Print summary from data/metrics-history.json\n" +
        "  --fetch   Force fetch even when --report is present\n\n" +
        "Environment variables:\n" +
        "  CHROME_WEBSTORE_URL or CHROME_EXTENSION_ID (+ optional CHROME_EXTENSION_SLUG)\n" +
        "  FIREFOX_ADDON_ID or FIREFOX_ADDON_SLUG"
    );
    return;
  }

  if (report && !fetch) {
    const history = await loadHistory();
    summarize(history);
    return;
  }

  console.log("Fetching Chrome Web Store metrics...");
  const chrome = await fetchChromeMetrics();
  console.log("Fetching Firefox Add-ons metrics...");
  const firefox = await fetchFirefoxMetrics();

  const history = await loadHistory();
  const record = buildRecord({ chrome, firefox });
  history.push(record);
  await writeHistory(history);

  console.log(`Saved metrics to ${METRICS_PATH}`);

  if (report) {
    summarize(history);
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
