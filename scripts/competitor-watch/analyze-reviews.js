#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Competitor Watch: Review Sentiment Analyzer
 * 
 * Analyzes reviews from Chrome Web Store and Firefox Add-ons to identify:
 * - Common complaints and pain points
 * - Praised features
 * - Feature requests
 * - Opportunities for EuroCheck
 */

const fs = require("node:fs/promises");
const path = require("node:path");

const DEFAULT_HEADERS = {
  "user-agent": "EurocheckAnalyzer/1.0 (Node.js fetch; +contact: dev@eurocheck)",
  "accept-language": "en-US,en;q=0.9",
  accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
};

const RATE_LIMIT_DELAY_MS = 1500;
const RETRY_LIMIT = 3;
const RETRY_BASE_DELAY_MS = 2000;

// Sentiment patterns
const COMPLAINT_PATTERNS = [
  /\b(bug|bugs|buggy)\b/i,
  /\b(crash|crashes|crashing|crashed)\b/i,
  /\b(slow|sluggish|laggy|lag)\b/i,
  /\b(broken|doesn't work|not working|stopped working)\b/i,
  /\b(useless|waste|garbage|trash)\b/i,
  /\b(annoying|frustrating|terrible|horrible|awful)\b/i,
  /\b(error|errors|fails|failed)\b/i,
  /\b(malware|spyware|privacy concern|tracking)\b/i,
  /\b(uninstall|removed|removing)\b/i,
  /\b(worst|hate|hated)\b/i,
  /\b(misleading|scam|fake)\b/i,
  /\b(memory hog|cpu|resource)\b/i,
  /\b(popup|popups|notifications spam)\b/i,
];

const PRAISE_PATTERNS = [
  /\b(great|excellent|amazing|awesome|fantastic)\b/i,
  /\b(love|loved|loving)\b/i,
  /\b(perfect|flawless|brilliant)\b/i,
  /\b(useful|helpful|handy|convenient)\b/i,
  /\b(best|favorite|favourite)\b/i,
  /\b(recommend|must have|essential)\b/i,
  /\b(works great|works well|works perfectly)\b/i,
  /\b(easy to use|simple|intuitive)\b/i,
  /\b(saves? (money|time))\b/i,
  /\b(thank|thanks|grateful)\b/i,
  /\b(impressive|outstanding)\b/i,
];

const FEATURE_REQUEST_PATTERNS = [
  /\b(wish|wished|hoping)\b/i,
  /\b(would be nice|would love|would like)\b/i,
  /\b(please add|please include|please support)\b/i,
  /\b(feature request|suggestion|suggest)\b/i,
  /\b(missing|lacks?|need|needs?)\b/i,
  /\b(should have|could have|could use)\b/i,
  /\b(want|wanted|wanting)\b/i,
  /\b(if only|hopefully)\b/i,
];

// Common complaint categories for aggregation
const COMPLAINT_CATEGORIES = {
  performance: ["slow", "lag", "sluggish", "memory", "cpu", "resource", "heavy"],
  bugs: ["bug", "crash", "error", "broken", "not working", "fails"],
  privacy: ["privacy", "tracking", "spyware", "malware", "data"],
  ui: ["popup", "notification", "annoying", "intrusive", "interface"],
  accuracy: ["wrong", "incorrect", "inaccurate", "misleading", "fake"],
  updates: ["update", "outdated", "stopped", "discontinued"],
  compatibility: ["doesn't work on", "not compatible", "support"],
};

// Praised feature categories
const PRAISE_CATEGORIES = {
  savings: ["save", "money", "discount", "deal", "price", "cheap"],
  ease: ["easy", "simple", "intuitive", "user friendly"],
  reliability: ["reliable", "consistent", "always works", "stable"],
  speed: ["fast", "quick", "instant"],
  coverage: ["many sites", "everywhere", "all stores", "wide support"],
  alerts: ["alert", "notify", "track", "watch"],
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
        const retryMs = RETRY_BASE_DELAY_MS * Math.pow(2, attempt);
        console.log(`Rate limited, waiting ${retryMs}ms...`);
        await sleep(retryMs);
        attempt += 1;
        continue;
      }

      if (!res.ok) {
        throw new Error(`HTTP ${res.status} for ${url}`);
      }

      const text = await res.text();
      await sleep(RATE_LIMIT_DELAY_MS);
      return text;
    } catch (err) {
      lastErr = err;
      await sleep(RETRY_BASE_DELAY_MS * Math.pow(2, attempt));
      attempt += 1;
    }
  }
  throw lastErr || new Error(`Failed to fetch ${url}`);
}

