# EuroCheck Screenshot Generator

Automated screenshot capture, annotation, and branding tool for creating polished marketing images.

## Installation

```bash
cd tools/screenshot-generator
npm install
npm link  # Makes 'screenshot' command available globally
```

## Commands

### Capture Screenshots

```bash
# Basic capture
screenshot capture https://example.com -o output.png

# Full page capture
screenshot capture https://example.com --full-page -o full.png

# Responsive captures
screenshot capture https://example.com --device mobile -o mobile.png
screenshot capture https://example.com --device tablet -o tablet.png
screenshot capture https://example.com --device desktop -o desktop.png

# Custom dimensions
screenshot capture https://example.com --width 1440 --height 900 -o custom.png

# With delay (for animations)
screenshot capture https://example.com --delay 3000 -o animated.png
```

### Annotate Images

```bash
# Add highlight boxes
screenshot annotate input.png --box 100,100,200,150 -o annotated.png

# Add arrows
screenshot annotate input.png --arrow 50,50,200,150 -o arrows.png

# Add text labels
screenshot annotate input.png --text "100,50,Click here!,24,#FF0000" -o labeled.png

# Add numbered callouts
screenshot annotate input.png --callout 150,100,1 --callout 300,200,2 -o callouts.png

# Blur sensitive areas
screenshot annotate input.png --blur 100,200,300,50 -o blurred.png

# Multiple annotations
screenshot annotate input.png \
  --box 100,100,200,150 \
  --arrow 50,50,100,100 \
  --text "200,50,Step 1,20,#FF4444" \
  --callout 150,175,1 \
  -o fully-annotated.png
```

### Apply Branding

```bash
# Add logo
screenshot brand input.png --logo logo.png -o branded.png

# Logo positioning
screenshot brand input.png --logo logo.png --logo-position top-left -o branded.png
# Positions: top-left, top-right, bottom-left, bottom-right

# Logo size (percentage of image width)
screenshot brand input.png --logo logo.png --logo-size 15 -o branded.png

# Apply frame templates
screenshot brand input.png --frame browser -o browser-framed.png
screenshot brand input.png --frame phone -o phone-framed.png
screenshot brand input.png --frame tablet -o tablet-framed.png
screenshot brand input.png --frame minimal -o minimal-framed.png

# Add watermark text
screenshot brand input.png --watermark "© EuroCheck 2024" -o watermarked.png

# Combine options
screenshot brand input.png \
  --logo logo.png \
  --frame browser \
  --watermark "eurocheck.app" \
  -o fully-branded.png
```

### Pipeline (All-in-One)

```bash
# Capture, frame, and brand in one command
screenshot pipeline https://eurocheck.app \
  --full-page \
  --logo logo.png \
  --frame browser \
  -o marketing-shot.png
```

## Frame Templates

| Template | Description |
|----------|-------------|
| `browser` | macOS-style browser chrome with traffic lights |
| `phone` | Smartphone frame with notch |
| `tablet` | Tablet frame with rounded corners |
| `minimal` | Clean white border with subtle shadow |

## Annotation Features

| Feature | Description |
|---------|-------------|
| Boxes | Red highlight rectangles |
| Arrows | Directional arrows with heads |
| Text | Customizable labels (position, size, color) |
| Callouts | Numbered circles (1, 2, 3...) |
| Blur | Gaussian blur for sensitive data |

## Output Formats

The tool automatically detects format from the output filename:
- `.png` - PNG (default, lossless)
- `.jpg` / `.jpeg` - JPEG (lossy, smaller files)
- `.webp` - WebP (modern, best compression)

## Examples

### Marketing Landing Page Shot

```bash
# Capture the hero section
screenshot capture https://eurocheck.app \
  --width 1440 --height 900 \
  -o /tmp/hero.png

# Add browser frame and logo
screenshot brand /tmp/hero.png \
  --frame browser \
  --logo assets/logo.png \
  --watermark "eurocheck.app" \
  -o marketing/hero-shot.png
```

### Feature Highlight

```bash
# Capture and annotate a feature
screenshot capture https://eurocheck.app/features \
  --full-page -o /tmp/features.png

screenshot annotate /tmp/features.png \
  --box 200,400,300,100 \
  --callout 350,450,1 \
  --text "100,380,Real-time alerts,18,#2563eb" \
  -o marketing/feature-highlight.png
```

### App Store Screenshots

```bash
# Generate all device sizes
for device in mobile tablet desktop; do
  screenshot capture https://eurocheck.app \
    --device $device \
    -o screenshots/${device}.png
  
  screenshot brand screenshots/${device}.png \
    --logo assets/logo-white.png \
    -o screenshots/${device}-branded.png
done
```

## Programmatic Usage

```javascript
const { captureScreenshot, captureResponsive } = require('./lib/capture');
const { annotateImage } = require('./lib/annotate');
const { applyBranding } = require('./lib/brand');

// Capture
const screenshot = await captureScreenshot('https://example.com', {
  output: 'screenshot.png',
  fullPage: true,
  device: 'desktop'
});

// Annotate
await annotateImage('screenshot.png', {
  output: 'annotated.png',
  boxes: [{ x: 100, y: 100, w: 200, h: 150 }],
  callouts: [{ x: 200, y: 175, number: 1 }]
});

// Brand
await applyBranding('annotated.png', {
  output: 'final.png',
  logo: 'logo.png',
  frame: 'browser'
});
```

## Dependencies

- **puppeteer** - Browser automation for screenshots
- **sharp** - High-performance image processing
- **commander** - CLI framework

## License

MIT - EuroCheck Team
