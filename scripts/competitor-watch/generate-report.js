#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Competitor Watch: Weekly Report Generator
 * 
 * Compares current week's competitor data with previous week:
 * - Rating changes (up/down trends)
 * - User growth (install velocity)
 * - New complaints or praise patterns
 * - Opportunities based on changes
 * 
 * Outputs a formatted report for email delivery.
 */

const fs = require("node:fs/promises");
const path = require("node:path");

const DATA_DIR = path.join(process.cwd(), "data", "competitor-watch");
const HISTORY_DIR = path.join(DATA_DIR, "history");
const REPORT_DIR = path.join(DATA_DIR, "reports");

/**
 * Get ISO week number from date
 */
function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

/**
 * Format date as YYYY-WXX
 */
function formatWeekId(date) {
  const year = date.getFullYear();
  const week = getWeekNumber(date);
  return `${year}-W${String(week).padStart(2, "0")}`;
}

/**
 * Get previous week's date
 */
function getPreviousWeek(date) {
  const prev = new Date(date);
  prev.setDate(prev.getDate() - 7);
  return prev;
}

/**
 * Load weekly snapshot from history
 */
async function loadWeeklySnapshot(weekId) {
  const filePath = path.join(HISTORY_DIR, `${weekId}.json`);
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    return null;
  }
}

/**
 * Load current competitor data
 */
async function loadCurrentData() {
  const competitorsPath = path.join(process.cwd(), "data", "competitors.json");
  const sentimentPath = path.join(DATA_DIR, "sentiment-report.json");
  
  let competitors = null;
  let sentiment = null;
  
  try {
    const raw = await fs.readFile(competitorsPath, "utf-8");
    competitors = JSON.parse(raw);
  } catch (err) {
    console.warn("No competitors.json found");
  }
  
  try {
    const raw = await fs.readFile(sentimentPath, "utf-8");
    sentiment = JSON.parse(raw);
  } catch (err) {
    console.warn("No sentiment-report.json found");
  }
  
  return { competitors, sentiment };
}

/**
 * Calculate changes between two weeks
 */
function calculateChanges(current, previous) {
  if (!current || !previous) {
    return { hasChanges: false };
  }
  
  const changes = {
    hasChanges: true,
    ratingChanges: [],
    userGrowth: [],
    newCompetitors: [],
    removedCompetitors: [],
  };
  
  const prevMap = new Map(
    (previous.competitors || []).map(c => [`${c.name}-${c.platform}`, c])
  );
  const currMap = new Map(
    (current.competitors || []).map(c => [`${c.name}-${c.platform}`, c])
  );
  
  // Find changes for existing competitors
  for (const [key, curr] of currMap) {
    const prev = prevMap.get(key);
    
    if (!prev) {
      changes.newCompetitors.push({
        name: curr.name,
        platform: curr.platform,
        rating: curr.rating,
        userCount: curr.userCount,
      });
      continue;
    }
    
    // Rating change
    if (curr.rating != null && prev.rating != null) {
      const ratingDiff = curr.rating - prev.rating;
      if (Math.abs(ratingDiff) >= 0.05) {
        changes.ratingChanges.push({
          name: curr.name,
          platform: curr.platform,
          previous: prev.rating,
          current: curr.rating,
          change: ratingDiff,
          trend: ratingDiff > 0 ? "up" : "down",
        });
      }
    }
    
    // User count change
    if (curr.userCount != null && prev.userCount != null) {
      const userDiff = curr.userCount - prev.userCount;
      const growthPercent = (userDiff / prev.userCount) * 100;
      if (Math.abs(growthPercent) >= 1) {
        changes.userGrowth.push({
          name: curr.name,
          platform: curr.platform,
          previous: prev.userCount,
          current: curr.userCount,
          change: userDiff,
          growthPercent: growthPercent.toFixed(2),
          trend: userDiff > 0 ? "growing" : "shrinking",
        });
      }
    }
  }
  
  // Find removed competitors
  for (const [key, prev] of prevMap) {
    if (!currMap.has(key)) {
      changes.removedCompetitors.push({
        name: prev.name,
        platform: prev.platform,
      });
    }
  }
  
  // Sort by magnitude of change
  changes.ratingChanges.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
  changes.userGrowth.sort((a, b) => Math.abs(b.growthPercent) - Math.abs(a.growthPercent));
  
  return changes;
}

/**
 * Generate opportunities from changes
 */
