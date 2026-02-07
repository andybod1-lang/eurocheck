# EuroCheck Analytics Cron Job Setup

## Clawdbot Cron Job

Add to Clawdbot config (`~/.clawdbot/clawdbot.json` under `cron.jobs`):

```json
{
  "id": "eurocheck-analytics",
  "schedule": "0 */6 * * *",
  "text": "Run EuroCheck analytics collection: cd /Users/antti/clawd/projects/004-eurocheck/analytics/scripts && node collect-metrics.js. Report results to me.",
  "channel": "telegram",
  "enabled": true
}
```

This runs every 6 hours (00:00, 06:00, 12:00, 18:00).

## Alternative: System Cron (crontab)

```bash
# Edit crontab
crontab -e

# Add this line (runs every 6 hours)
0 */6 * * * cd /Users/antti/clawd/projects/004-eurocheck/analytics/scripts && /opt/homebrew/bin/node collect-metrics.js >> /Users/antti/clawd/logs/eurocheck-analytics.log 2>&1
```

## Manual Run

```bash
cd /Users/antti/clawd/projects/004-eurocheck/analytics/scripts
node collect-metrics.js
```

## Environment Variables

Set these for full functionality:

```bash
export CHROME_EXTENSION_ID="your-chrome-extension-id"
export FIREFOX_ADDON_ID="eurocheck"
```

## Logs

- Clawdbot: Check session history
- System cron: `/Users/antti/clawd/logs/eurocheck-analytics.log`

## Alerts

Configure in `/Users/antti/clawd/projects/004-eurocheck/analytics/data/current.json`:

```json
"alerts": [
  {
    "name": "User Drop Alert",
    "metric": "chrome.users",
    "condition": "change_below",
    "threshold": -10,
    "channel": "telegram",
    "enabled": true
  }
]
```
