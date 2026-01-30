# Keyword Tracking Dashboard

A standalone SEO keyword ranking tracker for EuroCheck. Monitor your search positions, track changes over time, and visualize trends.

## Features

- 📊 **Track Keywords** — Add unlimited keywords with current positions
- 📈 **Position History** — 7-day trend visualization with Chart.js
- 🔄 **Change Indicators** — Green ↑ for improvements, Red ↓ for drops
- ✨ **Sparklines** — Mini trend charts in the table view
- 🌙 **Dark Mode** — Toggle between light and dark themes
- 💾 **localStorage** — Data persists in your browser
- 📥 **Export/Import** — Backup data as JSON

## Usage

### Open the Dashboard

Simply open `index.html` in your browser. No server required!

```bash
# On macOS
open index.html

# On Linux
xdg-open index.html

# On Windows
start index.html
```

### Add Keywords

1. Enter keyword in the input field
2. Enter current position (1-100)
3. Click "Add Keyword"

### Update Positions

Click the 📝 button next to any keyword to update its position. Updates are timestamped — if you update multiple times per day, only the latest position is kept.

### View Trends

- **Sparklines** show 7-day mini trends inline
- **Main chart** shows position history for top 5 keywords
- Lower positions (better ranks) appear higher on the chart

### Export/Import

- **Export:** Click "📥 Export JSON" to download your data
- **Import:** Click "📤 Import JSON" to restore from backup

## Data Format

```json
[
  {
    "keyword": "example keyword",
    "history": [15, 12, 10, 8],
    "dates": ["2026-01-24", "2026-01-25", "2026-01-26", "2026-01-27"]
  }
]
```

## Sample Keywords

The dashboard comes pre-loaded with sample EuroCheck keywords:
- eurocheck extension
- euro price tracker
- currency converter chrome
- eu price comparison
- shopping price euro

Delete these or add your own!

## Tech Stack

- **HTML5** — Semantic markup
- **CSS3** — Custom properties, Grid, Flexbox
- **Vanilla JS** — No framework dependencies
- **Chart.js** — Line charts (CDN)
- **localStorage** — Client-side persistence

## Files

```
keyword-dashboard/
├── index.html    # Main page
├── styles.css    # Styling (light + dark themes)
├── dashboard.js  # All functionality
└── README.md     # This file
```

## License

Part of EuroCheck SEO Tools. MIT License.