function generateOpportunities(changes, sentiment) {
  const opportunities = [];
  
  // Competitors with declining ratings = opportunity
  const decliningCompetitors = changes.ratingChanges
    ?.filter(c => c.trend === "down")
    ?.slice(0, 3) || [];
  
  for (const comp of decliningCompetitors) {
    opportunities.push({
      type: "competitor_decline",
      competitor: comp.name,
      detail: `${comp.name} rating dropped from ${comp.previous.toFixed(2)} to ${comp.current.toFixed(2)}`,
      action: `Target ${comp.name} users with messaging about reliability and quality`,
    });
  }
  
  // Fast-growing competitors = learn from them
  const growingCompetitors = changes.userGrowth
    ?.filter(c => c.trend === "growing" && parseFloat(c.growthPercent) > 5)
    ?.slice(0, 3) || [];
  
  for (const comp of growingCompetitors) {
    opportunities.push({
      type: "competitor_growth",
      competitor: comp.name,
      detail: `${comp.name} grew ${comp.growthPercent}% this week (+${comp.change.toLocaleString()} users)`,
      action: `Analyze what ${comp.name} is doing right - marketing, features, or positioning`,
    });
  }
  
  // New entrants = monitor
  for (const comp of (changes.newCompetitors || []).slice(0, 3)) {
    opportunities.push({
      type: "new_competitor",
      competitor: comp.name,
      detail: `New competitor detected: ${comp.name} on ${comp.platform}`,
      action: `Review their value proposition and watch for market positioning`,
    });
  }
  
  return opportunities;
}

/**
 * Format number with K/M suffixes
 */
function formatNumber(num) {
  if (num == null) return "N/A";
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString();
}

/**
 * Generate markdown report
 */
function generateMarkdownReport(currentWeek, previousWeek, changes, opportunities, sentiment) {
  const lines = [];
  const now = new Date();
  
  lines.push(`# EuroCheck Competitor Watch Report`);
  lines.push(`**Week ${currentWeek}** | Generated: ${now.toISOString().split("T")[0]}`);
  lines.push("");
  
  // Executive Summary
  lines.push("## 📊 Executive Summary");
  lines.push("");
  
  const summaryStats = {
    competitorsTracked: changes.hasChanges ? "Multiple" : "0",
    ratingChanges: changes.ratingChanges?.length || 0,
    significantGrowth: changes.userGrowth?.filter(c => c.trend === "growing").length || 0,
    newCompetitors: changes.newCompetitors?.length || 0,
  };
  
  lines.push(`- **Rating changes detected:** ${summaryStats.ratingChanges}`);
  lines.push(`- **Competitors with significant user growth:** ${summaryStats.significantGrowth}`);
  lines.push(`- **New competitors this week:** ${summaryStats.newCompetitors}`);
  lines.push("");
  
  // Rating Changes
  if (changes.ratingChanges?.length > 0) {
    lines.push("## ⭐ Rating Changes");
    lines.push("");
    lines.push("| Competitor | Platform | Previous | Current | Change |");
    lines.push("|------------|----------|----------|---------|--------|");
    
    for (const change of changes.ratingChanges.slice(0, 10)) {
      const emoji = change.trend === "up" ? "📈" : "📉";
      const changeStr = change.change > 0 ? `+${change.change.toFixed(2)}` : change.change.toFixed(2);
      lines.push(`| ${change.name} | ${change.platform} | ${change.previous.toFixed(2)} | ${change.current.toFixed(2)} | ${emoji} ${changeStr} |`);
    }
    lines.push("");
  }
  
  // User Growth
  if (changes.userGrowth?.length > 0) {
    lines.push("## 👥 User Growth");
    lines.push("");
    lines.push("| Competitor | Platform | Previous | Current | Growth |");
    lines.push("|------------|----------|----------|---------|--------|");
    
    for (const growth of changes.userGrowth.slice(0, 10)) {
      const emoji = growth.trend === "growing" ? "🚀" : "📉";
      const sign = parseFloat(growth.growthPercent) > 0 ? "+" : "";
      lines.push(`| ${growth.name} | ${growth.platform} | ${formatNumber(growth.previous)} | ${formatNumber(growth.current)} | ${emoji} ${sign}${growth.growthPercent}% |`);
    }
    lines.push("");
  }
  
  // New Competitors
  if (changes.newCompetitors?.length > 0) {
    lines.push("## 🆕 New Competitors Detected");
    lines.push("");
    for (const comp of changes.newCompetitors) {
      lines.push(`- **${comp.name}** (${comp.platform}) - Rating: ${comp.rating?.toFixed(2) || "N/A"}, Users: ${formatNumber(comp.userCount)}`);
    }
    lines.push("");
  }
  
  // Opportunities
  if (opportunities.length > 0) {
    lines.push("## 💡 Opportunities");
    lines.push("");
    for (const opp of opportunities) {
      const emoji = {
        competitor_decline: "🎯",
        competitor_growth: "📚",
        new_competitor: "👀",
      }[opp.type] || "💡";
      
      lines.push(`### ${emoji} ${opp.competitor}`);
      lines.push(`- **Finding:** ${opp.detail}`);
      lines.push(`- **Action:** ${opp.action}`);
      lines.push("");
    }
  }
  
  // Sentiment Summary (if available)
  if (sentiment?.topComplaints?.length > 0) {
    lines.push("## 😤 Top Complaints (Aggregated)");
    lines.push("");
    for (const complaint of sentiment.topComplaints.slice(0, 5)) {
      lines.push(`- "${complaint.item}" (${complaint.count} mentions)`);
    }
    lines.push("");
  }
  
  if (sentiment?.topPraise?.length > 0) {
    lines.push("## 😊 Top Praised Features");
    lines.push("");
    for (const praise of sentiment.topPraise.slice(0, 5)) {
      lines.push(`- "${praise.item}" (${praise.count} mentions)`);
    }
    lines.push("");
  }
  
  // Recommendations
  lines.push("## 📋 Recommendations");
  lines.push("");
  
  if (changes.ratingChanges?.some(c => c.trend === "down")) {
    lines.push("1. **Target unhappy users** - Competitors with declining ratings present acquisition opportunities");
  }
  if (changes.userGrowth?.some(c => c.trend === "growing" && parseFloat(c.growthPercent) > 10)) {
    lines.push("2. **Study fast movers** - Analyze what's driving rapid growth in the market");
  }
  if (sentiment?.complaintCategorySummary?.privacy > 0) {
    lines.push("3. **Lead with privacy** - Privacy concerns remain a top complaint category");
  }
  if (sentiment?.complaintCategorySummary?.performance > 0) {
    lines.push("4. **Emphasize performance** - Performance issues affect competitor reputation");
  }
  lines.push("5. **Monitor weekly** - Run this report every Sunday to stay ahead of market changes");
  lines.push("");
  
  // Footer
  lines.push("---");
  lines.push(`*Report generated by EuroCheck Competitor Watch | ${now.toISOString()}*`);
  
  return lines.join("\n");
}

