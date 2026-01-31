#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require("node:fs/promises");
const path = require("node:path");

const DEFAULT_HEADERS = {
  "user-agent":
    "EurocheckCompetitorScraper/1.0 (Node.js fetch; +contact: dev@eurocheck)",
  "accept-language": "en-US,en;q=0.9",
  accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
};

const RATE_LIMIT_DELAY_MS = 1200;
const RETRY_LIMIT = 5;
const RETRY_BASE_DELAY_MS = 1500;

const TARGETS = [
  "Honey",
  "RetailMeNot",
  "CamelCamelCamel",
  "Keepa",
  "Idealo",
  "PriceRunner",
  "Kelkoo",
  "ShopMania",
  "ShopSavvy",
  "Pricy",
  "price comparison",
  "shopping assistant",
  "cashback",
  "coupon",
  "deal finder",
  "european shopping",
  "eu shopping",
];

const CHROME_SEARCH_URL = (q) =>
  `https://chromewebstore.google.com/search/${encodeURIComponent(q)}`;
const FIREFOX_SEARCH_URL = (q) =>
  `https://addons.mozilla.org/en-US/firefox/search/?q=${encodeURIComponent(q)}`;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toNumber(text) {
  if (!text) return null;
  const cleaned = String(text).replace(/[^\d.]/g, "");
  if (!cleaned) return null;
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : null;
}

function uniq(arr) {
  return [...new Set(arr)];
}

async function fetchWithRetry(url, options = {}) {
  let attempt = 0;
  let lastErr;
  while (attempt <= RETRY_LIMIT) {
    try {
      const res = await fetch(url, {
        headers: DEFAULT_HEADERS,
        redirect: "follow",
        ...options,
      });

      if (res.status === 429 || res.status === 503 || res.status === 502) {
        const retryAfter = res.headers.get("retry-after");
        const retryMs = retryAfter
          ? Number(retryAfter) * 1000
          : RETRY_BASE_DELAY_MS * Math.pow(2, attempt);
        await sleep(retryMs + Math.floor(Math.random() * 300));
        attempt += 1;
        continue;
      }

      if (!res.ok) {
        throw new Error(`HTTP ${res.status} for ${url}`);
      }

      const text = await res.text();
      await sleep(RATE_LIMIT_DELAY_MS + Math.floor(Math.random() * 250));
      return text;
    } catch (err) {
      lastErr = err;
      const backoff = RETRY_BASE_DELAY_MS * Math.pow(2, attempt);
      await sleep(backoff + Math.floor(Math.random() * 300));
      attempt += 1;
    }
  }
  throw lastErr || new Error(`Failed to fetch ${url}`);
}

function extractJsonLd(html) {
  const scripts = [];
  const regex = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
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
      // Ignore invalid JSON-LD blocks
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

function extractMetaDescription(html) {
  const m = html.match(
    /<meta[^>]+name="description"[^>]+content="([^"]+)"[^>]*>/i
  );
  return m ? m[1].trim() : null;
}

function extractTextBetween(html, label) {
  const re = new RegExp(`${label}\\s*([^<\\n]+)`, "i");
  const m = html.match(re);
  return m ? m[1].trim() : null;
}

function extractUserCountGeneric(html) {
  const m = html.match(/([\d,.]+)\+?\s+users/i);
  return m ? toNumber(m[1]) : null;
}

function extractFirefoxUsers(html) {
  const m = html.match(/Users\s*([\d,.]+)/i);
  return m ? toNumber(m[1]) : null;
}

function extractDateGeneric(html, label) {
  const re = new RegExp(`${label}\\s*([^<\\n]+)`, "i");
  const m = html.match(re);
  return m ? m[1].trim() : null;
}

function normalizeRecord(record) {
  return {
    name: record.name || null,
    rating: record.rating != null ? Number(record.rating) : null,
    userCount: record.userCount != null ? Number(record.userCount) : null,
    lastUpdated: record.lastUpdated || null,
    description: record.description || null,
    storeUrl: record.storeUrl,
    platform: record.platform,
    scrapedAt: new Date().toISOString(),
  };
}

async function scrapeChromeDetail(url) {
  const html = await fetchWithRetry(url);
  const jsonLds = extractJsonLd(html);
  const appLd = pickJsonLdByType(jsonLds, ["SoftwareApplication", "WebApplication"]);
  const name =
    (appLd && appLd.name) ||
    (html.match(/<h1[^>]*>([^<]+)<\/h1>/i)?.[1] || null);
  const rating =
    (appLd && appLd.aggregateRating && appLd.aggregateRating.ratingValue) ||
    (html.match(/"ratingValue"\s*:\s*"([\d.]+)"/i)?.[1] || null);
  const userCount =
    extractUserCountGeneric(html) ||
    (appLd &&
      appLd.aggregateRating &&
      appLd.aggregateRating.ratingCount &&
      Number(appLd.aggregateRating.ratingCount)) ||
    null;
  const lastUpdated =
    (appLd && appLd.dateModified) ||
    extractDateGeneric(html, "Updated") ||
    null;
  const description =
    (appLd && appLd.description) || extractMetaDescription(html) || null;

  return normalizeRecord({
    platform: "chrome",
    storeUrl: url,
    name,
    rating,
    userCount,
    lastUpdated,
    description,
  });
}

