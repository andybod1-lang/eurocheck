#!/usr/bin/env node
/**
 * EuroCheck Analytics Alerts System
 * 
 * Monitors key metrics (installs, ratings, reviews), detects anomalies,
 * and sends alerts via Telegram when thresholds are crossed.
 * 
 * Usage:
 *   node scripts/analytics-alerts.js [options]
 * 
 * Options:
 *   --check        Run alert checks against current data
 *   --report       Generate a summary report
 *   --dry-run      Check alerts without sending notifications
 *   --verbose      Enable verbose logging
 *   --help         Show this help message
 * 
 * Environment:
 *   EUROCHECK_ALERTS_CONFIG - Path to alerts config (default: config/alerts.json)
 *   CLAWDBOT_TELEGRAM       - Enable Clawdbot Telegram integration
 */

const fs = require("node:fs/promises");
const path = require("node:path");

// Configuration
const DEFAULT_CONFIG_PATH = path.join(__dirname, "..", "config", "alerts.json");
const PROJECT_ROOT = path.join(__dirname, "..");

// Severity levels and their emoji
const SEVERITY = {
  critical: { emoji: "🚨", priority: 1 },
  warning: { emoji: "⚠️", priority: 2 },
  info: { emoji: "ℹ️", priority: 3 },
};

// Condition evaluators
const CONDITIONS = {
  above: (current, threshold) => current > threshold,
  below: (current, threshold) => current < threshold,
  change_above: (current, previous, threshold) => (current - previous) > threshold,
  change_below: (current, previous, threshold) => (current - previous) < threshold,
  percent_change_above: (current, previous, threshold) => {
    if (!previous || previous === 0) return false;
    const pctChange = ((current - previous) / previous) * 100;
    return pctChange > threshold;
  },
  percent_change_below: (current, previous, threshold) => {
    if (!previous || previous === 0) return false;
    const pctChange = ((current - previous) / previous) * 100;
    return pctChange < threshold;
  },
  changed: (current, previous) => current !== previous && previous !== null,
  milestone: () => false, // Handled specially
};

class AnalyticsAlerts {
  constructor(options = {}) {
    this.config = null;
    this.configPath = options.configPath || process.env.EUROCHECK_ALERTS_CONFIG || DEFAULT_CONFIG_PATH;
    this.dryRun = options.dryRun || false;
    this.verbose = options.verbose || false;
    this.alertState = { firedAlerts: {}, achievedMilestones: {} };
  }

  log(message, level = "info") {
    if (level === "debug" && !this.verbose) return;
    const prefix = level === "error" ? "❌" : level === "warn" ? "⚠️" : level === "debug" ? "🔍" : "📊";
    console.log(`${prefix} ${message}`);
  }

  async loadConfig() {
    try {
      const raw = await fs.readFile(this.configPath, "utf-8");
      this.config = JSON.parse(raw);
      this.log(`Loaded config from ${this.configPath}`, "debug");
      return this.config;
    } catch (err) {
      throw new Error(`Failed to load config from ${this.configPath}: ${err.message}`);
    }
  }

  async loadAlertState() {
    if (!this.config?.alertState?.stateFile) return;
    
    const statePath = path.resolve(PROJECT_ROOT, this.config.alertState.stateFile);
    try {
      const raw = await fs.readFile(statePath, "utf-8");
      this.alertState = JSON.parse(raw);
      this.log(`Loaded alert state from ${statePath}`, "debug");
    } catch (err) {
      if (err.code !== "ENOENT") {
        this.log(`Warning: Could not load alert state: ${err.message}`, "warn");
      }
      this.alertState = { firedAlerts: {}, achievedMilestones: {} };
    }
  }

  async saveAlertState() {
    if (!this.config?.alertState?.stateFile || this.dryRun) return;
    
    const statePath = path.resolve(PROJECT_ROOT, this.config.alertState.stateFile);
    try {
      await fs.mkdir(path.dirname(statePath), { recursive: true });
      await fs.writeFile(statePath, JSON.stringify(this.alertState, null, 2), "utf-8");
      this.log(`Saved alert state to ${statePath}`, "debug");
    } catch (err) {
      this.log(`Warning: Could not save alert state: ${err.message}`, "warn");
    }
  }

