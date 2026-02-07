# Thumbnail Generator CLI

Create marketing thumbnails with templates, text overlays, and A/B testing variants.

## Installation

```bash
cd projects/004-eurocheck/tools/thumbnail-generator
npm install
npm link  # Optional: makes 'thumbnail-generator' available globally
```

## Usage

### Create Single Thumbnail
```bash
./thumbnail-generator.js create -o output.png --title "Save 30% Shopping in EU" --subtitle "EuroCheck Extension"
```

### With Template
```bash
./thumbnail-generator.js create -o thumb.png -t eurocheck-dark --title "Price Comparison Made Easy"
```

### With Custom Colors
```bash
./thumbnail-generator.js create -o thumb.png \
  --title "Shop Smarter" \
  --bg-color "#1a1a2e" \
  --primary-color "#ffffff" \
  --accent-color "#e94560"
```

### Generate A/B Test Variants
```bash
# Color variants
./thumbnail-generator.js ab-variants -o ./variants --title "Save Money Shopping" --vary-colors -n 6

# Text and color variants
./thumbnail-generator.js ab-variants -o ./variants --title "EuroCheck" --vary-colors --vary-text -n 8
```

### Export for Multiple Platforms
```bash
./thumbnail-generator.js social-set -o ./social --title "EuroCheck" --subtitle "Smart Shopping"
# Creates: youtube.png, twitter.png, facebook.png, instagram.png, linkedin.png
```

### Batch Generate from CSV
```bash
# CSV format: title,subtitle,badge,bgColor
./thumbnail-generator.js batch thumbnails.csv -o ./batch-output -t eurocheck-basic
```

### List Templates
```bash
./thumbnail-generator.js templates
```

## Available Templates

| Template | Size | Purpose |
|----------|------|---------|
| eurocheck-basic | 1280x720 | Standard YouTube/social |
| eurocheck-comparison | 1280x720 | Price comparison split view |
| eurocheck-feature | 1280x720 | Feature highlight |
| eurocheck-minimal | 1280x720 | Clean minimal design |
| eurocheck-dark | 1280x720 | Dark mode professional |
| social-square | 1080x1080 | Instagram square |
| story-vertical | 1080x1920 | Stories/TikTok |

## Platform Export Sizes

| Platform | Size |
|----------|------|
| YouTube | 1280x720 |
| Twitter | 1200x675 |
| Facebook | 1200x630 |
| Instagram | 1080x1080 |
| LinkedIn | 1200x627 |

## A/B Testing Workflow

1. Generate variants:
   ```bash
   ./thumbnail-generator.js ab-variants -o ./test-1 --title "Save 30%" --vary-colors -n 4
   ```

2. Upload to platforms with different thumbnails

3. Track performance in `variants.csv`

4. Analyze results and pick winner

## CSV Format for Batch

```csv
title,subtitle,badge,bgColor,primaryColor,accentColor
Save 30% Now,EuroCheck Extension,NEW,#1a1a2e,#ffffff,#e94560
Best Prices EU,Compare & Save,,#0f3460,#ffffff,#00b4d8
```

## Integration

Can be automated with cron for scheduled content:
```bash
# Generate weekly promotional thumbnail
0 9 * * 1 /path/to/thumbnail-generator.js create -o /path/to/weekly-thumb.png --title "This Week's Deals"
```

## Author
Pekka @ EuroCheck