/**
 * Save current data as weekly snapshot
 */
async function saveWeeklySnapshot(weekId, data) {
  await fs.mkdir(HISTORY_DIR, { recursive: true });
  const filePath = path.join(HISTORY_DIR, `${weekId}.json`);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
  console.log(`Saved weekly snapshot: ${filePath}`);
}

async function main() {
  const now = new Date();
  const currentWeek = formatWeekId(now);
  const previousWeek = formatWeekId(getPreviousWeek(now));
  
  console.log(`Generating report for week ${currentWeek}`);
  console.log(`Comparing against week ${previousWeek}`);
  console.log("");
  
  // Load data
  const { competitors: currentData, sentiment } = await loadCurrentData();
  const previousData = await loadWeeklySnapshot(previousWeek);
  
  if (!currentData && !previousData) {
    console.error("No data available to generate report.");
    console.log("Run competitor-scraper.js to collect competitor data first.");
    
    // Generate template report for demonstration
    console.log("\nGenerating template report for demonstration...\n");
  }
  
  // Calculate changes
  const changes = calculateChanges(currentData, previousData);
  
  // Generate opportunities
  const opportunities = generateOpportunities(changes, sentiment);
  
  // Generate markdown report
  const markdownReport = generateMarkdownReport(
    currentWeek,
    previousWeek,
    changes,
    opportunities,
    sentiment
  );
  
  // Save report
  await fs.mkdir(REPORT_DIR, { recursive: true });
  const reportPath = path.join(REPORT_DIR, `${currentWeek}.md`);
  await fs.writeFile(reportPath, markdownReport, "utf-8");
  console.log(`Report saved: ${reportPath}`);
  
  // Save current data as this week's snapshot for next comparison
  if (currentData) {
    await saveWeeklySnapshot(currentWeek, currentData);
  }
  
  // Also save as JSON for programmatic access
  const jsonReport = {
    weekId: currentWeek,
    previousWeekId: previousWeek,
    generatedAt: now.toISOString(),
    changes,
    opportunities,
    sentiment: sentiment ? {
      topComplaints: sentiment.topComplaints?.slice(0, 5),
      topPraise: sentiment.topPraise?.slice(0, 5),
    } : null,
  };
  
  const jsonPath = path.join(REPORT_DIR, `${currentWeek}.json`);
  await fs.writeFile(jsonPath, JSON.stringify(jsonReport, null, 2), "utf-8");
  console.log(`JSON report saved: ${jsonPath}`);
  
  // Print summary
  console.log("\n=== Report Summary ===");
  console.log(`Week: ${currentWeek}`);
  console.log(`Rating changes: ${changes.ratingChanges?.length || 0}`);
  console.log(`User growth changes: ${changes.userGrowth?.length || 0}`);
  console.log(`New competitors: ${changes.newCompetitors?.length || 0}`);
  console.log(`Opportunities identified: ${opportunities.length}`);
  
  // Return report content for email sending
  return {
    markdown: markdownReport,
    json: jsonReport,
    reportPath,
  };
}

// Export for use in cron jobs
module.exports = { main, generateMarkdownReport };

// Run if called directly
if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
