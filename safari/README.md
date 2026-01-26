# EuroCheck Safari Extension

Safari Web Extension wrapper for EuroCheck — verify EU IBAN accounts and check company registry data.

## Requirements

- **macOS 11.0+** (Big Sur or later)
- **Xcode 14+** (or Xcode Command Line Tools)
- **Safari 14+**

### First-time Setup

If you haven't used Xcode before, you need to accept the license agreement:

```bash
sudo xcodebuild -license accept
```

## Project Structure

```
safari/
├── EuroCheck.xcodeproj/          # Xcode project
├── EuroCheck/                    # macOS container app
│   ├── AppDelegate.swift
│   ├── ViewController.swift
│   ├── Main.storyboard
│   ├── Assets.xcassets/
│   ├── Info.plist
│   └── EuroCheck.entitlements
├── EuroCheck Extension/          # Safari Web Extension
│   ├── SafariWebExtensionHandler.swift
│   ├── Resources/               # Extension files (from dist/chrome/)
│   │   ├── manifest.json
│   │   ├── popup/
│   │   ├── _locales/
│   │   └── ...
│   ├── Info.plist
│   └── EuroCheck_Extension.entitlements
└── README.md
```

## Building

### Using the build script (recommended)

```bash
# From project root
./scripts/build-safari.sh

# For debug build
./scripts/build-safari.sh debug
```

### Using Xcode

1. Open `safari/EuroCheck.xcodeproj` in Xcode
2. Select the "EuroCheck" scheme
3. Build (⌘B) or Run (⌘R)

### Using command line

```bash
xcodebuild -project safari/EuroCheck.xcodeproj \
           -scheme EuroCheck \
           -configuration Release \
           CODE_SIGN_IDENTITY="-" \
           CODE_SIGNING_REQUIRED=NO
```

## Installation

### For Development (Sign to Run Locally)

1. **Enable Developer Mode in Safari:**
   - Safari → Settings → Advanced
   - Check "Show features for web developers"

2. **Allow Unsigned Extensions:**
   - Safari → Develop menu → "Allow Unsigned Extensions"
   - (You'll need to re-enable this after each Safari restart)

3. **Build and Run:**
   - Build the project using Xcode or the build script
   - The container app will launch automatically

4. **Enable the Extension:**
   - Safari → Settings → Extensions
   - Check the box next to "EuroCheck"
   - Click "Always Allow on Every Website" if prompted

### For Distribution (requires Apple Developer account)

1. Sign up for an Apple Developer account ($99/year)
2. Create App IDs for both the container app and extension
3. Update bundle identifiers if needed
4. Archive and distribute through App Store or notarize for direct distribution

## Development

### Updating Extension Code

The extension resources in `EuroCheck Extension/Resources/` are copied from `dist/chrome/`. To update:

```bash
# Rebuild the extension
npm run build

# The build script will sync automatically, or manually:
rsync -av --delete ../dist/chrome/ "EuroCheck Extension/Resources/"
```

### Debugging

1. In Safari, enable Develop menu (Settings → Advanced)
2. Develop → Web Extension Background Pages → EuroCheck
3. Use Web Inspector to debug

### Native Messaging

The `SafariWebExtensionHandler.swift` handles `browser.runtime.sendNativeMessage()` calls. Currently supports:

- `{ "action": "ping" }` → Returns `{ "success": true, "response": "pong" }`
- `{ "action": "getSystemInfo" }` → Returns platform info

## Bundle Identifiers

| Component | Bundle ID |
|-----------|-----------|
| Container App | `com.eurocheck.EuroCheck` |
| Extension | `com.eurocheck.EuroCheck.Extension` |

## Troubleshooting

### "Extension not showing in Safari"

1. Make sure you built the project successfully
2. Check Safari → Settings → Extensions
3. Ensure "Allow Unsigned Extensions" is enabled (in Develop menu)

### "Extension icon not appearing in toolbar"

1. Right-click the Safari toolbar
2. Choose "Customize Toolbar..."
3. Drag the EuroCheck icon to the toolbar

### "Allow Unsigned Extensions disabled after restart"

This is expected behavior for unsigned extensions. You need to re-enable it each time Safari launches (Develop → Allow Unsigned Extensions).

### Build errors about code signing

For local development, the project is configured to skip code signing. If you see signing errors:

```bash
xcodebuild ... CODE_SIGN_IDENTITY="-" CODE_SIGNING_REQUIRED=NO CODE_SIGNING_ALLOWED=NO
```

## Safari-Specific Considerations

### Manifest Differences

Safari uses the same Manifest V3 format as Chrome with minor additions:

```json
{
  "browser_specific_settings": {
    "safari": {
      "strict_min_version": "14.0"
    }
  }
}
```

### API Compatibility

Safari supports most WebExtension APIs, but some differences exist:

- Use `browser.*` namespace (with `chrome.*` fallback)
- Some permissions may behave differently
- Native messaging goes through `SafariWebExtensionHandler`

See [Apple's Safari Web Extensions documentation](https://developer.apple.com/documentation/safariservices/safari_web_extensions) for details.

## License

Same license as the main EuroCheck project.