  async loadCurrentMetrics() {
    const metricsPath = path.resolve(PROJECT_ROOT, this.config.dataSource.metricsPath);
    try {
      const raw = await fs.readFile(metricsPath, "utf-8");
      const data = JSON.parse(raw);
      
      // If current.json has daily data, use the latest entry
      if (data.daily && data.daily.length > 0) {
        this.log(`Loaded current metrics from ${metricsPath} (daily[${data.daily.length - 1}])`, "debug");
        return data.daily[data.daily.length - 1];
      }
      
      // If empty, try to find the latest historical file
      const historyPath = path.resolve(PROJECT_ROOT, this.config.dataSource.historyPath);
      try {
        const files = await fs.readdir(historyPath);
        const jsonFiles = files.filter(f => f.endsWith(".json")).sort().reverse();
        if (jsonFiles.length > 0) {
          const latestFile = path.join(historyPath, jsonFiles[0]);
          const histRaw = await fs.readFile(latestFile, "utf-8");
          const histData = JSON.parse(histRaw);
          this.log(`Loaded current metrics from ${latestFile}`, "debug");
          return histData;
        }
      } catch { /* ignore */ }
      
      // Try sample-daily as last resort
      const samplePath = path.resolve(PROJECT_ROOT, "analytics/data/sample-daily.json");
      try {
        const sampleRaw = await fs.readFile(samplePath, "utf-8");
        const sampleData = JSON.parse(sampleRaw);
        this.log(`Loaded current metrics from sample-daily.json`, "debug");
        return sampleData;
      } catch { /* ignore */ }
      
      this.log(`Loaded current metrics from ${metricsPath}`, "debug");
      return data;
    } catch (err) {
      this.log(`Warning: Could not load current metrics: ${err.message}`, "warn");
      return null;
    }
  }

