# EuroCheck 🇪🇺

[![CI](https://github.com/pekka-eu/eurocheck/actions/workflows/ci.yml/badge.svg)](https://github.com/pekka-eu/eurocheck/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Companies](https://img.shields.io/badge/companies-321-blue.svg)](#)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

**Know if it's European** — A browser extension that instantly shows whether the website you're visiting belongs to a European or non-European company.

## Features

- 🔍 **Instant identification** — See EU status with one click
- 🌳 **Ownership chains** — Trace company ownership to ultimate parent
- 🔒 **Privacy-first** — All lookups happen locally, no data sent anywhere
- 🌐 **Multi-browser** — Chrome and Firefox support
- 📊 **320+ companies** — Growing database of major companies
- 🌍 **Multilingual** — English, German, French

## Installation

- **Chrome**: [Chrome Web Store](#) (coming soon)
- **Firefox**: [Firefox Add-ons](#) (coming soon)

## Status Indicators

| Badge | Meaning |
|-------|---------|
| 🟢 Green | European company (HQ and ownership in EU/EEA) |
| 🟡 Yellow | Mixed ownership (EU presence but non-EU ultimate parent) |
| 🔴 Red | Non-European company |
| ⚪ Gray | Unknown / Not in database |

## Development

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
cd projects/004-eurocheck
npm install
```

### Build

```bash
# Build for Chrome
npm run build:chrome

# Build for Firefox
npm run build:firefox

# Build all
npm run build:all

# Create zip packages for store submission
npm run package:chrome
npm run package:firefox
```

Output directories:
- `dist/chrome/` — Chrome/Chromium extension
- `dist/firefox/` — Firefox add-on

### Load Unpacked Extension

**Chrome/Brave:**
1. Go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" → select `dist/chrome/`

**Firefox:**
1. Go to `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Select any file in `dist/firefox/`

### Test

```bash
npm test
```

### Firefox-Specific Notes

- Requires Firefox 126+ (for MV3 module support)
- Uses `background.scripts` instead of `service_worker`
- Tested with `web-ext lint` for AMO compliance
- Handles `moz-extension://` URLs in badge logic

## Project Structure

```
004-eurocheck/
├── src/
│   ├── manifest.json      # Extension manifest (Chrome MV3)
│   ├── background.js      # Service worker
│   ├── popup/             # Popup UI
│   ├── content/           # Content scripts
│   ├── options/           # Settings page
│   ├── utils/             # Shared utilities
│   ├── icons/             # Extension icons
│   └── _locales/          # i18n translations
├── data/
│   ├── companies.json     # Company database
│   ├── domains.json       # Domain mappings
│   └── schemas/           # JSON schemas
├── scripts/
│   ├── build.js           # Build script
│   └── ingest/            # Data ingestion scripts
├── docs/                  # Documentation
├── store/                 # Store listing assets
├── landing/               # Landing page
└── dist/                  # Built extensions
```

## Data Sources

- [Wikidata](https://www.wikidata.org/) — Company headquarters and ownership
- [GLEIF](https://www.gleif.org/) — Legal Entity Identifier data
- Manual curation and verification

## Contributing

Contributions welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Adding Companies

1. Fork the repo
2. Add company to `data/companies.json`
3. Add domains to `data/domains.json`
4. Submit PR with sources

## Privacy

EuroCheck is designed with privacy in mind:
- **No tracking** — We don't collect any user data
- **Local lookups** — All company lookups happen on your device
- **No network requests** — The extension works entirely offline
- **Open source** — Verify our claims by reading the code

See [Privacy Policy](docs/privacy-policy.md) for details.

## License

MIT License — see [LICENSE](LICENSE) for details.

---

Made with 🇪🇺 by [Pekka](https://github.com/ea-pekka)

---

## Publishing

**Publisher Identity:**
- Publisher: "EuroCheck Team"
- Contact: eurocheck-team@googlegroups.com

