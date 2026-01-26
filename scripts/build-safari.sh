#!/bin/bash
#
# Build Safari Web Extension for EuroCheck
#
# Usage:
#   ./scripts/build-safari.sh [debug|release]
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
SAFARI_DIR="$PROJECT_ROOT/safari"

# Default to Release configuration
CONFIGURATION="${1:-Release}"
CONFIGURATION="$(echo "$CONFIGURATION" | tr '[:lower:]' '[:upper:]')"

# Normalize configuration name
if [ "$CONFIGURATION" = "DEBUG" ]; then
    CONFIGURATION="Debug"
else
    CONFIGURATION="Release"
fi

echo "🇪🇺 Building EuroCheck Safari Extension..."
echo "   Configuration: $CONFIGURATION"
echo "   Project: $SAFARI_DIR/EuroCheck.xcodeproj"
echo ""

# Check if Xcode command line tools are available
if ! command -v xcodebuild &> /dev/null; then
    echo "❌ Error: xcodebuild not found. Please install Xcode command line tools:"
    echo "   xcode-select --install"
    exit 1
fi

# Ensure extension resources are up to date
echo "📦 Syncing extension resources..."
if [ -d "$PROJECT_ROOT/dist/chrome" ]; then
    rsync -av --delete "$PROJECT_ROOT/dist/chrome/" "$SAFARI_DIR/EuroCheck Extension/Resources/"
    echo "   ✓ Resources synced from dist/chrome/"
else
    echo "   ⚠️  Warning: dist/chrome/ not found. Run 'npm run build' first."
fi

# Build the project
echo ""
echo "🔨 Building Xcode project..."
xcodebuild \
    -project "$SAFARI_DIR/EuroCheck.xcodeproj" \
    -scheme "EuroCheck" \
    -configuration "$CONFIGURATION" \
    CODE_SIGN_IDENTITY="-" \
    CODE_SIGNING_REQUIRED=NO \
    CODE_SIGNING_ALLOWED=NO \
    build \
    | grep -E "^(Build|Compile|Link|Sign|error:|warning:|✓)" || true

BUILD_RESULT=${PIPESTATUS[0]}

if [ $BUILD_RESULT -eq 0 ]; then
    echo ""
    echo "✅ Build successful!"
    echo ""
    echo "📍 Output location:"
    echo "   ~/Library/Developer/Xcode/DerivedData/EuroCheck-*/Build/Products/$CONFIGURATION/"
    echo ""
    echo "🔧 To enable the extension:"
    echo "   1. Open Safari → Settings → Extensions"
    echo "   2. Enable 'EuroCheck'"
    echo "   3. Grant necessary permissions"
    echo ""
    echo "   Or run the container app to open preferences:"
    echo "   open ~/Library/Developer/Xcode/DerivedData/EuroCheck-*/Build/Products/$CONFIGURATION/EuroCheck.app"
else
    echo ""
    echo "❌ Build failed with exit code $BUILD_RESULT"
    exit $BUILD_RESULT
fi
