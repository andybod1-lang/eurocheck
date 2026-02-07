#!/bin/bash
# EuroCheck Landing Page Deployment Script
# Deploys to GitHub Pages via gh-pages branch

set -e

cd /Users/antti/clawd/projects/004-eurocheck

echo "🚀 Deploying EuroCheck landing page..."

# Save current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 Current branch: $CURRENT_BRANCH"

# Create temporary directory with landing files
echo "📦 Preparing files..."
rm -rf /tmp/eurocheck-landing
mkdir -p /tmp/eurocheck-landing
cp landing/index.html /tmp/eurocheck-landing/
cp landing/style.css /tmp/eurocheck-landing/

# Copy screenshot
if [ -f store/screenshots/1-eu-company.png ]; then
    cp store/screenshots/1-eu-company.png /tmp/eurocheck-landing/
    echo "✅ Screenshot copied"
else
    echo "⚠️  Screenshot not found at store/screenshots/1-eu-company.png"
fi

# Fix image path in HTML
sed -i '' 's|../store/screenshots/||g' /tmp/eurocheck-landing/index.html
echo "✅ Image paths fixed"

# Create .nojekyll to disable Jekyll processing
touch /tmp/eurocheck-landing/.nojekyll

# Stash any uncommitted changes
git stash push -m "Pre-deployment stash" 2>/dev/null || true

# Create/update gh-pages branch
echo "🌿 Creating gh-pages branch..."
git checkout --orphan gh-pages-temp 2>/dev/null || git checkout gh-pages-temp
git rm -rf . 2>/dev/null || true
cp /tmp/eurocheck-landing/* .
cp /tmp/eurocheck-landing/.nojekyll .
git add .
git commit -m "Update landing page - $(date '+%Y-%m-%d %H:%M')"

# Force push to gh-pages
echo "📤 Pushing to gh-pages..."
git branch -D gh-pages 2>/dev/null || true
git branch -m gh-pages
git push -f origin gh-pages

# Return to original branch
echo "🔙 Returning to $CURRENT_BRANCH..."
git checkout "$CURRENT_BRANCH"

# Restore stashed changes
git stash pop 2>/dev/null || true

# Cleanup
rm -rf /tmp/eurocheck-landing

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🌐 Site will be available at:"
echo "   https://andybod1-lang.github.io/eurocheck/"
echo ""
echo "⚙️  If not already enabled, configure GitHub Pages:"
echo "   1. Go to: https://github.com/andybod1-lang/eurocheck/settings/pages"
echo "   2. Source: Deploy from a branch"
echo "   3. Branch: gh-pages → / (root)"
echo "   4. Save"
echo ""
echo "📋 Don't forget to check CHECKLIST.md for pre-launch items!"