/**
 * Extract reviews from Chrome Web Store detail page
 */
function extractChromeReviews(html) {
  const reviews = [];
  
  // Try to find review text in the page
  // Chrome Web Store embeds reviews in various formats
  const reviewMatches = html.matchAll(/"reviewText"\s*:\s*"([^"]+)"/gi);
  for (const match of reviewMatches) {
    const text = match[1]
      .replace(/\\n/g, " ")
      .replace(/\\"/g, '"')
      .trim();
    if (text.length > 10) {
      reviews.push(text);
    }
  }
  
  // Also try to extract from visible review blocks
  const blockMatches = html.matchAll(/<div[^>]*class="[^"]*review[^"]*"[^>]*>([^<]{20,500})<\/div>/gi);
  for (const match of blockMatches) {
    const text = match[1].trim();
    if (text.length > 10 && !reviews.includes(text)) {
      reviews.push(text);
    }
  }
  
  return reviews;
}

/**
 * Extract reviews from Firefox Add-ons detail page
 */
function extractFirefoxReviews(html) {
  const reviews = [];
  
  // Firefox reviews are typically in rating cards
  const reviewMatches = html.matchAll(/<div[^>]*class="[^"]*UserReview[^"]*"[^>]*>[\s\S]*?<p[^>]*>([^<]+)<\/p>/gi);
  for (const match of reviewMatches) {
    const text = match[1].trim();
    if (text.length > 10) {
      reviews.push(text);
    }
  }
  
  // Also look for review body content
  const bodyMatches = html.matchAll(/class="[^"]*review-body[^"]*"[^>]*>([^<]+)</gi);
  for (const match of bodyMatches) {
    const text = match[1].trim();
    if (text.length > 10 && !reviews.includes(text)) {
      reviews.push(text);
    }
  }
  
  return reviews;
}

/**
 * Analyze a single review text
 */
function analyzeReview(text) {
  const result = {
    text: text.slice(0, 500), // Truncate for storage
    sentiment: "neutral",
    complaints: [],
    praise: [],
    featureRequests: [],
  };
  
  // Check for complaints
  for (const pattern of COMPLAINT_PATTERNS) {
    if (pattern.test(text)) {
      const match = text.match(pattern);
      if (match) result.complaints.push(match[0].toLowerCase());
    }
  }
  
  // Check for praise
  for (const pattern of PRAISE_PATTERNS) {
    if (pattern.test(text)) {
      const match = text.match(pattern);
      if (match) result.praise.push(match[0].toLowerCase());
    }
  }
  
  // Check for feature requests
  for (const pattern of FEATURE_REQUEST_PATTERNS) {
    if (pattern.test(text)) {
      const match = text.match(pattern);
      if (match) result.featureRequests.push(match[0].toLowerCase());
    }
  }
  
  // Determine overall sentiment
  if (result.complaints.length > result.praise.length) {
    result.sentiment = "negative";
  } else if (result.praise.length > result.complaints.length) {
    result.sentiment = "positive";
  }
  
  return result;
}

/**
 * Categorize complaints into themes
 */
function categorizeComplaints(complaints) {
  const categories = {};
  
  for (const [category, keywords] of Object.entries(COMPLAINT_CATEGORIES)) {
    categories[category] = 0;
    for (const complaint of complaints) {
      const lower = complaint.toLowerCase();
      if (keywords.some(kw => lower.includes(kw))) {
        categories[category]++;
      }
    }
  }
  
  return categories;
}

/**
 * Categorize praised features
 */
function categorizePraise(praises) {
  const categories = {};
  
  for (const [category, keywords] of Object.entries(PRAISE_CATEGORIES)) {
    categories[category] = 0;
    for (const praise of praises) {
      const lower = praise.toLowerCase();
      if (keywords.some(kw => lower.includes(kw))) {
        categories[category]++;
      }
    }
  }
  
  return categories;
}

