#!/usr/bin/env node

/**
 * EuroCheck Build Script
 * Builds extension for Chrome, Firefox, and Safari
 * 
 * Usage:
 *   node scripts/build.js chrome [--zip]
 *   node scripts/build.js firefox [--zip]
 *   node scripts/build.js safari [--zip]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const DATA = path.join(ROOT, 'data');
const DIST = path.join(ROOT, 'dist');

// Files to copy for all browsers
const COMMON_FILES = [
  'background.js',
  'popup/popup.html',
  'popup/popup.js',
  'popup/popup.css',
  'content/content.js',
  'utils/domain.js',
  'options/options.html',
  'options/options.css',
  'options/options.js',
  'icons/icon-16.png',
  'icons/icon-32.png',
  'icons/icon-48.png',
  'icons/icon-128.png',
];

// Data files to include (optimized versions for reduced memory footprint)
const DATA_FILES = [
  'domain-index.json',   // Hot path: 24KB (domain -> minimal company info)
  'companies-min.json',  // Cold path: 130KB (lazy loaded full details)
];

// Original data files (kept for fallback/debugging)
const DATA_FILES_ORIGINAL = [
  'companies.json',
  'domains.json',
];

// Directories to copy recursively
const COMMON_DIRS = [
  '_locales',
];

/**
 * Copy a file, creating directories as needed
 */
function copyFile(src, dest) {
  const destDir = path.dirname(dest);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  fs.copyFileSync(src, dest);
}

/**
 * Copy directory recursively
 */
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      copyFile(srcPath, destPath);
    }
  }
}

/**
 * Get manifest for a specific browser
 */
function getManifest(browser) {
  const manifest = JSON.parse(fs.readFileSync(path.join(SRC, 'manifest.json'), 'utf8'));
  
  if (browser === 'firefox') {
    // Firefox-specific changes
    manifest.browser_specific_settings = {
      gecko: {
        id: '{e4f7c1b2-8a9d-4b3e-9c5f-6d8a7b2c1e0f}',
        strict_min_version: '126.0'  // Required for options_page and background.type
      }
    };
    // Firefox MV3 uses background.scripts not service_worker
    manifest.background = {
      scripts: ['background.js'],
      type: 'module'
    };
    // Remove Chrome-specific fields
    delete manifest.minimum_chrome_version;
  }
  
  if (browser === 'safari') {
    // Safari-specific changes
    delete manifest.minimum_chrome_version;
    // Safari handles background differently through Xcode
  }
  
  // Add data files to web_accessible_resources
  manifest.web_accessible_resources = [{
    resources: ['data/*.json'],
    matches: ['<all_urls>']
  }];
  
  return manifest;
}

/**
 * Generate optimized data files if needed
 */
function ensureOptimizedData() {
  const domainIndex = path.join(DATA, 'domain-index.json');
  const companiesMin = path.join(DATA, 'companies-min.json');
  const companiesOriginal = path.join(DATA, 'companies.json');
  
  // Check if optimized files are missing or older than source
  const needsRebuild = !fs.existsSync(domainIndex) || 
                       !fs.existsSync(companiesMin) ||
                       (fs.existsSync(companiesOriginal) && 
                        fs.statSync(companiesOriginal).mtime > fs.statSync(domainIndex).mtime);
  
  if (needsRebuild) {
    console.log('Generating optimized data files...');
    execSync('node scripts/optimize-data.js', { cwd: ROOT, stdio: 'inherit' });
  }
}

/**
 * Build for a specific browser
 */
function build(browser) {
  console.log(`Building for ${browser}...`);
  
  // Ensure optimized data exists
  ensureOptimizedData();
  
  const distDir = path.join(DIST, browser);
  
  // Clean previous build
  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true });
  }
  fs.mkdirSync(distDir, { recursive: true });
  
  // Copy common files
  for (const file of COMMON_FILES) {
    const srcPath = path.join(SRC, file);
    const destPath = path.join(distDir, file);
    if (fs.existsSync(srcPath)) {
      copyFile(srcPath, destPath);
    } else {
      console.warn(`  Warning: ${file} not found`);
    }
  }
  
  // Copy common directories
  for (const dir of COMMON_DIRS) {
    const srcPath = path.join(SRC, dir);
    const destPath = path.join(distDir, dir);
    if (fs.existsSync(srcPath)) {
      copyDir(srcPath, destPath);
    } else {
      console.warn(`  Warning: ${dir}/ not found`);
    }
  }
  
  // Copy data files
  const dataDir = path.join(distDir, 'data');
  fs.mkdirSync(dataDir, { recursive: true });
  for (const file of DATA_FILES) {
    const srcPath = path.join(DATA, file);
    const destPath = path.join(dataDir, file);
    if (fs.existsSync(srcPath)) {
      copyFile(srcPath, destPath);
    } else {
      console.warn(`  Warning: data/${file} not found`);
    }
  }
  
  // Write browser-specific manifest
  const manifest = getManifest(browser);
  fs.writeFileSync(
    path.join(distDir, 'manifest.json'),
    JSON.stringify(manifest, null, 2)
  );
  
  console.log(`  Built to ${distDir}`);
  return distDir;
}

/**
 * Create zip package
 */
function createZip(browser, distDir) {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const zipName = `eurocheck-${browser}-v${pkg.version}.zip`;
  const zipPath = path.join(DIST, zipName);
  
  // Remove old zip
  if (fs.existsSync(zipPath)) {
    fs.unlinkSync(zipPath);
  }
  
  // Create zip
  execSync(`cd "${distDir}" && zip -r "../${zipName}" .`, { stdio: 'inherit' });
  console.log(`  Packaged to ${zipPath}`);
}

// Main
const args = process.argv.slice(2);
const browser = args[0];
const shouldZip = args.includes('--zip');

if (!browser || !['chrome', 'firefox', 'safari'].includes(browser)) {
  console.log('Usage: node scripts/build.js <chrome|firefox|safari> [--zip]');
  process.exit(1);
}

const distDir = build(browser);

if (shouldZip) {
  createZip(browser, distDir);
}

console.log('Done!');