async function scrapeFirefoxDetail(url) {
  const html = await fetchWithRetry(url);
  const jsonLds = extractJsonLd(html);
  const appLd = pickJsonLdByType(jsonLds, ["SoftwareApplication", "WebApplication"]);
  const name =
    (appLd && appLd.name) ||
    (html.match(/<h1[^>]*>([^<]+)<\/h1>/i)?.[1] || null);
  const rating =
    (appLd && appLd.aggregateRating && appLd.aggregateRating.ratingValue) ||
    (html.match(/"ratingValue"\s*:\s*"([\d.]+)"/i)?.[1] || null);
  const userCount =
    extractFirefoxUsers(html) ||
    (appLd &&
      appLd.aggregateRating &&
      appLd.aggregateRating.ratingCount &&
      Number(appLd.aggregateRating.ratingCount)) ||
    null;
  const lastUpdated =
    (appLd && appLd.dateModified) ||
    extractDateGeneric(html, "Last updated") ||
    null;
  const description =
    (appLd && appLd.description) || extractMetaDescription(html) || null;

  return normalizeRecord({
    platform: "firefox",
    storeUrl: url,
    name,
    rating,
    userCount,
    lastUpdated,
    description,
  });
}

function extractChromeDetailLinks(html) {
  const links = [];
  const re = /https:\/\/chromewebstore\.google\.com\/detail\/[^"'?\s]+/gi;
  let match;
  while ((match = re.exec(html)) !== null) {
    links.push(match[0]);
  }
  return uniq(links);
}

function extractFirefoxDetailLinks(html) {
  const links = [];
  const re = /href="(\/en-US\/firefox\/addon\/[^"?#]+)"/gi;
  let match;
  while ((match = re.exec(html)) !== null) {
    links.push(`https://addons.mozilla.org${match[1]}`);
  }
  return uniq(links);
}

async function scrapeChrome() {
  const detailUrls = new Set();
  for (const term of TARGETS) {
    const html = await fetchWithRetry(CHROME_SEARCH_URL(term));
    for (const url of extractChromeDetailLinks(html)) {
      detailUrls.add(url);
    }
  }

  const results = [];
  for (const url of detailUrls) {
    try {
      const record = await scrapeChromeDetail(url);
      if (record.name) results.push(record);
    } catch (err) {
      console.warn(`Chrome scrape failed for ${url}: ${err.message}`);
    }
  }

  return results;
}

async function scrapeFirefox() {
  const detailUrls = new Set();
  for (const term of TARGETS) {
    const html = await fetchWithRetry(FIREFOX_SEARCH_URL(term));
    for (const url of extractFirefoxDetailLinks(html)) {
      detailUrls.add(url);
    }
  }

  const results = [];
  for (const url of detailUrls) {
    try {
      const record = await scrapeFirefoxDetail(url);
      if (record.name) results.push(record);
    } catch (err) {
      console.warn(`Firefox scrape failed for ${url}: ${err.message}`);
    }
  }

  return results;
}

function parseArgs(argv) {
  const flags = new Set(argv.slice(2));
  const chrome = flags.has("--chrome");
  const firefox = flags.has("--firefox");
  return {
    chrome: chrome || (!chrome && !firefox),
    firefox: firefox || (!chrome && !firefox),
  };
}

async function main() {
  const { chrome, firefox } = parseArgs(process.argv);

  if (!chrome && !firefox) {
    console.error("Usage: node scripts/competitor-scraper.js --chrome --firefox");
    process.exit(1);
  }

  const output = {
    generatedAt: new Date().toISOString(),
    competitors: [],
  };

  if (chrome) {
    console.log("Scraping Chrome Web Store...");
    const chromeResults = await scrapeChrome();
    output.competitors.push(...chromeResults);
  }

  if (firefox) {
    console.log("Scraping Firefox Add-ons...");
    const firefoxResults = await scrapeFirefox();
    output.competitors.push(...firefoxResults);
  }

  const outPath = path.join("data", "competitors.json");
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, JSON.stringify(output, null, 2), "utf-8");
  console.log(`Saved ${output.competitors.length} records to ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
