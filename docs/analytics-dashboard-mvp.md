# EuroCheck Analytics Dashboard MVP

## Overview
A minimal analytics dashboard for the EuroCheck company database, providing insights into company coverage, growth, and search trends.

## MVP Scope
**Keep it minimal** - Focus on three core visualizations:
1. Company count by country
2. Recent additions (last 30 days)
3. Search trends (popular domains/companies)

## Data Sources
- **Primary:** `data/companies.json` (or `companies-min.json`)
- **Secondary:** Historical tracking of additions (to be implemented)
- **Search data:** Extension usage logs (to be collected)

## Dashboard Components

### 1. Company Count by Country
**Visualization:** Bar chart or map
**Data:** Count of companies per `hq_country`
**Filters:**
- EU vs Non-EU (`eu_status`)
- Date range (when historical data available)
**Display:**
- Top 10 countries by company count
- EU vs Non-EU breakdown
- Total company count

### 2. Recent Additions
**Visualization:** Table or timeline
**Data:** Companies added in last 30 days (requires tracking `added_date`)
**Display:**
- Company name
- HQ country
- EU status
- Date added
- Sort by most recent first
**Implementation note:** Need to add `added_date` field to company schema

### 3. Search Trends
**Visualization:** Line chart or bar chart
**Data:** Popular searches from extension usage
**Display:**
- Top searched companies/domains (last 7 days)
- Search volume trend over time
- Most common search patterns
**Implementation note:** Requires collecting search logs from extension

## Technical Implementation

### Data Processing
```javascript
// Example data processing for country counts
const companies = require('./data/companies-min.json');
const countryCounts = {};

companies.forEach(company => {
  const country = company.hq_country || 'Unknown';
  countryCounts[country] = (countryCounts[country] || 0) + 1;
});

// Sort and get top 10
const topCountries = Object.entries(countryCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10);
```

### Dashboard Structure
```
analytics-dashboard/
├── index.html          # Main dashboard
├── dashboard.js        # Data processing & chart rendering
├── dashboard.css       # Styling
├── data/
│   ├── processed/
│   │   ├── country-counts.json
│   │   ├── recent-additions.json
│   │   └── search-trends.json
│   └── raw/            # Raw data backups
└── scripts/
    ├── process-data.js # Data processing script
    └── update-daily.js # Daily update cron job
```

### Charts Library
**Recommendation:** Chart.js (lightweight, easy to use)
- Bar chart for country counts
- Line chart for search trends
- Table for recent additions

### Update Frequency
- **Data processing:** Daily (cron job)
- **Dashboard refresh:** On page load (static JSON files)

## Implementation Phases

### Phase 1: Basic Dashboard (Week 1)
1. Create HTML/CSS dashboard structure
2. Implement country count visualization
3. Add basic filtering (EU/Non-EU)
4. Display total company count

### Phase 2: Recent Additions (Week 2)
1. Add `added_date` field to company schema
2. Create data processing for recent additions
3. Implement table display
4. Add "last updated" timestamp

### Phase 3: Search Trends (Week 3)
1. Set up search log collection in extension
2. Create data processing for search trends
3. Implement search trend visualization
4. Add search insights (top searches, patterns)

## Data Collection Requirements

### 1. Company Additions Tracking
- Add `added_date` field to company objects
- Backfill with current date for existing companies
- Track new additions with actual date

### 2. Search Logs Collection
- Extension: Log anonymized searches (domain, timestamp)
- Privacy: No personal data, aggregate only
- Storage: JSON file updated daily

### 3. Historical Data
- Daily snapshots of company counts
- Weekly summaries for trends
- Monthly reports for growth analysis

## Success Metrics (MVP)
- [ ] Dashboard loads in < 3 seconds
- [ ] Country counts accurate and up-to-date
- [ ] Recent additions show last 30 days
- [ ] Search trends display top 10 searches
- [ ] Data updates daily automatically
- [ ] Mobile-responsive design

## Future Enhancements (Post-MVP)
1. **Advanced filtering:** By industry, company size, etc.
2. **Export functionality:** Download data as CSV/JSON
3. **Alerts:** Notify when new companies added
4. **Comparison:** Compare coverage across countries
5. **Integration:** Connect with extension usage analytics

## Technical Notes

### Performance Considerations
- Process data offline (cron job)
- Serve pre-processed JSON files
- Use client-side rendering for charts
- Cache aggressively

### Privacy & Compliance
- No personal data in analytics
- Aggregate search data only
- Comply with GDPR (EU data)
- Anonymize all user data

### Data Accuracy
- Validate country codes (ISO 3166)
- Regular data quality checks
- Handle missing/incorrect data gracefully
- Provide data source transparency

## Getting Started

### 1. Set up data processing
```bash
cd /Users/antti/clawd/projects/004-eurocheck
mkdir -p analytics-dashboard/data/processed
```

### 2. Create initial dashboard
```bash
# Create basic HTML structure
touch analytics-dashboard/index.html
touch analytics-dashboard/dashboard.js
touch analytics-dashboard/dashboard.css
```

### 3. Add data processing script
```bash
touch analytics-dashboard/scripts/process-data.js
```

### 4. Test with sample data
```bash
node analytics-dashboard/scripts/process-data.js
```

### 5. Deploy dashboard
Serve from Mac Mini or integrate with existing analytics infrastructure.

---
**Last Updated:** 2026-01-31  
**Status:** MVP Design Complete  
**Next Step:** Implementation Phase 1