/**
 * Generate opportunities based on competitor weaknesses
 */
function identifyOpportunities(allComplaints, allPraise) {
  const opportunities = [];
  const complaintCategories = categorizeComplaints(allComplaints);
  const praiseCategories = categorizePraise(allPraise);
  
  // Find top complaint categories
  const sortedComplaints = Object.entries(complaintCategories)
    .sort((a, b) => b[1] - a[1])
    .filter(([, count]) => count > 0);
  
  for (const [category, count] of sortedComplaints.slice(0, 5)) {
    switch (category) {
      case "performance":
        opportunities.push({
          category,
          count,
          opportunity: "Build a lightweight extension that emphasizes speed and low resource usage",
          action: "Optimize bundle size, minimize background scripts, use efficient data structures",
        });
        break;
      case "bugs":
        opportunities.push({
          category,
          count,
          opportunity: "Focus on stability and thorough testing before releases",
          action: "Implement comprehensive test suite, staged rollouts, crash reporting",
        });
        break;
      case "privacy":
        opportunities.push({
          category,
          count,
          opportunity: "Make privacy a core differentiator with transparent data practices",
          action: "Minimal data collection, open source components, privacy-first architecture",
        });
        break;
      case "ui":
        opportunities.push({
          category,
          count,
          opportunity: "Create a non-intrusive, clean user experience",
          action: "Subtle indicators, user-controlled notifications, minimal popups",
        });
        break;
      case "accuracy":
        opportunities.push({
          category,
          count,
          opportunity: "Ensure data accuracy and freshness with reliable sources",
          action: "Multiple data source validation, clear accuracy indicators, update timestamps",
        });
        break;
    }
  }
  
  return opportunities;
}

/**
 * Analyze all reviews for a single competitor
 */
async function analyzeCompetitor(competitor) {
  const reviews = [];
  
  try {
    if (competitor.platform === "chrome" && competitor.storeUrl) {
      console.log(`  Fetching Chrome reviews for ${competitor.name}...`);
      const html = await fetchWithRetry(competitor.storeUrl);
      reviews.push(...extractChromeReviews(html));
    } else if (competitor.platform === "firefox" && competitor.storeUrl) {
      console.log(`  Fetching Firefox reviews for ${competitor.name}...`);
      const html = await fetchWithRetry(competitor.storeUrl);
      reviews.push(...extractFirefoxReviews(html));
    }
  } catch (err) {
    console.warn(`  Failed to fetch reviews for ${competitor.name}: ${err.message}`);
  }
  
  // Analyze each review
  const analyzedReviews = reviews.map(analyzeReview);
  
  // Calculate sentiment distribution
  const total = analyzedReviews.length || 1;
  const positive = analyzedReviews.filter(r => r.sentiment === "positive").length;
  const negative = analyzedReviews.filter(r => r.sentiment === "negative").length;
  const neutral = analyzedReviews.filter(r => r.sentiment === "neutral").length;
  
  // Collect all complaints and praise
  const allComplaints = analyzedReviews.flatMap(r => r.complaints);
  const allPraise = analyzedReviews.flatMap(r => r.praise);
  const allFeatureRequests = analyzedReviews.flatMap(r => r.featureRequests);
  
  return {
    name: competitor.name,
    platform: competitor.platform,
    storeUrl: competitor.storeUrl,
    reviewCount: reviews.length,
    sentiment: {
      positive: Math.round((positive / total) * 100),
      negative: Math.round((negative / total) * 100),
      neutral: Math.round((neutral / total) * 100),
    },
    complaints: allComplaints,
    praise: allPraise,
    featureRequests: allFeatureRequests,
    complaintCategories: categorizeComplaints(allComplaints),
    praiseCategories: categorizePraise(allPraise),
  };
}

/**
 * Count occurrences and return top N
 */
function getTopItems(items, n = 5) {
  const counts = {};
  for (const item of items) {
    counts[item] = (counts[item] || 0) + 1;
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([item, count]) => ({ item, count }));
}

