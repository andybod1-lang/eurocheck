# EuroCheck Promotional Graphics Specifications

## Brand Colors

| Color | Hex | Usage |
|-------|-----|-------|
| EU Blue | `#003399` | Primary background, headers, accents |
| EU Yellow | `#FFCC00` | Stars, highlights, CTAs |
| White | `#FFFFFF` | Text on dark backgrounds |
| Dark Navy | `#1a1a2e` | Extension UI dark theme |
| Success Green | `#22c55e` | EU badge color |
| Warning Red | `#ef4444` | Non-EU badge color |
| Mixed Yellow | `#eab308` | Mixed ownership badge |

---

## 1. Chrome Web Store Featured Tile

**Filename:** `chrome-tile-440x280.png`
**Dimensions:** 440×280 pixels
**Purpose:** Featured/marquee image on Chrome Web Store listing

### Design Layout

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│   [EuroCheck Logo]     🇪🇺                           │
│                                                      │
│   ╔═══════════════════════════════╗                  │
│   ║                               ║                  │
│   ║   Is it European?             ║ ← Large headline │
│   ║                               ║                  │
│   ╚═══════════════════════════════╝                  │
│                                                      │
│   Know instantly. Zero tracking.    ← Tagline       │
│                                                      │
│   [EU] [NON-EU] [MIXED]             ← Badge preview │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### Text Content
- **Headline:** "Is it European?"
  - Font: Bold sans-serif (Inter, SF Pro, or Roboto)
  - Size: ~48px
  - Color: White (#FFFFFF)
  
- **Tagline:** "Know instantly. Zero tracking."
  - Font: Regular sans-serif
  - Size: ~18px
  - Color: White with slight transparency (#FFFFFF, 85%)

### Visual Elements
- **Background:** EU Blue (#003399) gradient (darker at edges)
- **EU Stars:** Subtle EU flag stars pattern in background (10% opacity)
- **Logo:** EuroCheck icon (32×32px) in top-left
- **Badge preview:** Show green, red, yellow mini badges to hint at functionality
- **Flag:** Small 🇪🇺 EU flag emoji or icon

### Style Notes
- Clean, minimal design
- High contrast for readability at small sizes
- No cluttered elements — this displays small in store
- Must work at 1x and 2x resolution

---

## 2. Social Open Graph Image

**Filename:** `social-og-1200x630.png`
**Dimensions:** 1200×630 pixels
**Purpose:** Social media preview (Twitter, Facebook, LinkedIn, Discord)

### Design Layout

```
┌────────────────────────────────────────────────────────────────────────────┐
│                                                                            │
│     [Logo]  EuroCheck                                                      │
│                                                                            │
│  ┌─────────────────────────────────────────────────────────────────┐      │
│  │                                                                   │      │
│  │              Know if it's European                                │      │
│  │                                                                   │      │
│  │   ┌─────────┐    ┌─────────┐    ┌─────────┐                      │      │
│  │   │   EU    │    │ NON-EU  │    │  MIXED  │    ← Badge examples  │      │
│  │   │  ✓ 🇸🇪  │    │  ✗ 🇺🇸  │    │  ⚠ 🇳🇱  │                      │      │
│  │   └─────────┘    └─────────┘    └─────────┘                      │      │
│  │                                                                   │      │
│  │   Spotify        Amazon         Booking.com      ← Company names │      │
│  │                                                                   │      │
│  └─────────────────────────────────────────────────────────────────┘      │
│                                                                            │
│     🔒 100% Local • No Tracking • Open Source                              │
│                                                                            │
│     Browser Extension for Chrome, Firefox & Safari                         │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

### Text Content
- **Logo + Name:** "EuroCheck" with icon
  - Font: Bold, 28px
  - Position: Top-left
  
- **Main Headline:** "Know if it's European"
  - Font: Bold sans-serif, 56-64px
  - Color: White
  - Center-aligned
  
- **Company Examples:**
  - Three badge cards showing real examples
  - Green: Spotify (🇸🇪 Sweden)
  - Red: Amazon (🇺🇸 USA)  
  - Yellow: Booking.com (🇳🇱 Netherlands, US-owned)
  
- **Privacy line:** "🔒 100% Local • No Tracking • Open Source"
  - Font: Regular, 18px
  - Color: EU Yellow (#FFCC00)
  
- **Platform line:** "Browser Extension for Chrome, Firefox & Safari"
  - Font: Light, 16px
  - Color: White, 70% opacity

### Visual Elements
- **Background:** EU Blue (#003399) with subtle gradient
- **Star pattern:** Faint EU stars in background
- **Badge cards:** Mini versions of the actual extension popup badges
- **Country flags:** Small flag icons next to company locations
- **Browser icons:** Chrome, Firefox, Safari icons in bottom section

### Style Notes
- More detailed than Chrome tile (larger canvas)
- Shows actual functionality with real examples
- Privacy messaging prominent (key differentiator)
- Must render well when cropped to different aspect ratios

---

## 3. Additional Promotional Assets (Optional)

### GitHub Social Preview
**Filename:** `github-social-1280x640.png`
**Dimensions:** 1280×640 pixels

Similar to OG image but with:
- GitHub-friendly dark background option
- Prominent "Open Source" badge
- MIT License mention
- Star/Fork call-to-action

### Twitter/X Header
**Filename:** `twitter-header-1500x500.png`
**Dimensions:** 1500×500 pixels

Simplified horizontal layout:
- Logo left
- "Know if it's European" center
- Badge previews right
- Avoid text in center (profile picture overlap)

### App Store Assets (Future)
For potential mobile app or Safari Mac App Store:
- Icon: 1024×1024 (already have)
- Screenshots: 1290×2796 (iPhone 15 Pro Max)
- Preview video: 30 seconds max

---

## Design Resources

### Fonts (Free & Open Source)
- **Inter:** https://rsms.me/inter/ (recommended)
- **Roboto:** https://fonts.google.com/specimen/Roboto
- **Open Sans:** https://fonts.google.com/specimen/Open+Sans

### EU Flag Resources
- Official EU emblem: https://european-union.europa.eu/principles-countries-history/symbols/european-flag_en
- SVG stars: 12 stars in circle, gold (#FFCC00) on blue (#003399)

### Icon/Logo
- EuroCheck icon (globe with EU stars)
- Available in: 16, 32, 48, 128px
- Location: `/src/icons/`

---

## Production Checklist

### Chrome Tile (440×280)
- [ ] EU Blue background with gradient
- [ ] EuroCheck logo top-left
- [ ] "Is it European?" headline (white, bold)
- [ ] "Know instantly. Zero tracking." tagline
- [ ] Mini badge preview (green, red, yellow)
- [ ] Export at 2x resolution (880×560) for Retina
- [ ] File size under 2MB

### Social OG (1200×630)
- [ ] EU Blue background
- [ ] EuroCheck branding
- [ ] "Know if it's European" headline
- [ ] Three example badges (Spotify, Amazon, Booking)
- [ ] Privacy messaging
- [ ] Platform icons
- [ ] Test preview on Twitter Card Validator
- [ ] Test preview on Facebook Debugger

---

## Accessibility Considerations

- Minimum contrast ratio 4.5:1 for text
- Don't rely solely on color (badges have text labels too)
- Alt text for all promotional images:
  - Chrome tile: "EuroCheck browser extension - Know if a website is European"
  - OG image: "EuroCheck shows company ownership: Spotify (EU), Amazon (Non-EU), Booking.com (Mixed ownership)"