  async loadHistoricalData() {
    const historyPath = path.resolve(PROJECT_ROOT, this.config.dataSource.historyPath);
    const dailyPath = path.resolve(PROJECT_ROOT, this.config.dataSource.dailySnapshotPath);
    
    const history = [];
    
    // Try loading from history directory
    try {
      const files = await fs.readdir(historyPath);
      for (const file of files.filter(f => f.endsWith(".json"))) {
        try {
          const raw = await fs.readFile(path.join(historyPath, file), "utf-8");
          const data = JSON.parse(raw);
          if (data.date) history.push(data);
        } catch { /* skip invalid files */ }
      }
    } catch (err) {
      if (err.code !== "ENOENT") {
        this.log(`Warning: Could not read history directory: ${err.message}`, "warn");
      }
    }
    
    // Try loading from daily snapshot file
    try {
      const raw = await fs.readFile(dailyPath, "utf-8");
      const data = JSON.parse(raw);
      if (Array.isArray(data)) {
        history.push(...data);
      } else if (data.history && Array.isArray(data.history)) {
        history.push(...data.history);
      }
    } catch (err) {
      if (err.code !== "ENOENT") {
        this.log(`Warning: Could not load daily snapshots: ${err.message}`, "warn");
      }
    }
    
    // Sort by date and remove duplicates
    const seen = new Set();
    const sorted = history
      .filter(item => {
        const key = item.date || item.timestamp;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((a, b) => {
        const dateA = a.date || a.timestamp;
        const dateB = b.date || b.timestamp;
        return dateA.localeCompare(dateB);
      });
    
    this.log(`Loaded ${sorted.length} historical data points`, "debug");
    return sorted;
  }

  getMetricValue(data, metricPath) {
    if (!data || !metricPath) return null;
    
    const parts = metricPath.split(".");
    let value = data;
    
    for (const part of parts) {
      if (value === null || value === undefined) return null;
      value = value[part];
    }
    
    return value;
  }

  getPreviousValue(history, metricPath, currentDate = null) {
    if (!history || history.length === 0) return null;
    
    // Get the most recent historical value (excluding current date)
    for (let i = history.length - 1; i >= 0; i--) {
      const itemDate = history[i].date || history[i].timestamp?.split("T")[0];
      
      // Skip if this is the current date
      if (currentDate && itemDate === currentDate) continue;
      
      const value = this.getMetricValue(history[i], metricPath);
      if (value !== null && value !== undefined) {
        return value;
      }
    }
    return null;
  }

  checkMilestone(current, previous, milestones) {
    if (!current || !milestones || !Array.isArray(milestones)) return null;
    
    // Sort milestones in ascending order
    const sorted = [...milestones].sort((a, b) => a - b);
    
    // Find milestones crossed
    for (const milestone of sorted) {
      if (current >= milestone && (previous === null || previous < milestone)) {
        return milestone;
      }
    }
    return null;
  }

  calculateAnomalyScore(values, current) {
    if (!values || values.length < 3) return null;
    
    // Calculate mean and standard deviation
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    if (stdDev === 0) return 0;
    
    // Z-score
    return (current - mean) / stdDev;
  }

  async checkAnomalies(current, history) {
    if (!this.config.anomalyDetection?.enabled) return [];
    
    const alerts = [];
    const { lookbackDays, stdDevMultiplier, minDataPoints, metrics } = this.config.anomalyDetection;
    
    for (const metricPath of metrics) {
      const currentValue = this.getMetricValue(current, metricPath);
      if (currentValue === null) continue;
      
      // Get historical values for the lookback period
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - lookbackDays);
      
      const historicalValues = history
        .filter(h => {
          const date = new Date(h.date || h.timestamp);
          return date >= cutoffDate;
        })
        .map(h => this.getMetricValue(h, metricPath))
        .filter(v => v !== null && typeof v === "number");
      
      if (historicalValues.length < minDataPoints) continue;
      
      const zScore = this.calculateAnomalyScore(historicalValues, currentValue);
      
      if (zScore !== null && Math.abs(zScore) > stdDevMultiplier) {
        const direction = zScore > 0 ? "spike" : "drop";
        const severity = Math.abs(zScore) > stdDevMultiplier * 1.5 ? "critical" : "warning";
        
        alerts.push({
          id: `anomaly-${metricPath.replace(/\./g, "-")}`,
          name: `Anomaly Detected: ${metricPath}`,
          description: `Unusual ${direction} detected in ${metricPath}`,
          metric: metricPath,
          currentValue,
          zScore: zScore.toFixed(2),
          severity,
          isAnomaly: true,
        });
      }
    }
    
    return alerts;
  }

  evaluateAlert(alertConfig, current, history) {
    const { id, metric, condition, threshold, milestoneKey, enabled } = alertConfig;
    
    if (!enabled) return null;
    
    const currentValue = this.getMetricValue(current, metric);
    if (currentValue === null || currentValue === undefined) {
      this.log(`Metric ${metric} not found in current data`, "debug");
      return null;
    }
    
    // Get current date for excluding from history lookup
    const currentDate = current.date || current.timestamp?.split("T")[0];
    const previousValue = this.getPreviousValue(history, metric, currentDate);
    
    // Handle milestone condition
    if (condition === "milestone") {
      const milestones = this.config.milestones?.[milestoneKey];
      const achievedMilestone = this.checkMilestone(currentValue, previousValue, milestones);
      
      if (achievedMilestone) {
        // Check if already notified for this milestone
        const milestoneKey = `${id}-${achievedMilestone}`;
        if (this.alertState.achievedMilestones[milestoneKey]) {
          this.log(`Milestone ${achievedMilestone} already notified for ${id}`, "debug");
          return null;
        }
        
        this.alertState.achievedMilestones[milestoneKey] = new Date().toISOString();
        
        return {
          ...alertConfig,
          currentValue,
          previousValue,
          achievedMilestone,
          triggered: true,
        };
      }
      return null;
    }
    
    // Handle other conditions
    const evaluator = CONDITIONS[condition];
    if (!evaluator) {
      this.log(`Unknown condition: ${condition}`, "warn");
      return null;
    }
    
    const triggered = condition.includes("change") || condition === "changed"
      ? evaluator(currentValue, previousValue, threshold)
      : evaluator(currentValue, threshold);
    
    if (triggered) {
      // Check cooldown
      const lastFired = this.alertState.firedAlerts[id];
      if (lastFired) {
        const cooldownMs = (this.config.global?.cooldownMinutes || 60) * 60 * 1000;
        if (Date.now() - new Date(lastFired).getTime() < cooldownMs) {
          this.log(`Alert ${id} in cooldown`, "debug");
          return null;
        }
      }
      
      this.alertState.firedAlerts[id] = new Date().toISOString();
      
      return {
        ...alertConfig,
        currentValue,
        previousValue,
        triggered: true,
      };
    }
    
    return null;
  }

  formatAlertMessage(alert) {
    const severity = SEVERITY[alert.severity] || SEVERITY.info;
    const lines = [];
    
    lines.push(`${severity.emoji} **${alert.name}**`);
    lines.push("");
    
    if (alert.description) {
      lines.push(alert.description);
      lines.push("");
    }
    
    // Format values based on alert type
    if (alert.achievedMilestone) {
      lines.push(`🎉 Milestone reached: **${this.formatValue(alert.achievedMilestone)}**`);
      lines.push(`Current: ${this.formatValue(alert.currentValue)}`);
    } else if (alert.isAnomaly) {
      lines.push(`📊 Metric: \`${alert.metric}\``);
      lines.push(`Value: ${this.formatValue(alert.currentValue)}`);
      lines.push(`Z-Score: ${alert.zScore} (${Math.abs(parseFloat(alert.zScore)) > 2.5 ? "extreme" : "significant"})`);
    } else {
      lines.push(`📊 Metric: \`${alert.metric}\``);
      lines.push(`Current: ${this.formatValue(alert.currentValue)}`);
      
      if (alert.previousValue !== null && alert.previousValue !== undefined) {
        lines.push(`Previous: ${this.formatValue(alert.previousValue)}`);
        
        if (typeof alert.currentValue === "number" && typeof alert.previousValue === "number") {
          const change = alert.currentValue - alert.previousValue;
          const pctChange = alert.previousValue !== 0 
            ? ((change / alert.previousValue) * 100).toFixed(1) 
            : "∞";
          const changeSign = change >= 0 ? "+" : "";
          lines.push(`Change: ${changeSign}${this.formatValue(change)} (${changeSign}${pctChange}%)`);
        }
      }
      
      if (alert.threshold !== undefined) {
        lines.push(`Threshold: ${alert.condition} ${this.formatValue(alert.threshold)}`);
      }
    }
    
    lines.push("");
    lines.push(`_EuroCheck Analytics • ${new Date().toLocaleString("en-GB", { timeZone: this.config.global?.timezone || "UTC" })}_`);
    
    return lines.join("\n");
  }

  formatValue(value) {
    if (value === null || value === undefined) return "n/a";
    if (typeof value === "number") {
      if (Number.isInteger(value)) {
        return new Intl.NumberFormat("en-US").format(value);
      }
      return value.toFixed(2);
    }
    return String(value);
  }

  async sendTelegramAlert(message) {
    if (this.dryRun) {
      this.log("DRY RUN - Would send Telegram alert:", "info");
      console.log("---");
      console.log(message);
      console.log("---");
      return true;
    }
    
    // Use Clawdbot's message tool via stdout (parsed by parent)
    // This is a signal for the calling process to send the message
    console.log("TELEGRAM_ALERT_START");
    console.log(message);
    console.log("TELEGRAM_ALERT_END");
    
    return true;
  }

  async runAlertChecks() {
    await this.loadConfig();
    await this.loadAlertState();
    
    if (!this.config.global?.enabled) {
      this.log("Alerts are globally disabled");
      return { alerts: [], anomalies: [] };
    }
    
    const metricsData = await this.loadCurrentMetrics();
    if (!metricsData) {
      this.log("No current metrics available", "error");
      return { alerts: [], anomalies: [] };
    }
    
    const history = await this.loadHistoricalData();
    const triggeredAlerts = [];
    
    // Check configured alerts
    for (const alertConfig of this.config.alerts) {
      const result = this.evaluateAlert(alertConfig, metricsData, history);
      if (result) {
        triggeredAlerts.push(result);
      }
    }
    
    // Check for anomalies
    const anomalies = await this.checkAnomalies(metricsData, history);
    triggeredAlerts.push(...anomalies);
    
    // Sort by severity
    triggeredAlerts.sort((a, b) => {
      const priorityA = SEVERITY[a.severity]?.priority || 99;
      const priorityB = SEVERITY[b.severity]?.priority || 99;
      return priorityA - priorityB;
    });
    
    // Send notifications
    for (const alert of triggeredAlerts) {
      const message = this.formatAlertMessage(alert);
      await this.sendTelegramAlert(message);
    }
    
    await this.saveAlertState();
    
    return { 
      alerts: triggeredAlerts.filter(a => !a.isAnomaly),
      anomalies: triggeredAlerts.filter(a => a.isAnomaly),
    };
  }

  async generateReport() {
    await this.loadConfig();
    
    const current = await this.loadCurrentMetrics();
    const history = await this.loadHistoricalData();
    
    const lines = [];
    lines.push("# EuroCheck Analytics Report");
    lines.push(`_Generated: ${new Date().toISOString()}_`);
    lines.push("");
    
    if (current) {
      let metricsData = current;
      if (current.daily && current.daily.length > 0) {
        metricsData = current.daily[current.daily.length - 1];
      }
      
      lines.push("## Current Metrics");
      lines.push("");
      
      if (metricsData.chrome) {
        lines.push("### Chrome Web Store");
        lines.push(`- Users: ${this.formatValue(metricsData.chrome.users)}`);
        lines.push(`- Rating: ${this.formatValue(metricsData.chrome.rating)}⭐`);
        lines.push(`- Reviews: ${this.formatValue(metricsData.chrome.reviewCount)}`);
        lines.push(`- Version: ${metricsData.chrome.version || "n/a"}`);
        lines.push("");
      }
      
      if (metricsData.firefox) {
        lines.push("### Firefox Add-ons");
        lines.push(`- Users: ${this.formatValue(metricsData.firefox.users)}`);
        lines.push(`- Rating: ${this.formatValue(metricsData.firefox.rating)}⭐`);
        lines.push(`- Reviews: ${this.formatValue(metricsData.firefox.reviewCount)}`);
        lines.push(`- Version: ${metricsData.firefox.version || "n/a"}`);
        lines.push("");
      }
      
      if (metricsData.totals) {
        lines.push("### Totals");
        lines.push(`- Total Users: ${this.formatValue(metricsData.totals.totalUsers)}`);
        lines.push(`- Total Installs: ${this.formatValue(metricsData.totals.totalInstalls)}`);
        lines.push(`- Avg Rating: ${this.formatValue(metricsData.totals.avgRating)}⭐`);
        lines.push("");
      }
    }
    
    lines.push("## Alert Configuration");
    lines.push(`- Alerts configured: ${this.config.alerts.length}`);
    lines.push(`- Alerts enabled: ${this.config.alerts.filter(a => a.enabled).length}`);
    lines.push(`- Anomaly detection: ${this.config.anomalyDetection?.enabled ? "enabled" : "disabled"}`);
    lines.push(`- Cooldown: ${this.config.global?.cooldownMinutes || 60} minutes`);
    lines.push("");
    
    if (history.length > 0) {
      lines.push("## Historical Data");
      lines.push(`- Data points: ${history.length}`);
      lines.push(`- Oldest: ${history[0].date || history[0].timestamp}`);
      lines.push(`- Newest: ${history[history.length - 1].date || history[history.length - 1].timestamp}`);
    }
    
    return lines.join("\n");
  }
}

// CLI
function printHelp() {
  console.log(`
EuroCheck Analytics Alerts System

Usage: node scripts/analytics-alerts.js [options]

Options:
  --check        Run alert checks against current data
  --report       Generate a summary report
  --dry-run      Check alerts without sending notifications
  --verbose      Enable verbose logging
  --config PATH  Path to config file
  --help         Show this help message

Examples:
  node scripts/analytics-alerts.js --check
  node scripts/analytics-alerts.js --check --dry-run
  node scripts/analytics-alerts.js --report
`);
}

async function main() {
  const args = process.argv.slice(2);
  
  const options = {
    check: args.includes("--check"),
    report: args.includes("--report"),
    dryRun: args.includes("--dry-run"),
    verbose: args.includes("--verbose"),
    help: args.includes("--help") || args.includes("-h"),
  };
  
  const configIndex = args.indexOf("--config");
  if (configIndex !== -1 && args[configIndex + 1]) {
    options.configPath = args[configIndex + 1];
  }
  
  if (options.help) {
    printHelp();
    return;
  }
  
  if (!options.check && !options.report) {
    // Default to check
    options.check = true;
  }
  
  const alerts = new AnalyticsAlerts(options);
  
  try {
    if (options.report) {
      const report = await alerts.generateReport();
      console.log(report);
    }
    
    if (options.check) {
      console.log("🔍 Running alert checks...");
      const result = await alerts.runAlertChecks();
      
      const totalAlerts = result.alerts.length + result.anomalies.length;
      
      if (totalAlerts === 0) {
        console.log("✅ All metrics within normal ranges");
      } else {
        console.log(`\n📊 Summary:`);
        console.log(`  - Threshold alerts: ${result.alerts.length}`);
        console.log(`  - Anomalies detected: ${result.anomalies.length}`);
      }
    }
  } catch (err) {
    console.error(`❌ Error: ${err.message}`);
    if (options.verbose) {
      console.error(err.stack);
    }
    process.exit(1);
  }
}

main();

// Export for programmatic use
module.exports = { AnalyticsAlerts };
