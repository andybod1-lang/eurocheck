# EuroCheck Analytics Data Structure

## Overview

This directory contains the data schema and storage for EuroCheck extension analytics.

## Files

| File | Purpose |
|------|---------|
| `schema.json` | JSON Schema defining all data types |
| `current.json` | Current state + alert configurations |
| `history/` | Historical snapshots by date |

## Data Types

### Daily Snapshot
Store-level metrics captured daily:
- Users (weekly active)
- Installs / Uninstalls
- Rating & Review count
- Version deployed

### Usage Metrics
Extension usage tracking:
- Price checks performed
- Unique users
- Savings tracked (EUR)
- Top categories & countries

### Competitor Snapshot
Weekly competitor tracking:
- User counts
- Ratings & reviews
- Version freshness

### Traffic Metrics
Landing page & store page analytics:
- Visitors & pageviews
- Bounce rate
- Traffic sources
- Conversion rates

### Growth Metrics
Period-over-period analysis:
- User growth (absolute + %)
- Install growth
- Retention & churn rates

## Historical Data

Files in `history/` follow naming:
- `YYYY-MM-DD-daily.json` - Daily snapshot
- `YYYY-MM-DD-usage.json` - Usage metrics
- `YYYY-WW-competitors.json` - Weekly competitor data
- `YYYY-MM-DD-traffic.json` - Traffic data

## Alerts

Configured in `current.json`:

| Alert | Trigger |
|-------|---------|
| User Drop | >10% decrease |
| Rating Drop | Below 4.0 |
| New Review | Any new review |
| Install Milestone | 1000+ installs |

## Usage

```javascript
const fs = require('fs');
const Ajv = require('ajv');
const ajv = new Ajv();

// Load schema
const schema = JSON.parse(fs.readFileSync('schema.json'));

// Validate data
const validate = ajv.compile(schema.definitions.dailySnapshot);
const data = JSON.parse(fs.readFileSync('sample-daily.json'));
const valid = validate(data);
```

## Integration

- **Cron job** collects data every 6 hours
- **Dashboard** reads from `current.json`
- **Alerting** checks thresholds on each update
