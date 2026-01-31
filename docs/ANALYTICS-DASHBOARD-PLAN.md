# Analytics Dashboard Plan - EuroCheck

## Overview
Build a real-time analytics dashboard to track EuroCheck extension performance across Chrome Web Store, Firefox Add-ons, and the landing page.

## Data Sources

### 1. Chrome Web Store
- Install count (daily/weekly/cumulative)
- Active users
- Ratings distribution (1-5 stars)
- Review count and sentiment
- Version adoption rate
- Country breakdown (where possible)

### 2. Firefox Add-ons (when published)
- Daily active users
- Install count
- Ratings and reviews
- Version distribution

### 3. Landing Page (eurocheck.eu)
- Page views
- Unique visitors
- Traffic sources
- Time on page
- Bounce rate
- Conversion rate (page view → store click)
- Geographic distribution

### 4. Extension Usage (optional - privacy-respecting)
- Lookups per day (aggregate, anonymous)
- Top domains checked
- European vs Non-European ratio
- Feature usage (popup opens, etc.)

## Dashboard Features

### Core Metrics Cards
- Total installs (all platforms)
- Weekly active users
- Average rating
- Reviews this week

### Charts
1. **Install trend** - Line chart, daily installs over time
2. **Ratings breakdown** - Pie/bar chart, 1-5 stars distribution
3. **Platform split** - Chrome vs Firefox vs Safari
4. **Geographic reach** - Map visualization or top countries list
5. **Conversion funnel** - Landing page → Store → Install

### Alerts
- Rating drops below 4.0
- Negative review detected
- Install spike (viral detection)
- Install drop (problem detection)

## Implementation Tasks

### Phase 1: Data Collection (Tasks #338-341)
1. Chrome Web Store API integration
2. Firefox Add-ons API integration
3. Plausible/simple analytics for landing page
4. Data storage (JSON files, updated hourly)

### Phase 2: Dashboard UI (Tasks #342-344)
5. Dashboard HTML/CSS structure
6. Chart components (Chart.js or D3)
7. Real-time data binding

### Phase 3: Automation (Tasks #345-346)
8. Cron job for hourly data refresh
9. Alert system for anomalies

## Tech Stack
- **Frontend:** Vanilla JS + Chart.js (consistent with existing projects)
- **Data:** JSON files (no database needed initially)
- **Hosting:** Same as other dashboards (served via Mac Mini)
- **Analytics:** Plausible (privacy-focused, no cookies)

## Success Criteria
- [ ] Dashboard loads <2s
- [ ] Data updates hourly automatically
- [ ] All platforms tracked
- [ ] Accessible on mobile
- [ ] Alerts working

## Timeline
- Week 1: Data collection infrastructure
- Week 2: Dashboard UI
- Week 3: Polish and alerts

---
Created: 2026-01-29