async function main() {
  const dataPath = path.join(process.cwd(), "data", "competitors.json");
  const outputDir = path.join(process.cwd(), "data", "competitor-watch");
  const outputPath = path.join(outputDir, "sentiment-report.json");
  
  // Check if competitors data exists
  let competitorData;
  try {
    const raw = await fs.readFile(dataPath, "utf-8");
    competitorData = JSON.parse(raw);
  } catch (err) {
    console.error(`No competitor data found at ${dataPath}`);
    console.log("Run competitor-scraper.js first to generate competitor data.");
    
    // Create mock data for testing
    console.log("\nUsing sample competitors for demonstration...\n");
    competitorData = {
      competitors: [
        {
          name: "Honey",
          platform: "chrome",
          storeUrl: "https://chromewebstore.google.com/detail/honey-automatic-coupons-c/bmnlcjabgnpnenekpadlanbbkooimhnj",
        },
        {
          name: "RetailMeNot",
          platform: "chrome", 
          storeUrl: "https://chromewebstore.google.com/detail/retailmenot-deal-finder/jjfblogammkiefalfpafidabbnamoknm",
        },
        {
          name: "CamelCamelCamel",
          platform: "chrome",
          storeUrl: "https://chromewebstore.google.com/detail/the-camelizer/ghnomdcacenbmilgjigehppbamfndblo",
        },
      ],
    };
  }
  
  console.log(`Analyzing ${competitorData.competitors.length} competitors...\n`);
  
  // Analyze each competitor (limit to first 10 to avoid rate limits)
  const competitorsToAnalyze = competitorData.competitors.slice(0, 10);
  const results = [];
  
  for (const competitor of competitorsToAnalyze) {
    if (!competitor.storeUrl) continue;
    console.log(`Analyzing: ${competitor.name}`);
    const result = await analyzeCompetitor(competitor);
    results.push(result);
  }
  
  // Aggregate all data
  const allComplaints = results.flatMap(r => r.complaints);
  const allPraise = results.flatMap(r => r.praise);
  const allFeatureRequests = results.flatMap(r => r.featureRequests);
  
  // Generate report
  const report = {
    generatedAt: new Date().toISOString(),
    competitorsAnalyzed: results.length,
    totalReviewsAnalyzed: results.reduce((sum, r) => sum + r.reviewCount, 0),
    
    // Per-competitor summaries
    competitors: results.map(r => ({
      name: r.name,
      platform: r.platform,
      reviewCount: r.reviewCount,
      sentiment: r.sentiment,
      topComplaints: getTopItems(r.complaints, 3),
      topPraise: getTopItems(r.praise, 3),
    })),
    
    // Aggregated insights
    topComplaints: getTopItems(allComplaints, 10),
    topPraise: getTopItems(allPraise, 10),
    topFeatureRequests: getTopItems(allFeatureRequests, 10),
    
    // Category breakdowns
    complaintCategorySummary: categorizeComplaints(allComplaints),
    praiseCategorySummary: categorizePraise(allPraise),
    
    // Opportunities for EuroCheck
    opportunities: identifyOpportunities(allComplaints, allPraise),
    
    // Recommendations
    recommendations: [
      "Focus on performance - competitors receive many complaints about slowness",
      "Make privacy a key differentiator - users are increasingly concerned about data",
      "Keep the UI minimal and non-intrusive - popup fatigue is common",
      "Ensure price data accuracy - wrong prices damage trust quickly",
      "Provide clear value proposition - savings tracking resonates well",
    ],
  };
  
  // Save report
  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(outputPath, JSON.stringify(report, null, 2), "utf-8");
  
  console.log(`\n=== Sentiment Analysis Report ===`);
  console.log(`Competitors analyzed: ${report.competitorsAnalyzed}`);
  console.log(`Total reviews analyzed: ${report.totalReviewsAnalyzed}`);
  console.log(`\nTop 5 Complaints:`);
  report.topComplaints.slice(0, 5).forEach((c, i) => {
    console.log(`  ${i + 1}. "${c.item}" (${c.count} mentions)`);
  });
  console.log(`\nTop 5 Praised Features:`);
  report.topPraise.slice(0, 5).forEach((p, i) => {
    console.log(`  ${i + 1}. "${p.item}" (${p.count} mentions)`);
  });
  console.log(`\nOpportunities identified: ${report.opportunities.length}`);
  console.log(`\nReport saved to: ${outputPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
