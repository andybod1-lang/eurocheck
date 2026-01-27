#!/bin/bash
# EuroCheck Extension Testing Script

EUROCHECK_DIR="/Users/antti/clawd/projects/004-eurocheck"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
BRAVE="/Applications/Brave Browser.app/Contents/MacOS/Brave Browser"
FIREFOX="/Applications/Firefox.app/Contents/MacOS/firefox"

case "$1" in
  chrome)
    echo "🧪 Testing in Google Chrome..."
    "$CHROME" \
      --load-extension="$EUROCHECK_DIR/dist/chrome" \
      --no-first-run \
      --no-default-browser-check \
      --user-data-dir="/tmp/eurocheck-chrome-test" \
      "https://amazon.com" &
    echo "✅ Chrome launched with extension. Check the toolbar for EuroCheck icon."
    ;;
  brave)
    echo "🧪 Testing in Brave (Chrome-compatible)..."
    "$BRAVE" \
      --load-extension="$EUROCHECK_DIR/dist/chrome" \
      --no-first-run \
      --no-default-browser-check \
      --user-data-dir="/tmp/eurocheck-brave-test" \
      "https://amazon.com" &
    echo "✅ Brave launched with extension. Check the toolbar for EuroCheck icon."
    ;;
  firefox|ff)
    echo "🧪 Testing in Firefox..."
    cd "$EUROCHECK_DIR"
    web-ext run \
      --source-dir ./dist/firefox \
      --firefox "$FIREFOX" \
      --start-url "https://amazon.com" &
    echo "✅ Firefox launched with extension."
    ;;
  build-chrome)
    echo "📦 Building Chrome extension..."
    cd "$EUROCHECK_DIR"
    npm run build:chrome
    ;;
  build-firefox)
    echo "📦 Building Firefox extension..."
    cd "$EUROCHECK_DIR"
    npm run build:firefox
    ;;
  build)
    echo "📦 Building both extensions..."
    cd "$EUROCHECK_DIR"
    npm run build
    ;;
  *)
    echo "EuroCheck Extension Tester"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  chrome         - Test in Google Chrome"
    echo "  brave          - Test in Brave browser"
    echo "  firefox, ff    - Test in Firefox"
    echo "  build-chrome   - Build Chrome extension"
    echo "  build-firefox  - Build Firefox extension"
    echo "  build          - Build both"
    ;;
esac
